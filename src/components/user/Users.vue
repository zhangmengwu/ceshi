<template>
  <div>
    <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页1</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理1</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表1</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card class="box-card">
      <!-- 用户添加搜索区域 -->
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @click="getUserList" class="cor">
              <el-button slot="append" icon="el-icon-search" @click="fn"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary"  @click="addDialogVisible = true" >添加用户</el-button>
          </el-col>
        </el-row>
       <!-- 用户列表区域 -->
        <el-table :data="userList" border style="width: 100%">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username" label="姓名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="userStateChanged(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditFormDialog(scope.row.id)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteuser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="权限分配" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="fenPeiJiaoSe(scope.row)"></el-button>
            </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
        
      </el-card>
    
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="35%" @closed="dialogClosed">
        <el-form label-width="80px" :rules="addUserRules" :model="addForm" ref="addFormRef">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" >
            <el-input v-model="addForm.password" type="password" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile" placeholder=""></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"  @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%" @closed="editDialogClosed">
        <el-form label-width="80px" :rules="addUserRules" :model="editForm" ref="editFormRef">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" ></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"  @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      
      <el-dialog title="提示" :visible.sync="fenPeiDialogFormVisible" width="50%" @close="closeRoleInfo">
        <p>当前的用户 : {{user.username}}</p>
        <p>当前的角色 : {{user.role_name}}</p>
        <p>分配新角色 : 
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
        <span slot="footer" class="dialog-footer">
          <el-button @click="fenPeiDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>
<script>
import { async } from 'q';
export default {
      data () {
        var checkEmail = (rule,value,cb)=>{
        //验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)){
          //合法的邮箱
          return cb();
        }
        cb(new Error('请输入合法的邮箱'));
      }
      //验证手机号的规则
      var checkMobile = (rule,value,cb)=>{
        //验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)){
          return cb();
        }
        cb(new Error('请输入合法的手机号'))
      }
      return {
        queryInfo:{
          query:'',
          //当前页数
          pagenum:1,
          //每页显示几条
          pagesize:2
        },
        userList:[],
        //总条数
        total:0,
        addDialogVisible: false,
        editDialogVisible:false,
        fenPeiDialogFormVisible:false,
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        editForm:{
          email:'',
          mobile:''
        },
        addUserRules: {
          username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
          //  {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            { required: true, message: '请输入手机', trigger: 'blur' },
            // {validator:checkMobile,trigger:'blur'}
          ]
        },
        id:0,
        user:{},
        rolesList:[],
        selectedRoleId:''
      };
    },
    created () {
      this.getUserList()
    },
    
    methods:{
      //查询用户列表
      async getUserList(){
        const {data:res}=await this.$http.get('users',{params:this.queryInfo});
       
        if(res.meta.status !==200) return this.message.error('获取用户列表失败');
        this.userList=res.data.users;
        this.total=res.data.total;   
      },
      //监听pagesize改变的事件
      handleSizeChange(newSeize){
        this.queryInfo.pagesize=newSeize;
        this.getUserList();
      },
      //监听pagenum页码改变的事件
      handleCurrentChange(newCurrent){
        this.queryInfo.pagenum=newCurrent;
        this.getUserList();
      },
      async userStateChanged(userInfo){
        console.log(userInfo);
        const {data:res}=await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
        this.getUserList();
        if (res.meta.status !==200) {
          userInfo.mg_state = !userInfo.mg_state;
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
      },
      fn(){
        this.queryInfo.pagenum = 1
        this.getUserList()
      },
      dialogClosed(){
        this.$refs.addFormRef.resetFields();
      },
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          if (!valid) return
          const {data:res} = await this.$http.post('users',this.addForm);
           if(res.meta.status !== 201)return this.$message.error('修改用户信息失败');
          console.log(res);
          this.$message.success('用户创建成功！');
          this.getUserList();
          this.addDialogVisible=false;
        })
      },
      async showEditFormDialog(id){
        this.id=id;
        const {data:res} = await this.$http.get('users/'+id,this.editForm);
        this.editForm=res.data;
        this.editDialogVisible=true;
      },
      editDialogClosed(){
        this.$refs.editFormRef.resetFields();
      },
      async editUser(){
          const {data:res} = await this.$http.put('users/'+this.id,{email:this.editForm.email,mobile:this.editForm.mobile});
          if(res.meta.status != 200)return this.$message.error('修改用户信息失败');
          this.$message.success('用户创建成功！');
          this.getUserList();
          this.editDialogVisible=false;
      },
       deleteuser(id){
        this.$confirm('此操作将永久删除当前用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const {data:res}=await this.$http.delete('users/'+id);
          if(res.meta.status!==200) return this.$message.error('删除用户信息失败！');
          this.$message.success('删除用户信息成功！');
          this.getUserList();
          this.$message({
            type: 'success',
            message: '删除用户成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      async fenPeiJiaoSe(user){
        this.fenPeiDialogFormVisible=true;
        this.user=user;
        const {data:res}=await this.$http.get('roles');
        if(res.meta.status!==200) return this.$message.error('获取角色列表失败！');
        this.rolesList=res.data;
      },
      async saveRoleInfo(){
        this.fenPeiDialogFormVisible=false;
        if(!this.selectedRoleId){
          return this.$message.error('请选择角色！');
        } 
        if(this.user.username==='admin'){
          return this.$message.error('超级管理不能修改！');
        } 
        const {data:res} = await this.$http.put(`users/${this.user.id}/role`,{rid:this.selectedRoleId});
        if(res.meta.status!==200) return this.$message.error('更新角色失败！');
          this.$message.success('更新角色成功！');
          this.getUserList();
      },
      closeRoleInfo(){
        this.selectedRoleId=''
        // this.rolesList=[];
      }
    }
}
</script>
<style lang='less' scoped>
    .el-breadcrumb{
      margin-bottom: 15px;
      font-size: 12px;

    }
    .el-card{
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15)!important;
    }
    .el-table{
      margin-top: 15px;
      font-size: 12px;
    }
    .el-pagination{
       margin-top: 15px;
    }
    .el-dialog p{
      margin: 10px;
    }
    .el-input{
      width: 350px;
      margin-bottom: -20px;
    }
    .cor{
      width: 350px;
    }
    .el-form{
      margin-left: 30px;
    }
</style>
