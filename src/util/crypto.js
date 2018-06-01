const crypto = require('crypto');
const words = require('./words.js');
const WORD_LIST_LENGTH = words.length;
const config = require('./config.js');
const aes256 = require('aes256');

// this is pretty cool: parseInt(Buffer.from('password').toString('hex'), 16) % 654321;

function createSeed(entropy = '') {
    let randomWords = [];

    while (randomWords.length < 20) {
        debugger;
        const randomBytes = crypto.randomBytes(4);
        const secureRandom = parseInt(randomBytes.toString('hex'), 16);
        const entropyHash = sha256(entropy[secureRandom % entropy.length].toString());
        const largeNumberFromEntropy = parseInt(entropyHash, 16);

        console.log('entropy hash', entropyHash, 'as a hex: ', largeNumberFromEntropy);

        const r = largeNumberFromEntropy % parseInt(randomBytes.toString('hex'), 16);
        console.log(r)
        const word = words[r % WORD_LIST_LENGTH];

        if (word) {
            randomWords.push(word);

        }
    }

    return randomWords.join(' ');
}

function generatePassword({ privateKey, domain, version = 1 }) {
    return crypto.createHmac('sha256', privateKey)
                    .update(domain)
                    .update(version.toString())
                    .digest('hex');
}

function getPassword(password, domain, version = 1) {
    if(!config.privateKeyExists()) {
        console.log('no seed file found, create one by pressing setup.')
        return;
    }

    const privateKey = getPrivateKeyFromFile(password);
    console.log('privateKey found: ', privateKey);
    if (privateKey) {
        return generatePassword({
            domain,
            version,
            privateKey,
        });
    }
}

function sha256(input, key = '', format = 'hex') {
    return crypto.createHmac('sha256', key)
                    .update(input)
                    .digest(format);
}

function getHashedMasterPassword(password) {
    return sha256(password);
}

function setupNewSecretKey({ password, recoverySeed, entropy }) {
    const seed = recoverySeed || createSeed(entropy);
    const privateKey = sha256(seed);
    const hashedMaterPass = getHashedMasterPassword(password);

    const encryptedKey = encrypt(hashedMaterPass, privateKey);

    console.log('the secret key: [', privateKey, '] encrypted: ', encryptedKey);

    config.save(encryptedKey);

    return seed;
}

function getPrivateKeyFromFile(password) {
    if(config.privateKeyExists()) {
        return decrypt(password, config.get());
    }
}

function encrypt(password, content) {
    const encrypted = aes256.encrypt(password, content);
    console.log(encrypted);
    return encrypted
}

function decrypt(password, cipherText) {
    const decrypted = aes256.decrypt(password, cipherText);
    console.log(decrypted);
    return decrypted;
}

function recoverFromSeed(password, seed) {
    setupNewSecretKey({
        password,
        recoverySeed: seed
    });
}

module.exports = {
    createSeed,
    generatePassword,
    getPassword,
    setupNewSecretKey,
    sha256,
}

// tests =================================================================================

function test_getPassword() {
    console.log(getPassword('pass', 'google.com', 1));
}
// test_getPassword();

// =========================================================================
function test_passwordGeneration() {
    const password = 'safe pass';
    const seed = createSeed();
    const privateKey = generatePrivateKey(password, seed);
    console.log('password: ', password, 'seed: ', seed, '\nPrivate Key: ', privateKey);

    const finalPassword = generatePassword({
        privateKey,
        password,
        domain: 'google.com',
        version: 3,
    });

    console.log('Final Password: ', finalPassword);
}
// test_passwordGeneration();
// =========================================================================
function test_createSeed() {
    console.log(createSeed())
}
// test_createSeed();


// =========================================================================
function test_setupNewSecretKey() {
    setupNewSecretKey('safePassowrd123');
}
function test_getPrivateKeyFromFile() {
    getPrivateKeyFromFile('safePassowrd123');
}
// test_setupNewSecretKey();
// test_getPrivateKeyFromFile();


// =========================================================================
function test_encrypt() {
    encrypt('pass', 'apa');
}
// test_encrypt();


// =========================================================================
function test_decrypt() {
    const priv = generatePrivateKey(createSeed());

    const cipher1 = encrypt('pass', priv);
    const cipher2 = encrypt('pass', priv);

    const des1 = decrypt('pass', cipher2);
    const des2 = decrypt('pass', cipher1);

    console.assert(des1 === des2, 'asdsd');

}
// test_decrypt();
// =========================================================================


function test_recoverFromSeed(){
    recoverFromSeed('safePassowrd123', 'member stone evoke short water abuse adapt trip uniform basic nothing practice test human absurd');
}
// test_recoverFromSeed();
