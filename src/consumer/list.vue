<template>
  <div>
    <p>
      <!-- v-model="name"绑定了变量name -->
      <el-input
        v-model="name"
        placeholder="请输入关键字"
        clearable
        style="width: 300px"
      ></el-input>
      <el-button type="success" @click="query">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </p>
    <!-- dom 数据 绑定了数据源tableData -->
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
            style="width: 80px; height: 80px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="phoneNum" label="手机号码"> </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >Edit</el-button
          >
          <el-popconfirm
            title="这是一段内容确定删除吗？"
            @confirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button slot="reference" type="danger">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
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
    <!-- 对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <!--  :model="form" 绑定了某个对象 -->
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="头像">
          <!-- 上传组件 -->
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8085/music/file/avatar/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password"></el-input>
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
          <el-input v-model="form.phoneNum"></el-input>
        </el-form-item>
        <el-form-item label="文件">
          <!-- 上传组件 -->
          <el-upload
            class="upload-demo"
            action="http://localhost:8085/music/file/music/upload"
            :file-list="fileList"
            :on-success="handleAvatarSuccess"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<!-- js 中有对象数据 -->
<script>
import request from "../utils/request";
export default {
  //vue对象中的数据==data
  data() {
    return {
      tableData: [],
      dialogVisible: false,
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
      fileList: [],
    };
  },
  //生命周期：vue创建成功后触发的函数
  created: function () {
    //发起查询
    this.query();
  },
  //定义函数集
  methods: {
    //上传成功后的处理
    // handleAvatarSuccess(res, file) {
    //     this.fileList = res;
    //     this.form.url = res.url
    //     console.log("res[0].name=" + res.url);
    // },
    getImageUrl(path) {
      console.log("path=" + "http://localhost:8085" + path);
      return "http://localhost:8085" + path;
    },
    // 【保留并修改】使用这一段，确保赋值给 form.avator
    handleAvatarSuccess(res, file) {
      // 1. 如果 res 是字符串，手动转成 JSON 对象
      if (typeof res === "string") {
        res = JSON.parse(res);
      }

      // 前端显示图片预览
      this.imageUrl = URL.createObjectURL(file.raw);

      // 2. 判断 success
      // 注意：有的后端返回 code:1，有的返回 success:true，请根据您的实际打印结果调整
      if (res.success || res.code === 1) {
        // 3. 赋值给表单
        this.form.avator = res.path;
        this.$message.success("上传成功");
        console.log("上传成功，新路径已赋值:", this.form.avator);
      } else {
        this.$message.error(res.message || "上传失败");
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG\png 格式!");
      }
      if (!isLt10M) {
        this.$message.error("上传头像图片大小不能超过 10MB!");
      }
      return isJPG && isLt10M;
    },
    //记录条数的变化
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      //变更查询条数
      this.size = val;
      //查询数据
      this.query();
    },
    //页码的变化
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      //变更当前页码
      this.pageNum = val;
      //查询数据
      this.query();
    },
    //提交处理-发起请求
    submit() {
      //发起查询
      request.post("/consumer/update", this.form).then((res) => {
        if (res.success == true) {
          this.$message({
            message: "操作成功",
            type: "success",
          });
          //关闭对话框
          this.dialogVisible = false;
          //重新查询数据
          this.query();
        } else {
          this.$message.error("操作失败");
        }
      });
    },
    //封装查询请求
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
          console.log(res);
          this.tableData = res.list;
          this.total = res.total;
        });
    },
    // 点击新增
    handleAdd() {
      this.dialogVisible = true;
      this.form.id = "";
      this.form.username = "";
      this.form.password = "";
      this.form.sex = "";
      this.form.phoneNum = "";
      this.imageUrl = "";
    },
    // 点击编辑
    handleEdit(index, row) {
      console.log(index, row);

      // 显示对话框
      this.dialogVisible = true;

      // 将row赋值到form
      this.form.id = row.id;
      this.form.username = row.username;
      this.form.password = row.password;
      this.form.sex = row.sex;
      this.form.phoneNum = row.phoneNum;

      // 【新增修复】必须把原有的头像路径赋值给 form，否则不修改图片提交时字段为空
      this.form.avator = row.avator;

      // 设置预览图（如果有头像，就显示原来的，没有就置空）
      if (row.avator) {
        this.imageUrl = this.getImageUrl(row.avator);
      } else {
        this.imageUrl = "";
      }
    },
    // 点击删除
    handleDelete(index, row) {
      request
        .get("/consumer/delete", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.success == true) {
            this.$message({
              message: "删除成功",
              type: "success",
            });
            //重新查询数据
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
