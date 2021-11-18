import { GetApiType } from 'electron-typescript-ipc';
import { Entry, EntryType, MonthEntries, MonthId, YearEntries } from '../model';

export type IEntryOrder = { entryId: number, order: number};

export type IEntrySum = {
  entryId: number;
  entry: Entry;
  sum: number;
};

export type IMonthSums = {
  monthId: MonthId;
  sums: IEntrySum[];
  totalExpense: number;
  totalIncome: number;
};

export type FileDialogResult = {
  canceled: boolean;
  filePath?: string;
}

export type IEvidAPI = GetApiType<
  {
    getLastUsedDbPath: () => Promise<string>;
    isDbModified: () => Promise<boolean>;
    isDbFileSet: () => Promise<boolean>;
    saveDb: () => Promise<void>;
    saveDbAs: (filePath: string, password: string) => Promise<void>;
    showSaveDbDialog: (defaultPath: string | undefined) => Promise<FileDialogResult>;
    openDb: (filePath: string, password: string) => Promise<void>;
    showOpenDbDialog: (defaultPath: string | undefined) => Promise<FileDialogResult>;
    getDbPath: () => Promise<string>;
    getYears: () => Promise<number[]>;
    addNewYear: (yearId: number) => Promise<void>;
    getYearEntries: (yearId: number) => Promise<YearEntries>;
    copyEntries: (fromYearId: number, toYearId: number) => Promise<void>;
    changeYearEntry: (yearId: number, entryId: number, entryName: string) => Promise<void>;
    newYearEntry: (yearId: number, entryType: EntryType) => Promise<void>;
    changeEntriesOrder: (yearId: number, entriesOrder: IEntryOrder[]) => Promise<void>;
    getYearEntrySum: (yearId: number, entryId: number) => Promise<number>;
    deleteYearEntry: (yearId: number, entryId: number) => Promise<void>;
    getYearSums: (yearId: number) => Promise<IEntrySum[]>;
    getMonthEntries: (yearId: number, monthId: MonthId) => Promise<MonthEntries>;
    incrementMonthEntry: (yearId: number, monthId: MonthId, entryId: number, value: number) => Promise<void>;
    setMonthEntry: (yearId: number, monthId: MonthId, entryId: number, value: number) => Promise<void>;
    printMonthReport: (yearId: number, monthId: MonthId) => Promise<void>;
    printYearReport: (yearId: number) => Promise<void>;
    getMonthsSums: (yearId: number) => Promise<IMonthSums[]>;
    printReportWindow: (reportType: "year" | "month") => Promise<void>;
  },
  {
    dbHasChanged: () => Promise<void>;
    showOpenDbDialog: () => Promise<void>;
    dbModificationChanged: () => Promise<void>;
    showSaveDbDialog: () => Promise<void>;
  }
>;

declare global {
    interface Window {
        evidAPI: IEvidAPI
    }
}