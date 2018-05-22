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

const setupContainer = document.querySelector('#setupContainer');
const mainContainer = document.querySelector('#mainContainer');
const unlockContainer = document.querySelector('#unlockContainer');


const copyPassButton = document.querySelector('#copyPassButton');
const unlockButton = document.querySelector('#unlockButton');
const lockButton = document.querySelector('#lockButton');

let win;

lockButton.addEventListener('click', () => {
    lock();
});

const getStoredPassword = () => {
    return localStorage.getItem('password');
};

const setPassword = (pw) => {
    localStorage.setItem('password', pw);
};

const lock = () => {
    localStorage.clear();
    hide(mainContainer);
    show(unlockContainer);
};

function show(containerId) {
    containerId.classList.remove('hidden');
}

function hide(containerId) {
    containerId.classList.add('hidden');
}


if(!config.exists()) {
    show(setupContainer);

    const openSetupButton = document.querySelector('#setupButton');

    openSetupButton.addEventListener('click', e => {
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
} else if(!getStoredPassword()){
    show(unlockContainer);
    hide(setupContainer);
} else {
    show(mainContainer);
    hide(setupContainer);
}

unlockButton.addEventListener('click', e => {
    e.preventDefault();

    const passwordInput = document.querySelector('#password');

    setPassword(passwordInput.value);

    passwordInput.value = '';
    hide(unlockContainer);
    show(mainContainer);
});

copyPassButton.addEventListener('click', e => {
    e.preventDefault();

    const domain = document.querySelector('#domain');
    console.log(getStoredPassword(), localStorage);

    const pw = passwords.getPassword(getStoredPassword(), domain.value);
    clipboard.writeText(pw);
    domain.value = '';


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
