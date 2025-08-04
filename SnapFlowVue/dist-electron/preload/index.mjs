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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi9lbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlwY1JlbmRlcmVyLCBjb250ZXh0QnJpZGdlIH0gZnJvbSAnZWxlY3Ryb24nXG5cbi8vIC0tLS0tLS0tLSBFeHBvc2Ugc29tZSBBUEkgdG8gdGhlIFJlbmRlcmVyIHByb2Nlc3MgLS0tLS0tLS0tXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdpcGNSZW5kZXJlcicsIHtcbiAgb24oLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIub24+KSB7XG4gICAgY29uc3QgW2NoYW5uZWwsIGxpc3RlbmVyXSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKGV2ZW50LCAuLi5hcmdzKSA9PiBsaXN0ZW5lcihldmVudCwgLi4uYXJncykpXG4gIH0sXG4gIG9mZiguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBpcGNSZW5kZXJlci5vZmY+KSB7XG4gICAgY29uc3QgW2NoYW5uZWwsIC4uLm9taXRdID0gYXJnc1xuICAgIHJldHVybiBpcGNSZW5kZXJlci5vZmYoY2hhbm5lbCwgLi4ub21pdClcbiAgfSxcbiAgc2VuZCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBpcGNSZW5kZXJlci5zZW5kPikge1xuICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZChjaGFubmVsLCAuLi5vbWl0KVxuICB9LFxuICBpbnZva2UoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIuaW52b2tlPikge1xuICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLm9taXQpXG4gIH0sXG5cbiAgLy8gWW91IGNhbiBleHBvc2Ugb3RoZXIgQVBUcyB5b3UgbmVlZCBoZXJlLlxuICAvLyAuLi5cbn0pXG5cbi8vIC0tLS0tLS0tLSBQcmVsb2FkIHNjcmlwdHMgbG9hZGluZyAtLS0tLS0tLS1cbmZ1bmN0aW9uIGRvbVJlYWR5KGNvbmRpdGlvbjogRG9jdW1lbnRSZWFkeVN0YXRlW10gPSBbJ2NvbXBsZXRlJywgJ2ludGVyYWN0aXZlJ10pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xuICAgICAgcmVzb2x2ZSh0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZGl0aW9uLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpKSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cblxuY29uc3Qgc2FmZURPTSA9IHtcbiAgYXBwZW5kKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmZpbmQoZSA9PiBlID09PSBjaGlsZCkpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpXG4gICAgfVxuICB9LFxuICByZW1vdmUocGFyZW50OiBIVE1MRWxlbWVudCwgY2hpbGQ6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5maW5kKGUgPT4gZSA9PT0gY2hpbGQpKSB7XG4gICAgICByZXR1cm4gcGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgIH1cbiAgfSxcbn1cblxuLyoqXG4gKiBodHRwczovL3RvYmlhc2FobGluLmNvbS9zcGlua2l0XG4gKiBodHRwczovL2Nvbm5vcmF0aGVydG9uLmNvbS9sb2FkZXJzXG4gKiBodHRwczovL3Byb2plY3RzLmx1a2VoYWFzLm1lL2Nzcy1sb2FkZXJzXG4gKiBodHRwczovL21hdGVqa3VzdGVjLmdpdGh1Yi5pby9TcGluVGhhdFNoaXRcbiAqL1xuZnVuY3Rpb24gdXNlTG9hZGluZygpIHtcbiAgY29uc3QgY2xhc3NOYW1lID0gYHRlY2gtcHJvZ3Jlc3MtYmFyYFxuICBjb25zdCBzdHlsZUNvbnRlbnQgPSBgXG5Aa2V5ZnJhbWVzIHByb2dyZXNzLWdsb3cge1xuICAwJSB7IGJveC1zaGFkb3c6IDAgMCA1cHggIzAwZjJmZiwgMCAwIDEwcHggIzAwZjJmZjsgfVxuICAxMDAlIHsgYm94LXNoYWRvdzogMCAwIDE1cHggIzAwZjJmZiwgMCAwIDMwcHggIzAwZjJmZjsgfVxufVxuQGtleWZyYW1lcyBwdWxzZSB7XG4gIDAlIHsgb3BhY2l0eTogMC42OyB9XG4gIDUwJSB7IG9wYWNpdHk6IDE7IH1cbiAgMTAwJSB7IG9wYWNpdHk6IDAuNjsgfVxufVxuLiR7Y2xhc3NOYW1lfS1jb250YWluZXIge1xuICB3aWR0aDogODAlO1xuICBtYXgtd2lkdGg6IDQwMHB4O1xufVxuLiR7Y2xhc3NOYW1lfS10cmFjayB7XG4gIGhlaWdodDogNnB4O1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMik7XG4gIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBtYXJnaW4tYm90dG9tOiAxNXB4O1xufVxuLiR7Y2xhc3NOYW1lfS1maWxsIHtcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMDtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCAjMDBmMmZmLCAjMDA4NGZmKTtcbiAgYm9yZGVyLXJhZGl1czogM3B4O1xuICBhbmltYXRpb246IHByb2dyZXNzLWdsb3cgMS41cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XG59XG4uJHtjbGFzc05hbWV9LWluZm8ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGNvbG9yOiAjMDBmMmZmO1xuICBmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZjtcbiAgZm9udC1zaXplOiAxNHB4O1xuICB0ZXh0LXNoYWRvdzogMCAwIDVweCByZ2JhKDAsIDI0MiwgMjU1LCAwLjcpO1xufVxuLiR7Y2xhc3NOYW1lfS1wZXJjZW50YWdlIHtcbiAgYW5pbWF0aW9uOiBwdWxzZSAxLjVzIGVhc2UtaW4tb3V0IGluZmluaXRlO1xufVxuLmFwcC1sb2FkaW5nLXdyYXAge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgd2lkdGg6IDEwMHZ3O1xuICBoZWlnaHQ6IDEwMHZoO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYmFja2dyb3VuZDogcmdiYSgxMCwgMTUsIDI1LCAwLjk1KTtcbiAgei1pbmRleDogOTk5OTtcbn1cbi5sb2FkaW5nLXRpdGxlIHtcbiAgY29sb3I6ICMwMGYyZmY7XG4gIGZvbnQtc2l6ZTogMjRweDtcbiAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWY7XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gIGxldHRlci1zcGFjaW5nOiAycHg7XG4gIHRleHQtc2hhZG93OiAwIDAgMTBweCByZ2JhKDAsIDI0MiwgMjU1LCAwLjcpO1xuICBhbmltYXRpb246IHB1bHNlIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlO1xufVxuICAgIGBcbiAgY29uc3Qgb1N0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICBjb25zdCBvRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICBvU3R5bGUuaWQgPSAnYXBwLWxvYWRpbmctc3R5bGUnXG4gIG9TdHlsZS5pbm5lckhUTUwgPSBzdHlsZUNvbnRlbnRcbiAgb0Rpdi5jbGFzc05hbWUgPSAnYXBwLWxvYWRpbmctd3JhcCdcbiAgb0Rpdi5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cImxvYWRpbmctdGl0bGVcIj7ns7vnu5/mraPlnKjliqDovb0uLi48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfS10cmFja1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9LWZpbGxcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfS1pbmZvXCI+XG4gICAgICAgIDxzcGFuPkxPQURJTkc8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiJHtjbGFzc05hbWV9LXBlcmNlbnRhZ2VcIj4wJTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgXG5cbiAgLy8g6I635Y+WRE9N5YWD57SgXG4gIGNvbnN0IHBlcmNlbnRhZ2VFbCA9IG9EaXYucXVlcnlTZWxlY3RvcihgLiR7Y2xhc3NOYW1lfS1wZXJjZW50YWdlYClcbiAgY29uc3QgZmlsbEVsID0gb0Rpdi5xdWVyeVNlbGVjdG9yKGAuJHtjbGFzc05hbWV9LWZpbGxgKVxuXG4gIC8vIOeyvuehruaOp+WItjE1MDBtc+WujOaIkOi/m+W6plxuICBsZXQgc3RhcnRUaW1lID0gbnVsbFxuICBjb25zdCBkdXJhdGlvbiA9IDE4MDAgLy8gMS4156eSXG5cbiAgZnVuY3Rpb24gYW5pbWF0ZVByb2dyZXNzKHRpbWVzdGFtcCkge1xuICAgIGlmICghc3RhcnRUaW1lKSBzdGFydFRpbWUgPSB0aW1lc3RhbXBcbiAgICBjb25zdCBlbGFwc2VkID0gdGltZXN0YW1wIC0gc3RhcnRUaW1lXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihlbGFwc2VkIC8gZHVyYXRpb24sIDEpXG5cbiAgICAvLyDmm7TmlrBVSVxuICAgIGNvbnN0IHBlcmNlbnQgPSBNYXRoLmZsb29yKHByb2dyZXNzICogMTAwKVxuICAgIHBlcmNlbnRhZ2VFbC50ZXh0Q29udGVudCA9IGAke3BlcmNlbnR9JWBcbiAgICBmaWxsRWwuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzcyAqIDEwMH0lYFxuXG4gICAgLy8g57un57ut5Yqo55S755u05Yiw5a6M5oiQXG4gICAgaWYgKHByb2dyZXNzIDwgMSkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVQcm9ncmVzcylcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFwcGVuZExvYWRpbmcoKSB7XG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5oZWFkLCBvU3R5bGUpXG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5ib2R5LCBvRGl2KVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVQcm9ncmVzcylcbiAgICB9LFxuICAgIHJlbW92ZUxvYWRpbmcoKSB7XG4gICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5oZWFkLCBvU3R5bGUpXG4gICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5ib2R5LCBvRGl2KVxuICAgIH0sXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCB7IGFwcGVuZExvYWRpbmcsIHJlbW92ZUxvYWRpbmcgfSA9IHVzZUxvYWRpbmcoKVxuZG9tUmVhZHkoKS50aGVuKGFwcGVuZExvYWRpbmcpXG5cbndpbmRvdy5vbm1lc3NhZ2UgPSAoZXYpID0+IHtcbiAgZXYuZGF0YS5wYXlsb2FkID09PSAncmVtb3ZlTG9hZGluZycgJiYgcmVtb3ZlTG9hZGluZygpXG59XG5cbnNldFRpbWVvdXQocmVtb3ZlTG9hZGluZywgMjEwMClcbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiaXBjUmVuZGVyZXIiLCJhcmdzIl0sIm1hcHBpbmdzIjoiOztBQUdBQSxTQUFBQSxjQUFjLGtCQUFrQixlQUFlO0FBQUEsRUFDN0MsTUFBTSxNQUF5QztBQUM3QyxVQUFNLENBQUMsU0FBUyxRQUFRLElBQUk7QUFDNUIsV0FBT0MscUJBQVksR0FBRyxTQUFTLENBQUMsVUFBVUMsVUFBUyxTQUFTLE9BQU8sR0FBR0EsS0FBSSxDQUFDO0FBQUEsRUFDN0U7QUFBQSxFQUNBLE9BQU8sTUFBMEM7QUFDL0MsVUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUk7QUFDM0IsV0FBT0QscUJBQVksSUFBSSxTQUFTLEdBQUcsSUFBSTtBQUFBLEVBQ3pDO0FBQUEsRUFDQSxRQUFRLE1BQTJDO0FBQ2pELFVBQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJO0FBQzNCLFdBQU9BLHFCQUFZLEtBQUssU0FBUyxHQUFHLElBQUk7QUFBQSxFQUMxQztBQUFBLEVBQ0EsVUFBVSxNQUE2QztBQUNyRCxVQUFNLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSTtBQUMzQixXQUFPQSxxQkFBWSxPQUFPLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFDNUM7QUFBQTtBQUFBO0FBSUYsQ0FBQztBQUdELFNBQVMsU0FBUyxZQUFrQyxDQUFDLFlBQVksYUFBYSxHQUFHO0FBQy9FLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixRQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxjQUFRLElBQUk7QUFBQSxJQUNkLE9BQU87QUFDTCxlQUFTLGlCQUFpQixvQkFBb0IsTUFBTTtBQUNsRCxZQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxrQkFBUSxJQUFJO0FBQUEsUUFDZDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVBLE1BQU0sVUFBVTtBQUFBLEVBQ2QsT0FBTyxRQUFx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
