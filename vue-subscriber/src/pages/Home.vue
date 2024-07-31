<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import LoginForm from "../containers/LoginForm.vue";
import { TESTNET_ACCESS_TOKEN, TESTNET_BROKER_URL } from "../constants";

export default {
  components: {
    LoginForm,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const isCustomMode = ref(false);

    const handleToggleMode = () => {
      isCustomMode.value = !isCustomMode.value;
    };

    const handleBaseLogin = () => {
      const payload = {
        accessToken: TESTNET_ACCESS_TOKEN,
        serverUrl: TESTNET_BROKER_URL,
      };

      userStore.setUserData(payload);

      router.push("/PurrFlix/video");
    };

    return {
      isCustomMode,
      handleBaseLogin,
      handleToggleMode,
    };
  },
};
</script>

<template>
  <base-page-container>
    <div class="contentContainer">
      <div class="formContainer">
        <div v-if="isCustomMode" class="baseLoginContainer">
          <login-form></login-form>
          <button v-on:click="handleToggleMode">
            Help me, I don't know what this means
          </button>
        </div>

        <div v-else class="baseLoginContainer">
          <button v-on:click="handleBaseLogin">Start</button>
          <button v-on:click="handleToggleMode">I know what I'm doing</button>
        </div>
      </div>
    </div>
  </base-page-container>
</template>

<style scoped>
.contentContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.formContainer {
  width: 90%;
  margin: 64px 0;
}

.baseLoginContainer {
  display: flex;
  flex-direction: column;
}

.baseLoginContainer > * {
  margin-bottom: 16px;
}

@media (min-width: 600px) {
  .formContainer {
    width: 50%;
  }
}
</style>
