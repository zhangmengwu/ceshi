<template>
    <div>
       <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-card>
         <el-table :data="rightsList" border style="width: 100%">
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="authName" label="权限名称"></el-table-column>
            <el-table-column prop="path" label="路径"></el-table-column>
            <el-table-column prop="level" label="权限等级">
                <template slot-scope="scope">
                    
                    <!-- <el-tag type="info" v-if="scope.row.level === '0'">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.level === '2'">三级</el-tag> -->
                    <el-tag :type="obj[scope.row.level].type">{{obj[scope.row.level].name}}</el-tag>
                </template>
            </el-table-column>
        </el-table>
      </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
       rightsList:[],
       obj:{
           0:{
               name:'一级',
               type:''
           },
           1:{
               name:'二级',
               type:'success'
           },
           2:{
               name:'三级',
               type:'warning'
           }
       }
    };
  },
  created () {
      this.getRightsList()
  },
  methods:{
    async getRightsList(){
      const {data:res}=await this.$http.get('rights/list',{params:this.queryInfo});
      if(res.meta.status !==200) return this.message.error('获取权限列表失败');
      this.rightsList=res.data;
      console.log(this.rightsList);
    }
  }
}
</script>
<style lang='less' scoped>
    .el-card{
        margin-top: 15px;
    }
</style>