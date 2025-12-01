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
      <el-button type="success" @click="query">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </p>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="编号" width="180"> </el-table-column>
      <el-table-column prop="title" label="歌单名" width="180">
      </el-table-column>
      <el-table-column prop="pic" label="歌单封面">
        <template slot-scope="scope">
          <img
            :src="getImageUrl(scope.row.pic)"
            style="width: 80px; height: 80px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="introduction" label="简介"> </el-table-column>
      <el-table-column prop="style" label="风格"> </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">Edit</el-button>
          <el-popconfirm
            title="这是一段内容确定删除吗？"
            @confirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button slot="reference" type="danger">删除</el-button>
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
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="歌单封面">
          <el-upload
            class="pic-uploader"
            action="http://localhost:8085/music/file/upload"
            :show-file-list="false"
            :on-success="handlepicSuccess"
            :before-upload="beforepicUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="pic" />
            <i v-else class="el-icon-plus pic-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="歌单名">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.introduction"></el-input>
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="form.style"></el-input>
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
        title: "",
        pic: "",
        introduction: "",
        style: "",
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
    getImageUrl(path) {
      if (!path) return "";
      if (path.indexOf("http") === 0) return path;
      console.log("path=" + "http://localhost:8085" + path);
      return "http://localhost:8085" + path;
    },

    // 【修复点2 & 3】删除重复方法，增加JSON解析
    handlepicSuccess(res, file) {
      // 1. 手动解析 JSON 字符串
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch (e) {
          console.error(e);
          return this.$message.error("上传响应解析失败");
        }
      }

      // 前端显示预览
      this.imageUrl = URL.createObjectURL(file.raw);

      // 2. 判断成功
      if (res.success || res.code === 1) {
        // 3. 赋值路径
        this.form.pic = res.path;
        this.$message.success("上传成功");
        console.log("上传成功，图片路径:", this.form.pic);
      } else {
        this.$message.error(res.message || "上传失败");
      }
    },

    beforepicUpload(file) {
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
      request.post("songLists", this.form).then((res) => {
        if (res == true) {
          this.$message({
            message: "操作成功",
            type: "success",
          });
          //关闭对话框
          this.dialogVisible = false;
          //重新查询数据
          this.query();
        } else {
          console.log(res);
          this.$message.error("操作失败");
        }
      });
    },
    //封装查询请求
    query() {
      //发起查询
      request
        .get("songLists", {
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
      this.form.title = "";
      this.form.pic = "";
      this.imageUrl = "";
      this.form.introduction = "";
      this.form.style = "";
    },
    // 点击编辑
    handleEdit(row) {
      //显示对话框
      this.dialogVisible = true;
      //将row赋值到form
      this.form.id = row.id;
      this.form.title = row.title;
      this.form.style = row.style;
      this.form.introduction = row.introduction;

      // 【修复点4】确保编辑时回显图片路径，防止提交空值
      this.form.pic = row.pic;

      // 预览图片处理
      if (row.pic) {
        this.imageUrl = this.getImageUrl(row.pic);
      } else {
        this.imageUrl = "";
      }
    },
    // 点击删除
    handleDelete(index, row) {
      request.delete(`songLists/${row.id}`).then((res) => {
        if (res == true) {
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
.pic-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pic-uploader .el-upload:hover {
  border-color: #409eff;
}

.pic-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.pic {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
