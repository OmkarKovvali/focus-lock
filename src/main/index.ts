import { app, shell, screen, BrowserWindow, ipcMain, desktopCapturer } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import 'dotenv/config'


let pollInterval: NodeJS.Timeout | null = null

let isFocusModeActive = false;

async function runFocusCheck(window:BrowserWindow,task:string): Promise<void>{
  
  const scheduleNextRun = () => {
    if (isFocusModeActive) {
      console.log("Scheduling next check in 30s...");
      setTimeout(() => runFocusCheck(window, task), 30000);
    }
  };
  
  if (!isFocusModeActive) {
    console.log("Focus mode stopped, aborting check.");
    return;
  }
  console.log("Starting getSources")
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 }
  })
  console.log("Got sources")

  const primarySource = sources[0]

  if (!primarySource) {
    console.warn("No primary source found. Retrying...");
    scheduleNextRun();
    return;
  }

  if (primarySource) {
    const imageBase64 = primarySource.thumbnail.toDataURL()

    if (imageBase64.length < 1000) {
      console.warn('Screenshot is messed up, check your permissions!')
      scheduleNextRun();
      return;
    }

    try{
      const response = await fetch('https://overlord-44ct.onrender.com/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task,
          image: imageBase64
        })
      })

      const data = await response.json()
      const gpt_response = data.verdict // Get the verdict from Python
      
      console.log('AI Verdict:', gpt_response)

      if (gpt_response?.toUpperCase().includes('NO')) {
        isFocusModeActive = false;
        window.setKiosk(true)
        window.setAlwaysOnTop(true, 'screen-saver')
        window.webContents.send('lock-screen-trigger')

        fetch('https://overlord-44ct.onrender.com/punish', { method: 'POST' })
              .then(() => console.log('Report send via judge server'))
              .catch((err) => console.error('Not able to report to judge: ', err))

            if (pollInterval) {
              clearInterval(pollInterval)
            }
            pollInterval = setInterval(async () => {
              try {
                const poll_response = await fetch('https://overlord-44ct.onrender.com/status', {
                  method: 'GET'
                })
                const poll_data = await poll_response.json()
                if (!poll_data.locked) {
                  window.setKiosk(false)
                  window.setAlwaysOnTop(false)
                  
                  setTimeout(() => {
                    window.webContents.send('unlock-screen-trigger')
                  },500)

                  if (pollInterval) {
                    clearInterval(pollInterval)
                  }
                }
              } catch (error) {
                console.error('Polling failed:', error)
              }
            }, 1000);

            return;
          }
        } catch (error) {
          console.error('OpenAI messed something up', error)
        }

        scheduleNextRun();
        
  }    

  
}


function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('start-focus-mode', (event, duration, task) => {
    console.log('start fsoocus mode signal activated yuhh')
    console.log('Start focus mode:', duration, task)
    const currentTask = task
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win == null) {
      return
    }
    const windowWidth = 300
    const windowHeight = 200
    const display = screen.getPrimaryDisplay()
    const screenWidth = display.workAreaSize.width
    const screenHeight = display.workAreaSize.height
    const x = screenWidth - windowWidth
    const y = screenHeight - windowHeight
    win.setBounds({ x: x, y: y, width: windowWidth, height: windowHeight })
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen: true})

    isFocusModeActive = true
    runFocusCheck(win,currentTask)
  })

  ipcMain.on('end-focus-mode', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    const width = 900
    const height = 670
    const display = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = display.workAreaSize

    // Calculate center position
    const x = Math.round((screenWidth - width) / 2)
    const y = Math.round((screenHeight - height) / 2)

    win.setBounds({ x, y, width, height })
    win.setAlwaysOnTop(false)
    win.setVisibleOnAllWorkspaces(false)
    win.center()

    win.show()
    win.focus()

    isFocusModeActive = false
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length === 0) {
      createWindow()
    } else {
      allWindows[0].show()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
