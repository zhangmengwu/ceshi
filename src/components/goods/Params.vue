<template>
  <div>
     <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <div style="margin:15px 0;">
        <span>选择商品分类:</span>
        <el-cascader
          v-model="selectedParent" 
          :options="catelist" 
          :props="cateProps" 
          clearable 
          @change="parentChange" 
         ></el-cascader>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many"> 
          <!-- 只有当级联选择器选了，并且选的是三级分类的数据，才是激活状态 -->
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                   <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small"@click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>          
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                   <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>  
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
      <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible=false">取消</el-button>
          <el-button type="primary"  @click="addParams">确定</el-button>
        </span>
      </el-dialog>

       <!-- 修改参数的对话框 -->
      <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible=false">取消</el-button>
          <el-button type="primary" @click="editParams">确定</el-button>
        </span>
      </el-dialog>
  </div>
</template>
<script>
export default {
  //created 数据和方法准备好了（越早越好） mounted dom准备好了 
  created(){
    this.getCateList()
  },
  data () {
    return {
      catelist:[],
      cateProps:{
        expandTrigger: 'hover',
        label:'cat_name',
        value:'cat_id',
        children:'children'
      },
      selectedParent:[],//选中的数据组成的数组
      activeName:'many',
      manyTableData:[],//存动态属性数据
      onlyTableData:[],//存静态参数的数据
       addDialogVisible:false,
      addForm:{},
      addFormRules:{},
      //添加表单验证规则的对象
      addFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      },
       editDialogVisible:false,
      // 修改的表单数据对象
      editForm:{},
      //修改表单的验证规则对象
      editFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      },
       //控制按钮与文本框的切换显示
      inputVisible:false,
      //文本框中输入的内容
      inputValue:''
    };
  },
  methods:{
    async getCateList(){
      //axios只能用于vue 和ajax axios只不过是封装了一下fetch.... 
      //axios更好用一点 基于promise的 原生的ajax在用的时候callback hell 拦截器
      const {data:res} =  await this.$http.get('categories')
      if(res.meta.status != 200)return this.$message.error('请求数据失败')
      this.catelist = res.data 
      console.log(this.catelist)
    },
    //级联选择器对应的回调函数当中
    async parentChange(){
     this.getParamsData()
    },
    handleClick(){
      console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData(){
      console.log(this.selectedParent)
      //如果用户选的不是三级分类，就阻止掉，同时重置一下选中的值为空
      if(this.selectedParent.length != 3){
        this.selectedParent = []
        this.manyTableData = []
        this.onlyTableData = []
        return //代码不能往下执行了
      }
      //请求数据
      // var catId = this.selectedParent[this.selectedParent.length -1]//父级分类的Id
      const {data:res} =  await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
      if(res.meta.status != 200)return this.$message.error('请求数据失败')
      // console.log(res.data)
       res.data.forEach(item=>{
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
           //控制文本框的显示与隐藏
          item.inputVisible = false 
          //文本框中输入的值
          item.inputValue = ''
        })
      if(this.activeName == 'only'){
        this.onlyTableData = res.data 
      }else{
        this.manyTableData = res.data 
      }
    },
     addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      addParams(){
        this.$refs.addFormRef.validate(async valid=>{  
          if(!valid)return 
          const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
            attr_name:this.addForm.attr_name,
            attr_sel:this.activeName
          })
          if(res.meta.status != 201){
            return this.$message.error('添加参数失败 ')
          }
          this.$message.success('添加参数成功')
          this.addDialogVisible = false 
          this.getParamsData()
        })
      },
       editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮显示修改对话框
     
      async showEditDialog(attr_id){
        // console.log(attr_id)
        //查询当前参数的信息
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
        if(res.meta.status != 200){
          return this.$message.error('获取参数信息失败!')
        }
        this.editForm = res.data 
        this.editDialogVisible = true 
      },
      editParams(){
        this.$refs.editFormRef.validate(async valid=>{
          if(!valid)return 
          const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName})
          if(res.meta.status != 200){
            return this.$message.error('修改参数失败')
          }
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false 
        })    
      },
       //根据id删除对应的参数项
      async removeParams(attr_id){
        const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续?','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).catch(err=>err)

        //用户取消了删除的操作
        if(confirmResult != 'confirm'){
          return this.$message.info('已取消删除!')
        }

        //删除的业务逻辑
        const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

        if(res.meta.status != 200){
          return this.$message.error('删除参数失败')
        }

        this.$message.success('删除参数成功')
        this.getParamsData()
      },
        //文本框失去焦点或按下了enter键
     async handleInputConfirm(row){
        if(row.inputValue.trim().length === 0){
          row.inputValue = ''
          row.inputVisible = false 
          return 
        } 
        //如果没有return,则证明输入的内容，需要做后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false

        //需要发起请求，保存这次操作
        this.saveAttrValues(row)
        //如果没有return,则证明输入的内容，需要做后续处理
      },
       showInput(row){
        row.inputVisible = true 
        //让文本框自动获得焦点
        //$nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码 
        //这个_作用是占位符，你写啥都行，必须要有一个东西放那块
        this.$nextTick(_=>{
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
            //删除对应的参数和选项
      handleClose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrValues(row)
      },
      async saveAttrValues(row){
        //需要发起请求，保存这次操作
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(',')})
        if(res.meta.status != 200){
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
      }
  },
  computed:{
    isDisabled:function(){
      return this.selectedParent.length != 3
    },
    cateId:function(){
      return this.selectedParent[this.selectedParent.length -1];
    },
    titleText(){
      if(this.activeName === 'many'){
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  }
}
</script>
<style lang='less' scoped>
  .el-tag{
    margin:10px;
  }
  .el-button{
        margin-bottom: 15px;

    }
    .el-card{
        margin-top: 15px;
    }
     .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
</style>
