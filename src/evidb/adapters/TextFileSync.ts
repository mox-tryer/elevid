import fs from 'fs';
import path from 'path';

import { SyncAdapter } from '../EviDbSync';

export interface TextEncoderSync {
    encode(data: string): string;
    decode(data: string): string;
}

class NoEncoderSync implements TextEncoderSync {
    encode(data: string): string {
        return data;
    }

    decode(data: string): string {
        return data;
    }
}

export class TextFileSync implements SyncAdapter<string> {
    tempFilename: string;
    filename: string;
    encoder: TextEncoderSync;

    constructor(filename: string, encoder?: TextEncoderSync) {
        this.filename = filename;
        this.tempFilename = path.join(
            path.dirname(filename),
            `.${path.basename(filename)}.tmp`,
        );
        this.encoder = encoder || new NoEncoderSync();
    }

    read(): string | null {
        let data;

        try {
            data = fs.readFileSync(this.filename, 'utf-8');
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw e;
        }

        return this.encoder.decode(data);
    }

    write(str: string): void {
        fs.writeFileSync(this.tempFilename, this.encoder.encode(str));
        fs.renameSync(this.tempFilename, this.filename);
    }
}