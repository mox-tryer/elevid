import { Worker, isMainThread, parentPort, workerData} from "worker_threads";
import { CryptoEncoderSync } from "./CryptoEncoderSync";

interface CryptoWorkerData {
    action: "encrypt" | "decrypt";
    data: string;
    password: string;
}

function runWorker(cryptoWorkerData: CryptoWorkerData) {
    return new Promise<string>((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: cryptoWorkerData
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
}

export function encrypt(str: string, pwd: string): Promise<string> {
    return runWorker({action: "encrypt", data: str, password: pwd});
}

export function decrypt(str: string, pwd: string): Promise<string> {
    return runWorker({action: "decrypt", data: str, password: pwd});
}

function encryptString(data: string, password: string): string {
    const encoder = new CryptoEncoderSync(password);
    return encoder.encode(data);
}

function decryptString(data: string, password: string): string {
    const encoder = new CryptoEncoderSync(password);
    return encoder.decode(data);
}

if (!isMainThread) {
    const cryptoWorkerData = workerData as CryptoWorkerData;
    switch (cryptoWorkerData.action) {
        case "encrypt":
            parentPort?.postMessage(encryptString(cryptoWorkerData.data, cryptoWorkerData.password));
            break;

        case "decrypt":
            parentPort?.postMessage(decryptString(cryptoWorkerData.data, cryptoWorkerData.password));
            break;
    }
}