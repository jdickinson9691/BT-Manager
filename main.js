const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let mainWindow;
let pythonProcess = null;
let webServer = null;

function startWebServer(callback) {
  const webOutDir = path.join(__dirname, 'apps', 'web', 'out');
  
  if (!fs.existsSync(webOutDir)) {
    console.log('Web out directory does not exist, proceeding to create window...');
    if (callback) callback();
    return;
  }

  webServer = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let filePath = path.join(webOutDir, reqUrl === '/' ? 'index.html' : reqUrl);

    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      }
    });
  });

  webServer.listen(3000, '127.0.0.1', () => {
    console.log('Local web static server running on http://127.0.0.1:3000');
    if (callback) callback();
  });

  webServer.on('error', (err) => {
    console.log('Web server port 3000 busy or error, using standard loader:', err.message);
    if (callback) callback();
  });
}

function startPythonBackend() {
  const isDevelopment = !app.isPackaged;
  const exePath = isDevelopment
    ? path.join(__dirname, 'dist', 'main', 'main.exe')
    : path.join(process.resourcesPath, 'extra', 'main', 'main.exe');

  if (fs.existsSync(exePath)) {
    console.log('Spawning standalone Python server binary from:', exePath);
    pythonProcess = spawn(exePath, ['--server'], { detached: true });
  } else {
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
    width: 1420,
    height: 920,
    title: "BT-Manager - BattleTech Campaign Operations",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  });

  mainWindow.loadURL('http://127.0.0.1:3000').catch(() => {
    mainWindow.loadFile(path.join(__dirname, 'apps', 'web', 'out', 'index.html'));
  });
}

app.whenReady().then(() => {
  startPythonBackend();
  startWebServer(() => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pythonProcess && pythonProcess.pid) {
    try {
      kill(pythonProcess.pid);
    } catch (e) {}
  }
  if (webServer) {
    try {
      webServer.close();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});