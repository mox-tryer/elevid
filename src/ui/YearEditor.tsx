import * as React from 'react';
import { Column, Cell, Table2, Utils, SelectionModes, EditableCell2, Region } from "@blueprintjs/table";
import { EvidYear, Entry, EntryType, MonthId } from '../model';
import { AnchorButton, Button, ButtonGroup, Tab, Tabs } from '@blueprintjs/core';

type EntryRow = {
    entryId: number;
    entry: Entry;
}

interface IEntryTableProps {
    year: EvidYear;
    entryType: EntryType;
}

function EntryTable(props: IEntryTableProps) {
    const entries = Object.entries(props.year.entries)
        .filter(([, entry]) => entry.type == props.entryType)
        .map(([entryIdStr, entry]) => { return { entryId: Number(entryIdStr), entry: entry } as EntryRow; })
        .sort((a, b) => a.entry.order - b.entry.order);

    const [dataVersion, setDataVersion] = React.useState(0);

    const handleRowsReordered = (oldIndex: number, newIndex: number, length: number) => {
        if (oldIndex === newIndex) {
            return;
        }
        Utils.reorderArray(entries, oldIndex, newIndex, length).forEach((entry, i) => entry.entry.order = i + 1);
        setDataVersion(dataVersion + 1); // force rerender
    };

    const entryNameSetter = (rowIndex: number) => {
        const entry = entries[rowIndex].entry;

        return (value: string) => {
            entry.name = value;
        };
    };

    const entryAdder = () => {
        const newEntryId = 1 + Object.entries(props.year.entries)
            .map(([entryId]) => Number(entryId))
            .reduce((a, b) => Math.max(a, b), 0);
        const newEntry: Entry = {type: props.entryType, name: "New Entry", order: newEntryId};
        props.year.entries[newEntryId] = newEntry;
        setDataVersion(dataVersion + 1); // force rerender
    };

    const [selection, setSelection] = React.useState([] as Region[]);

    const entryDeleter = () => {
        if (!selection || selection.length == 0) {
            return;
        }
        const [rowId] = selection[0].rows;
        const entryId = entries[rowId].entryId;
        const entry = entries[rowId].entry;

        let monthId: MonthId;
        let totalSum = 0
        for (monthId in props.year.months) {
            const value = props.year.months[monthId][entryId];
            if (value) {
                totalSum += value;
            }
        }

        // vypytat potvrdenie, ci naozaj vymazat polozku ak je totalSum > 0 zobrazit velke upozornenie aj s prislusnou sumou
        // pozriet ako sa robia dialogy...
        //todo("dokoncit!");
        //window.evidAPI.invoke.dbgLogCurrentDb();
        todo("CELE PREROBIT: nemozem potiahnut celu DB a tu ju menit... vsetko musi ist cez API!");
        // App vlastne musi handlovat vsetky zmeny a riesit ich cez zavolanie zmeny v hlavnom procese a po skonceni zavolat reload
    };

    return (
        <div>
            <ButtonGroup fill={false}>
                <Button icon="add" onClick={entryAdder} />
                <AnchorButton icon="delete" disabled={selection.length == 0} onClick={entryDeleter} />
            </ButtonGroup>
            <Table2 numRows={entries.length}
                    enableRowHeader={true}
                    enableRowReordering={true}
                    enableMultipleSelection={false}
                    selectionModes={SelectionModes.ROWS_AND_CELLS}
                    enableRowResizing={false}
                    onRowsReordered={handleRowsReordered}
                    onSelection={(region) => setSelection(region)}>
                <Column name="Id" cellRenderer={(rowId) => <Cell>{entries[rowId].entryId}</Cell>} />
                <Column name="Name" cellRenderer={(rowId) => <EditableCell2 value={entries[rowId].entry.name} onConfirm={entryNameSetter(rowId)} />} />
                <Column name="Order" cellRenderer={(rowId) => <Cell>{entries[rowId].entry.order}</Cell>} />
            </Table2>
        </div>
    );
}

export interface IYearEditorProps {
    year: EvidYear
}

export function YearEditor(props: IYearEditorProps): React.ReactElement {
    return (
        <Tabs id="yearEditor" renderActiveTabPanelOnly={true}>
            <Tab id="expenses" title="Položky: Výdavky" panel={<EntryTable key="yearEditor-expenses-table" year={props.year} entryType={"expense"} />} />
            <Tab id="incomes" title="Položky: Príjmy" panel={<EntryTable key="yearEditor-incomes-table" year={props.year} entryType={"income"} />} />
            <Tab id="report" title="Ročný výpis" panel={<span>todo</span>} />
        </Tabs>
    );
}