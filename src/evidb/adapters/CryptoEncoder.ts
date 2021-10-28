import { TextEncoder } from "./TextFile";
import { encrypt, decrypt} from "./crypto-worker";

export class CryptoEncoder implements TextEncoder {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    encode(data: string): Promise<string> {
        return encrypt(data, this.password);
    }

    decode(data: string): Promise<string> {
        return decrypt(data, this.password);
    }

}