<template>
  <div
    style="
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #ccc;
      display: flex;
    "
  >
    <div
      style="
        width: 200px;
        padding-left: 30px;
        font-weight: bold;
        color: dodgerblue;
      "
    >
      管理系统
    </div>
    <div style="flex: 1"></div>
    <div style="width: 150px">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          <div class="userbox">
            <el-avatar
              :size="50"
              :src="user.avator || defaultAvatar"
            ></el-avatar>
            <span style="margin-left: 10px">{{ user.username }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </div>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="login" v-if="!isLogin"
            >登录</el-dropdown-item
          >
          <el-dropdown-item command="info" v-if="isLogin"
            >个人信息</el-dropdown-item
          >
          <el-dropdown-item command="logout" v-if="isLogin"
            >退出系统</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import request from "../utils/request";

export default {
  name: "Header",
  data() {
    return {
      defaultAvatar:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      user: {
        username: "未登录",
        avator: "",
      },
      isLogin: false,
    };
  },
  created() {
    this.initUser();
  },
  methods: {
    // 【核心修改】初始化用户数据
    initUser() {
      // 1. 尝试从缓存获取基础信息（主要是为了拿到 ID）
      const userStr = localStorage.getItem("user");

      if (userStr) {
        try {
          const localUser = JSON.parse(userStr);
          // 只要缓存里有 ID，我们就去后端查最新的
          if (localUser.id) {
            this.fetchLatestUserInfo(localUser.id);
          } else {
            // 缓存格式不对，视为未登录
            this.resetUser();
          }
        } catch (e) {
          this.resetUser();
        }
      } else {
        this.resetUser();
      }
    },

    // 【新增】调用后端接口获取最新信息
    fetchLatestUserInfo(id) {
      request
        .get("/users/detail?id=" + id)
        .then((res) => {
          // 兼容处理：有的后端直接返回对象，有的包了一层 data
          let data = res.data || res;

          if (data && data.id) {
            this.isLogin = true;
            this.user = data;

            // 处理头像路径：如果是相对路径，拼接服务器地址
            if (this.user.avator && !this.user.avator.startsWith("http")) {
              this.user.avator = "http://localhost:8085" + this.user.avator;
            }

            // 【可选】顺便更新一下本地缓存，保持同步
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("username", this.user.username);
          } else {
            // 查询失败（可能用户被删了），重置状态
            this.resetUser();
          }
        })
        .catch((err) => {
          console.error("获取用户信息失败", err);
          // 接口报错时，勉强使用本地缓存显示（降级处理）
          const userStr = localStorage.getItem("user");
          if (userStr) this.user = JSON.parse(userStr);
        });
    },

    resetUser() {
      this.user = { username: "未登录", avator: "" };
      this.isLogin = false;
    },

    handleCommand(command) {
      if (command === "login") {
        this.$router.push("/");
      } else if (command === "logout") {
        this.logout();
      } else if (command === "info") {
        this.$router.push("/info");
      }
    },

    logout() {
      request.get("/users/logout").finally(() => {
        this.$message.success("退出成功");
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        this.resetUser();
        this.$router.push("/");
      });
    },
  },
};
</script>

<style>
.userbox {
  width: 150px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
