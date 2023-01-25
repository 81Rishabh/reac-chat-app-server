const crypto = require('crypto');
const  CryptoJS = require("crypto-js");

class Crypto {
    constructor() {
        // generate ECDH key
        const client = crypto.createECDH('secp256k1');
        client.generateKeys();

        // generate ECDH key 
        const server = crypto.createECDH('secp256k1');
        server.generateKeys();

        const clientPublicKeyBase64 = client.getPublicKey().toString('base64');
        const serverPublicKeyBase64 = server.getPublicKey().toString('base64');

        this.clientSharedKey = client.computeSecret(serverPublicKeyBase64, 'base64', 'hex');
        this.serverSharedKey = server.computeSecret(clientPublicKeyBase64, 'base64', 'hex');

    }

    secretKey() {
        return this.serverSharedKey;
    }

    encrypt(message) {
       return CryptoJS.AES.encrypt(message, this.clientSharedKey).toString();  
    }

   
}

const Ncrypto  = new Crypto();
exports.Ncrypto = Ncrypto;
  