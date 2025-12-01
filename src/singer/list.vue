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
      <el-table-column prop="name" label="歌手" width="180"> </el-table-column>
      <el-table-column prop="pic" label="图片">
        <template slot-scope="scope">
          <img
            :src="getImageUrl(scope.row.pic)"
            style="
              width: 80px;
              height: 80px;
              border-radius: 5px;
              object-fit: cover;
            "
          />
        </template>
      </el-table-column>
      <el-table-column prop="sex" label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.sex == 1">男</span>
          <span v-if="scope.row.sex == 0">女</span>
          <span v-if="scope.row.sex == 2">组合</span>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="地点"> </el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
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
          <el-input v-model="form.name" placeholder="请输入歌手名"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select
            v-model="form.sex"
            style="width: 100%"
            placeholder="请选择性别"
          >
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="0"></el-option>
            <el-option label="组合" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="请输入地区"></el-input>
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
      dialogTitle: "", // 新增标题控制变量
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
  created: function () {
    this.query();
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      if (path.indexOf("http") === 0) return path;
      console.log("path=" + "http://localhost:8085" + path);
      return "http://localhost:8085" + path;
    },

    // 【修改点3】优化上传成功逻辑
    handlepicSuccess(res, file) {
      // 1. 兼容 JSON 字符串
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch (e) {
          console.error(e);
          return this.$message.error("上传响应解析失败");
        }
      }

      // 2. 预览
      this.imageUrl = URL.createObjectURL(file.raw);

      // 3. 赋值 (兼容 path 和 url)
      if (res.success || res.code === 1) {
        this.form.pic = res.path || res.url;
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

    submit() {
      request.post("singers", this.form).then((res) => {
        if (res == true) {
          this.$message({
            message: "操作成功",
            type: "success",
          });
          this.dialogVisible = false;
          this.query();
        } else {
          console.log(res);
          this.$message.error("操作失败");
        }
      });
    },

    query() {
      request
        .get("singers", {
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

    // 【修改点4】完善新增逻辑
    handleAdd() {
      this.dialogTitle = "添加歌手"; // 设置标题
      this.dialogVisible = true;

      // 重置表单
      this.form = {
        id: "",
        name: "",
        sex: "1", // 默认男
        pic: "",
        location: "",
      };

      this.imageUrl = ""; // 清空图片预览

      // 清空校验状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },

    // 【修改点5】完善编辑逻辑
    handleEdit(row) {
      this.dialogTitle = "修改歌手"; // 设置标题
      this.dialogVisible = true;

      // 赋值数据
      this.form.id = row.id;
      this.form.name = row.name;
      // 这里的类型转换要小心，根据后端返回类型调整
      this.form.sex = String(row.sex);
      this.form.location = row.location;
      this.form.pic = row.pic;

      // 预览图片
      if (row.pic) {
        this.imageUrl = this.getImageUrl(row.pic);
      } else {
        this.imageUrl = "";
      }

      // 清空校验状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },

    handleDelete(index, row) {
      request.delete(`singers/${row.id}`).then((res) => {
        if (res == true) {
          this.$message({
            message: "删除成功",
            type: "success",
          });
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
