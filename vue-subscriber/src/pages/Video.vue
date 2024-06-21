<script lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { connect } from "../api";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import {
  isNewInitStream,
  initMediaSource,
  MIME_CODEC,
} from "../utils/videoUtils";
import SideBar from "../containers/SideBar.vue";

export default {
  components: {
    SideBar,
  },
  setup() {
    const videoRef = ref<HTMLVideoElement | null>(null);
    const connectionRef = ref<any>(null);
    const sourceRef = ref<any>(null);
    const userStore = useUserStore();
    const { getAccessToken: accessToken, getServerUrl: serverUrl } =
      storeToRefs(userStore);
    const streamStore = useStreamStore();
    const { getActiveStream: activeStream } = storeToRefs(streamStore);

    const handleOnError = () => {
      console.log("handleOnError");
    };

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

    const handleActiveStreamChange = async (newActiveStream: string) => {
      const videoEl = videoRef.value;

      if (!!videoEl && serverUrl.value && accessToken.value) {
        connectionRef.value && connectionRef.value.disconnect();

        try {
          connectionRef.value = await connect({
            url: serverUrl.value,
            accessToken: accessToken.value,
          });

          connectionRef.value.subscribe({
            subject: newActiveStream,
            onError: handleOnError,
            onMessages: handleOnMessage,
          });
        } catch (e) {
          console.log(e);
        }
      }
    };

    watch(activeStream, (newValue: any) => {
      if (newValue) {
        handleActiveStreamChange(newValue.subjectName);
      }
    });

    onBeforeUnmount(() => {
      if (connectionRef.value) {
        connectionRef.value.disconnect();
      }
    });

    return {
      videoRef,
      activeStream,
    };
  },
};
</script>

<template>
  <base-page-container>
    <div class="mainContentContainer">
      <div class="videoPlayerContainer">
        <video
          ref="videoRef"
          class="videoPlayer"
          muted
          autoPlay
          controls
        ></video>
      </div>

      <div class="descriptionContainer">
        <div v-if="activeStream">
          <h3>{{ activeStream.subjectName }}</h3>
          <div>{{ activeStream }}</div>
        </div>
        <h3 v-else>Pick a stream from the list of live streams to start</h3>
      </div>

      <div class="streamListContainer">
        <side-bar></side-bar>
      </div>
    </div>
  </base-page-container>
</template>

<style scoped>
.mainContentContainer {
  background-color: cyan;
  display: grid;
  height: 100%;
  grid-template-rows: min-content min-content 1fr;
}

.videoPlayerContainer {
  background-color: red;
  height: 100%;
  aspect-ratio: 16/9;
  display: flex;
}

.videoPlayer {
  width: 100%;
  height: 100%;
}

.descriptionContainer {
  background-color: green;
}

.streamListContainer {
  background-color: yellow;
}

@media (orientation: portrait) {
}

@media (orientation: landscape) {
  @media (min-aspect-ratio: 8/5) {
    .mainContentContainer {
      grid-template-rows: min-content 1fr;
      grid-template-columns: 1fr 1fr;
    }

    .videoPlayerContainer {
      grid-row-start: 1;
      grid-row-end: 3;
    }
  }

  @media (min-width: 1024px) {
    .mainContentContainer {
      grid-template-rows: min-content 1fr;
      grid-template-columns: 2fr 1fr;
    }

    .videoPlayerContainer {
      grid-row: 1;
    }

    .streamListContainer {
      grid-row-start: 1;
      grid-row-end: 3;
    }
  }
}
</style>
