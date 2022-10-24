const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs')

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  global.mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#002b36',
    show: false,
    webPreferences:
    {       
      nodeIntegration:true, //Notwendig um NodeJS Befehle zu nutzen
      contextIsolation:false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.setIcon(path.join(__dirname, '/assets/logo/logo.png'));
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setMenu(null) // just remove default menu of a specific window and not all windows
  mainWindow.setFullScreen(true);

  mainWindow.on('ready-to-show', function() {
    mainWindow.show();
    mainWindow.focus();
});

//Ugly Fix for some Testserver Problems about content security, probably should not be kept if this game goes to any places further than offline singleplayer
const { session } = require('electron')
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': '' 
    }
  })
})

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};





// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('Shutdown', (event) => {
  app.exit(0)
})

global.fullScreen = true
ipcMain.on('Fullscreen', (event) => {
  if(fullScreen){
    mainWindow.setFullScreen(false);
    fullScreen = false
  }
  else{
    mainWindow.setFullScreen(true);
    fullScreen = true
  } 
})
