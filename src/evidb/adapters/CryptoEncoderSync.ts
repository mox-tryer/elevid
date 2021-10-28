import { TextEncoderSync } from "./TextFileSync";
import * as CryptoJS from "crypto-js";

type EncJson = {
    ct: string,
    iv?: string,
    s?: string
}

function stringify(cipherParams: CryptoJS.lib.CipherParams): string {
    // create json object with ciphertext
    const jsonObj: EncJson = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };

    // optionally add iv or salt
    if (cipherParams.iv) {
        jsonObj.iv = cipherParams.iv.toString();
    }

    if (cipherParams.salt) {
        jsonObj.s = cipherParams.salt.toString();
    }

    // stringify json object
    return JSON.stringify(jsonObj, null, 2);
}

function parse(str: string): CryptoJS.lib.CipherParams {
    // parse json string
    const jsonObj = JSON.parse(str);

    // extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
    });

    // optionally extract iv or salt

    if (jsonObj.iv) {
        cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }

    if (jsonObj.s) {
        cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }

    return cipherParams;
}

export class CryptoEncoderSync implements TextEncoderSync {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    encode(data: string): string {
        return stringify(CryptoJS.AES.encrypt(data, this.password));
    }

    decode(data: string): string {
        return CryptoJS.AES.decrypt(parse(data), this.password).toString(CryptoJS.enc.Utf8);
    }
}