const {
    app,
    clipboard,
    remote,
    ipcRenderer: ipc,
} = require('electron');
const { BrowserWindow } = remote;
const path = require('path');
const url = require('url');
const passwords = require('../util/crypto');
const config = require('../util/config');

const setupContainer = document.querySelector('#setupContainer')
const mainContainer = document.querySelector('#mainContainer')
let win;

if(!config.exists()) {
    const openSetupButton = document.querySelector('#setupButton');

    openSetupButton.addEventListener('click', () => {
        const setupPath = url.format({
            pathname: path.join(__dirname, 'welcome.html'),
            protocol: 'file:',
            slashes: true,
        });

        win = new BrowserWindow({
            width: 600,
            height: 500,
            frame: false,
            alwaysOnTop: true,
        });

        win.on('close', () => {
            win = null;
        })

        win.loadURL(setupPath);
        win.show();
    });
} else {
    mainContainer.classList.toggle('hidden');
    setupContainer.classList.toggle('hidden');
}

const copyPassButton = document.querySelector('#copyPassButton');

copyPassButton.addEventListener('click', (e) => {
    e.preventDefault();

    const password = localStorage.getItem('password') || 'jaenq002';
    const domain = document.querySelector('#domain').value
    const pw = passwords.getPassword(password, domain);
    clipboard.writeText(pw);


    const alertMessage = document.querySelector('#alert')
    alertMessage.classList.remove('hidden');


    setTimeout(() => {
        alertMessage.classList.add('fadeOut');
        setTimeout(() => {
            alertMessage.classList.remove('fadeOut');
            alertMessage.classList.add('hidden');
        }, 1000);
    }, 1000);
});

ipc.on('reload-main', () => {
    console.log('reload-main in index.js');
    mainContainer.classList.toggle('hidden');
    setupContainer.classList.toggle('hidden');
});
