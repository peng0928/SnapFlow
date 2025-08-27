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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi9lbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXBjUmVuZGVyZXIsIGNvbnRleHRCcmlkZ2UsIHNoZWxsfSBmcm9tICdlbGVjdHJvbidcclxuXHJcbi8vIC0tLS0tLS0tLSBFeHBvc2Ugc29tZSBBUEkgdG8gdGhlIFJlbmRlcmVyIHByb2Nlc3MgLS0tLS0tLS0tXHJcbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2lwY1JlbmRlcmVyJywge1xyXG4gICAgb24oLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIub24+KSB7XHJcbiAgICAgICAgY29uc3QgW2NoYW5uZWwsIGxpc3RlbmVyXSA9IGFyZ3NcclxuICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKGV2ZW50LCAuLi5hcmdzKSA9PiBsaXN0ZW5lcihldmVudCwgLi4uYXJncykpXHJcbiAgICB9LFxyXG4gICAgb2ZmKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLm9mZj4pIHtcclxuICAgICAgICBjb25zdCBbY2hhbm5lbCwgLi4ub21pdF0gPSBhcmdzXHJcbiAgICAgICAgcmV0dXJuIGlwY1JlbmRlcmVyLm9mZihjaGFubmVsLCAuLi5vbWl0KVxyXG4gICAgfSxcclxuICAgIHNlbmQoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIuc2VuZD4pIHtcclxuICAgICAgICBjb25zdCBbY2hhbm5lbCwgLi4ub21pdF0gPSBhcmdzXHJcbiAgICAgICAgcmV0dXJuIGlwY1JlbmRlcmVyLnNlbmQoY2hhbm5lbCwgLi4ub21pdClcclxuICAgIH0sXHJcbiAgICBpbnZva2UoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIuaW52b2tlPikge1xyXG4gICAgICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcclxuICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLm9taXQpXHJcbiAgICB9LFxyXG4gICAgb3BlbkV4dGVybmFsOiAodXJsKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ09wZW5pbmcgVVJMOicsIHVybCwgc2hlbGwpOyAvLyDinIUg5qOA5p+l5piv5ZCm6LCD55SoXHJcbiAgICAgICAgcmV0dXJuIHNoZWxsLm9wZW5FeHRlcm5hbCh1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFlvdSBjYW4gZXhwb3NlIG90aGVyIEFQVHMgeW91IG5lZWQgaGVyZS5cclxuICAgIC8vIC4uLlxyXG59KVxyXG5cclxuLy8gLS0tLS0tLS0tIFByZWxvYWQgc2NyaXB0cyBsb2FkaW5nIC0tLS0tLS0tLVxyXG5mdW5jdGlvbiBkb21SZWFkeShjb25kaXRpb246IERvY3VtZW50UmVhZHlTdGF0ZVtdID0gWydjb21wbGV0ZScsICdpbnRlcmFjdGl2ZSddKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBpZiAoY29uZGl0aW9uLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCBzYWZlRE9NID0ge1xyXG4gICAgYXBwZW5kKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICghQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmZpbmQoZSA9PiBlID09PSBjaGlsZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmIChBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbikuZmluZChlID0+IGUgPT09IGNoaWxkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBodHRwczovL3RvYmlhc2FobGluLmNvbS9zcGlua2l0XHJcbiAqIGh0dHBzOi8vY29ubm9yYXRoZXJ0b24uY29tL2xvYWRlcnNcclxuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xyXG4gKiBodHRwczovL21hdGVqa3VzdGVjLmdpdGh1Yi5pby9TcGluVGhhdFNoaXRcclxuICovXHJcbmZ1bmN0aW9uIHVzZUxvYWRpbmcoKSB7XHJcbiAgICBjb25zdCBjbGFzc05hbWUgPSBgdGVjaC1wcm9ncmVzcy1iYXJgXHJcbiAgICBjb25zdCBzdHlsZUNvbnRlbnQgPSBgXHJcbkBrZXlmcmFtZXMgcHJvZ3Jlc3MtZ2xvdyB7XHJcbiAgMCUgeyBib3gtc2hhZG93OiAwIDAgNXB4ICMwMGYyZmYsIDAgMCAxMHB4ICMwMGYyZmY7IH1cclxuICAxMDAlIHsgYm94LXNoYWRvdzogMCAwIDE1cHggIzAwZjJmZiwgMCAwIDMwcHggIzAwZjJmZjsgfVxyXG59XHJcbkBrZXlmcmFtZXMgcHVsc2Uge1xyXG4gIDAlIHsgb3BhY2l0eTogMC42OyB9XHJcbiAgNTAlIHsgb3BhY2l0eTogMTsgfVxyXG4gIDEwMCUgeyBvcGFjaXR5OiAwLjY7IH1cclxufVxyXG4uJHtjbGFzc05hbWV9LWNvbnRhaW5lciB7XHJcbiAgd2lkdGg6IDgwJTtcclxuICBtYXgtd2lkdGg6IDQwMHB4O1xyXG59XHJcbi4ke2NsYXNzTmFtZX0tdHJhY2sge1xyXG4gIGhlaWdodDogNnB4O1xyXG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4yKTtcclxuICBib3JkZXItcmFkaXVzOiAzcHg7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgbWFyZ2luLWJvdHRvbTogMTVweDtcclxufVxyXG4uJHtjbGFzc05hbWV9LWZpbGwge1xyXG4gIGhlaWdodDogMTAwJTtcclxuICB3aWR0aDogMDtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICMwMGYyZmYsICMwMDg0ZmYpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDNweDtcclxuICBhbmltYXRpb246IHByb2dyZXNzLWdsb3cgMS41cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XHJcbn1cclxuLiR7Y2xhc3NOYW1lfS1pbmZvIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICBjb2xvcjogIzAwZjJmZjtcclxuICBmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZjtcclxuICBmb250LXNpemU6IDE0cHg7XHJcbiAgdGV4dC1zaGFkb3c6IDAgMCA1cHggcmdiYSgwLCAyNDIsIDI1NSwgMC43KTtcclxufVxyXG4uJHtjbGFzc05hbWV9LXBlcmNlbnRhZ2Uge1xyXG4gIGFuaW1hdGlvbjogcHVsc2UgMS41cyBlYXNlLWluLW91dCBpbmZpbml0ZTtcclxufVxyXG4uYXBwLWxvYWRpbmctd3JhcCB7XHJcbiAgcG9zaXRpb246IGZpeGVkO1xyXG4gIHRvcDogMDtcclxuICBsZWZ0OiAwO1xyXG4gIHdpZHRoOiAxMDB2dztcclxuICBoZWlnaHQ6IDEwMHZoO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGJhY2tncm91bmQ6IHJnYmEoMTAsIDE1LCAyNSwgMC45NSk7XHJcbiAgei1pbmRleDogOTk5OTtcclxufVxyXG4ubG9hZGluZy10aXRsZSB7XHJcbiAgY29sb3I6ICMwMGYyZmY7XHJcbiAgZm9udC1zaXplOiAyNHB4O1xyXG4gIG1hcmdpbi1ib3R0b206IDMwcHg7XHJcbiAgZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWY7XHJcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcclxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xyXG4gIHRleHQtc2hhZG93OiAwIDAgMTBweCByZ2JhKDAsIDI0MiwgMjU1LCAwLjcpO1xyXG4gIGFuaW1hdGlvbjogcHVsc2UgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XHJcbn1cclxuICAgIGBcclxuICAgIGNvbnN0IG9TdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcclxuICAgIGNvbnN0IG9EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cclxuICAgIG9TdHlsZS5pZCA9ICdhcHAtbG9hZGluZy1zdHlsZSdcclxuICAgIG9TdHlsZS5pbm5lckhUTUwgPSBzdHlsZUNvbnRlbnRcclxuICAgIG9EaXYuY2xhc3NOYW1lID0gJ2FwcC1sb2FkaW5nLXdyYXAnXHJcbiAgICBvRGl2LmlubmVySFRNTCA9IGBcclxuICAgIDxkaXYgY2xhc3M9XCJsb2FkaW5nLXRpdGxlXCI+57O757uf5q2j5Zyo5Yqg6L29Li4uPC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LWNvbnRhaW5lclwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LXRyYWNrXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfS1maWxsXCI+PC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LWluZm9cIj5cclxuICAgICAgICA8c3Bhbj5MT0FESU5HPC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiJHtjbGFzc05hbWV9LXBlcmNlbnRhZ2VcIj4wJTwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICBgXHJcblxyXG4gICAgLy8g6I635Y+WRE9N5YWD57SgXHJcbiAgICBjb25zdCBwZXJjZW50YWdlRWwgPSBvRGl2LnF1ZXJ5U2VsZWN0b3IoYC4ke2NsYXNzTmFtZX0tcGVyY2VudGFnZWApXHJcbiAgICBjb25zdCBmaWxsRWwgPSBvRGl2LnF1ZXJ5U2VsZWN0b3IoYC4ke2NsYXNzTmFtZX0tZmlsbGApXHJcblxyXG4gICAgLy8g57K+56Gu5o6n5Yi2MTUwMG1z5a6M5oiQ6L+b5bqmXHJcbiAgICBsZXQgc3RhcnRUaW1lID0gbnVsbFxyXG4gICAgY29uc3QgZHVyYXRpb24gPSAxODAwIC8vIDEuNeenklxyXG5cclxuICAgIGZ1bmN0aW9uIGFuaW1hdGVQcm9ncmVzcyh0aW1lc3RhbXApIHtcclxuICAgICAgICBpZiAoIXN0YXJ0VGltZSkgc3RhcnRUaW1lID0gdGltZXN0YW1wXHJcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRpbWVzdGFtcCAtIHN0YXJ0VGltZVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKVxyXG5cclxuICAgICAgICAvLyDmm7TmlrBVSVxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBNYXRoLmZsb29yKHByb2dyZXNzICogMTAwKVxyXG4gICAgICAgIHBlcmNlbnRhZ2VFbC50ZXh0Q29udGVudCA9IGAke3BlcmNlbnR9JWBcclxuICAgICAgICBmaWxsRWwuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzcyAqIDEwMH0lYFxyXG5cclxuICAgICAgICAvLyDnu6fnu63liqjnlLvnm7TliLDlrozmiJBcclxuICAgICAgICBpZiAocHJvZ3Jlc3MgPCAxKSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlUHJvZ3Jlc3MpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYXBwZW5kTG9hZGluZygpIHtcclxuICAgICAgICAgICAgc2FmZURPTS5hcHBlbmQoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKVxyXG4gICAgICAgICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5ib2R5LCBvRGl2KVxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVByb2dyZXNzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlTG9hZGluZygpIHtcclxuICAgICAgICAgICAgc2FmZURPTS5yZW1vdmUoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKVxyXG4gICAgICAgICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5ib2R5LCBvRGl2KVxyXG4gICAgICAgIH0sXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IHthcHBlbmRMb2FkaW5nLCByZW1vdmVMb2FkaW5nfSA9IHVzZUxvYWRpbmcoKVxyXG5kb21SZWFkeSgpLnRoZW4oYXBwZW5kTG9hZGluZylcclxuXHJcbndpbmRvdy5vbm1lc3NhZ2UgPSAoZXYpID0+IHtcclxuICAgIGV2LmRhdGEucGF5bG9hZCA9PT0gJ3JlbW92ZUxvYWRpbmcnICYmIHJlbW92ZUxvYWRpbmcoKVxyXG59XHJcblxyXG5zZXRUaW1lb3V0KHJlbW92ZUxvYWRpbmcsIDIxMDApXHJcbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiaXBjUmVuZGVyZXIiLCJhcmdzIiwi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
