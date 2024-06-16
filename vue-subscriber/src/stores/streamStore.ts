import { defineStore } from "pinia";

interface StreamStore {
  activeStream: any | null;
}

export const useStreamStore = defineStore("stream", {
  state: () => {
    return { activeStream: null } as StreamStore;
  },
  getters: {
    getActiveStream: (state) => state.activeStream,
  },
  actions: {
    setActiveStream(activeStreamConfig: any) {
      this.activeStream = activeStreamConfig;
    },
  },
});
