// 预加载脚本 - 安全地在主进程和渲染进程之间建立通信桥梁
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('timerAPI', {
  // 控制窗口
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  unmaximize: () => ipcRenderer.send('unmaximize-window'),
  close: () => ipcRenderer.send('close-window'),
});
