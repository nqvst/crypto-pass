const {
    app,
    BrowserWindow,
    Menu,
} = require('electron');
const path = require('path');
const url = require('url');

const mainMenuTemplate = require('./menu/mainMenu.js');

let win;

function createMainMenu() {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

function createWindow() {
    win = new BrowserWindow({ width: 800, height: 600, frame: false });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'templates/index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    createMainMenu();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
