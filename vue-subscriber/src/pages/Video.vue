<script lang="ts">
import { ref, watch, onMounted } from "vue";
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

    const observer = new IntersectionObserver(
      () => {
        const target = document.querySelector("#videoPlayerRow");

        if (target && !target.getAttribute("data-is-observed")) {
          target.setAttribute("data-is-observed", "true");
        } else if (target) {
          const target = document.querySelector("#videoPlayerRowContainer");
          const isSticky = target?.classList.contains("sticky");

          if (isSticky) {
            target?.classList.remove("sticky");
          } else {
            target?.classList.add("sticky");
          }
        }
      },
      {
        threshold: 0,
        rootMargin: "-200px",
        root: document.querySelector("#mainContentContainer"),
      }
    );

    watch(activeStream, (newValue: any) => {
      currentActiveStream.value = newValue;
    });

    onMounted(() => {
      observer.observe(document.querySelector("#videoPlayerRow")!);
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
      <div id="videoPlayerRow" class="videoPlayerRow">
        <div id="videoPlayerRowContainer" class="videoPlayerRowContainer">
          <div class="videoPlayerContainer">
            <div class="videoPlayerWrapper">
              <video-player></video-player>
            </div>
            <div v-if="currentActiveStream" class="videoDescriptionContainer">
              <h3>{{ currentActiveStream.subjectName }}</h3>
              <div>{{ currentActiveStream.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="videoInfoRow">
        <div class="videoInfoRowContent">
          <div class="videoInfoContainer">
            <div v-if="currentActiveStream">
              <h3>{{ currentActiveStream.subjectName }}</h3>
              <div>{{ currentActiveStream }}</div>
            </div>
            <div v-else>
              <h3>Current stream information</h3>
              <div>Pick a stream from the list of active streams to start</div>
            </div>
          </div>

          <div class="streamListContainer">
            <video-feed></video-feed>
          </div>
        </div>
      </div>
    </div>
  </base-page-container>
</template>

<style scoped>
.mainContentContainer {
  height: 100%;
  display: grid;
  grid-template-rows: min-content 1fr;
}

.videoPlayerRow {
  grid-row: 1;
  height: 216px;
  display: flex;
  justify-content: center;
  background-color: black;
}

.videoPlayerRowContainer {
  width: 100%;
  height: 216px;
  display: flex;
  justify-content: center;
}

.sticky {
  position: fixed;
  height: 140px !important;
  max-width: unset;
  background-color: black;
}

.videoPlayerContainer {
  width: 100%;
  display: flex;
  justify-content: center;
  max-width: var(--page-content-width);
}

.videoDescriptionContainer {
  display: none;
  overflow: hidden;
}

.videoDescriptionContainer > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky > .videoPlayerContainer {
  justify-content: unset;
}

.sticky > .videoPlayerContainer > .videoDescriptionContainer {
  color: white;
  display: unset;
  padding: 16px;
}

.videoPlayerWrapper {
  height: 100%;
  aspect-ratio: 16/9;
}

.videoInfoRow {
  grid-row: 2;
  min-height: 480px;
  display: flex;
  justify-content: center;
}

.videoInfoRowContent {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 16px;
  max-width: var(--page-content-width);
}

.videoInfoContainer {
  padding: 16px;
}

.streamListContainer {
  padding: 16px;
}

@media (min-width: 768px) {
  .videoInfoRowContent {
    display: grid;
    grid-template-columns: 4fr 3fr;
    max-width: var(--page-content-width);
  }
}

@media (min-width: 1024px) {
  .videoInfoRowContent {
    grid-template-columns: 5fr 4fr;
  }

  .videoPlayerRow {
    height: 560px;
  }

  .videoPlayerRowContainer {
    height: 560px;
  }
}
</style>
