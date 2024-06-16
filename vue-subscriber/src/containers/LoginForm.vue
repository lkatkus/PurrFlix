<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

// const DEVNET_ACCESS_TOKEN =
//   "SAAOLK2QRXMNEICFGSH6H24QTB7X27NFATR2FOGCMX4762OJLX3GDHKCMM";
// const DEVNET_BROKER_URL =
//   "wss://europe-west3-gcp-dal-devnet-brokernode-cluster03.synternet.com:443";

const TESTNET_ACCESS_TOKEN =
  "SAABQWC4KNWKXVJ2KT5P23I2CXZY32CWVQMPPS64FXWFDOZRVVVM6CC6BM";
const TESTNET_BROKER_URL =
  "wss://europe-west3-gcp-dl-testnet-brokernode-frankfurt01.synternet.com:443";

const ACCESS_TOKEN = TESTNET_ACCESS_TOKEN;
const BROKER_URL = TESTNET_BROKER_URL;
const SERVER_OPTIONS = [
  // { text: "Devnet", value: DEVNET_BROKER_URL },
  { text: "Testnet", value: TESTNET_BROKER_URL },
];

export default {
  setup() {
    const router = useRouter();
    const accessToken = ref(ACCESS_TOKEN);
    const brokerUrl = ref(BROKER_URL);
    const userStore = useUserStore();

    const handleLogIn = () => {
      const payload = {
        accessToken: accessToken.value,
        serverUrl: brokerUrl.value,
      };

      userStore.setUserData(payload);

      router.push("/video");
    };

    return {
      accessToken,
      brokerUrl,
      options: SERVER_OPTIONS,
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
      <select id="brokerUrl" v-model="brokerUrl">
        <option disabled value="">Please select one</option>
        <option v-for="option in options" :value="option.value">
          {{ option.text }}
        </option>
      </select>
    </div>

    <div>
      <button>Login</button>
    </div>
  </form>
</template>

<style scoped>
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
