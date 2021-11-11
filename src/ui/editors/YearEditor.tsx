import * as React from 'react';
import { Column, Cell, Table2, Utils, SelectionModes, EditableCell2, Region } from "@blueprintjs/table";
import { Entry, EntryType, YearEntries } from '../../model';
import { AnchorButton, Button, ButtonGroup, Tab, Tabs } from '@blueprintjs/core';
import { IEntrySum } from '../api';
import { Tooltip2 } from '@blueprintjs/popover2';

interface IEntryTableProps {
    yearEntries: YearEntries;
    entryType: EntryType;
    onEntryNameChange: (entryId: number, entryName: string) => void;
    onNewEntry: (entryType: EntryType) => void;
    onChangeEntriesOrder: (orders: {entryId: number, order: number}[]) => void;
    onEntryDelete: (entryId: number) => void;
}

function EntryTable(props: IEntryTableProps) {
    type EntryRow = {
        entryId: number;
        entry: Entry;
    }
    
    const entryRows = Object.entries(props.yearEntries || {})
        .filter(([, entry]) => entry.type == props.entryType)
        .map(([entryIdStr, entry]) => { return { entryId: Number(entryIdStr), entry: entry } as EntryRow; })
        .sort((a, b) => a.entry.order - b.entry.order);

    const handleRowsReordered = (oldIndex: number, newIndex: number, length: number) => {
        if (oldIndex === newIndex) {
            return;
        }

        const orders = entryRows.map((row) => { const e = {entryId: row.entryId, order: row.entry.order}; return e });
        Utils.reorderArray(orders, oldIndex, newIndex, length).forEach((entry, i) => entry.order = i + 1);
        props.onChangeEntriesOrder(orders);
    };

    const entryNameSetter = (rowIndex: number) => {
        const entryRow = entryRows[rowIndex];

        return (value: string) => {
            //entry.name = value;
            props.onEntryNameChange(entryRow.entryId, value);
        };
    };

    const [selection, setSelection] = React.useState([] as Region[]);

    const entryDeleter = () => {
        if (!selection || selection.length == 0) {
            return;
        }
        const [rowId] = selection[0].rows;
        const entryId = entryRows[rowId].entryId;
        props.onEntryDelete(entryId);
    };

    return (
        <div>
            <ButtonGroup fill={false}>
                <Tooltip2 content={"Pridať položku"}>
                    <Button icon="add" onClick={() => props.onNewEntry(props.entryType)} />
                </Tooltip2>
                <Tooltip2 content={"Odstrániť položku"}>
                    <AnchorButton icon="delete" disabled={selection.length == 0} onClick={entryDeleter} />
                </Tooltip2>
            </ButtonGroup>
            <Table2 numRows={entryRows.length}
                    enableRowHeader={true}
                    enableRowReordering={true}
                    enableMultipleSelection={false}
                    selectionModes={SelectionModes.ROWS_AND_CELLS}
                    enableRowResizing={false}
                    onRowsReordered={handleRowsReordered}
                    onSelection={(region) => setSelection(region)}>
                <Column name="Názov" cellRenderer={(rowId) => <EditableCell2 value={entryRows[rowId].entry.name} onConfirm={entryNameSetter(rowId)} />} />
                <Column name="Poradie" cellRenderer={(rowId) => <Cell>{entryRows[rowId].entry.order}</Cell>} />
            </Table2>
        </div>
    );
}

interface IYearReportProps {
    sums: IEntrySum[];
    onPrint: () => void;
}

function YearReport(props: IYearReportProps) {
    type ReportRow = {
        entry: Entry;
        total: boolean;
        sum: number;
    };

    const rows = (props.sums || [])
        .map((entrySum) => { return { ...entrySum, total: false} as ReportRow})
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
    function entriesSum(entryType: EntryType) {
        return props.sums
            .filter((entrySum) => entrySum.entry.type == entryType)
            .map((entrySum) => entrySum.sum)
            .reduce((totalSum, a) => totalSum + a, 0);
    }
    const totalIncome = entriesSum("income");
    const totalExpense = entriesSum("expense");
    const totalSavings = totalIncome - totalExpense;

    rows.push({entry: {name: "Výdavky", type: "expense", order: 1000}, total: true, sum: totalExpense});
    rows.push({entry: {name: "Úspory", type: "income", order: 2000}, total: true, sum: totalSavings});

    return (
        <div>
            <ButtonGroup fill={false}>
                <Tooltip2 content={"Vytlačiť"}>
                    <Button icon="print" onClick={props.onPrint}/>
                </Tooltip2>
            </ButtonGroup>
            <Table2 numRows={rows.length}
                    enableRowHeader={true}
                    enableMultipleSelection={false}
                    selectionModes={SelectionModes.ROWS_AND_CELLS}
                    enableRowResizing={false}>
                <Column name="Názov" cellRenderer={(rowId) => <Cell intent={rows[rowId].total ? "primary" : "none"}>{rows[rowId].entry.name}</Cell>} />
                <Column name="Suma" cellRenderer={(rowId) => <Cell style={{textAlign: 'right'}} intent={rows[rowId].total ? "primary" : "none"}>{rows[rowId].sum.toFixed(2)}</Cell>} />
            </Table2>
        </div>
    );
}

export interface IYearEditorProps {
    yearId: number;
    yearEntries: YearEntries;
    yearSums: IEntrySum[];
    onEntryNameChange: (yearId: number, entryId: number, entryName: string) => void;
    onNewEntry: (yearId: number, entryType: EntryType) => void;
    onChangeEntriesOrder: (yearId: number, orders: {entryId: number, order: number}[]) => void;
    onEntryDelete: (yearId: number, entryId: number) => void;
    onPrint: (yearId: number) => void;
}

export function YearEditor(props: IYearEditorProps): React.ReactElement {
    return (
        <Tabs id="yearEditor" renderActiveTabPanelOnly={true}>
            <Tab id="expenses"
                title="Položky: Výdavky"
                panel={<EntryTable
                            key="yearEditor-expenses-table"
                            yearEntries={props.yearEntries}
                            entryType={"expense"} 
                            onEntryNameChange={(entryId, entryName) => props.onEntryNameChange(props.yearId, entryId, entryName)}
                            onNewEntry={(entryType) => props.onNewEntry(props.yearId, entryType)}
                            onChangeEntriesOrder={(orders) => props.onChangeEntriesOrder(props.yearId, orders)}
                            onEntryDelete={(entryId) => props.onEntryDelete(props.yearId, entryId)}
                        />}
                />
            <Tab id="incomes"
                title="Položky: Príjmy"
                panel={<EntryTable
                            key="yearEditor-incomes-table"
                            yearEntries={props.yearEntries}
                            entryType={"income"} 
                            onEntryNameChange={(entryId, entryName) => props.onEntryNameChange(props.yearId, entryId, entryName)}
                            onNewEntry={(entryType) => props.onNewEntry(props.yearId, entryType)}
                            onChangeEntriesOrder={(orders) => props.onChangeEntriesOrder(props.yearId, orders)}
                            onEntryDelete={(entryId) => props.onEntryDelete(props.yearId, entryId)}
                        />}
                />
            <Tab id="report" title="Ročný výpis" panel={<YearReport key="yearEditor-report" sums={props.yearSums} onPrint={() => props.onPrint(props.yearId)} />} />
        </Tabs>
    );
}