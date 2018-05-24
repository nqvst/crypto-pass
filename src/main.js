const {
    app,
    BrowserWindow,
    Menu,
    ipcMain: ipc,
    globalShortcut,
    remote,
} = require('electron');
const path = require('path');
const url = require('url');
const config = require('./util/config');

const mainMenuTemplate = require('./menu/mainMenu.js');

let win;

function createMainMenu() {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

function createWindow() {

    win = new BrowserWindow({ width: 800, height: 200, frame: false });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'templates/index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    win.webContents.openDevTools();

    win.on('close', (e) => {

        win = null;

        // e.preventDefault();
        // win.hide();
      });

    const ret = globalShortcut.register('Control+Command+P', () => {
        app.focus();
    });

    if (!ret) {
        console.log('registration failed')
    }

    console.log(globalShortcut.isRegistered('Control+Command+P'));

    // createMainMenu();
}

app.on('ready', createWindow);

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

ipc.on('setup-done', () => {
    console.log('setup-done in main.js')
    win.webContents.send('reload-main');
})