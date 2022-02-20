<template>
    <div>
         <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-button type="primary" @click="showaddCateDialog">添加商品</el-button>

        <!-- 商品表格 -->
        <tree-table
        :data="cateList"
        :columns="columns"
        border
        show-header
        :show-summary="false"
        show-row-hover
        show-index
        tree-type
        is-fold
        :expand-type="false"
        :selection-type="false">
        <template slot="isok" slot-scope="scope"> 
            <i class="el-icon-success" v-if="scope.row.cat_deleted == false" style="color:lightgreen"></i>
            <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template slot="order" slot-scope="scope"> 
            <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" > 
             <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
             <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
        </tree-table>
        <!-- 商品分页 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </el-card>


      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
         @close="addCateDialogClosed">
         <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
                <el-cascader 
                 v-model="selectedKeys" 
                :options="parentCateList" 
                :props="cascaderProps" 
                clearable 
                @change="parentCateChanged" ></el-cascader>
            </el-form-item> 
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
       queryInfo:{
           type:3,
           pagenum:1,
           pagesize:5
       },
       cateList:[],
       total:0,
       columns:[
          {
            label: '分类名称',
            prop: 'cat_name',
          },
          {
            label: '是否有效',
            type:'template',
            template:'isok'
          },
           {
            label: '排序',
            type:'template',
            template:'order'
          },
           {
            label: '操作',
            type:'template',
            template:'opt'
          },
       ],
       addCateDialogVisible:false,
       addCateForm:{
           //将要添加的分类的名称
            cat_name:'',
            // 父级分类的id
            cat_pid:0,
            //分类的等级，默认要添加的是1级分类
            cat_level:0
       }, 
       addCateFormRules:{
            cat_name:[
                {required:true,message:'请输入分类名称',trigger:'blur'}
            ]
        },
        parentCateList:[],
        //选中的父级分类的id数组
        selectedKeys:[],
        //指定级联选择器的配置对象
        cascaderProps:{
            expandTrigger:'hover',
            value:'cat_id',
            label:'cat_name',
            children:'children',
            checkStrictly:true
        },
    };
  },
  created () {
    this.getCateList();  
  },
  methods:{
    async getCateList(){
        const {data:res}=await this.$http.get('categories',{params:this.queryInfo});
        console.log(res);
        this.cateList=res.data.result;
        this.total=res.data.total;
    },
    handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize;
        this.getCateList();
    },
    handleCurrentChange(pagenum){
        this.queryInfo.pagenum=pagenum;
        this.getCateList();
    },
    showaddCateDialog(){
         this.getParentCateList();
        this.addCateDialogVisible=true;
    },
    addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
     //获取父类的数据列表
    async getParentCateList(){
        const {data:res} = await this.$http.get('categories',{params:{type:2}});
        if(res.meta.status != 200){
            return this.$message.error('获取父级分类数据失败!');
        }
        console.log(res.data);
          this.parentCateList = res.data
        },
        parentCateChanged(){
             console.log(this.selectedKeys)
            // console.log(this.selectedKeys)
            // 如果selectedKeys数组中的length大于0，证明选中的父级分类 反之，就说明没有选择任何父级分类
            if(this.selectedKeys.length >0 ){
                //父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                //为当前分类的等价赋值
                this.addCateForm.cat_level = this.selectedKeys.length 
                return 
            }else{
                // 父级分类的id
                this.addCateForm.cat_pid = 0
                //为当前分类的等级赋值
                this.addCateForm.cat_level = 0
            }                         
        },
         addCate(){
            this.$refs.addCateFormRef.validate(async valid=>{
                if(!valid)return 
                console.log(this.addCateForm)
                const {data:res} = await this.$http.post('categories',this.addCateForm)
                if(res.meta.status != 201){
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addCateDialogVisible = false 
            })
        }  
    }
}
</script>
<style lang='less' scoped>
    .el-button{
        margin-bottom: 15px;

    }
    .el-card{
        margin-top: 15px;
    }
    .el-cascader{
        width:100%;
    }

</style>