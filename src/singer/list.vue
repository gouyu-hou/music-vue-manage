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
      <el-table-column prop="name" label="歌手" width="180"> </el-table-column>
      <el-table-column prop="pic" label="图片">
        <template slot-scope="scope">
          <img
            :src="getImageUrl(scope.row.pic)"
            style="width: 80px; height: 80px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="sex" label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.sex == 1">男</span>
          <span v-if="scope.row.sex == 0">女</span>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="地点"> </el-table-column>
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
        <el-form-item label="头像">
          <el-upload
            class="pic-uploader"
            action="http://localhost:8085/music/file/singerPic/upload"
            :show-file-list="false"
            :on-success="handlepicSuccess"
            :before-upload="beforepicUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="pic" />
            <i v-else class="el-icon-plus pic-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name"></el-input>
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
        <el-form-item label="地点">
          <el-input v-model="form.location"></el-input>
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
        name: "",
        sex: "",
        pic: "",
        location: "",
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
      console.log("path=" + "http://localhost:8085" + path);
      return "http://localhost:8085" + path;
    },
    // 【核心修复】上传成功后的处理
    handlepicSuccess(res, file) {
      // 1. 兼容后端返回字符串的情况，手动转JSON
      if (typeof res === "string") {
        res = JSON.parse(res);
      }

      // 前端显示图片预览
      this.imageUrl = URL.createObjectURL(file.raw);

      // 2. 判断 success (根据后端逻辑，成功可能是 success:true 或 code:1)
      if (res.success || res.code === 1) {
        // 3. 赋值给表单的 pic 字段
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
      request.post("singers", this.form).then((res) => {
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
        .get("singers", {
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
      this.form.name = "";
      this.form.sex = "";
      this.form.pic = "";
      this.imageUrl = "";
      this.location = "";
    },
    // 点击编辑
    handleEdit(row) {
      //显示对话框
      this.dialogVisible = true;
      //将row赋值到form
      this.form.id = row.id;
      this.form.name = row.name;
      row.sex == "1" ? (this.form.sex = "1") : (this.form.sex = "0");
      this.form.location = row.location;

      // 【重要】确保编辑时回显图片路径
      this.form.pic = row.pic;

      // 处理预览图显示
      if (row.pic) {
        this.imageUrl = this.getImageUrl(row.pic);
      } else {
        this.imageUrl = "";
      }
    },
    // 点击删除
    handleDelete(index, row) {
      request.delete(`singers/${row.id}`).then((res) => {
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
