const fs = window.require('fs');

const homeFolder = window.process.env['HOME'];
const BASE_FOLDER_PATH = homeFolder + '/.hidden'
const KEY_FILE_PATH = BASE_FOLDER_PATH + '/key';
const DOMAIN_FILE_PATH =  BASE_FOLDER_PATH + '/domains.json';

export function persistKey(content) {
    if (!exists(BASE_FOLDER_PATH)) {
        fs.mkdirSync(BASE_FOLDER_PATH);
    }
    fs.writeFileSync(KEY_FILE_PATH, content);
}

export function updateDomain(domain, version = 1) {
    let domains = [];

    if (exists(DOMAIN_FILE_PATH)) {
        domains = getDomains();
    }

    if(domains.find(entry => entry.domain === domain)) {
        domains = domains.map(entry => {
            if (entry.domain === domain && version > entry.version) {
                return {
                    ...entry,
                    version,
                    lastUpdated: Date.now(),
                };
            }
            return entry;
        });
    } else {
        domains.push({
            domain,
            version,
            lastUpdated: Date.now(),
            lastUsed: Date.now(),
        });
    }

    fs.writeFileSync(DOMAIN_FILE_PATH, JSON.stringify(domains));
    return domains;
}

export function useDomain(domain) {
    let domains = [];

    if (exists(DOMAIN_FILE_PATH)) {
        domains = getDomains();
    }

    domains = domains.map(entry => {
        if (entry.domain === domain) {
            return {
                ...entry,
                lastUsed: Date.now(),
            };
        }
        return entry;
    });

    fs.writeFileSync(DOMAIN_FILE_PATH, JSON.stringify(domains));
    return domains;
}

export function getKey() {
    try {
        const fileBuffer = fs.readFileSync(KEY_FILE_PATH, 'utf8');
        return fileBuffer.toString();
    } catch(e) {
        console.error(e);
        return undefined;
    }
}

export function getDomains() {
    try {
        const fileBuffer = fs.readFileSync(DOMAIN_FILE_PATH, 'utf8');
        return JSON.parse(fileBuffer.toString());
    } catch(e) {
        console.error(e);
        return [];
    }
}

export function exists(file) {
    return fs.existsSync(file);
}

export function privateKeyExists() {
    return exists(KEY_FILE_PATH);
}

