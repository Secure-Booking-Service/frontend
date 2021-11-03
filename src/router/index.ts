import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Terminal from "../views/Terminal.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Terminal",
    component: Terminal,
  },
  
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
