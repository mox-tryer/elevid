import fs from 'fs';
import { Writer } from "./AsyncWriter";

import { Adapter } from '../EviDb';

export interface TextEncoder {
    encode(data: string): Promise<string>;
    decode(data: string): Promise<string>;
}

class NoEncoder implements TextEncoder {
    encode(data: string): Promise<string> {
        return Promise.resolve(data);
    }

    decode(data: string): Promise<string> {
        return Promise.resolve(data);
    }
}

export class TextFile implements Adapter<string> {
    filename: string;
    writer: Writer;
    encoder: TextEncoder;

    constructor(filename: string, encoder?: TextEncoder) {
        this.filename = filename;
        this.writer = new Writer(filename);
        this.encoder = encoder || new NoEncoder();
    }

    async read(): Promise<string | null> {
        let data;

        try {
            data = await fs.promises.readFile(this.filename, 'utf-8');
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw e;
        }

        return this.encoder.decode(data);
    }

    async write(str: string): Promise<void> {
        try {
            await fs.promises.copyFile(this.filename, this.filename + ".bkp");
        } catch {
            console.error("cannot make backup copy");
        }
        const encStr = await this.encoder.encode(str);
        return this.writer.write(encStr);
    }
}