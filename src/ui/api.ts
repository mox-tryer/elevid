import { GetApiType } from 'electron-typescript-ipc';

export type IEvidAPI = GetApiType<
  {
    showOpenFile: (str: string) => Promise<string>;
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