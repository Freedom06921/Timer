// Electron主进程 - 负责创建窗口和管理应用生命周期
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 保持窗口的全局引用，防止JS垃圾回收导致窗口意外关闭
let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,  // 无边框窗口，实现全屏沉浸效果
    alwaysOnTop: true,  // 窗口始终置顶
    transparent: false,  // 不透明背景
    resizable: false,  // 不可调整大小
    skipTaskbar: false,  // 显示在任务栏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // 预加载脚本
      contextIsolation: true,  // 启用上下文隔离（安全最佳实践）
      nodeIntegration: false,  // 禁用Node集成（安全）
    }
  });

  // 加载HTML文件
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 进入全屏模式
  mainWindow.setFullScreen(true);

  // 处理窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron准备就绪后创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS点击Dock图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC处理：窗口控制
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) mainWindow.maximize();
});

ipcMain.on('unmaximize-window', () => {
  if (mainWindow) mainWindow.unmaximize();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});
