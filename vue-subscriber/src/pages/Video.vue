<script lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useStreamStore } from "../stores/streamStore";
import VideoFeed from "../containers/VideoFeed.vue";
import VideoPlayer from "../containers/VideoPlayer.vue";

export default {
  components: {
    VideoFeed,
    VideoPlayer,
  },
  setup() {
    const streamStore = useStreamStore();
    const { getActiveStream: activeStream } = storeToRefs(streamStore);
    const currentActiveStream = ref<any>(null);

    watch(activeStream, (newValue: any) => {
      currentActiveStream.value = newValue;
    });

    return {
      currentActiveStream,
    };
  },
};
</script>

<template>
  <base-page-container>
    <div class="mainContentContainer">
      <div class="videoPlayerContainer">
        <video-player></video-player>
      </div>

      <div class="descriptionContainer">
        <div v-if="currentActiveStream">
          <h3>{{ currentActiveStream.subjectName }}</h3>
          <div>{{ currentActiveStream }}</div>
        </div>
        <h3 v-else>Pick a stream from the list of live streams to start</h3>
      </div>

      <div class="streamListContainer">
        <video-feed></video-feed>
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
