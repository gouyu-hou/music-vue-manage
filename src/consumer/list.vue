<template>
  <div>
    <p>
      <el-input
        v-model="name"
        placeholder="请输入关键字"
        clearable
        style="width: 300px"
        @clear="query"
      ></el-input>
      <el-button type="success" @click="query" icon="el-icon-search"
        >查询</el-button
      >
      <el-button type="primary" @click="handleAdd" icon="el-icon-plus"
        >新增</el-button
      >
    </p>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="编号" width="180"> </el-table-column>
      <el-table-column prop="username" label="姓名" width="180">
      </el-table-column>
      <el-table-column prop="password" label="密码"> </el-table-column>
      <el-table-column prop="sex" label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.sex == 1">男</span>
          <span v-if="scope.row.sex == 0">女</span>
        </template>
      </el-table-column>
      <el-table-column prop="avator" label="头像">
        <template slot-scope="scope">
          <img
            :src="getImageUrl(scope.row.avator)"
            style="width: 80px; height: 80px; border-radius: 5px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="phoneNum" label="手机号码"> </el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >

          <el-popconfirm
            title="这是一段内容确定删除吗？"
            @confirm="handleDelete(scope.$index, scope.row)"
            style="margin-left: 10px"
          >
            <el-button
              slot="reference"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[4, 10, 20, 50]"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" label-width="80px">
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
        <el-form-item label="名称">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select
            v-model="form.sex"
            style="width: 100%"
            placeholder="请选择性别"
          >
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机">
          <el-input
            v-model="form.phoneNum"
            placeholder="请输入手机号"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "../utils/request";
export default {
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: "", // 【新增】用于控制对话框标题
      name: "",
      pageNum: 1,
      size: 4,
      total: 0,
      imageUrl: "",
      form: {
        id: "",
        username: "",
        password: "",
        sex: "",
        phoneNum: "",
        avator: "",
      },
    };
  },
  created: function () {
    this.query();
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      if (path.indexOf("http") === 0) return path;
      return this.$apiServer + path;
    },

    handleAvatarSuccess(res, file) {
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch (e) {
          console.error(e);
          return this.$message.error("上传响应解析失败");
        }
      }
      this.imageUrl = URL.createObjectURL(file.raw);
      if (res.success || res.code === 1) {
        this.form.avator = res.path;
        this.$message.success("上传成功");
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

    handleSizeChange(val) {
      this.size = val;
      this.query();
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.query();
    },

    // 【修改点3】完善新增逻辑
    handleAdd() {
      this.dialogTitle = "添加用户"; // 设置标题
      this.dialogVisible = true;

      // 彻底重置表单，给性别默认值
      this.form = {
        id: "",
        username: "",
        password: "",
        sex: "1", // 默认为男
        phoneNum: "",
        avator: "",
      };

      this.imageUrl = ""; // 清空图片预览

      // 清除可能存在的表单验证红字
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },

    // 【修改点4】完善编辑逻辑
    handleEdit(index, row) {
      this.dialogTitle = "修改用户"; // 设置标题
      this.dialogVisible = true;

      // 赋值数据
      this.form.id = row.id;
      this.form.username = row.username;
      this.form.password = row.password;
      this.form.sex = row.sex;
      this.form.phoneNum = row.phoneNum;
      this.form.avator = row.avator;

      // 设置预览图
      if (row.avator) {
        this.imageUrl = this.getImageUrl(row.avator);
      } else {
        this.imageUrl = "";
      }

      // 清除验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },

    submit() {
      request.post("/consumer/update", this.form).then((res) => {
        if (res.success == true) {
          this.$message.success("操作成功");
          this.dialogVisible = false;
          this.query();
        } else {
          this.$message.error("操作失败");
        }
      });
    },

    query() {
      request
        .get("consumer/list", {
          params: {
            name: this.name,
            pageNum: this.pageNum,
            size: this.size,
          },
        })
        .then((res) => {
          this.tableData = res.list;
          this.total = res.total;
        });
    },

    handleDelete(index, row) {
      request
        .get("/consumer/delete", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.success == true) {
            this.$message.success("删除成功");
            this.query();
          } else {
            this.$message.error("删除失败");
          }
        });
    },

    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
  },
};
</script>

<style>
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
}
</style>
