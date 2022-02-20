import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局的样式表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

Vue.filter('datefomat', function(str) {
    var date = new Date(str * 1000)
    var y = date.getFullYear()
    var mm = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var m = date.getMinutes()
    var s = date.getSeconds()
    return `${y}-${mm}-${d} ${h}:${m}:${s}`
})

axios.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token');
        return config
    })
    //配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //把axios请求放到vue原型上使用this调用￥http发送请求
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')