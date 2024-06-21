<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

export default {
  setup() {
    const router = useRouter();
    const accessToken = ref("");
    const brokerUrl = ref("");
    const userStore = useUserStore();

    const handleLogIn = () => {
      if (accessToken.value && brokerUrl.value) {
        const payload = {
          accessToken: accessToken.value,
          serverUrl: brokerUrl.value,
        };

        userStore.setUserData(payload);

        router.push("/PurrFlix/video");
      } else {
        alert("Missing access token or broker server URL");
      }
    };

    return {
      accessToken,
      brokerUrl,
      handleLogIn,
    };
  },
};
</script>

<template>
  <form v-on:submit.prevent="handleLogIn">
    <div class="inputContainer">
      <label for="accessToken">Access Token</label>
      <input
        id="accessToken"
        placeholder="Enter subscriber access token"
        v-model="accessToken"
      />
    </div>

    <div class="inputContainer">
      <label for="brokerUrl">Broker Server URL</label>
      <input
        id="brokerUrl"
        placeholder="Enter broker server URL"
        v-model="brokerUrl"
      />
    </div>

    <button>Login</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

form > *:not(:first-child) {
  margin-top: 16px;
}

.inputContainer {
  display: flex;
  flex-direction: column;
}

.inputContainer > label {
  margin-bottom: 8px;
}
</style>
