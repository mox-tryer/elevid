import { contextBridge, ipcRenderer } from 'electron-typescript-ipc';
import { EntryType, MonthEntries, MonthId, YearEntries } from './model';
import { IEntryOrder, IEntrySum, IEvidAPI, IMonthSums, FileDialogResult } from './ui/api';

const api: IEvidAPI = {
    invoke: {
        getLastUsedDbPath: async () => {
            return await ipcRenderer.invoke<IEvidAPI>("getLastUsedDbPath") as string;
        },
        isDbModified: async () => {
            return await ipcRenderer.invoke<IEvidAPI>("isDbModified") as boolean;
        },
        isDbFileSet: async () => {
            return await ipcRenderer.invoke<IEvidAPI>("isDbFileSet") as boolean;
        },
        saveDb: async () => {
            await ipcRenderer.invoke<IEvidAPI>("saveDb");
        },
        saveDbAs: async (filePath: string, password: string) => {
            await ipcRenderer.invoke<IEvidAPI>("saveDbAs", filePath, password);
        },
        showSaveDbDialog: async (defaultPath: string | undefined) => {
            return await ipcRenderer.invoke<IEvidAPI>("showSaveDbDialog", defaultPath) as FileDialogResult;
        },
        openDb: async (filePath: string, password: string) => {
            await ipcRenderer.invoke<IEvidAPI>("openDb", filePath, password);
        },
        showOpenDbDialog: async (defaultPath: string | undefined) => {
            return await ipcRenderer.invoke<IEvidAPI>("showOpenDbDialog", defaultPath) as FileDialogResult;
        },
        getDbPath: async() => {
            return await ipcRenderer.invoke<IEvidAPI>("getDbPath") as string;
        },
        getYears: async () => {
            return await ipcRenderer.invoke<IEvidAPI>("getYears") as number[];
        },
        addNewYear: async (yearId: number) => {
            await ipcRenderer.invoke<IEvidAPI>("addNewYear", yearId);
        },
        getYearEntries: async (yearId: number) => {
            return await ipcRenderer.invoke<IEvidAPI>("getYearEntries", yearId) as YearEntries;
        },
        copyEntries: async (fromYearId: number, toYearId: number) => {
            await ipcRenderer.invoke<IEvidAPI>("copyEntries", fromYearId, toYearId);
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
        printMonthReport: async (yearId: number, monthId: MonthId) => {
            await ipcRenderer.invoke<IEvidAPI>("printMonthReport", yearId, monthId);
        },
        printYearReport: async (yearId: number) => {
            await ipcRenderer.invoke<IEvidAPI>("printYearReport", yearId);
        },
        getMonthsSums: async (yearId: number) => {
            return await ipcRenderer.invoke<IEvidAPI>("getMonthsSums", yearId) as IMonthSums[];
        },
        printReportWindow: async (reportType: "year" | "month") => {
            await ipcRenderer.invoke<IEvidAPI>("printReportWindow", reportType);
        }
    },
    on: {
        dbHasChanged: (listener) => {
            ipcRenderer.on<IEvidAPI>("dbHasChanged", listener);
        },
        showOpenDbDialog: (listener) => {
            ipcRenderer.on<IEvidAPI>("showOpenDbDialog", listener);
        },
        dbModificationChanged: (listener) => {
            ipcRenderer.on<IEvidAPI>("dbModificationChanged", listener);
        },
        showSaveDbDialog: (listener) => {
            ipcRenderer.on<IEvidAPI>("showSaveDbDialog", listener);
        }
    },
};

contextBridge.exposeInMainWorld('evidAPI', api);