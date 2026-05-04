// electron-main.js
// AI-assisted: Electron wrapper that boots the Express server
// and opens a browser window pointing to it.

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let serverProcess = null;
const PORT = 3100; // Use a different port to avoid clashing with dev server

// Avoid OneDrive sync conflicts with Electron's cache
app.setPath('userData', path.join(app.getPath('appData'), 'get-interviews'));
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

/**
 * Boot the Express server in-process (not as a child process).
 * This keeps everything in one Electron app and shares lifecycle.
 */
function startServer() {
    process.env.PORT = PORT;
    process.env.ELECTRON_RUN = 'true';
    const { startServer: start } = require('./server.js');
    start();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 860,
        minWidth: 900,
        minHeight: 600,
        title: 'Get Interviews',
        icon: path.join(__dirname, 'public', 'icons', 'web-app-manifest-512x512.png'),
        backgroundColor: '#0f172a', // matches dark mode bg, prevents white flash
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        },
        show: false // Don't show until ready, prevents flash
    });

    // Open external links (e.g., Gemini console) in the user's default browser,
    // not inside Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Wait briefly for Express to boot, then load the URL
    setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${PORT}`);
    }, 500);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    startServer();
    createWindow();

    // Set a clean menu (remove DevTools by default in production, keep File>Quit etc.)
    const isMac = process.platform === 'darwin';
    const menuTemplate = [
        ...(isMac ? [{ role: 'appMenu' }] : []),
        {
            label: 'File',
            submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Get Interviews',
                    click: () => {
                        shell.openExternal('https://github.com/WordTheBird/get-interviews');
                    }
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});