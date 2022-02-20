<template>
    <div>
         <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input v-model="queryInfo.query" clearable @clear="getGoodsList"
                    @keyup.enter.native="getGoodsList">
                        <el-button slot="append" class="el-icon-search" @click="serchGoods"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="3">
                    <el-button type="primary" @click="goGoodsAdd">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="goods">
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" width="350px"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
                <el-table-column prop="add_time" label="创建时间">
                    <template slot-scope="scope">
                        {{scope.row.add_time|datefomat}}
                    </template>
                </el-table-column>
                <el-table-column  label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit"  size="mini">修改</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeGoods(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
export default {
    created(){
        this.getGoodsList()
    },
  data () {
    return {
        queryInfo:{
            query:"",
            pagenum:1,
            pagesize:10
        },
        goods:[],
        total:0
    };
  },
    methods:{
       async getGoodsList(){
           const {data:res}=await this.$http.get('goods',{params:this.queryInfo})
           if(res.meta.status!=200) return this.$message.error('请求失败')
           this.$message.success('请求成功')
           console.log(res);
           this.total=res.data.total
           this.goods=res.data.goods
        },
        // 分页
        handleSizeChange(pagesize){
            this.queryInfo.pagesize = pagesize 
            this.getGoodsList()
            },
        handleCurrentChange(pagenum){
        this.queryInfo.pagenum = pagenum
        this.getGoodsList()
        },
        serchGoods(){
            this.getGoodsList()
        },
        async removeGoods(id){
             this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(async() => {
                   const {data:res}=await this.$http.delete(`goods/${id}`)
                    if(res.meta.status!=200) return this.$message.error('删除失败')
                    this.$message.success('删除成功')
                    this.getGoodsList()
                }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
             
        },
        // 添加商品
        goGoodsAdd(){
            this.$router.push('goodsadd')
        }
             
                
        
    }
}
</script>
<style lang='less' scoped>
    
</style>