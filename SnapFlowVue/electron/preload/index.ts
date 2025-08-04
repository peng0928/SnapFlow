import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `tech-progress-bar`
  const styleContent = `
@keyframes progress-glow {
  0% { box-shadow: 0 0 5px #00f2ff, 0 0 10px #00f2ff; }
  100% { box-shadow: 0 0 15px #00f2ff, 0 0 30px #00f2ff; }
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.${className}-container {
  width: 80%;
  max-width: 400px;
}
.${className}-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
}
.${className}-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #00f2ff, #0084ff);
  border-radius: 3px;
  animation: progress-glow 1.5s ease-in-out infinite alternate;
}
.${className}-info {
  display: flex;
  justify-content: space-between;
  color: #00f2ff;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(0, 242, 255, 0.7);
}
.${className}-percentage {
  animation: pulse 1.5s ease-in-out infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10, 15, 25, 0.95);
  z-index: 9999;
}
.loading-title {
  color: #00f2ff;
  font-size: 24px;
  margin-bottom: 30px;
  font-family: 'Arial', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.7);
  animation: pulse 2s ease-in-out infinite;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `
    <div class="loading-title">系统正在加载...</div>
    <div class="${className}-container">
      <div class="${className}-track">
        <div class="${className}-fill"></div>
      </div>
      <div class="${className}-info">
        <span>LOADING</span>
        <span class="${className}-percentage">0%</span>
      </div>
    </div>
  `

  // 获取DOM元素
  const percentageEl = oDiv.querySelector(`.${className}-percentage`)
  const fillEl = oDiv.querySelector(`.${className}-fill`)

  // 精确控制1500ms完成进度
  let startTime = null
  const duration = 1800 // 1.5秒

  function animateProgress(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 更新UI
    const percent = Math.floor(progress * 100)
    percentageEl.textContent = `${percent}%`
    fillEl.style.width = `${progress * 100}%`

    // 继续动画直到完成
    if (progress < 1) {
      requestAnimationFrame(animateProgress)
    }
  }

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
      requestAnimationFrame(animateProgress)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 2100)
