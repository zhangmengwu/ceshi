<template>
    <div>
        <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
          <el-button type="primary" @click="showAddRolesDialogVisible">添加角色</el-button>
          <el-table :data="rolesList" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                   <el-row :class="['bdbottom',index1==0?'bdtop':'']"  v-for="(item1,index1) in scope.row.children" :key="item1.id">
                    <el-col :span="5">
                      <el-tag  closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="19">
                      <el-row :class="[index2==0?'':'bdtop']" v-for="(item2,index2) in item1.children" :key="item2.id">
                        <el-col :span="6">
                            <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="18">
                            <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">
                                {{item3.authName}}
                            </el-tag>
                        </el-col>
                      </el-row>
                    </el-col>
                   </el-row>
                   
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="roleName" label="角色名称"></el-table-column>
            <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
            <el-table-column width="290px" label="操作">
                <template slot-scope="scope">
                     <el-button size="mini" icon="el-icon-edit" type="primary">编辑</el-button>
                     <el-button  icon="el-icon-delete" size="mini"  type="danger" @click="deleteRole(scope.row.id)" >删除</el-button>
                     <el-button icon="el-icon-setting" size="mini"  type="warning" @click="showRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
          </el-table>
      </el-card>

      <el-dialog title="分配权限" :visible.sync="rightDialogVisible" width="50%" @close="setRightDialogClosed">
        <el-tree
        :data="rightList"
        :props="defaultProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="mytree">
        </el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="rightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="alloRight">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="添加角色"
        :visible.sync="addRolesDialogVisible"
        width="50%"
        @close="roleClosed">
        <el-form label-width="100px" :rules="rolesRules" :model="addRoles" ref="addroleFormRef">
           <el-form-item label="角色名称:" prop="roleNames">
            <el-input v-model="addRoles.roleNames"></el-input>
          </el-form-item>
          <el-form-item label="角色描述:"  prop="roleDescs">
            <el-input v-model="addRoles.roleDescs"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRolelist">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
       rolesList:[],
       rightDialogVisible:false,
       addRolesDialogVisible:false,
       rightList:[],
       defaultProps: {
        children: 'children',
        label: 'authName'
       },
       defKeys:[],
       id:0,
       rolesRules: {
          roleNames: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
          ],
          roleDescs: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
          ],
       },
       addRoles:{
         roleNames:'',
         roleDescs:''
       }
     
    };
  },
  created () {
      this.getRolesList()
  },
    methods:{
      async getRolesList(){
        const {data:res}=await this.$http.get('roles');
        if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
        this.rolesList=res.data;
       },
       removeRightById(role,rightId){
           this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
         const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
         if(res.meta.status != 200) return this.$message.error('删除权限失败');
            role.children = res.data
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
       },
       async showRightDialog(row){
           this.id=row.id;
           this.getLeafKeys(row.children);
           const {data:res}=await this.$http.get('rights/tree');
           if (res.meta.status!==200) return this.$message.error('请求数据失败！');
           this.rightList=res.data;
           console.log(res.data);
           this.rightDialogVisible=true;
       },
        getLeafKeys(arr) {
            for(var i=0; i<arr.length;i++){
                if (arr[i].children) {
                    this.getLeafKeys(arr[i].children);
                }else{
                    this.defKeys.push(arr[i].id);
                }
            }
        },
        async alloRight(){
           var ids=[...this.$refs.mytree.getCheckedKeys(),...this.$refs.mytree.getHalfCheckedKeys()];
           ids=ids.join(',');
           const {data:res}=await this.$http.post(`roles/${this.id}/rights`,{rids:ids});
           if(res.meta.status!==200) return this.message.error('分配权限失败!');
           this.getRolesList();
           this.rightDialogVisible=false;
        },
        setRightDialogClosed(){
            this.defKeys=[];
        },
        showAddRolesDialogVisible(){
          this.addRolesDialogVisible=true;
        },
        async addRolelist(){
          this.$refs.addroleFormRef.validate(async valid=>{
            if (!valid) return
            this.addRolesDialogVisible=false;
            const {data:res}=await this.$http.post('roles',{roleName:this.addRoles.roleNames,roleDesc:this.addRoles.roleDescs});
            if(res.meta.status!==201) return this.message.error('角色添加失败!');
            this.getRolesList();
          })
        },
        roleClosed(){
          this.$refs.addroleFormRef.resetFields();
        },
        deleteRole(id){
          console.log(id);
          this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
             const {data:res}=await this.$http.delete('roles/'+id);
            if(res.meta.status!==200) return this.message.error('角色删除失败!');
            this.getRolesList();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });          
          });
        }

    }
}
</script>
<style lang='less' scoped>
    .el-card{
        margin-top: 15px;
    }
    .el-tag{
        margin: 7px;
    }
   .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .el-row{
        align-items: center;
        display: flex;
    }
    .el-table{
        margin-top: 15px;
    }
</style>