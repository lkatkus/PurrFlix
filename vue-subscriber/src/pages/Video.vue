<script lang="ts">
import { ref, watch } from "vue";
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

    return {
      videoRef,
      activeStream,
    };
  },
};
</script>

<template>
  <base-page-container>
    <div class="pageContentContainer">
      <div class="mainContent">
        <div class="videoPlayerContainer">
          <video
            ref="videoRef"
            class="videoPlayer"
            muted
            autoPlay
            controls
          ></video>
        </div>

        <div class="description descriptionDesktop">
          <div v-if="activeStream">
            <h3>{{ activeStream.subjectName }}</h3>
            <div>{{ activeStream }}</div>
          </div>
          <h2 v-else>Pick a stream from the list of live streams</h2>
        </div>
      </div>

      <div class="sideContent">
        <div class="description descriptionMobile">
          <div v-if="activeStream">
            <h3>{{ activeStream.subjectName }}</h3>
            <div>{{ activeStream }}</div>
          </div>
          <h2 v-else>Pick a stream from the list of live streams</h2>
        </div>

        <div class="listContainer">
          <side-bar></side-bar>
        </div>
      </div>
    </div>
  </base-page-container>
</template>

<style scoped>
.pageContentContainer {
  background-color: lime;
  /* overflow-y: auto; */
  display: grid;
  width: 100%;
  height: 100%;
  max-width: 1440px;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;
}

.mainContent {
  background-color: silver;
}

.videoPlayerContainer {
  display: flex;
}

.videoPlayer {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
}

.sideContent {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.listContainer {
  overflow-y: auto;
}

.description {
  background-color: yellow;
}

@media (orientation: portrait) {
  .pageContentContainer {
    background-color: green;
    display: flex;
    flex-direction: column;
  }

  .descriptionDesktop {
    display: none;
  }
}

@media (orientation: landscape) {
  .pageContentContainer {
    background-color: red;
    grid-template-columns: 8fr 4fr;
    grid-template-rows: 1fr;
  }

  .descriptionDesktop {
    display: none;
  }

  @media (min-width: 1024px) {
    .pageContentContainer {
      grid-template-columns: 8fr 4fr;
      grid-template-rows: 1fr;
    }

    .descriptionMobile {
      display: none;
    }

    .descriptionDesktop {
      display: unset;
    }
  }
}
</style>
