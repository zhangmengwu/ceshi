<template>
    <div>
        <!-- 面包屑 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card>
            <!-- 警告 -->
            <el-alert title="添加商品信息" center type="info" show-icon :closable="false">
            </el-alert>
            <!-- step步骤条 -->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tab栏切换 -->
            <el-form :model="addForm" :rules="addRuleForm" ref="addRuleFormRef" class="demo-ruleForm">
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeave"
                @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类">
                            <el-cascader
                                v-model="goods_cat"
                                :options="cateList"
                                :props="cateOptions"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 多选框 -->
                        <el-form-item v-for="item in manyTabData" :key="item.attr_id" :label="item.attr_name" >
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item1" v-for="(item1,index) in item.attr_vals"
                                :key="index" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label="item.attr_name" >
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 图片上传 -->
                        <el-upload
                        class="upload-demo"
                        :action="uploadURL"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture" :headers="headerToken"
                         :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-edit v-model="addForm.goods_introduce"></quill-edit>
                        <el-button type="primary" @click="add">点击提交</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
        title="图片预览"
        :visible.sync="previewDialogVisible"
        width="80%">
        <img :src="previewSrc" alt="">
        </el-dialog>
    </div>
</template>
<script>
export default {
    created(){
        this.getCateList()
    },
  data () {
    return {
        activeIndex:'0',
        addForm:{
            goods_name:'',
            goods_price:0,
            goods_weight:0,
            goods_number:0,
            pics:[],
            goods_introduce:''
        },
        // 数据列表
        cateList:[],
        // 规则
        cateOptions:{ 
          expandTrigger: 'hover',
          value:'cat_id',
          label:'cat_name',
          children:'children' 
        },
        goods_cat:[],
        addRuleForm:{
           goods_name:[{required:true,message:'请输入商品名称',trigger:'blur'}],
           goods_price:[{required:true,message:'请输入商品价格',trigger:'blur'}],
           goods_weight:[{required:true,message:'请输入商品重量',trigger:'blur'}],
           goods_number:[{required:true,message:'请输入商品数量',trigger:'blur'}]
        },
        // 动态参数
        manyTabData:[],
        // 静态属性
        onlyTabData:[],
        // 图片上传地址
        uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
        headerToken:{
            Authorization:window.sessionStorage.getItem('token')
        },
        previewSrc:'',
        previewDialogVisible:false

        
    };
  },
    methods:{
        async getCateList(){
        const {data:res} = await this.$http.get('categories')
        if(res.meta.status != 200)return this.$message.error('请求数据失败')
        this.cateList = res.data 
        console.log(res.data)
        },
        handleChange(){
        console.log(this.goods_cat)
        if(this.goods_cat.length<=2){
            this.goods_cat=[]
            return
            }
        },
        // 如果未选商品分类 阻止代码向下执行
        beforeLeave(){
            if(this.activeIndex=='0'&&this.goods_cat.length!=3){
                this.$message.error('请选择商品分类')
                return false
            }
        },//点击切换tab时触发的函数
       async tabClicked(){
           if(this.activeIndex=='1'){
              const{data:res} =await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
              if(res.meta.status!=200)return this.$message.error('请求失败')
              console.log(res.data);
              
              res.data.forEach((item)=>{
                  if(item.attr_vals==''){
                      item.attr_vals=[]
                  }else{
                      item.attr_vals=item.attr_vals.split(' ')
                  }
              })
              this.manyTabData=res.data
           }else if(this.activeIndex=='2'){
               const{data:res} =await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
              if(res.meta.status!=200)return this.$message.error('请求失败')
               this.onlyTabData=res.data
           }
        },
        // 图片上传是时触发的预览函数
        handlePreview(file){
            console.log(file);
            
            this.previewSrc=file.response.data.url
            this.previewDialogVisible=true
        },
        // 点击图片删除时触发
        handleRemove(file){
            var tmp_path=file.response.data.tmp_path
            for(var i=0;i<this.addForm.pics.length ;i++) {
                if(this.addForm.pics[i]==tmp_path){
                    this.addForm.pics.splice(i,1)
                    break
                }
            }
        },
        handleSuccess(response){
            var picsObj={pic:response.data.tmp_path}
            this.addForm.pics.push(picsObj)
        },
        add(){
            this.$refs.addRuleFormRef.validate(valid=>{
                if(!valid) return this.$message.error('验证失败')
            })
        }
    },
    computed:{
        cateId(){
            return this.goods_cat[this.goods_cat.length-1]
        }
    }
}
</script>
<style  lang="less">
    .ql-container{
        height: 400px!important
    }
</style>
<style lang='less' scoped>
    
</style>