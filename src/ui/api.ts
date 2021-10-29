import { GetApiType } from 'electron-typescript-ipc';
import { EvidDb } from '../model';

export type IEvidAPI = GetApiType<
  {
    showOpenFile: (str: string) => Promise<string>,
    getCurrentDb: () => Promise<EvidDb>
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