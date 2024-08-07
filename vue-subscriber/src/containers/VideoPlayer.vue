<script lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import {
  initMediaSource,
  MIME_CODEC,
  getMediaSource,
} from "../utils/videoUtils";
import NatsWorker from "../workers/natsWorker?worker";

function splitWithLengthPrefixes(data: ArrayBuffer, lengthSize = 4) {
  const uint8Array = new Uint8Array(data);
  const chunks = [];
  const view = new DataView(data);

  let offset = 0;

  while (offset < uint8Array.length) {
    // Read the length of the next segment
    if (offset + lengthSize > uint8Array.length) {
      throw new Error("Unexpected end of data while reading length prefix.");
    }
    const length = view.getUint32(offset);
    offset += lengthSize;

    // Extract the segment based on the length
    if (offset + length > uint8Array.length) {
      throw new Error("Unexpected end of data while reading segment.");
    }
    const segment = uint8Array.slice(offset, offset + length);
    chunks.push(segment);

    // Move to the next segment
    offset += length;
  }

  return chunks;
}

function compareArrayBuffers(a: ArrayBuffer, b: ArrayBuffer) {
  // Convert ArrayBuffers to Uint8Arrays
  const view1 = new Uint8Array(a);
  const view2 = new Uint8Array(b);

  // Check if they are the same length
  if (view1.byteLength !== view2.byteLength) {
    return false;
  }

  // Compare byte-by-byte
  for (let i = 0; i < view1.byteLength; i++) {
    if (view1[i] !== view2[i]) {
      return false;
    }
  }

  return true;
}

export default {
  setup() {
    const videoWorker = new NatsWorker();
    const videoRef = ref<HTMLVideoElement | null>(null);
    const sourceRef = ref<any>(null);
    const currentInitBuffer = ref<any>(new ArrayBuffer(0));
    const userStore = useUserStore();
    const { getAccessToken: accessToken, getServerUrl: serverUrl } =
      storeToRefs(userStore);
    const streamStore = useStreamStore();
    const { getActiveStream: activeStream } = storeToRefs(streamStore);

    const handleOnMessage = async (messages: any[]) => {
      const message = messages[0];
      const messageBuffer = message.data;

      const chunks = splitWithLengthPrefixes(messageBuffer);
      const initBuffer = chunks[0].buffer;
      const dataBuffer = chunks[1].buffer;

      const isNewInit = compareArrayBuffers(
        currentInitBuffer.value,
        initBuffer
      );

      if (!isNewInit) {
        if (!getMediaSource().isTypeSupported(MIME_CODEC)) {
          throw new Error("Unsupported mime codec");
        }

        if (videoRef.value === null) {
          return;
        }

        currentInitBuffer.value = initBuffer;

        const mediaSource = await initMediaSource((sb: SourceBuffer) => {
          sourceRef.value = sb;

          sb.appendBuffer(initBuffer);
        });

        videoRef.value.src = URL.createObjectURL(mediaSource);

        setTimeout(() => {
          const sourceBuffer = sourceRef.value;

          sourceBuffer.appendBuffer(dataBuffer);
        }, 100);
      } else {
        const sourceBuffer = sourceRef.value;

        if (sourceBuffer) {
          sourceBuffer.appendBuffer(dataBuffer);
        }
      }
    };

    const handleConnect = (subjectName: string) => {
      const message = {
        type: "subscribe",
        url: serverUrl.value,
        subject: subjectName,
        accessToken: accessToken.value,
      };

      videoWorker.postMessage(message);
    };

    videoWorker.onmessage = function (e) {
      handleOnMessage(e.data.messages);
    };

    const handleActiveStreamChange = async (newActiveStream: string) => {
      const videoEl = videoRef.value;

      if (!!videoEl && serverUrl.value && accessToken.value) {
        try {
          handleConnect(newActiveStream);
        } catch (e) {
          console.log(e);
        }
      }
    };

    watch(activeStream, (newValue: any, oldValue: any) => {
      if (oldValue) {
        const message = {
          type: "unsubscribe",
          subject: oldValue.subjectName,
        };

        videoWorker.postMessage(message);
      }

      if (newValue) {
        handleActiveStreamChange(newValue.subjectName);
      }
    });

    onBeforeUnmount(() => {
      const message = {
        type: "unsubscribe",
        subject: activeStream.value.subjectName,
      };

      videoWorker.postMessage(message);
    });

    return {
      videoRef,
    };
  },
};
</script>

<template>
  <!-- @vue-ignore -->
  <video
    ref="videoRef"
    class="videoPlayer"
    playsinline
    autoplay
    v-bind:muted.attr="''"
    controls
  ></video>
</template>

<style scoped>
.videoPlayer {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
