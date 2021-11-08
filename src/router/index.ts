import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import TerminalView from "../views/Terminal.vue";
import LoginAndRegistrationDummy from "../components/LoginAndRegistrationDummy.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Terminal",
    component: TerminalView,
  },
  {
    path: "/authentication",
    name: "Authentication",
    component: LoginAndRegistrationDummy,
  },
  {
    path: "/manual",
    name: "Man Page",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Manual.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
