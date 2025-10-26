import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import EventDetail from "../components/EventDetail.vue";
import CreateEvent from "../components/CreateEvent.vue";
import EditEvent from "../components/EditEvent.vue";
import UserProfile from "../components/UserProfile.vue";

const routes = [
  { path: "/", redirect: "/home" }, 
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/event-detail", component: EventDetail },
  { path: "/create-event", component: CreateEvent },
  { path: "/event-edit", component: EditEvent },
  { path: "/profile", component: UserProfile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
