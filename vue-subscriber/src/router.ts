import {
  createRouter,
  createWebHistory,
  RouteRecordSingleView,
} from "vue-router";
import { useUserStore } from "./stores/userStore";
import HomePage from "./pages/Home.vue";
import VideoPage from "./pages/Video.vue";

const routes: RouteRecordSingleView[] = [
  { path: "/PurrFlix/", component: HomePage },
  {
    path: "/PurrFlix/video",
    component: VideoPage,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(function (to, _from, next) {
  const userStore = useUserStore();

  if (
    to.path === "/video" &&
    (!userStore.getAccessToken || !userStore.getServerUrl)
  ) {
    next("/");
  } else {
    next();
  }
});

export default router;
