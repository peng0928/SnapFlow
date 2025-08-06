import {createApp} from 'vue'
import App from './App.vue'

import './style.css'

import './demos/ipc'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueDOMPurifyHTML from 'vue-dompurify-html';
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

// 使用路由
app.use(ElementPlus)
app.use(VueDOMPurifyHTML)
app.use(router)

app.mount('#app')