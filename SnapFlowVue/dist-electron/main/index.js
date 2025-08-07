import { app as e, BrowserWindow as l, ipcMain as R, shell as _ } from "electron";
import { createRequire as P } from "node:module";
import { fileURLToPath as E } from "node:url";
import o from "node:path";
import I from "node:os";
import { spawn as p } from "child_process";
P(import.meta.url);
const c = o.dirname(E(import.meta.url));
process.env.APP_ROOT = o.join(c, "../..");
const O = o.join(process.env.APP_ROOT, "dist-electron"), f = o.join(process.env.APP_ROOT, "dist"), s = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = s ? o.join(process.env.APP_ROOT, "public") : f;
I.release().startsWith("6.1") && e.disableHardwareAcceleration();
process.platform === "win32" && e.setAppUserModelId(e.getName());
e.requestSingleInstanceLock() || (e.quit(), process.exit(0));
let n = null;
const m = o.join(c, "../preload/index.mjs"), u = o.join(f, "index.html");
let t, r;
const w = e.isPackaged ? o.join(process.resourcesPath, "services") : o.join(c, "../../services");
t = p(o.join(w, "run/run"), {
  stdio: "inherit",
  shell: !0
});
r = p(o.join(w, "scoket_run/scoket_run"), {
  stdio: "inherit",
  shell: !0
});
async function h() {
  n = new l({
    width: 1e3,
    height: 800,
    title: "灵嗅",
    icon: o.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: m,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: !0
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  }), s ? n.loadURL(s) : n.loadFile(u), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n.webContents.setWindowOpenHandler(({ url: i }) => (i.startsWith("https:") && _.openExternal(i), { action: "deny" }));
}
e.whenReady().then(h);
e.on("window-all-closed", () => {
  n = null, process.platform !== "darwin" && e.quit();
});
e.on("second-instance", () => {
  n && (n.isMinimized() && n.restore(), n.focus());
});
e.on("activate", () => {
  const i = l.getAllWindows();
  i.length ? i[0].focus() : h();
});
R.handle("open-win", (i, a) => {
  const d = new l({
    webPreferences: {
      preload: m,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  s ? d.loadURL(`${s}#${a}`) : d.loadFile(u, { hash: a });
});
e.on("will-quit", () => {
  t && (t.kill("SIGTERM"), t = null), r && (r.kill("SIGTERM"), r = null);
});
e.on("window-all-closed", () => {
  process.platform !== "darwin" && e.quit();
});
export {
  O as MAIN_DIST,
  f as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
