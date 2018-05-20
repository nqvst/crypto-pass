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

function setup(password) {

    const seed = core.setupNewSecretKey(password);
    if(seed) {
        const seedOutputElement = document.querySelector('#seed');
        seedOutputElement.innerHTML = seed;
        const cardContainer = document.querySelector('#cardContainer');
        const setupForm = document.querySelector('#setupForm');
        cardContainer.classList.toggle('hidden');
        setupForm.classList.toggle('hidden');
    }
}

setupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pw1 = document.querySelector('#pass1').value
    const pw2 = document.querySelector('#pass2').value
    if(pw1 === pw2 && pw1.length >= 1) {
        if(config.exists()) {
            const answer = remote.dialog.showMessageBox({
                title: 'Overwrite',
                type: 'question',
                buttons: ['Cancel', 'Overwrite'],
                defaultId: 0,
                message: 'A secret key already exists \nDo you want to overwrite the existing secret key and loose all the passwords?',
            });
            if(answer !== 0) {
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
    const sure = remote.dialog.showMessageBox({
        title: 'Are you sure',
        type: 'question',
        buttons: ['NO Wait!', 'Yes i wrote it down!'],
        defaultId: 0,
        message: 'Are you sure you have written it down? you will never see them again',
    });

    if(sure) {
        const win = remote.getCurrentWindow();
        ipc.send('setup-done');
        win.close();
    }
});