

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const SelectedGame = require('./lib/src/selectedGame')
const GameConfigManager = require('./lib/src/gameConfigManager')
const ApiInit = require('./lib/src/apiInit')

require('dotenv').config()
const dev = (process.env.NODE_ENV === 'development')

const start = (webContents) => {
  const sendEvent = (channel, args) => {
    if ((typeof webContents.send) === 'function') {
      webContents.send(channel, args)
    } else {
      console.log('can not send event')
    }
  }

  const listenEvent = (channel, callable) => {
    ipcMain.on(channel, function (event, arg) {
      callable(arg, event)
    })
  }

  const api = new ApiInit(sendEvent, listenEvent);
  api.init();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width:825,
    height:675,
    resizable:true,
    minimizable : false,
    maximizable : false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame:false,
    title:'bHaptics Racing games',
  })
  
  mainWindow.loadFile('./view/main/index.html')
  /*
      .then(() => {
        dev && mainWindow.webContents.openDevTools()
        start(mainWindow.webContents)
      })
      .catch((err) => console.error(err))
  */
}

app.allowRendererProcessReuse = false;

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('selectGame', (evt, arg) => {
  SelectedGame.setGameID(arg);
});

ipcMain.on('gameConfig', (evt, arg) => {
  const check = GameConfigManager.checkConfigNeeded();
  if(!check)
  {
    BrowserWindow.getAllWindows()[0].loadFile('./view/gameconfig/'+ SelectedGame.getGameId() + ".html");
    SelectedGame.setGameID('');
  }
});

ipcMain.on('start', (evt, arg) => {
  const check = GameConfigManager.checkConfigNeeded();
  if (!check && BrowserWindow.getAllWindows().length > 0){
    start(BrowserWindow.getAllWindows()[0]);
  }
});

ipcMain.on('close', (evt, arg) => {
  app.quit();
});
