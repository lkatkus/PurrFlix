import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import BasePageContainer from "./components/BasePageContainer.vue";

const app = createApp(App);
const store = createPinia();

app.use(router);
app.use(store);

app.component("BasePageContainer", BasePageContainer);

app.mount("#app");
