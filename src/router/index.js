import Vue from "vue";
import Router from "vue-router";
import login from "@/loginPage/loginPage.vue";
import Layout from "@/components/Layout";
import consumer_list from "@/consumer/list.vue";
import singer_list from "@/singer/list.vue";
import song_list from "@/song/list.vue";
import music_list from "@/music/list.vue";
import Info from "@/components/Info.vue"; // 【新增 1】引入个人信息组件

Vue.use(Router);
export default new Router({
  routes: [
    {
      path: "/",
      name: "login",
      component: login,
    },
    {
      path: "/index",
      name: "Layout",
      component: Layout,
      children: [
        {
          path: "/consumer_list",
          name: "consumer_list",
          component: consumer_list,
        },
        {
          path: "/singer_list",
          name: "singer_list",
          component: singer_list,
        },
        {
          path: "/song_list",
          name: "song_list",
          component: song_list,
        },
        {
          path: "/music_list",
          name: "music_list",
          component: music_list,
        },
        {
          // 【新增 2】个人信息路由
          path: "/info",
          name: "info",
          component: Info,
        },
      ],
    },
  ],
});
