<script lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { connect } from "../api";
import { useUserStore } from "../stores/userStore";
import { useStreamStore } from "../stores/streamStore";
import { getObjectFromBuffer } from "../utils/dataUtils.ts";

const LIVE_STREAMS = "laimonas.purrflix-publisher.live";

export default {
  setup() {
    const liveStreams = ref<any[]>([]);
    const streamStore = useStreamStore();
    const userStore = useUserStore();
    const { getAccessToken: accessToken, getServerUrl: serverUrl } =
      storeToRefs(userStore);

    const handleOnClickItem = (stream: any) => {
      streamStore.setActiveStream(stream);
    };

    const handleOnError = () => {
      console.log("handleOnError");
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

    onMounted(async () => {
      if (serverUrl.value && accessToken.value) {
        try {
          const connection = await connect({
            url: serverUrl.value,
            accessToken: accessToken.value,
          });
          connection.subscribe({
            subject: LIVE_STREAMS,
            onError: handleOnError,
            onMessages: handleOnMessage,
          });
        } catch (e) {
          console.log(e);
        }
      }
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
h3,
h4 {
  margin: 6px 0;
}

.listContainer {
  display: grid;
  row-gap: 16px;
}

.listItem {
  padding: 8px;
  background-color: red;
}
</style>
