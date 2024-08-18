<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import { getObjectFromBuffer } from "../utils/dataUtils.ts";
import NatsWorker from "../workers/natsWorker?worker";
import { getParsedDuration } from "../utils/videoUtils.ts";

const LIVE_STREAMS = "laimonas.purrflix-publisher.live";

export default {
  setup() {
    const feedWorker = new NatsWorker();
    const liveStreams = ref<any[]>([]);
    const streamStore = useStreamStore();
    const userStore = useUserStore();
    const { getAccessToken: accessToken, getServerUrl: serverUrl } =
      storeToRefs(userStore);

    const handleOnClickItem = (stream: any) => {
      streamStore.setActiveStream(stream);
      window.scroll({ top: 0 });
    };

    const handleOnMessage = async (messages: any[]) => {
      const message = messages[0];
      const arrayBuffer = message.data;
      const streamMetadata = getObjectFromBuffer(arrayBuffer);
      const existingLiveStreamIndex = liveStreams.value.findIndex(
        ({ subjectName }) => subjectName === streamMetadata.subjectName
      );
      const isNewStream = existingLiveStreamIndex < 0;

      if (isNewStream) {
        liveStreams.value.push(streamMetadata);
      } else {
        liveStreams.value[existingLiveStreamIndex] = streamMetadata;
      }
    };

    feedWorker.onmessage = function (e) {
      handleOnMessage(e.data.messages);
    };

    const handleConnect = () => {
      const message = {
        type: "subscribe",
        url: serverUrl.value,
        subject: LIVE_STREAMS,
        accessToken: accessToken.value,
      };

      feedWorker.postMessage(message);
    };

    onMounted(async () => {
      if (serverUrl.value && accessToken.value) {
        try {
          handleConnect();
        } catch (e) {
          console.log(e);
        }
      }
    });

    onBeforeUnmount(() => {
      const message = {
        type: "unsubscribe",
        subject: LIVE_STREAMS,
      };

      feedWorker.postMessage(message);
    });

    return {
      liveStreams,
      handleOnClickItem,
      handleParseDuration: getParsedDuration,
    };
  },
};
</script>

<template>
  <div>
    <div>
      <h3>Active streams</h3>
      <div v-if="liveStreams.length === 0">Awaiting stream data</div>
    </div>

    <div class="listContainer">
      <div
        class="listItem"
        v-on:click="handleOnClickItem(stream)"
        v-for="stream in liveStreams"
      >
        <div class="listItemThumbnail">
          <img v-bind:src="stream.thumbnail" />
          <div>{{ handleParseDuration(stream.duration) }}</div>
        </div>
        <div class="listItemDescription">
          <h4>{{ stream.name }}</h4>
          <div>{{ stream.subjectName }}</div>
          <div>{{ stream.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.listContainer {
  display: grid;
  row-gap: 16px;
}

.listItem {
  overflow: hidden;
  cursor: pointer;
  padding: 8px;

  display: grid;
  column-gap: 16px;
  grid-template-columns: min-content 1fr;
  border-radius: 16px;
}

.listItem:hover {
  background-color: #f6f6f6;
}

.listItemThumbnail {
  border-radius: 12px;
  width: 100px;
  height: 100px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #d0d0d0;
  overflow: hidden;
}

.listItemThumbnail > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listItemThumbnail > div {
  color: white;
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-weight: 600;
}

.listItemDescription {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.listItemDescription > * {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.listItemDescription > *:not(:first-child) {
  margin-top: 4px;
}

@media (min-width: 768px) {
  .fullWidthStreamList .listItemThumbnail {
    width: 300px;
    height: 200px;
  }
}
</style>
