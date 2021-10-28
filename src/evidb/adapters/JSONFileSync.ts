import { SyncAdapter } from '../EviDbSync';
import { TextFileSync, TextEncoderSync } from './TextFileSync';

export class JSONFileSync<T> implements SyncAdapter<T> {
    adapter: TextFileSync;

    constructor(filename: string, encoder?: TextEncoderSync) {
        this.adapter = new TextFileSync(filename, encoder);
    }

    read(): T | null {
        const data = this.adapter.read();
        if (data === null) {
            return null;
        } else {
            return JSON.parse(data) as T;
        }
    }

    write(obj: T): void {
        this.adapter.write(JSON.stringify(obj, null, 2));
    }
}