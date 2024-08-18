import { defineStore } from "pinia";

interface StreamStore {
  activeStream: any | null;
  activeStreamMetadata: any | null;
}

export const useStreamStore = defineStore("stream", {
  state: () => {
    return { activeStream: null, activeStreamMetadata: null } as StreamStore;
  },
  getters: {
    getActiveStream: (state) => state.activeStream,
    getActiveStreamMetadata: (state) => state.activeStreamMetadata,
  },
  actions: {
    setActiveStream(activeStream: any) {
      this.activeStream = activeStream;
    },
    setActiveStreamMetadata(activeStreamMetadata: any) {
      this.activeStreamMetadata = activeStreamMetadata;
    },
  },
});
