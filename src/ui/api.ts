import { GetApiType } from 'electron-typescript-ipc';
import { EntryType, EvidDb, YearEntries } from '../model';

export type IEntryOrder = { entryId: number, order: number};

export type IEvidAPI = GetApiType<
  {
    showOpenFile: (str: string) => Promise<string>,
    getCurrentDb: () => Promise<EvidDb>,
    dbgLogCurrentDb: () => Promise<void>,
    isDbModified: () => Promise<boolean>,
    getCurrentDbYears: () => Promise<number[]>,
    getCurrentDbYearEntries: (yearId: number) => Promise<YearEntries>,
    changeYearEntry: (yearId: number, entryId: number, entryName: string) => Promise<void>,
    newYearEntry: (yearId: number, entryType: EntryType) => Promise<void>,
    changeEntriesOrder: (yearId: number, entriesOrder: IEntryOrder[]) => Promise<void>,
    getYearEntrySum: (yearId: number, entryId: number) => Promise<number>,
    deleteYearEntry: (yearId: number, entryId: number) => Promise<void>,
  },
  {
    showAlert: (text: string, num: number) => Promise<void>;
  }
>;

declare global {
    interface Window {
        evidAPI: IEvidAPI
    }
}