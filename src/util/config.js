const fs = require('fs');

const homeFolder = process.env['HOME'];
const configFilePath = homeFolder + '/.hidden';

function save(content) {
    fs.writeFileSync(configFilePath, content);
}

function get() {
    const configBuffer = fs.readFileSync(configFilePath, 'utf8');
    console.log(configBuffer.toString());
    return configBuffer.toString();
}

function exists() {
    return fs.existsSync(configFilePath);
}


module.exports = {
    get,
    save,
    exists,
};