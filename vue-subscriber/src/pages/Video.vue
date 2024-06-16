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

// const CATS_STREAM = "laimonas.purrflix-publisher.cats";
// const DOGS_STREAM = "laimonas.purrflix-publisher.dogs";
// const STREAM_OPTIONS = [
//   { text: "Cats", value: CATS_STREAM },
//   { text: "Dogs", value: DOGS_STREAM },
// ];

export default {
  components: {
    SideBar,
  },
  setup() {
    const videoRef = ref<HTMLVideoElement | null>(null);
    const connectionRef = ref<any>(null);
    const sourceRef = ref<any>(null);
    // const channel = ref<any>(CATS_STREAM);
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

    // onMounted(async () => {
    //   const videoEl = videoRef.value;
    //   if (!!videoEl && serverUrl.value && accessToken.value) {
    //     try {
    //       connectionRef.value = await connect({
    //         url: serverUrl.value,
    //         accessToken: accessToken.value,
    //       });
    //       connectionRef.value.subscribe({
    //         subject: CATS_STREAM,
    //         onError: handleOnError,
    //         onMessages: handleOnMessage,
    //       });
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   }
    // });

    watch(activeStream, (newValue: any) => {
      if (newValue) {
        handleActiveStreamChange(newValue.subjectName);
      }
    });

    // watch(channel, async (newValue) => {
    //   if (newValue) {
    //     handleActiveStreamChange(newValue);
    //   }
    // });

    return {
      videoRef,
      activeStream,
      // channel,
      // options: STREAM_OPTIONS,
    };
  },
};
</script>

<template>
  <div class="pageContainer">
    <div class="pageHeaderContainer">
      <div class="pageHeaderContentContainer">
        <h1>PurrFlix</h1>
      </div>
    </div>

    <div class="pageContentContainer">
      <div class="mainContent">
        <!-- <div class="inputContainer">
          <label for="currentChannel">Pick a channel</label>
          <select id="currentChannel" v-model="channel">
            <option v-for="option in options" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div> -->

        <div>
          <video
            ref="videoRef"
            class="videoPlayer"
            muted
            autoPlay
            controls
          ></video>
        </div>

        <div>
          <div v-if="activeStream">
            <h3>{{ activeStream.subjectName }}</h3>
            <div>{{ activeStream }}</div>
          </div>
          <h2 v-else>Pick a stream from the list of live streams</h2>
        </div>
      </div>

      <div class="sideContent">
        <side-bar></side-bar>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 8px 0;
}

.inputContainer {
  display: flex;
  flex-direction: column;
}

.inputContainer > label {
  margin-bottom: 8px;
}

.pageContainer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: cyan;
}

.pageHeaderContainer {
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: red;
}

.pageHeaderContentContainer {
  width: 100%;
  background-color: salmon;
  width: 100%;
  max-width: 1440px;
}

.pageContentContainer {
  overflow-y: auto;
  display: grid;
  background-color: skyblue;
  width: 100%;
  height: 100%;
  max-width: 1440px;
  column-gap: 16px;
  grid-template-columns: 1fr;
}

.mainContent {
  background-color: silver;
}

.videoPlayer {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.sideContent {
  overflow-y: auto;
  background-color: gold;
}

@media (min-width: 600px) {
  .pageContentContainer {
    background-color: orange;
    grid-template-columns: 8fr 4fr;
  }
}
</style>
