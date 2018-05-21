const {
    app,
    remote,
    ipcRenderer: ipc,
} = require('electron');

const path = require('path');
const url = require('url');
const core = require('../util/crypto');
const config = require('../util/config');

const setupBtn = document.querySelector('#setupBtn');
const doneBtn = document.querySelector('#done');
const recoverCheck = document.querySelector('#recover');
const recoveryContainer = document.querySelector('#recoveryContainer');
const recoveryInput = document.querySelector('#recoveryInput');

const MIN_PASSWORD_LENGTH = 8;

const validPassword = (pw1, pw2) => (
    pw1 === pw2 && pw1.length >= MIN_PASSWORD_LENGTH
);

function setup(password) {
    const recoverySeed = document.querySelector('#recoveryInput').value;

    let seed;
    if (showRecovery && recoverySeed) {
        seed = core.setupNewSecretKey(password, recoverySeed);
    } else {
        seed = core.setupNewSecretKey(password);
    }

    if(seed) {
        if (seed === recoverySeed && showRecovery) {
            done();
        }

        const seedOutputElement = document.querySelector('#seed');
        seedOutputElement.innerHTML = seed;
        const cardContainer = document.querySelector('#cardContainer');
        const setupForm = document.querySelector('#setupForm');

        cardContainer.classList.toggle('hidden');
        setupForm.classList.toggle('hidden');
    }
}

let showRecovery = false;

recoverCheck.addEventListener('change', e => {
    const { target: { checked } = {}} = e;

    showRecovery = Boolean(checked);
    if (showRecovery) {
        recoveryContainer.classList.remove('hidden');
    } else {
        recoveryContainer.classList.add('hidden');
    }
});

setupBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const pw1 = document.querySelector('#pass1').value
    const pw2 = document.querySelector('#pass2').value

    if (validPassword(pw1, pw2)) {

        if(config.exists()) {
            const answer = remote.dialog.showMessageBox({
                title: 'Overwrite',
                type: 'question',
                buttons: ['Cancel', 'Overwrite'],
                defaultId: 0,
                message: 'A secret key already exists \nDo you want to overwrite the existing secret key and loose all the passwords?',
            });

            if (answer !== 0) {
                setup(pw1);
            }

        } else {
            setup(pw1);
        }
    } else {
        alert('password doesn\'t match.');
    }
});

doneBtn.addEventListener('click', (e) => {
    const answer = remote.dialog.showMessageBox({
        title: 'Are you sure',
        type: 'question',
        buttons: ['NO Wait!', 'Yes i wrote it down!'],
        defaultId: 0,
        message: 'Are you sure you have written it down? you will never see them again',
    });

    if(answer) {
       done();
    }
});

function done() {
    const win = remote.getCurrentWindow();
    ipc.send('setup-done');
    win.close();
}
