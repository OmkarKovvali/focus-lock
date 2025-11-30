import { app, shell, screen, BrowserWindow, ipcMain, desktopCapturer } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import OpenAI from "openai";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});



let focusInterval: NodeJS.Timeout | null = null;

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

  ipcMain.on('start-focus-mode',(event,payload) => {
    console.log("start fsoocus mode signal activated yuhh")
    const currentTask = payload;
    const win = BrowserWindow.fromWebContents(event.sender);
    if(win==null){
      return;
    }
    const windowWidth = 300;
    const windowHeight = 200;
    const display = screen.getPrimaryDisplay();
    const screenWidth = display.workAreaSize.width;
    const screenHeight = display.workAreaSize.height;
    const x = screenWidth - windowWidth;
    const y = screenHeight - windowHeight;
    win.setBounds({ x: x, y: y, width: windowWidth, height: windowHeight });
    win.setAlwaysOnTop(true,"screen-saver");

    if (focusInterval) clearInterval(focusInterval);

    focusInterval = setInterval(async () => {
      console.log("Taking a screenshot...");

      const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
      });

      const primarySource = sources[0];

      if (primarySource) {
        const imageBase64 = primarySource.thumbnail.toDataURL();

        try {
          const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: `The user wants to focus on: "${currentTask}". Is the screen content consistent with this task? Reply YES or NO.` },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64, // Pass the base64 string here
                    },
                  },
                ],
              },
            ],
            max_tokens: 10, // We only need a short YES/NO
          });
        
          const result = response.choices[0].message.content;
          console.log("AI Verdict:", result);
        
        } catch (error) {
          console.error("OpenAI Error:", error);
        }

        console.log("Yessir we screengrabbed, Len is", imageBase64.length);
      }

      

    }, 3000);




  });

  ipcMain.on('end-focus-mode',(event) =>{
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    const width = 900;
    const height = 670;
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    // Calculate center position
    const x = Math.round((screenWidth - width) / 2);
    const y = Math.round((screenHeight - height) / 2);

    win.setBounds({ x, y, width, height });
    win.setAlwaysOnTop(false);
    win.center();

    if (focusInterval){
      clearInterval(focusInterval);
      focusInterval = null;
    }


  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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
