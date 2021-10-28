import { Adapter } from '../EviDb';
import { TextFile, TextEncoder } from './TextFile';

export class JSONFile<T> implements Adapter<T> {
    adapter: TextFile;

    constructor(filename: string, encoder?: TextEncoder) {
        this.adapter = new TextFile(filename, encoder);
    }

    async read(): Promise<T | null> {
        const data = await this.adapter.read();
        if (data === null) {
            return null;
        } else {
            return JSON.parse(data) as T;
        }
    }

    write(obj: T): Promise<void> {
        return this.adapter.write(JSON.stringify(obj, null, 2));
    }
}