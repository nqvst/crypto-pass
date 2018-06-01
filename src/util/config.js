const fs = require('fs');

const homeFolder = process.env['HOME'];
const BASE_FOLDER_PATH = homeFolder + '/.hidden'
const KEY_FILE_PATH = BASE_FOLDER_PATH + '/key';
const DOMAIN_FILE_PATH =  BASE_FOLDER_PATH + '/domains.json';

function save(content) {
    if (!exists(BASE_FOLDER_PATH)) {
        fs.mkdirSync(BASE_FOLDER_PATH);
    }
    fs.writeFileSync(KEY_FILE_PATH, content);
}

function update(domain, version = 1) {
    let existingDomains;

    if(!exists(DOMAIN_FILE_PATH)) {
        existingDomains = [];
    }else {
        const domainFileContents = getDomains();
        existingDomains = JSON.parse(domainFileContents);
    }

    let newDomains;
    if(existingDomains.find(d => d.domain === domain)) {
        newDomains = domainsFromFile.map(d => {
            if (d.domain === domain && version > d.version) {
                return {
                    ...d,
                    version,
                };
            }
            return d;
        });
    } else {
        newDomains.push({
            domain,
            version,
        });
    }

    fs.writeFileSync(DOMAIN_FILE_PATH, JSON.stringify(newDomains));
}

function getKey() {
    const fileBuffer = fs.readFileSync(KEY_FILE_PATH, 'utf8');
    return fileBuffer.toString();
}

function getDomains() {
    const fileBuffer = fs.readFileSync(DOMAIN_FILE_PATH, 'utf8');
    return fileBuffer.toString();
}

function exists(file) {
    return fs.existsSync(file);
}

function privateKeyExists() {
    return exists(KEY_FILE_PATH);
}


module.exports = {
    get: getKey,
    save,
    exists,
    privateKeyExists,
    update,
    getDomains,
};