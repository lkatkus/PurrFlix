<script lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import { initMediaSource } from "../utils/videoUtils";
import NatsWorker from "../workers/natsWorker?worker";
import {
  compareArrayBuffers,
  concatArrayBuffers,
  splitWithLengthPrefixes,
} from "../utils/dataUtils";

export default {
  setup() {
    const videoWorker = new NatsWorker({ name: "VideoPlayerWorker" });
    const videoRef = ref<HTMLVideoElement | null>(null);
    const sourceRef = ref<any>(null);
    const loadingRef = ref<any>(false);
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

      const isSameInit = compareArrayBuffers(
        currentInitBuffer.value,
        initBuffer
      );

      if (!isSameInit) {
        currentInitBuffer.value = initBuffer;

        const initialArrayBuffer = concatArrayBuffers(initBuffer, dataBuffer);

        await handleCreateMediaSource(initialArrayBuffer);
      } else {
        const sourceBuffer = sourceRef.value;

        if (sourceBuffer) {
          sourceBuffer.appendBuffer(dataBuffer);
        }
      }

      loadingRef.value = false;
    };

    videoWorker.onmessage = function (e) {
      handleOnMessage(e.data.messages);
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

    const handleCreateMediaSource = async (data?: any) => {
      if (videoRef.value) {
        const mediaSource = await initMediaSource((sb: SourceBuffer) => {
          sourceRef.value = sb;

          if (data) {
            sb.appendBuffer(data);
          }
        });

        videoRef.value.src = URL.createObjectURL(mediaSource);
      }
    };

    watch(activeStream, (newValue: any, oldValue: any) => {
      loadingRef.value = true;

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

    onMounted(() => {
      handleCreateMediaSource();
    });

    onBeforeUnmount(() => {
      if (activeStream.value) {
        const message = {
          type: "unsubscribe",
          subject: activeStream.value.subjectName,
        };

        videoWorker.postMessage(message);
      }
    });

    return {
      videoRef,
      loadingRef,
    };
  },
};
</script>

<template>
  <div class="videoPlayerWrapper">
    <!-- @vue-ignore -->
    <video
      ref="videoRef"
      class="videoPlayer"
      playsinline
      autoplay
      v-bind:muted.attr="''"
      disableRemotePlayback
    ></video>
    <div
      id="videoPlayerLoader"
      class="videoPlayerLoaderContainer"
      v-bind:class="{ hidden: !loadingRef }"
    >
      <h3>LOADING...</h3>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 0.8;
  }
}

.videoPlayerWrapper {
  height: 100%;
  aspect-ratio: 16/9;
  position: relative;
}

.videoPlayer {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.videoPlayerLoaderContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: black;
  animation: fadeIn 300ms forwards;
}

.hidden {
  display: none;
}
</style>
