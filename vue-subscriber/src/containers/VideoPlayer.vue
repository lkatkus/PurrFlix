<script lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import {
  isNewInitStream,
  initMediaSource,
  MIME_CODEC,
} from "../utils/videoUtils";
import NatsWorker from "../workers/natsWorker?worker";

export default {
  setup() {
    const feedWorker = new NatsWorker();
    const videoRef = ref<HTMLVideoElement | null>(null);
    const sourceRef = ref<any>(null);
    const userStore = useUserStore();
    const { getAccessToken: accessToken, getServerUrl: serverUrl } =
      storeToRefs(userStore);
    const streamStore = useStreamStore();
    const { getActiveStream: activeStream } = storeToRefs(streamStore);

    const handleOnMessage = async (messages: any[]) => {
      const message = messages[0];
      const arrayBuffer = message.data;

      const dataView = new DataView(arrayBuffer);
      const isNew = isNewInitStream(dataView);

      if (isNew) {
        if (!MediaSource.isTypeSupported(MIME_CODEC)) {
          throw new Error("Unsupported mime codec");
        }

        if (videoRef.value === null) {
          return;
        }

        const mediaSource = await initMediaSource((sb: SourceBuffer) => {
          sourceRef.value = sb;

          sb.appendBuffer(arrayBuffer);
        });

        videoRef.value.src = URL.createObjectURL(mediaSource);
      } else {
        const sourceBuffer = sourceRef.value;

        if (sourceBuffer) {
          sourceBuffer.appendBuffer(arrayBuffer);
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

      feedWorker.postMessage(message);
    };

    feedWorker.onmessage = function (e) {
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

        feedWorker.postMessage(message);
      }

      if (newValue) {
        handleActiveStreamChange(newValue.subjectName);
      }
    });

    return {
      videoRef,
    };
  },
};
</script>

<template>
  <video ref="videoRef" class="videoPlayer" muted autoPlay controls></video>
</template>

<style scoped>
.videoPlayer {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
