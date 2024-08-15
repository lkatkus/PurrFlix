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
    const isObserving = ref(false);
    const currentActiveStream = ref<any>(null);

    const observer = new IntersectionObserver(
      (entries) => {
        const target = document.querySelector("#videoPlayerRow");

        if (target && !target.getAttribute("data-is-observed")) {
          target.setAttribute("data-is-observed", "true");

          if (!(entries[0] as any).isIntersecting) {
            const target = document.querySelector("#videoPlayerRowContainer");

            target?.classList.add("sticky");
          }
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
        rootMargin: "-180px", // -200px does not work on iOS for some reason
        root: document.querySelector("#mainContentContainer"),
      }
    );

    watch(activeStream, (newValue: any) => {
      currentActiveStream.value = newValue;

      if (!isObserving.value) {
        isObserving.value = true;

        observer.observe(document.querySelector("#videoPlayerRow")!);
      }
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
      <div
        id="videoPlayerRow"
        class="videoPlayerRow"
        v-bind:class="{ hidden: !currentActiveStream }"
      >
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
          <div v-if="currentActiveStream" class="videoInfoContainer">
            <h3>{{ currentActiveStream.subjectName }}</h3>
            <div>{{ currentActiveStream.description }}</div>
          </div>

          <div
            class="streamListContainer"
            v-bind:class="{ fullWidthStreamList: !currentActiveStream }"
          >
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
  overflow: hidden;
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
  z-index: var(--z-index-top);
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

.fullWidthStreamList {
  grid-column-start: 1;
  grid-column-end: 3;
}

.hidden {
  display: none;
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
