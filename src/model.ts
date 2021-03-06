export type EntryType = "income" | "expense";

export type Entry = {
    name: string,
    type: EntryType,
    order: number
}

export type YearEntries = {
    [id: number]: Entry
}

export type MonthEntries = {
    [entryId: number]: number
}

export type MonthId = "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";

export type YearMonths = {
    [month in MonthId]: MonthEntries;
}

export type EvidYear = {
    entries: YearEntries,
    months: YearMonths
}

export type EvidDb = {
    [year: number]: EvidYear
}



const monthIds: Array<MonthId> = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function orderToMonth(order: number): MonthId {
    return monthIds[order - 1];
}

export function monthToOrder(month: MonthId): number {
    switch (month) {
        case "jan": return 1;
        case "feb": return 2;
        case "mar": return 3;
        case "apr": return 4;
        case "may": return 5;
        case "jun": return 6;
        case "jul": return 7;
        case "aug": return 8;
        case "sep": return 9;
        case "oct": return 10;
        case "nov": return 11;
        case "dec": return 12;
    }
}

const monthLabels = [
    "Január",
    "Február",
    "Marec",
    "Apríl",
    "Máj",
    "Jún",
    "Júl",
    "August",
    "September",
    "Október",
    "November",
    "December"
  ];

export function monthLabel(monthId: MonthId | number): string {
    if (typeof monthId !== "number") {
        monthId = monthToOrder(monthId);
    }

    return monthLabels[monthId - 1];
}