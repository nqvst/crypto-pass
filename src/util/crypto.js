const crypto = require('crypto');
const words = require('./words.js');
const WORD_LIST_LENGTH = words.length;
const config = require('./config.js');
const aes256 = require('aes256');

// this is pretty cool: parseInt(Buffer.from('password').toString('hex'), 16) % 654321;

function createSeed() {
    let randomWords = [];

    while (randomWords.length < 15) {
        const randomBytes = crypto.randomBytes(3);
        const r = parseInt(randomBytes.toString('hex'), 16)
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
    if(!config.exists()) {
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

function generatePrivateKey(seed) {
    return crypto.createHmac('sha256', '')
                    .update(seed)
                    .digest('hex');
}

function setupNewSecretKey(password, recoverySeed) {
    const seed = recoverySeed || createSeed();
    console.log('the secret words: ', seed);
    const privateKey = generatePrivateKey(seed);
    const encryptedKey = encrypt(password, privateKey);
    console.log('the secret key: [', privateKey, '] encrypted: ', encryptedKey);
    config.save(encryptedKey);
    return seed;
}

function getPrivateKeyFromFile(password) {
    if(config.exists()) {
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
    setupNewSecretKey(password, seed);
}

module.exports = {
    createSeed,
    generatePrivateKey,
    generatePassword,
    getPassword,
    setupNewSecretKey,
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