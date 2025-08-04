<template>
  <el-container style="">
    <!-- 顶部工具栏 -->
    <el-header height="30px" class="flex mt-3 gap-3">
      <div class="">
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
      </div>

      <div class="">
        <el-button @click="exportHar" :disabled="requests.length === 0" size="small">
          <el-icon>
            <Download/>
          </el-icon>
          导出 HAR
        </el-button>
      </div>
    </el-header>

    <el-container>
      <!-- 主内容区 -->
      <el-main class="main-content">
        <div
            style="height: 100%; box-shadow: var(--el-border-color-light) 0px 0px 10px"
        >
          <el-splitter layout="vertical">
            <el-splitter-panel>
              <div class="request-table-container">
                <el-table
                    :data="filteredRequests"
                    style="width: 100%"
                    height="100%"
                    stripe
                    highlight-current-row
                    @row-click="handleRowClick"
                    empty-text="没有捕获到网络请求"
                    class="hide-scrollbar"
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
                  <el-table-column prop="url" label="URL" min-width="300">
                    <template #default="{ row }">
                      <div class="url-cell">
                        <el-icon class="type-icon">
                          <component :is="getRequestTypeIcon(row.type)"/>
                        </el-icon>
                        <span class="url-text">{{ getUrlPath(row.url) }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="domain" label="域名" width="150">
                    <template #default="{ row }">
                      {{ getUrlDomain(row.url) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="size" label="大小" width="100" align="right">
                    <template #default="{ row }">
                      {{ formatSize(row.size) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="time" label="耗时" width="100" align="right">
                    <template #default="{ row }">
                      {{ row.timings.total ? `${row.timings.total}ms` : '-' }}
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
                        <span class="font-semibold">常规</span>
                      </div>
                      <div class="border-t border-gray-300 my-2"></div>
                      <div class="grid gap-1 italic text-base">
                        <div class="flex">
                          <div class="w-1/5">请求网站</div>
                          <div class="w-4/5 text-sm">{{ selectedRequest.url }}</div>
                        </div>
                        <div class="flex">
                          <div class="w-1/5">请求方法</div>
                          <div class="w-4/5 text-sm">{{ selectedRequest.method }}</div>
                        </div>
                        <div class="flex">
                          <div class="w-1/5">状态代码</div>
                          <div class="w-4/5 text-sm">{{ selectedRequest.status }}</div>
                        </div>
                        <div class="flex">
                          <div class="w-1/5">远程地址</div>
                          <div class="w-4/5 text-sm">{{ selectedRequest.host }}</div>
                        </div>
                      </div>
                      <div class="border-t border-gray-300 my-2"></div>
                    </div>
                    <div>
                      <div>
                        <span class="font-semibold">响应标头</span>
                      </div>
                      <div class="border-t border-gray-300 my-2"></div>
                      <div class="grid gap-1 italic text-base">
                        <div class="flex">
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
                  <div v-html="selectedRequest.text" class="pl-3 pr-3"></div>
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
                  <div>{{ selectedRequest.responseHeaders }}</div>
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
                      <el-tag size="small" type="info">{{ event.time }}ms</el-tag>
                      {{ event.event }}
                    </el-timeline-item>
                  </el-timeline>
                </el-tab-pane>

              </el-tabs>
            </el-splitter-panel>
          </el-splitter>
        </div>


        <!-- 请求详情面板 - 仅在选中请求时显示 -->
      </el-main>
    </el-container>
    <el-footer height="16px">11</el-footer>
  </el-container>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {VideoPlay, Delete, Search, Download, Document, Connection, Picture} from '@element-plus/icons-vue'
import {SemiSelect, Position, View, Pointer, Timer} from '@element-plus/icons-vue'
import 'vue-json-viewer/style.css'

// 请求记录
const requests = ref([])
const selectedRequest = ref(null)
const isRecording = ref(true)
const filterText = ref('')
const activeView = ref('all')

// 模拟一些初始数据
const mockRequests = [
  {
    id: 1,
    method: 'GET',
    url: 'https://example.com/api/data',
    status: 200,
    type: 'xhr',
    size: 1024,
    time: 150,
    requestHeaders: {
      'Accept': 'application/json',
      'Authorization': 'Bearer token123',
      'User-Agent': 'Mozilla/5.0'
    },
    responseHeaders: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Date': new Date().toUTCString()
    },
    requestBody: null,
    responseBody: {data: Array(5).fill().map((_, i) => ({id: i + 1, name: `Item ${i + 1}`}))},
    timings: [
      {event: 'Request started', timestamp: new Date(Date.now() - 5000).toLocaleTimeString(), time: 0},
      {event: 'DNS lookup', timestamp: new Date(Date.now() - 4950).toLocaleTimeString(), time: 50},
      {event: 'TCP connection', timestamp: new Date(Date.now() - 4900).toLocaleTimeString(), time: 100},
      {event: 'Response received', timestamp: new Date(Date.now() - 4850).toLocaleTimeString(), time: 150}
    ]
  }
]

const ws = ref()
const initWebSocket = () => {
  const wsUrl = 'ws://localhost:8765'
  ws.value = new WebSocket(wsUrl)

  ws.value.onopen = () => {
    console.log('WebSocket连接已建立')
  }

  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      requests.value.push(data)
    } catch (error) {
      console.error('解析WebSocket数据失败:', error)
    }
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket错误:', error)
  }

  ws.value.onclose = () => {
    console.log('WebSocket连接已关闭')
  }
}

// 初始化模拟数据
onMounted(() => {
  requests.value = [...mockRequests]
  initWebSocket()
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
  console.log(row)
  selectedRequest.value = row
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
    PATCH: 'info'
  }
  return methodMap[method] || 'info'
}

// 获取请求类型图标
const getRequestTypeIcon = (type) => {
  const iconMap = {
    xhr: Connection,
    script: Document,
    stylesheet: Document,
    image: Picture,
    font: Document,
    media: VideoPlay,
    websocket: Connection,
    other: Document
  }
  return iconMap[type] || Document
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


const height = ref(200) // 初始高度
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)

const startResize = (e) => {
  isResizing.value = true
  startY.value = e.clientY
  startHeight.value = height.value

  // 防止文本选中
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'row-resize'
}

const doResize = (e) => {
  if (!isResizing.value) return

  // 计算新的高度（向上拖动是减小高度）
  const newHeight = startHeight.value + (startY.value - e.clientY)

  // 设置最小和最大高度限制
  height.value = Math.max(50, Math.min(800, newHeight))
}

const stopResize = () => {
  isResizing.value = false

  // 恢复文本选中和光标
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

// 添加全局事件监听器
onMounted(() => {
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
})

// 移除事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>


.sidebar {
  border-right: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(88vh);
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}

.request-table-container {
  flex: 1;
  overflow: hidden;
}

.request-detail-container {
  height: 40vh;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 10px;
  overflow: hidden;
  resize: both;
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

.url-cell {
  display: flex;
  align-items: center;
}

.type-icon {
  margin-right: 8px;
  color: var(--el-text-color-secondary);
}

.url-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


/* 隐藏滚动条样式 */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}


</style>