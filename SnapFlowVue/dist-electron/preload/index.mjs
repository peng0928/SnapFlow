"use strict";const i=require("electron");i.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[n,t]=e;return i.ipcRenderer.on(n,(o,...r)=>t(o,...r))},off(...e){const[n,...t]=e;return i.ipcRenderer.off(n,...t)},send(...e){const[n,...t]=e;return i.ipcRenderer.send(n,...t)},invoke(...e){const[n,...t]=e;return i.ipcRenderer.invoke(n,...t)},openExternal:e=>(console.log("Opening URL:",e,i.shell),i.shell.openExternal(e))});function h(e=["complete","interactive"]){return new Promise(n=>{e.includes(document.readyState)?n(!0):document.addEventListener("readystatechange",()=>{e.includes(document.readyState)&&n(!0)})})}const a={append(e,n){if(!Array.from(e.children).find(t=>t===n))return e.appendChild(n)},remove(e,n){if(Array.from(e.children).find(t=>t===n))return e.removeChild(n)}};function x(){const e="tech-progress-bar",n=`
@keyframes progress-glow {
  0% { box-shadow: 0 0 5px #00f2ff, 0 0 10px #00f2ff; }
  100% { box-shadow: 0 0 15px #00f2ff, 0 0 30px #00f2ff; }
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.${e}-container {
  width: 80%;
  max-width: 400px;
}
.${e}-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
}
.${e}-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #00f2ff, #0084ff);
  border-radius: 3px;
  animation: progress-glow 1.5s ease-in-out infinite alternate;
}
.${e}-info {
  display: flex;
  justify-content: space-between;
  color: #00f2ff;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(0, 242, 255, 0.7);
}
.${e}-percentage {
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
    `,t=document.createElement("style"),o=document.createElement("div");t.id="app-loading-style",t.innerHTML=n,o.className="app-loading-wrap",o.innerHTML=`
    <div class="loading-title">系统正在加载...</div>
    <div class="${e}-container">
      <div class="${e}-track">
        <div class="${e}-fill"></div>
      </div>
      <div class="${e}-info">
        <span>LOADING</span>
        <span class="${e}-percentage">0%</span>
      </div>
    </div>
  `;const r=o.querySelector(`.${e}-percentage`),f=o.querySelector(`.${e}-fill`);let s=null;const m=1800;function c(l){s||(s=l);const u=l-s,d=Math.min(u/m,1),g=Math.floor(d*100);r.textContent=`${g}%`,f.style.width=`${d*100}%`,d<1&&requestAnimationFrame(c)}return{appendLoading(){a.append(document.head,t),a.append(document.body,o),requestAnimationFrame(c)},removeLoading(){a.remove(document.head,t),a.remove(document.body,o)}}}const{appendLoading:y,removeLoading:p}=x();h().then(y);window.onmessage=e=>{e.data.payload==="removeLoading"&&p()};setTimeout(p,2100);
