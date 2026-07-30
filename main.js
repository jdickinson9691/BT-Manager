const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let mainWindow;
let pythonProcess = null;

function startPythonBackend() {
  const isDevelopment = !app.isPackaged;
  const exePath = isDevelopment
    ? path.join(__dirname, 'dist', 'main', 'main.exe')
    : path.join(process.resourcesPath, 'extra', 'main', 'main.exe');

  if (fs.existsSync(exePath)) {
    pythonProcess = spawn(exePath, [], { detached: true });
  } else {
    // Fallback in development: launch uvicorn via python
    console.log('Executable not found, launching FastAPI backend via uvicorn...');
    pythonProcess = spawn('python', ['-m', 'uvicorn', 'apps.api.main:app', '--port', '8000'], {
      detached: true,
      cwd: __dirname
    });
  }

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python backend:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDevelopment = !app.isPackaged;
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'apps', 'web', 'out', 'index.html'));
  }
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (pythonProcess && pythonProcess.pid) {
    try {
      kill(pythonProcess.pid);
    } catch (e) {
      console.error('Failed to kill process:', e);
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});