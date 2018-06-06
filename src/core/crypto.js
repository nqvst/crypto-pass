import aes256  from 'aes256';
import crypto from 'crypto';
import words from './words.js';
import { privateKeyExists, getKey, persistKey } from './config.js';
// import sha256 from 'sha256';
const WORD_LIST_LENGTH = words.length;

// this is pretty cool: parseInt(Buffer.from('password').toString('hex'), 16) % 654321;

export function createSeed(entropy = '') {
    let randomWords = [];

    while (randomWords.length < 20) {
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

export function sha256(message) {
    return crypto.createHash('sha256')
                    .update(message)
                    .digest('hex');
}

export function generatePassword({ privateKey, domain, version = 1 }) {
    const hash = sha256([
        privateKey,
        domain,
        version
    ].join());
    const hashAsNumber = parseInt(hash, 16);
    const passwordAsANumber = parseInt(Buffer.from('password').toString('hex'), 16);
    const pw = hash.split().map((char, index) => {
        //shorten it somehow??
        return char;
    }).join('');

    return pw;
}

export function getPassword(password, domain, version = 1) {
    if(!privateKeyExists()) {
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

export function getHashedMasterPassword(password) {
    return sha256(password);
}

export function setupNewSecretKey({ password, entropy, recoverySeed }) {
    const seed = recoverySeed || createSeed(entropy);
    const privateKey = sha256(seed);
    const hashedMaterPass = getHashedMasterPassword(password);

    const encryptedKey = encrypt(hashedMaterPass, privateKey);

    console.log('the secret key: [', privateKey, '] encrypted: ', encryptedKey);

    persistKey(encryptedKey);

    return seed;
}

export function getPrivateKeyFromFile(password) {
    if(!privateKeyExists()) {
        throw new Error('Missing keyfile!');
    }
    return decrypt(password, getKey());
}

export function encrypt(password, content) {
    const encrypted = aes256.encrypt(password, content);
    console.log(encrypted);
    return encrypted
}

export function decrypt(password, cipherText) {
    const decrypted = aes256.decrypt(password, cipherText);
    console.log(decrypted);
    return decrypted;
}

export function recoverFromSeed(password, seed) {
    setupNewSecretKey({
        password,
        recoverySeed: seed
    });
}

/*
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
*/