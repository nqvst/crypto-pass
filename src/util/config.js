const fs = require('fs');

const homeFolder = process.env['HOME'];
const configFilePath = homeFolder + '/.hidden';

function save(content) {
    if(exists()) {
        console.warn('config file already created.')
        return;
    }
    fs.writeFileSync(content);
}

function get() {
    const configBuffer = fs.readSync(configFilePath);
    console.log(configBuffer.toString());
}

function exists() {
    return fs.existsSync(configFilePath);
}


moduel.exports = {
    get,
    save,
    exists,
};