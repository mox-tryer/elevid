import { contextBridge, ipcRenderer } from 'electron-typescript-ipc';
import { EvidDb } from './model';
import { IEvidAPI } from './ui/api';

const api: IEvidAPI = {
  invoke: {
    showOpenFile: async (key: string) => {
      return await ipcRenderer.invoke<IEvidAPI>('showOpenFile', key) as string;
    },
    getCurrentDb: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("getCurrentDb") as EvidDb;
    }
  },
  on: {
    showAlert: (listener) => {
      ipcRenderer.on<IEvidAPI>('showAlert', listener);
    },
  },
};

contextBridge.exposeInMainWorld('evidAPI', api);
