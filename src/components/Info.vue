<template>
  <div class="info-wrap">
    <el-card class="box-card" style="width: 500px; margin: 50px auto">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 18px">个人信息编辑</span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            show-password
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>

        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="$apiServer + '/music/file/avatar/upload'"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="save">保存修改</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from "../utils/request";

export default {
  name: "Info",
  data() {
    return {
      imageUrl: "",
      form: {
        id: "",
        username: "",
        password: "",
        avator: "", // 确保 avator 字段始终存在
      },
    };
  },
  created() {
    this.loadUserInfo();
  },
  methods: {
    getImageUrl(path) {
  if (!path) return "";
  if (path.indexOf("http") === 0) return path;
  return this.$apiServer + path;
},

    loadUserInfo() {
      let userStr = localStorage.getItem("user");
      if (!userStr) {
        this.$message.error("未登录");
        this.$router.push("/");
        return;
      }
      let userObj = JSON.parse(userStr);

      request.get("/users/detail?id=" + userObj.id).then((res) => {
        // 兼容处理
        let data = res.data || res;
        if (data) {
          // 【核心修复】不要直接 this.form = data;
          // 而是像 consumer/list.vue 那样逐个赋值，确保 form 结构稳固
          this.form.id = userObj.id;
          this.form.username = data.username;
          // 密码通常不回显，或者是空，防止覆盖
          this.form.password = data.password;
          this.form.avator = data.avator;

          // 回显头像预览
          if (this.form.avator) {
            this.imageUrl = this.getImageUrl(this.form.avator);
          }
        } else {
          this.$message.error("获取用户信息失败");
        }
      });
    },

    handleAvatarSuccess(res, file) {
      // 1. JSON 解析兼容
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch (e) {
          console.error(e);
          return this.$message.error("上传响应解析失败");
        }
      }

      // 2. 显示本地预览
      this.imageUrl = URL.createObjectURL(file.raw);

      // 3. 赋值路径给表单
      if (res.success || res.code === 1) {
        // 优先使用后端返回的完整 url (OSS场景)，或者是 path
        this.form.avator = res.path;
        this.$message.success("头像上传成功");
        console.log("上传成功，图片路径:", this.form.avator);
      } else {
        this.$message.error(res.message || "上传失败");
      }
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
      }
      if (!isLt10M) {
        this.$message.error("上传头像图片大小不能超过 10MB!");
      }
      return isJPG && isLt10M;
    },

    save() {
      if (!this.form.id) {
        this.$message.error("用户信息异常，请重新登录");
        return;
      }

      // 发送请求时，this.form 中必然包含 avator
      request.post("/users/update", this.form).then((res) => {
        if (res.success === true || res === true) {
          this.$message.success("修改成功");

          // 更新本地缓存
          let oldUser = JSON.parse(localStorage.getItem("user"));
          // 合并新数据
          let newUser = { ...oldUser, ...this.form };
          localStorage.setItem("user", JSON.stringify(newUser));
          localStorage.setItem("username", this.form.username);

          // 延迟刷新
          setTimeout(() => {
            location.reload();
          }, 500);
        } else {
          this.$message.error("修改失败");
        }
      });
    },
  },
};
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
