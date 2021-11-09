import { EviDb, JSONFile } from './evidb';
import { CryptoEncoder } from './evidb/adapters/CryptoEncoder';
import { Entry, EntryType, EvidDb, MonthEntries, MonthId, monthToOrder, YearEntries, YearMonths } from './model';

export interface EntryOrder {
    entryId: number;
    order: number;
}

export interface EntrySum {
    entryId: number;
    entry: Entry;
    sum: number;
}

export interface MonthSums {
    monthId: MonthId;
    sums: EntrySum[];
    totalExpense: number;
    totalIncome: number;
}

function entrySum(yearMonths: YearMonths, entryId: number) {
    return Object.entries(yearMonths)
        .map(([, month]) => month[entryId] || 0)
        .reduce((partialSum, a) => partialSum + a, 0);
}

type PathWithPassword = {
    filePath: string;
    password: string;
}

export class CurrentDatabase {
    private evidDb: EvidDb;
    private modified: boolean;
    private file?: PathWithPassword;

    public constructor(evidDb: EvidDb, filePath?: PathWithPassword) {
        this.evidDb = evidDb;
        this.file = filePath;
        this.modified = false;
    }

    public hasPath(): boolean {
        return !!this.file;
    }

    public setFile(filePath: string, password: string): void {
        this.file = { filePath, password };
    }

    public getFile(): string {
        return this.file?.filePath;
    }

    public async save(): Promise<void> {
        const db = new EviDb<EvidDb>(new JSONFile(this.file.filePath, new CryptoEncoder(this.file.password)));
        db.data = this.evidDb;
        await db.write();
        this.modified = false;
    }

    public toJSON(): string {
        return JSON.stringify(this.evidDb, null, 2);
    }

    public isModified(): boolean {
        return this.modified;
    }

    public getYears(): number[] {
        return Object.entries(this.evidDb).map(([key]) => Number(key));
    }

    public getYearEntries(yearId: number): YearEntries {
        return this.evidDb[yearId].entries;
    }

    public changeYearEntry(yearId: number, entryId: number, entryName: string): void {
        this.evidDb[yearId].entries[entryId].name = entryName;
        this.modified = true;
    }

    public newYearEntry(yearId: number, entryType: EntryType): void {
        const evidYear = this.evidDb[yearId];
        const newEntryId = 1 + Object.entries(evidYear.entries)
            .map(([entryId]) => Number(entryId))
            .reduce((a, b) => Math.max(a, b), 0);
        const newEntry: Entry = { type: entryType, name: "Nová položka", order: newEntryId };
        evidYear.entries[newEntryId] = newEntry;
        this.modified = true;
    }

    public changeEntriesOrder(yearId: number, entriesOrder: EntryOrder[]): void {
        const yearEntries = this.evidDb[yearId].entries;
        entriesOrder.forEach((entryOrder) => yearEntries[entryOrder.entryId].order = entryOrder.order);
        this.modified = true;
    }

    public getYearEntrySum(yearId: number, entryId: number): number {
        return entrySum(this.evidDb[yearId].months, entryId);
    }

    public deleteYearEntry(yearId: number, entryId: number): void {
        const yearEntries = this.evidDb[yearId].entries;
        delete yearEntries[entryId];
        const yearMonths = this.evidDb[yearId].months;
        Object.entries(yearMonths).forEach(([, month]) => delete month[entryId]);
        this.modified = true;
    }

    public getYearSums(yearId: number): EntrySum[] {
        const yearEntries = this.evidDb[yearId].entries;
        return Object.entries(yearEntries)
            .map(([entryId, entry]) => {
                return {
                    entryId: Number(entryId),
                    entry,
                    sum: entrySum(this.evidDb[yearId].months, Number(entryId))
                };
            });
    }

    public getMonthEntries(yearId: number, monthId: MonthId): MonthEntries {
        return this.evidDb[yearId].months[monthId];
    }

    public incrementMonthEntry(yearId: number, monthId: MonthId, entryId: number, value: number): void {
        const monthEntries = this.evidDb[yearId].months[monthId];
        if (monthEntries[entryId]) {
            monthEntries[entryId] += value;
        } else {
            monthEntries[entryId] = value;
        }
        this.modified = true;
    }

    public setMonthEntry(yearId: number, monthId: MonthId, entryId: number, value: number): void {
        this.evidDb[yearId].months[monthId][entryId] = value;
        this.modified = true;
    }

    private monthEntriesToSums(yearId: number, monthEntries: MonthEntries): EntrySum[] {
        return Object.entries(monthEntries)
            .map(([entryIdStr, value]) => {
                const entryId = Number(entryIdStr);
                return {
                    entryId,
                    entry: this.evidDb[yearId].entries[entryId],
                    sum: value
                };
            })
            .sort((a, b) => {
                if (a.entry.type == b.entry.type) {
                    return a.entry.order - b.entry.order;
                } else {
                    if (a.entry.type == "expense") {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });
    }

    private entriesSum(sums: EntrySum[], entryType: EntryType): number {
        return sums
            .filter((row) => row.entry.type == entryType)
            .map((row) => row.sum)
            .reduce((totalSum, a) => totalSum + a, 0);
    }

    public getMonthsSums(yearId: number): MonthSums[] {
        return Object.entries(this.evidDb[yearId].months)
            .map(([monthId, monthEntries]) => {
                const monthSums = this.monthEntriesToSums(yearId, monthEntries);
                const totalIncome = this.entriesSum(monthSums, "income");
                const totalExpense = this.entriesSum(monthSums, "expense");

                return {
                    monthId: monthId as MonthId,
                    sums: monthSums,
                    totalIncome,
                    totalExpense
                };
            })
            .sort((a, b) => monthToOrder(a.monthId) - monthToOrder(b.monthId));
    }
}

const _fakeDb: EvidDb = {
    1977: {
        entries: {
            1: {
                name: "Výplata",
                type: "income",
                order: 1
            },
            2: {
                name: "Kreditka",
                type: "expense",
                order: 2
            },
            3: {
                name: "Výnosy",
                type: "income",
                order: 3
            },
            5: {
                name: "Potraviny",
                type: "expense",
                order: 5
            }
        },
        months: {
            jan: {
                1: 1500,
                2: 1200,
            },
            feb: {
                1: 1500,
                3: 800,
                2: 1200,
                5: 1200
            },
            mar: {},
            apr: {},
            may: {},
            jun: {},
            jul: {},
            aug: {},
            sep: {},
            oct: {},
            nov: {},
            dec: {}
        }
    }
}

export function createFakeDb(): CurrentDatabase {
    return new CurrentDatabase(_fakeDb);
}

export async function openDb(filePath: string, password: string): Promise<CurrentDatabase> {
    const db = new EviDb<EvidDb>(new JSONFile(filePath, new CryptoEncoder(password)));
    await db.read();
    return new CurrentDatabase(db.data, {filePath, password});
}