import { contextBridge, ipcRenderer } from 'electron-typescript-ipc';
import { EntryType, EvidDb, YearEntries } from './model';
import { IEntryOrder, IEvidAPI } from './ui/api';

const api: IEvidAPI = {
  invoke: {
    showOpenFile: async (key: string) => {
      return await ipcRenderer.invoke<IEvidAPI>('showOpenFile', key) as string;
    },
    getCurrentDb: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("getCurrentDb") as EvidDb;
    },
    dbgLogCurrentDb: async () => {
      await ipcRenderer.invoke<IEvidAPI>("dbgLogCurrentDb");
    },
    isDbModified: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("isDbModified") as boolean;
    },
    getCurrentDbYears: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("getCurrentDbYears") as number[];
    },
    getCurrentDbYearEntries: async (yearId: number) => {
      return await ipcRenderer.invoke<IEvidAPI>("getCurrentDbYearEntries", yearId) as YearEntries;
    },
    changeYearEntry: async (yearId: number, entryId: number, entryName: string) => {
      await ipcRenderer.invoke<IEvidAPI>("changeYearEntry", yearId, entryId, entryName);
    },
    newYearEntry: async (yearId: number, entryType: EntryType) => {
      await ipcRenderer.invoke<IEvidAPI>("newYearEntry", yearId, entryType);
    },
    changeEntriesOrder: async (yearId: number, entriesOrder: IEntryOrder[]) => {
      await ipcRenderer.invoke<IEvidAPI>("changeEntriesOrder", yearId, entriesOrder);
    },
    getYearEntrySum: async (yearId: number, entryId: number) => {
      return await ipcRenderer.invoke<IEvidAPI>("getYearEntrySum", yearId, entryId) as number;
    },
    deleteYearEntry: async (yearId: number, entryId: number) => {
      await ipcRenderer.invoke<IEvidAPI>("deleteYearEntry", yearId, entryId);
    }
  },
  on: {
    showAlert: (listener) => {
      ipcRenderer.on<IEvidAPI>('showAlert', listener);
    },
  },
};

contextBridge.exposeInMainWorld('evidAPI', api);
