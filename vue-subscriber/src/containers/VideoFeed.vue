<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import { getObjectFromBuffer } from "../utils/dataUtils.ts";
import NatsWorker from "../workers/natsWorker?worker";

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
        <h4>{{ stream.subjectName }}</h4>
        <div>{{ stream }}</div>
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
  padding: 8px;
  background-color: red;
}
</style>
