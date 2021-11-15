import { TextEncoder } from "./TextFile";
import { encrypt, decrypt} from "./crypto-worker";
import { CryptoEncoderSync } from "./CryptoEncoderSync";

export class CryptoEncoder implements TextEncoder {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    encode(data: string): Promise<string> {
        const encoder = new CryptoEncoderSync(this.password);
        return Promise.resolve(encoder.encode(data));
        //return encrypt(data, this.password);
    }

    decode(data: string): Promise<string> {
        const encoder = new CryptoEncoderSync(this.password);
        return Promise.resolve(encoder.decode(data));
        //return decrypt(data, this.password);
    }

}