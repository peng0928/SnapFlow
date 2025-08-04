import {createApp} from 'vue'
import App from './App.vue'

import './style.css'

import './demos/ipc'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'
const app = createApp(App)

// 使用路由
app.use(ElementPlus)
app.use(router)

app.mount('#app')