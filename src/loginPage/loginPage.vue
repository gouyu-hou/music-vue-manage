<template>
  <div class="background">
    <div class="box">
      <span v-if="flag == 'login'">
        <h2>登录</h2>
        <!--  :model="form" 绑定了某个对象 -->
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="用户名">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              clearable
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="login-footer">
          <el-button @click="register">注 册</el-button>
          <el-button type="primary" @click="submit">登 录</el-button>
        </span>
      </span>
      <span v-else>
        <h2>注册</h2>
        <!--  :model="form" 绑定了某个对象 -->
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="用户名">
            <el-input
              v-model="form.username"
              placeholder="请输入注册用户名, 长度在4-10之间"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              placeholder="请输入注册密码, 长度在4-16之间"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              v-model="form.confirmPassword"
              placeholder="请再次输入注册密码, 请确保与第一次密码一致"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="login-footer">
          <el-button @click="login">返 回</el-button>
          <el-button type="primary" @click="submit">注 册</el-button>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import request from "../utils/request";
export default {
  data() {
    return {
      flag: "login",
      form: {
        id: "",
        username: "",
        password: "",
        confirmPassword: "",
      },
    };
  },
  methods: {
    submit() {
      if (this.flag == "login") {
        // 登录逻辑
        if (this.form.username == "" || this.form.password == "") {
          return this.$message.error("请输入用户名和密码");
        }

        request.post("users/login", this.form).then((res) => {
          // 修改判断逻辑：如果返回的是对象且包含id，说明登录成功
          // (注意：如果后端失败返回false，这里 res 就是 false)
          if (res && res.id) {
            this.$message.success("登录成功");

            // 【关键】将完整的用户信息对象转为字符串存储到 localStorage
            // 这样 Header.vue 才能读取到 id, username, avator
            localStorage.setItem("user", JSON.stringify(res));

            // 兼容旧逻辑（可选）
            localStorage.setItem("username", res.username);

            this.$router.push("/index");
          } else {
            this.$message.error("登录失败，请检查账号密码是否正确");
          }
        });
      } else {
        // 注册逻辑 (保持不变)
        if (
          this.form.password == "" ||
          this.form.confirmPassword == "" ||
          this.form.username == ""
        ) {
          return this.$message.error("请输入用户名、密码和确认密码");
        } else if (
          this.form.username.length < 4 ||
          this.form.username.length > 10
        ) {
          return this.$message.error("用户名长度必须在4-10之间");
        } else if (
          this.form.password.length < 4 ||
          this.form.password.length > 16
        ) {
          return this.$message.error("密码长度必须在4-16之间");
        } else if (this.form.password != this.form.confirmPassword) {
          return this.$message.error("两次密码不一致");
        }
        request.post("users/register", this.form).then((res) => {
          if (res == true) {
            // 注册接口通常还是返回 boolean
            this.$message.success("注册成功");
            this.flag = "login";
            this.form.password = this.form.confirmPassword;
          } else {
            this.$message.error("注册失败");
          }
        });
      }
    },
    register() {
      this.flag = "register";
      this.form.password = "";
      this.form.confirmPassword = "";
    },
    login() {
      this.flag = "login";
      this.form.password = "";
    },
  },
};
</script>

<style scoped>
.background {
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  position: fixed;
  background-color: gray;
  top: 0;
  left: 0;
}

.box {
  width: 400px;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin: 11% auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px #ccc;
}

.login-footer {
  position: absolute;
  justify-content: space-between;
  width: 200px;
  height: 40px;
  border-radius: 10px;
  bottom: 40%;
  left: 45%;
}
</style>
