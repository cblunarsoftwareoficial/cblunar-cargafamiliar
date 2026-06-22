const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Configuración básica del actualizador
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'CB Lunar | Gestor de Cargas',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#09090b',
    show: false
  });

  // Check if we are in development mode by checking an env var or URL
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Interceptar window.open para abrir links externos (Mercado Pago) en el navegador del usuario (Chrome, Edge, etc)
  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  win.once('ready-to-show', () => {
    win.removeMenu();
    win.show();
    
    // Revisar si hay actualizaciones solo si estamos en producción
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

// Al descargar la actualización, le avisamos al usuario
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización Disponible',
    message: 'Se ha descargado una nueva versión del programa. Se instalará automáticamente al cerrar la aplicación.',
    buttons: ['Cerrar y Actualizar Ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
