import { contextBridge, ipcRenderer } from 'electron-typescript-ipc';
import { EntryType, MonthEntries, MonthId, YearEntries } from './model';
import { IEntryOrder, IEntrySum, IEvidAPI } from './ui/api';

const api: IEvidAPI = {
  invoke: {
    showOpenFile: async (key: string) => {
      return await ipcRenderer.invoke<IEvidAPI>('showOpenFile', key) as string;
    },
    dbgLogCurrentDb: async () => {
      await ipcRenderer.invoke<IEvidAPI>("dbgLogCurrentDb");
    },
    isDbModified: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("isDbModified") as boolean;
    },
    getYears: async () => {
      return await ipcRenderer.invoke<IEvidAPI>("getYears") as number[];
    },
    getYearEntries: async (yearId: number) => {
      return await ipcRenderer.invoke<IEvidAPI>("getYearEntries", yearId) as YearEntries;
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
    },
    getYearSums: async (yearId: number) => {
      return await ipcRenderer.invoke<IEvidAPI>("getYearSums", yearId) as IEntrySum[];
    },
    getMonthEntries: async (yearId: number, monthId: MonthId) => {
      return await ipcRenderer.invoke<IEvidAPI>("getMonthEntries", yearId, monthId) as MonthEntries;
    },
    incrementMonthEntry: async (yearId: number, monthId: MonthId, entryId: number, value: number) => {
      await ipcRenderer.invoke<IEvidAPI>("incrementMonthEntry", yearId, monthId, entryId, value);
    },
    setMonthEntry: async (yearId: number, monthId: MonthId, entryId: number, value: number) => {
      await ipcRenderer.invoke<IEvidAPI>("setMonthEntry", yearId, monthId, entryId, value);
    },
  },
  on: {
    showAlert: (listener) => {
      ipcRenderer.on<IEvidAPI>('showAlert', listener);
    },
  },
};

contextBridge.exposeInMainWorld('evidAPI', api);
