<template>
  <el-container class="main-content">
    <!-- 顶部工具栏 -->
    <el-header height="10px" class="flex mt-5  gap-3 tems-center text-center justify-between">
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

      <div class="mb-3">
        <SwitchVue v-model="isDarkMode"/>
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
                  class=""
              >
                <el-table-column prop="status" label="状态" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)" size="small">
                      {{ row.status || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="method" label="方法" width="90" align="center">
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
                    <div class="flex gap-1 items-center text-center">
                      <el-icon class="type-icon">
                        <component :is="getRequestTypeIcon(row.type)"/>
                      </el-icon>
                      <!--                      <span class="url-text">{{ // getUrlPath(row.url) }}</span>-->
                      <el-text truncated tag="p">{{ row.url }}</el-text>
                    </div>

                  </template>
                </el-table-column>
                <el-table-column prop="domain" label="类型" width="100">
                  <template #default="{ row }">
                    <img :src="row.url" alt="" v-if="handle_png(row)" width="50" height="50"/>
                    <div v-else class="flex items-center text-center gap-1">
                      <el-icon class="type-icon">
                        <component :is="getRequestTypeIcon(row.type)"/>
                      </el-icon>
                      <div v-dompurify-html="row.type"/>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="size" label="大小" width="100">
                  <template #default="{ row }">
                    {{ formatSize(row.size) }}
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="耗时" width="100">
                  <template #default="{ row }">
                    {{ row.timings.cost ? `${row.timings.cost}ms` : '-' }}
                  </template>
                </el-table-column>
              </el-table>
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
              <el-tab-pane>
                <template #label>
                  <div class="flex gap-1 items-center text-center">
                    <el-icon>
                      <View/>
                    </el-icon>
                    <span>预览</span>
                  </div>
                </template>
                <div v-if="selectedRequest.type==='json' || selectedRequest.type==='Json'" >
                  <JsonViewer
                      :data="jsonSource"
                      :darkMode="isDarkMode"
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

            </el-tabs>
          </el-splitter-panel>
        </el-splitter>
      </div>
    </el-main>

  </el-container>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {VideoPlay, Delete, Search, Download, Document, Connection, Picture} from '@element-plus/icons-vue'
import {SemiSelect, Position, View, Pointer, Timer} from '@element-plus/icons-vue'
import SwitchVue from './components/model/SwitchVue.vue'
import {JsonViewer} from '@anilkumarthakur/vue3-json-viewer';
import '@anilkumarthakur/vue3-json-viewer/styles.css';
// 请求记录
const requests = ref([])
const selectedRequest = ref(null)
const isRecording = ref(true)
const filterText = ref('')
const activeView = ref('all')
const isDarkMode = ref(false);

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
  console.log(isDarkMode.value)
  selectedRequest.value = row
  try {
    jsonSource.value = JSON.parse(row.text)
  } catch (error) {
    jsonSource.value = {}
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

// 获取 URL 路径部分
const getUrlPath = (url) => {
  try {
    const u = new URL(url)
    return u.pathname + u.search + u.hash
  } catch {
    return url
  }
}

// 获取 URL 域名部分
const getUrlDomain = (url) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

const handle_type = (row) => {
  const _type = row.type
  const text = row.text
  if (_type === 'png') {
    console.log(text)
    return _type
  }
  return _type
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
</script>

<style scoped>
.box {
  margin-top: 1rem;
}

.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh);
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}


.url-cell {
  display: flex;
  align-items: center;
}

.url-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>