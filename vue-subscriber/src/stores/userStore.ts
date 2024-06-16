import { defineStore } from "pinia";

interface UserStore {
  accessToken: string | null;
  serverUrl: string | null;
}

export const useUserStore = defineStore("user", {
  state: () => {
    return { accessToken: null, serverUrl: null } as UserStore;
  },
  getters: {
    getAccessToken: (state) => state.accessToken,
    getServerUrl: (state) => state.serverUrl,
  },
  actions: {
    setUserData(userData: { accessToken: string; serverUrl: string }) {
      this.accessToken = userData.accessToken;
      this.serverUrl = userData.serverUrl;
    },
  },
});
