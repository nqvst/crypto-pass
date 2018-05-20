const fs = require('fs');
const readline = require('readline');

const homeFolder = process.env['HOME'];
const configFilePath = homeFolder + '/.hidden';

function save(content) {
    if(exists()) {
        console.warn('config file already created.')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          rl.question('overwrite? y/n\n', (answer) => {
            console.log(answer);
            if(answer==='y') {
                console.log('overwriting file...\n', content);
                fs.writeFileSync(configFilePath, content);
            }

            rl.close();
        });
        // return;
    }
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