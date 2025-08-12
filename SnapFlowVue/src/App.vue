<template>
  <el-container class="main-content">
    <!-- 顶部工具栏 -->
    <el-header height="10px" class="flex mt-5  gap-3 items-center text-center justify-between">
      <div class="flex items-center text-center gap-1">
        <el-button-group>
          <el-button :type="isRecording ? 'primary' : ''" @click="toggleRecording" size="small">
            <el-icon>
              <VideoPlay/>
            </el-icon>
            {{ isRecording ? '停止' : '开始' }}记录
          </el-button>
          <el-button @click="clearRecords" size="small">
            <el-icon>
              <Delete/>
            </el-icon>
            清空
          </el-button>
<!--          <el-button @click="postData('10086')" size="small">-->
<!--            测试-->
<!--          </el-button>-->
        </el-button-group>

        <el-input
            v-model="filterText"
            placeholder="过滤请求"
            clearable
            size="small"
            style="width: 200px; margin-left: 10px"
        >
          <template #prefix>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-input>

        <el-button @click="exportHar" :disabled="requests.length === 0" size="small">
          <el-icon>
            <Download/>
          </el-icon>
          导出 HAR
        </el-button>

        <el-button @click="openInBrowser('http://mitm.it')" size="small">
          证书安装
        </el-button>
        <div>
        </div>
      </div>

      <div class="">
        <SwitchVue/>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main>
      <div style="height: 100%;">
        <el-splitter layout="vertical">
          <el-splitter-panel>
            <div class="overflow-y-auto no-scrollbar"
                 style="height: 100%; scrollbar-width: none; -ms-overflow-style: none;">
              <el-table
                  :data="filteredRequests"
                  style="width: 100%"
                  :max-height="'calc(90vh)'"
                  stripe
                  highlight-current-row
                  @row-click="handleRowClick"
                  empty-text="没有捕获到网络请求"
                  @row-contextmenu="handleRightClick"
              >
                <el-table-column prop="status" label="状态" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)" size="small">
                      {{ row.status || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="method" label="方法" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getMethodTagType(row.method)" size="small">
                      {{ row.method }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="method" label="请求" width="90" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getMethodTagType(row.scheme)" size="small">
                      {{ row.scheme || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="url" label="URL" min-width="400">
                  <template #default="{ row }">
                    <div class="flex gap-2 items-center text-center">
                      <img src="./assets/svg/CatppuccinUrl.svg" alt="Icon" width="15"
                           height="15">
                      <el-tag type="info" >
                        {{ row.url }}
                      </el-tag>
                    </div>

                  </template>
                </el-table-column>
                <el-table-column prop="domain" label="类型" width="100">
                  <template #default="{ row }">
                    <img :src="row.url" alt="" v-if="handle_png(row)" width="50" height="50"/>
                    <div v-else class="flex items-center text-center gap-1 ">
                      <div class="bg-green-200 rounded ">
                        <img src="./assets/svg/BiFiletypeJson.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-if="row.type.toLowerCase() === 'json'">
                        <img src="./assets/svg/TablerFileTypeHtml.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'html'">
                        <img src="./assets/svg/AntDesignJavaScriptOutlined.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'js'">
                        <img src="./assets/svg/MaterialSymbolsFilePng.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'png'">
                        <img src="./assets/svg/MdiFileJpgBox.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'jpg'">
                        <img src="./assets/svg/MaterialSymbolsGif2Sharp.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'gif'">
                        <img src="./assets/svg/FluentDocumentCss16Filled.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'css'">
                        <img src="./assets/svg/MaterialSymbolsTextFieldsRounded.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'text'">
                        <img src="./assets/svg/MaterialSymbolsTextFieldsRounded.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else-if="row.type.toLowerCase() === 'txt'">
                        <img src="./assets/svg/UiwFileUnknown.svg" alt="Icon" width="30"
                             height="30" class="p-1" v-else>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="size" label="大小" width="100">
                  <template #default="{ row }">
                    <el-tag type="primary">
                      {{ formatSize(row.size) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <!--                <el-table-column prop="time" label="耗时" width="100">-->
                <!--                  <template #default="{ row }">-->
                <!--                    {{ row.timings.cost ? `${row.timings.cost}ms` : '-' }}-->
                <!--                  </template>-->
                <!--                </el-table-column>-->
              </el-table>

              <!-- 右键菜单 -->
              <div v-if="contextMenu.visible"
                   :style="{left: contextMenu.left + 'px', top: contextMenu.top + 'px'}"
                   class="context-menu text-xs p-1 text-nowrap rounded "
                   :class="handleRowClass()"
              >
                <!-- 关闭按钮 -->
                <div class="close-btn" @click.stop="closeContextMenu">
                  <img src="./assets/svg/MaterialSymbolsLightCancelPresentationOutline.svg" alt="Icon" width="25"
                       height="25">
                </div>

                <div @click="handleMenuClick('curl')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/IconParkCurling.svg" alt="Icon" width="15" height="15">
                  复制 CURL
                </div>
                <div @click="handleMenuClick('request')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/MaterialSymbolsSendAndArchiveOutlineRounded.svg" alt="Icon" width="15"
                       height="15">
                  复制 Request
                </div>
                <div @click="handleMenuClick('cookie')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/LineMdCookieCheck.svg" alt="Icon" width="15" height="15">
                  复制 Cookie
                </div>
                <div @click="handleMenuClick('header')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/JamHeader.svg" alt="Icon" width="15" height="15">
                  复制 Headers
                </div>
                <div @click="handleMenuClick('params')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/OuiTokenParameter.svg" alt="Icon" width="15" height="15">
                  复制 请求参数
                </div>
                <div @click="handleMenuClick('copy')" class="hover:bg-blue-300 flex gap-3 items-center text-center">
                  <img src="./assets/svg/IcRoundReplay.svg" alt="Icon" width="15" height="15">
                  重发请求
                </div>
              </div>
            </div>
          </el-splitter-panel>
          <el-splitter-panel v-if="selectedRequest">
            <!-- 可调整高度的内容区域 -->
            <el-tabs class="detail-tabs hide-scrollbar p-3" addable>
              <template #add-icon>
                <el-icon @click="selectedRequest=false">
                  <SemiSelect/>
                </el-icon>
              </template>
              <el-tab-pane>
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <Position/>
                    </el-icon>
                    <span>概览</span>
                  </div>
                </template>
                <div class="">
                  <div>
                    <div>
                      <el-text class="text-md font-semibold">常规</el-text>
                    </div>
                    <div class="border-t border-gray-300 my-2"></div>
                    <div class="grid gap-1 italic text-xs pl-3">
                      <div class="flex">
                        <el-text class="w-72">请求网站</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ selectedRequest.url }}</el-text>
                      </div>
                      <div class="flex">
                        <el-text class="w-72">请求方法</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ selectedRequest.method }}</el-text>
                      </div>
                      <div class="flex">
                        <el-text class="w-72">状态代码</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ selectedRequest.status }}</el-text>
                      </div>
                      <div class="flex">
                        <el-text class="w-72">远程地址</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ selectedRequest.host }}</el-text>
                      </div>
                    </div>
                    <div class="border-t border-gray-300 my-2"></div>
                  </div>

                  <div>
                    <div>
                      <div class="text-md font-semibold text-yellow-600">响应标头</div>
                    </div>
                    <div class="border-t border-gray-300 my-2"></div>
                    <div class="grid gap-1 italic text-base pl-3">
                      <div class="flex text-xs" v-for="(value, key) in selectedRequest.responseHeaders">
                        <el-text class="w-72">{{ key }}</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ value }}</el-text>
                      </div>
                    </div>
                    <div class="border-t border-gray-300 my-2"></div>
                  </div>

                  <div>
                    <div>
                      <span class="text-md font-semibold text-blue-600">请求标头</span>
                    </div>
                    <div class="border-t border-gray-300 my-2"></div>
                    <div class="grid gap-1 italic text-base pl-3">
                      <div class="flex text-xs" v-for="(value, key) in selectedRequest.requestHeaders">
                        <el-text class="w-72">{{ key }}</el-text>
                        <el-text class="min-w-0 flex-1 break-all">{{ value }}</el-text>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="">
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <Key/>
                    </el-icon>
                    <span>参数</span>
                  </div>
                </template>
                <div v-if="check_if(selectedRequest.params)">
                  <div>
                    <div class="text-md font-semibold ">URL参数</div>
                  </div>
                  <div class="border-t border-gray-300 my-1 pb-1"></div>
                  <JsonViewer
                      :data="try_parse(selectedRequest.params)"
                      :darkMode="isDarkMode"
                      class="break-all"
                  />
                </div>
                <div v-if="check_if(selectedRequest.body)">
                  <div>
                    <div class="text-md font-semibold text-blue-600">请求参数</div>
                  </div>
                  <div class="border-t border-gray-300 my-1 pb-1"></div>
                  <JsonViewer
                      :data="try_parse(selectedRequest.body)"
                      :darkMode="isDarkMode"
                      class="break-all"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane>
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <View/>
                    </el-icon>
                    <span>预览</span>
                  </div>
                </template>
                <div v-if="selectedRequest.type.toLowerCase() === 'json'">
                  <JsonViewer
                      :data="jsonSource"
                      :darkMode="isDarkMode"
                      class="break-all"
                  />
                </div>
                <el-text v-dompurify-html="selectedRequest.text" class="pl-3 pr-3" v-else></el-text>
              </el-tab-pane>
              <el-tab-pane label="响应">
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <Pointer/>
                    </el-icon>
                    <span>响应</span>
                  </div>
                </template>
                <el-text class="pl-3 pr-3">{{ selectedRequest.text }}</el-text>
              </el-tab-pane>
              <el-tab-pane>
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <Timer/>
                    </el-icon>
                    <span>时间线</span>
                  </div>
                </template>
                <el-timeline class="hide-scrollbar">
                  <el-timeline-item
                      v-for="(event, index) in selectedRequest.timings"
                      :key="index"
                      :timestamp="event.timestamp"
                      placement="top"
                  >
                    <el-tag size="small" type="info">{{ event }} ms</el-tag>
                    {{ index }}
                  </el-timeline-item>
                </el-timeline>
              </el-tab-pane>
              <el-tab-pane>
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <img src="./assets/svg/EmojioneCookie.svg" alt="Icon" width="15" height="15">
                    <span>Cookie</span>
                  </div>


                </template>

                <div v-if="check_cookie(selectedRequest.requestHeaders)">
                  <div>
                    <el-text class="text-md font-semibold ">请求Cookie</el-text>
                  </div>
                  <div class="border-t border-gray-300 my-1 pb-1"></div>
                  <JsonViewer
                      :data="get_cookie(selectedRequest.requestHeaders)"
                      :darkMode="isDarkMode"
                      class="break-all"

                  />
                </div>

                <div v-if="check_cookie(selectedRequest.responseHeaders)" class="pt-5">
                  <div>
                    <div class="text-md font-semibold text-yellow-600">响应Cookie</div>
                  </div>
                  <div class="border-t border-gray-300 my-1 pb-1"></div>
                  <JsonViewer
                      :data="get_cookie(selectedRequest.responseHeaders)"
                      :darkMode="isDarkMode"
                      class="break-all"
                  />
                </div>

              </el-tab-pane>

            </el-tabs>
          </el-splitter-panel>
        </el-splitter>
      </div>
    </el-main>

  </el-container>
</template>

<script setup>
import axios from 'axios'
import useClipboard from 'vue-clipboard3'

const {toClipboard} = useClipboard()
import {computed, onMounted, ref, watch} from 'vue'
import {
  Connection,
  Delete,
  Document,
  Download,
  Key,
  Picture,
  Pointer,
  Position,
  Search,
  SemiSelect,
  Timer,
  VideoPlay,
  View
} from '@element-plus/icons-vue'
import SwitchVue from './components/model/SwitchVue.vue'
import {JsonViewer} from '@anilkumarthakur/vue3-json-viewer';
import '@anilkumarthakur/vue3-json-viewer/styles.css';
import {isDark} from "vue-dark-switch"
import {ElMessage} from 'element-plus'
import {curlToPython} from "./common/tools";

// 请求记录
const requests = ref([])
const selectedRequest = ref(null)
const isRecording = ref(true)
const filterText = ref('')
const activeView = ref('all')
const isDarkMode = ref(true);

const jsonSource = ref({})
// 模拟一些初始数据
const ws = ref()
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 100
const reconnectDelay = 1000


const initWebSocket = () => {
  const wsUrl = 'ws://localhost:8765'
  if (ws.value) {
    ws.value.close()
  }
  ws.value = new WebSocket(wsUrl)

  ws.value.onopen = () => {
    isConnected.value = true
    console.log('WebSocket连接已建立')
  }

  ws.value.onmessage = (event) => {
    try {
      if (isRecording.value) {
        const data = JSON.parse(event.data)
        requests.value.push(data)
      }
    } catch (error) {
      console.error('解析WebSocket数据失败:', error)
    }
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket错误:', error)
    isConnected.value = false
  }

  ws.value.onclose = () => {
    isConnected.value = false
    console.log('WebSocket连接已关闭')
  }
}

const reconnect = () => {
  if (reconnectAttempts.value < maxReconnectAttempts) {
    reconnectAttempts.value++
    console.log(`尝试重新连接 (${reconnectAttempts.value}/${maxReconnectAttempts})...`)
    setTimeout(() => {
      initWebSocket()
    }, reconnectDelay)
  } else {
    console.log(`已达到最大重连次数 (${maxReconnectAttempts})，停止尝试`)
  }
}

// 初始化模拟数据
onMounted(() => {
  // postData()
  initWebSocket()
})
watch(isConnected, (newVal, oldVal) => {
  if (!newVal && oldVal) { // 从连接状态变为断开状态
    reconnect()
  }
})
// 过滤后的请求列表
const filteredRequests = computed(() => {
  let result = [...requests.value]

  // 按类型过滤
  if (activeView.value !== 'all') {
    const typeMap = {
      xhr: 'xhr',
      js: 'script',
      css: 'stylesheet',
      img: 'image'
    }
    result = result.filter(r => r.type === typeMap[activeView.value])
  }

  // 按搜索文本过滤
  if (filterText.value) {
    const searchText = filterText.value.toLowerCase()
    result = result.filter(r =>
        r.url.toLowerCase().includes(searchText) ||
        r.text.toLowerCase().includes(searchText) ||
        (r.method && r.method.toLowerCase().includes(searchText)) ||
        (r.status && r.status.toString().includes(searchText))
    )
  }

  return result
})

// 切换记录状态
const toggleRecording = () => {
  isRecording.value = !isRecording.value
}

// 清空记录
const clearRecords = () => {
  requests.value = []
  selectedRequest.value = null
}

// 导出 HAR 文件
const exportHar = () => {
  const harData = {
    log: {
      version: '1.2',
      creator: {
        name: 'Vue Network Monitor',
        version: '1.0'
      },
      entries: requests.value.map(req => ({
        request: {
          method: req.method,
          url: req.url,
          headers: Object.entries(req.requestHeaders || {}).map(([name, value]) => ({name, value})),
          postData: req.requestBody ? {
            mimeType: 'application/json',
            text: JSON.stringify(req.requestBody, null, 2)
          } : undefined
        },
        response: {
          status: req.status,
          headers: Object.entries(req.responseHeaders || {}).map(([name, value]) => ({name, value})),
          content: {
            size: req.size,
            mimeType: 'application/json',
            text: JSON.stringify(req.responseBody, null, 2)
          }
        },
        timings: {
          send: 0,
          wait: req.time,
          receive: 0
        },
        time: req.time
      }))
    }
  }

  const blob = new Blob([JSON.stringify(harData, null, 2)], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `network-log-${new Date().toISOString()}.har`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  activeView.value = index
}

// 处理行点击
const handleRowClick = (row) => {
  selectedRequest.value = row
  try {
    jsonSource.value = JSON.parse(row.text)
  } catch (error) {
    jsonSource.value = {}
  }
}
const handleRowClass = () => {
  if (isDark.value) {
    return "text-black bg-green-200"
  } else {
    return "bg-green-200"
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  if (!status) return 'info'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'danger'
  return 'info'
}

// 获取方法标签类型
const getMethodTagType = (method) => {
  const methodMap = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info',
    https: 'warning',
    http: 'primary'
  }
  return methodMap[method] || 'info'
}

// 获取请求类型图标
const getRequestTypeIcon = (type) => {
  const iconMap = {
    json: Connection,
    html: Document,
    javascript: Document,
    script: Document,
    stylesheet: Document,
    css: Document,
    png: Picture,
    image: Picture,
    font: Document,
    media: VideoPlay,
    websocket: Connection,
    other: Document
  }
  return iconMap[type] || ""
}

// 格式化大小
const formatSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handle_png = (row) => {
  const _type = row.type
  const url = row.url.toLowerCase();
  const imageExtensions = ['.png', '.jpg', '.svg'];
  const imageType = ['png', 'jpg', 'image/webp', 'gif'];
  return imageExtensions.some(ext => url.endsWith(ext)) || imageType.includes(_type);
}

const openInBrowser = (url) => {
  console.log(url)
  window.ipcRenderer.openExternal(url);
}
const try_parse = (e) => {
  try {
    e = JSON.parse(e)
  } catch (err) {
  }
  return e;
}

const try_stringify = (e) => {
  try {
    e = JSON.stringify(e)
  } catch (err) {
  }
  return e;
}
const check_cookie = (data) => {
  return data['Cookie'] || data['cookie'] || data['Set-Cookie']
}
const get_cookie = (data) => {
  const filter_ket = ["expires", "httponly", 'path', 'secure', 'domain']
  const CookieDict = {}
  const cookie = data['Cookie'] || data['cookie'] || data['Set-Cookie']
  if (cookie) {
    cookie.split(';').forEach(item => {
      let [key, value] = item.split('=')
      try {
        key = key.trim().toLowerCase()
        value = value.trim().toLowerCase()
      } catch (e) {
      }
      if (!filter_ket.includes(key)) {
        CookieDict[key] = value
      }
    })
  }
  return CookieDict
}

const check_if = (e) => {
  e = try_parse(e)
  return Object.keys(e).length > 0 || e.length > 0;
}

const contextMenu = ref({
  visible: false,
  left: 0,
  top: 0,
  row: null,
  index: -1
})

const handleRightClick = (row, column, event) => {


  event.preventDefault() // 阻止默认右键菜单
  contextMenu.value = {
    visible: true,
    left: event.clientX,
    top: event.clientY,
    row,
    index: filteredRequests.value.indexOf(row)
  }
  document.addEventListener('click', closeContextMenu)
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
  document.removeEventListener('click', closeContextMenu)
}

const handleMenuClick = async (action) => {
  console.log(`执行 ${action} 操作`, contextMenu.value.row.requestHeaders)
  closeContextMenu()

  // 根据action执行不同操作
  switch (action) {
    case 'edit':
      // 编辑逻辑
      break
    case 'delete':
      // 删除逻辑
      tableData.value.splice(contextMenu.value.index, 1)
      break
    case 'copy':
      // 复制逻辑
      break
    case 'cookie':
      await copy(try_stringify(get_cookie(contextMenu.value.row.requestHeaders)))
      // 复制逻辑
      break
    case 'header':
      await copy(try_stringify(contextMenu.value.row.requestHeaders))
      // 复制逻辑
      break
    case 'params':
      await copy(try_stringify(contextMenu.value.row.body))
      // 复制逻辑
      break
    case 'curl':
      await copy(generateCurl(contextMenu.value.row))
      // 复制逻辑
      break
    case 'request':
      await copy(curlToPython(generateCurl(contextMenu.value.row)))
      // 复制逻辑
      break
  }
}

const postData = async (port = "12028") => {
  // try {
  //   const response = await axios.post('http://localhost:12027/set_port', {
  //     port: port // 示例数据
  //   })
  //   console.log(response.json)
  // } catch (error) {
  //   console.error('Error:', error)
  // } finally {
  // }
  await copy()
}


const copy = async (val) => {
  try {
    await toClipboard(val)
    msg('复制成功')
  } catch (e) {
    console.error(e)
    msg('复制失败', 'error')
  }
}
const msg = (message, type = 'success') => {
  ElMessage(
      {
        message: message,
        type: type,
      }
  )
}


const generateCurl = (data) => {
  let curl = `curl -X ${data.method.toUpperCase()} '${data.url}'`;

  // 添加headers
  for (const [key, value] of Object.entries(data.requestHeaders)) {
    curl += ` \\\n  -H '${key}: ${value}'`;
  }

  // 添加请求体（如果是POST/PUT等）
  if (['POST', 'PUT', 'PATCH'].includes(data.method.toUpperCase())) {
    curl += ` \\\n  -d '${JSON.stringify(data.body)}'`;
  }
  console.log(curl)
  return curl
};


</script>

<style scoped>

.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh);
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}


.detail-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.detail-tabs .el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


.context-menu {
  position: fixed;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  max-height: 80vh; /* 限制最大高度 */
  overflow-y: auto; /* 添加滚动条以防内容过多 */
}

.context-menu div {
  padding: 8px 15px;
  cursor: pointer;
}

/* 关闭按钮样式 */
.close-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  color: #999;
}

</style>