import { contextBridge, ipcRenderer } from 'electron-typescript-ipc';
import { IEvidAPI } from './ui/api';

const api: IEvidAPI = {
  invoke: {
    showOpenFile: async (key: string) => {
      return await ipcRenderer.invoke<IEvidAPI>('showOpenFile', key);
    },
  },
  on: {
    showAlert: (listener) => {
      ipcRenderer.on<IEvidAPI>('showAlert', listener);
    },
  },
};

contextBridge.exposeInMainWorld('evidAPI', api);
