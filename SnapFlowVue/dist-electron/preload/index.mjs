"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  openExternal: (url) => {
    console.log("Opening URL:", url, electron.shell);
    return electron.shell.openExternal(url);
  }
  // You can expose other APTs you need here.
  // ...
});
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  }
};
function useLoading() {
  const className = `tech-progress-bar`;
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
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
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
  `;
  const percentageEl = oDiv.querySelector(`.${className}-percentage`);
  const fillEl = oDiv.querySelector(`.${className}-fill`);
  let startTime = null;
  const duration = 1800;
  function animateProgress(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const percent = Math.floor(progress * 100);
    percentageEl.textContent = `${percent}%`;
    fillEl.style.width = `${progress * 100}%`;
    if (progress < 1) {
      requestAnimationFrame(animateProgress);
    }
  }
  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
      requestAnimationFrame(animateProgress);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    }
  };
}
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);
window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};
setTimeout(removeLoading, 2100);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi9lbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXBjUmVuZGVyZXIsIGNvbnRleHRCcmlkZ2UsIHNoZWxsfSBmcm9tICdlbGVjdHJvbidcblxuLy8gLS0tLS0tLS0tIEV4cG9zZSBzb21lIEFQSSB0byB0aGUgUmVuZGVyZXIgcHJvY2VzcyAtLS0tLS0tLS1cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2lwY1JlbmRlcmVyJywge1xuICAgIG9uKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLm9uPikge1xuICAgICAgICBjb25zdCBbY2hhbm5lbCwgbGlzdGVuZXJdID0gYXJnc1xuICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKGV2ZW50LCAuLi5hcmdzKSA9PiBsaXN0ZW5lcihldmVudCwgLi4uYXJncykpXG4gICAgfSxcbiAgICBvZmYoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIub2ZmPikge1xuICAgICAgICBjb25zdCBbY2hhbm5lbCwgLi4ub21pdF0gPSBhcmdzXG4gICAgICAgIHJldHVybiBpcGNSZW5kZXJlci5vZmYoY2hhbm5lbCwgLi4ub21pdClcbiAgICB9LFxuICAgIHNlbmQoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIuc2VuZD4pIHtcbiAgICAgICAgY29uc3QgW2NoYW5uZWwsIC4uLm9taXRdID0gYXJnc1xuICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZChjaGFubmVsLCAuLi5vbWl0KVxuICAgIH0sXG4gICAgaW52b2tlKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLmludm9rZT4pIHtcbiAgICAgICAgY29uc3QgW2NoYW5uZWwsIC4uLm9taXRdID0gYXJnc1xuICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLm9taXQpXG4gICAgfSxcbiAgICBvcGVuRXh0ZXJuYWw6ICh1cmwpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ09wZW5pbmcgVVJMOicsIHVybCwgc2hlbGwpOyAvLyDinIUg5qOA5p+l5piv5ZCm6LCD55SoXG4gICAgICAgIHJldHVybiBzaGVsbC5vcGVuRXh0ZXJuYWwodXJsKTtcbiAgICB9XG5cbiAgICAvLyBZb3UgY2FuIGV4cG9zZSBvdGhlciBBUFRzIHlvdSBuZWVkIGhlcmUuXG4gICAgLy8gLi4uXG59KVxuXG4vLyAtLS0tLS0tLS0gUHJlbG9hZCBzY3JpcHRzIGxvYWRpbmcgLS0tLS0tLS0tXG5mdW5jdGlvbiBkb21SZWFkeShjb25kaXRpb246IERvY3VtZW50UmVhZHlTdGF0ZVtdID0gWydjb21wbGV0ZScsICdpbnRlcmFjdGl2ZSddKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGlmIChjb25kaXRpb24uaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmNvbnN0IHNhZmVET00gPSB7XG4gICAgYXBwZW5kKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIUFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5maW5kKGUgPT4gZSA9PT0gY2hpbGQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LmFwcGVuZENoaWxkKGNoaWxkKVxuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmUocGFyZW50OiBIVE1MRWxlbWVudCwgY2hpbGQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmIChBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbikuZmluZChlID0+IGUgPT09IGNoaWxkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5yZW1vdmVDaGlsZChjaGlsZClcbiAgICAgICAgfVxuICAgIH0sXG59XG5cbi8qKlxuICogaHR0cHM6Ly90b2JpYXNhaGxpbi5jb20vc3BpbmtpdFxuICogaHR0cHM6Ly9jb25ub3JhdGhlcnRvbi5jb20vbG9hZGVyc1xuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xuICogaHR0cHM6Ly9tYXRlamt1c3RlYy5naXRodWIuaW8vU3BpblRoYXRTaGl0XG4gKi9cbmZ1bmN0aW9uIHVzZUxvYWRpbmcoKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gYHRlY2gtcHJvZ3Jlc3MtYmFyYFxuICAgIGNvbnN0IHN0eWxlQ29udGVudCA9IGBcbkBrZXlmcmFtZXMgcHJvZ3Jlc3MtZ2xvdyB7XG4gIDAlIHsgYm94LXNoYWRvdzogMCAwIDVweCAjMDBmMmZmLCAwIDAgMTBweCAjMDBmMmZmOyB9XG4gIDEwMCUgeyBib3gtc2hhZG93OiAwIDAgMTVweCAjMDBmMmZmLCAwIDAgMzBweCAjMDBmMmZmOyB9XG59XG5Aa2V5ZnJhbWVzIHB1bHNlIHtcbiAgMCUgeyBvcGFjaXR5OiAwLjY7IH1cbiAgNTAlIHsgb3BhY2l0eTogMTsgfVxuICAxMDAlIHsgb3BhY2l0eTogMC42OyB9XG59XG4uJHtjbGFzc05hbWV9LWNvbnRhaW5lciB7XG4gIHdpZHRoOiA4MCU7XG4gIG1heC13aWR0aDogNDAwcHg7XG59XG4uJHtjbGFzc05hbWV9LXRyYWNrIHtcbiAgaGVpZ2h0OiA2cHg7XG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgYm9yZGVyLXJhZGl1czogM3B4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG1hcmdpbi1ib3R0b206IDE1cHg7XG59XG4uJHtjbGFzc05hbWV9LWZpbGwge1xuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAwO1xuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICMwMGYyZmYsICMwMDg0ZmYpO1xuICBib3JkZXItcmFkaXVzOiAzcHg7XG4gIGFuaW1hdGlvbjogcHJvZ3Jlc3MtZ2xvdyAxLjVzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcbn1cbi4ke2NsYXNzTmFtZX0taW5mbyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgY29sb3I6ICMwMGYyZmY7XG4gIGZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzYW5zLXNlcmlmO1xuICBmb250LXNpemU6IDE0cHg7XG4gIHRleHQtc2hhZG93OiAwIDAgNXB4IHJnYmEoMCwgMjQyLCAyNTUsIDAuNyk7XG59XG4uJHtjbGFzc05hbWV9LXBlcmNlbnRhZ2Uge1xuICBhbmltYXRpb246IHB1bHNlIDEuNXMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XG59XG4uYXBwLWxvYWRpbmctd3JhcCB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwdnc7XG4gIGhlaWdodDogMTAwdmg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDEwLCAxNSwgMjUsIDAuOTUpO1xuICB6LWluZGV4OiA5OTk5O1xufVxuLmxvYWRpbmctdGl0bGUge1xuICBjb2xvcjogIzAwZjJmZjtcbiAgZm9udC1zaXplOiAyNHB4O1xuICBtYXJnaW4tYm90dG9tOiAzMHB4O1xuICBmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZjtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDJweDtcbiAgdGV4dC1zaGFkb3c6IDAgMCAxMHB4IHJnYmEoMCwgMjQyLCAyNTUsIDAuNyk7XG4gIGFuaW1hdGlvbjogcHVsc2UgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XG59XG4gICAgYFxuICAgIGNvbnN0IG9TdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBjb25zdCBvRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIG9TdHlsZS5pZCA9ICdhcHAtbG9hZGluZy1zdHlsZSdcbiAgICBvU3R5bGUuaW5uZXJIVE1MID0gc3R5bGVDb250ZW50XG4gICAgb0Rpdi5jbGFzc05hbWUgPSAnYXBwLWxvYWRpbmctd3JhcCdcbiAgICBvRGl2LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibG9hZGluZy10aXRsZVwiPuezu+e7n+ato+WcqOWKoOi9vS4uLjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCIke2NsYXNzTmFtZX0tY29udGFpbmVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LXRyYWNrXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke2NsYXNzTmFtZX0tZmlsbFwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LWluZm9cIj5cbiAgICAgICAgPHNwYW4+TE9BRElORzwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCIke2NsYXNzTmFtZX0tcGVyY2VudGFnZVwiPjAlPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGBcblxuICAgIC8vIOiOt+WPlkRPTeWFg+e0oFxuICAgIGNvbnN0IHBlcmNlbnRhZ2VFbCA9IG9EaXYucXVlcnlTZWxlY3RvcihgLiR7Y2xhc3NOYW1lfS1wZXJjZW50YWdlYClcbiAgICBjb25zdCBmaWxsRWwgPSBvRGl2LnF1ZXJ5U2VsZWN0b3IoYC4ke2NsYXNzTmFtZX0tZmlsbGApXG5cbiAgICAvLyDnsr7noa7mjqfliLYxNTAwbXPlrozmiJDov5vluqZcbiAgICBsZXQgc3RhcnRUaW1lID0gbnVsbFxuICAgIGNvbnN0IGR1cmF0aW9uID0gMTgwMCAvLyAxLjXnp5JcblxuICAgIGZ1bmN0aW9uIGFuaW1hdGVQcm9ncmVzcyh0aW1lc3RhbXApIHtcbiAgICAgICAgaWYgKCFzdGFydFRpbWUpIHN0YXJ0VGltZSA9IHRpbWVzdGFtcFxuICAgICAgICBjb25zdCBlbGFwc2VkID0gdGltZXN0YW1wIC0gc3RhcnRUaW1lXG4gICAgICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKVxuXG4gICAgICAgIC8vIOabtOaWsFVJXG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBNYXRoLmZsb29yKHByb2dyZXNzICogMTAwKVxuICAgICAgICBwZXJjZW50YWdlRWwudGV4dENvbnRlbnQgPSBgJHtwZXJjZW50fSVgXG4gICAgICAgIGZpbGxFbC5zdHlsZS53aWR0aCA9IGAke3Byb2dyZXNzICogMTAwfSVgXG5cbiAgICAgICAgLy8g57un57ut5Yqo55S755u05Yiw5a6M5oiQXG4gICAgICAgIGlmIChwcm9ncmVzcyA8IDEpIHtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlUHJvZ3Jlc3MpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBlbmRMb2FkaW5nKCkge1xuICAgICAgICAgICAgc2FmZURPTS5hcHBlbmQoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKVxuICAgICAgICAgICAgc2FmZURPTS5hcHBlbmQoZG9jdW1lbnQuYm9keSwgb0RpdilcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlUHJvZ3Jlc3MpXG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZUxvYWRpbmcoKSB7XG4gICAgICAgICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5oZWFkLCBvU3R5bGUpXG4gICAgICAgICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5ib2R5LCBvRGl2KVxuICAgICAgICB9LFxuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCB7YXBwZW5kTG9hZGluZywgcmVtb3ZlTG9hZGluZ30gPSB1c2VMb2FkaW5nKClcbmRvbVJlYWR5KCkudGhlbihhcHBlbmRMb2FkaW5nKVxuXG53aW5kb3cub25tZXNzYWdlID0gKGV2KSA9PiB7XG4gICAgZXYuZGF0YS5wYXlsb2FkID09PSAncmVtb3ZlTG9hZGluZycgJiYgcmVtb3ZlTG9hZGluZygpXG59XG5cbnNldFRpbWVvdXQocmVtb3ZlTG9hZGluZywgMjEwMClcbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiaXBjUmVuZGVyZXIiLCJhcmdzIiwic2hlbGwiXSwibWFwcGluZ3MiOiI7O0FBR0FBLFNBQUFBLGNBQWMsa0JBQWtCLGVBQWU7QUFBQSxFQUMzQyxNQUFNLE1BQXlDO0FBQzNDLFVBQU0sQ0FBQyxTQUFTLFFBQVEsSUFBSTtBQUM1QixXQUFPQyxxQkFBWSxHQUFHLFNBQVMsQ0FBQyxVQUFVQyxVQUFTLFNBQVMsT0FBTyxHQUFHQSxLQUFJLENBQUM7QUFBQSxFQUMvRTtBQUFBLEVBQ0EsT0FBTyxNQUEwQztBQUM3QyxVQUFNLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSTtBQUMzQixXQUFPRCxxQkFBWSxJQUFJLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFDM0M7QUFBQSxFQUNBLFFBQVEsTUFBMkM7QUFDL0MsVUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUk7QUFDM0IsV0FBT0EscUJBQVksS0FBSyxTQUFTLEdBQUcsSUFBSTtBQUFB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
