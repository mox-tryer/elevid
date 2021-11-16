import * as React from 'react';
import { Button, ButtonGroup, Classes, ControlGroup, Dialog, Divider, FormGroup, H3, Icon, NumericInput, Tab, Tabs } from '@blueprintjs/core';
import { Cell, Column, SelectionModes, Table2 } from "@blueprintjs/table";
import { Entry, EntryType, MonthEntries, MonthId, YearEntries } from '../../model';
import { Tooltip2 } from '@blueprintjs/popover2';

interface MonthReportProps {
    yearEntries: YearEntries;
    monthEntries: MonthEntries;
    onPrint: () => void;
}

function MonthReport(props: MonthReportProps) {
    type ReportRow = {
        entry: Entry;
        total: boolean;
        sum: number;
    };

    const rows = (!props.yearEntries || !props.monthEntries) ? [] : Object.entries(props.yearEntries)
        .map(([entryIdStr, entry]) => {
            const entryId = Number(entryIdStr);
            return { entry, total: false, sum: props.monthEntries[entryId] || 0} as ReportRow;
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
    function entriesSum(entryType: EntryType) {
        return rows
            .filter((row) => row.entry.type == entryType)
            .map((row) => row.sum)
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
                    <Button icon="print" onClick={() => props.onPrint()} />
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

interface EntryEditDialogProps {
    isOpen: boolean;
    entryName: string;
    entrySum: number;
    onClose: () => void;
    onValueAdded: (value: number) => void;
    onValueSet: (value: number) => void;
}

function EntryEditDialog(props: EntryEditDialogProps) {
    const [valueForAdd, setValueForAdd] = React.useState(undefined as number | undefined);
    const [valueForSet, setValueForSet] = React.useState(props.entrySum);
    const [entryValue, setEntryValue] = React.useState(props.entrySum);
    React.useEffect(() => {
        setEntryValue(props.entrySum);
    }, [props.entrySum]);

    const addToEntryValue = (value: number) => {
        setEntryValue(entryValue + value);
        props.onValueAdded(value);
    };

    const setToEntryValue = (value: number) => {
        setEntryValue(value);
        props.onValueSet(value);
    };

    /*const onAddEntryInputValueChange = (valueAsNumber: number, valueAsString: string, inputElement: HTMLInputElement | null) => {
        setValueForAdd(valueAsNumber);
        inputElement.setSelectionRange(0, valueAsString.length);
    };*/

    const valueForAddRef = React.createRef<HTMLInputElement>();

    return (
        <Dialog isOpen={props.isOpen}
                    title="Úprava položky"
                    className={Classes.DARK}
                    onClose={props.onClose}
                    onOpened={() => {
                        document.getElementById("addEntryInput").focus();
                    }}
            >
                <div className={Classes.DIALOG_BODY}>
                    <H3>{props.entryName}: {entryValue?.toFixed(2)}</H3>
                    <br />
                    <form onSubmit={(e) => {
                            e.preventDefault();
                            addToEntryValue(valueForAdd);
                            valueForAddRef.current.setSelectionRange(0, valueForAddRef.current.value.length);
                        }}
                    >
                        <FormGroup intent="primary" label="Pridať" labelFor="addEntryInput" helperText="Pridávanie sumy k existujúcej sume na položke">
                            <ControlGroup>
                                <NumericInput id="addEntryInput" inputRef={valueForAddRef} buttonPosition="none" leftIcon="euro" placeholder="Suma..."
                                        onValueChange={setValueForAdd}
                                />
                                <Button icon="add" type="submit" />
                            </ControlGroup>
                        </FormGroup>
                    </form>
                    <Divider />
                    <form onSubmit={(e) => {
                            e.preventDefault();
                            setToEntryValue(valueForSet);
                        }}
                    >
                    <FormGroup label="Nastaviť" labelFor="setEntryInput" helperText="Nastavenie sumy na položke">
                        <ControlGroup>
                            <NumericInput id="setEntryInput" buttonPosition="none" leftIcon="euro" placeholder="Suma..."
                                    defaultValue={props.entrySum} onValueChange={setValueForSet}
                            />
                            <Button icon="equals" type="submit" />
                        </ControlGroup>
                    </FormGroup>
                    </form>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={props.onClose}>Zatvoriť</Button>
                    </div>
                </div>
            </Dialog>
    );
}

interface EntryTableProps {
    yearId: number;
    monthId: MonthId;
    yearEntries: YearEntries;
    monthEntries: MonthEntries;
    onValueAdded: (yearId: number, monthId: MonthId, entryId: number, value: number) => void;
    onValueSet: (yearId: number, monthId: MonthId, entryId: number, value: number) => void;
}

function EntryTable(props: EntryTableProps) {
    type ReportRow = {
        entryId: number;
        entry: Entry;
        sum: number;
    };

    const rows = (!props.yearEntries || !props.monthEntries) ? [] : Object.entries(props.yearEntries)
        .map(([entryIdStr, entry]) => {
            const entryId = Number(entryIdStr);
            return { entryId, entry, sum: props.monthEntries[entryId] || 0} as ReportRow;
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

    const [columnWidths, setColumnWidths] = React.useState([60, undefined, undefined, 40]);
    const setColumnWidth = (index: number, size: number) => {
        const newWidths = [...columnWidths];
        newWidths[index] = size;
        setColumnWidths(newWidths);
    };

    class DialogStatus {
        constructor(public openYearId: number = null,
                    public openMonthId: MonthId = null,
                    public entryId: number = null,
                    public entryName: string = null,
                    public entrySum: number = null,
                    private open: boolean = false) {
        }

        isOpen() {
            // urobit dialog tak aby zmizol ak sa zmeni yearId alebo monthId
            return this.open && (this.openYearId == props.yearId) && (this.openMonthId == props.monthId);
        }

        setOpen(open: boolean) {
            this.open = open;
        }
    }

    const [dialogStatus, setDialogStatus] = React.useState(new DialogStatus());

    return (
        <>
            <EntryEditDialog
                isOpen={dialogStatus.isOpen()}
                entryName={dialogStatus.entryName}
                entrySum={dialogStatus.entrySum}
                onClose={() => setDialogStatus(new DialogStatus())}
                onValueAdded={(value) => props.onValueAdded(dialogStatus.openYearId, dialogStatus.openMonthId, dialogStatus.entryId, value)}
                onValueSet={(value) => props.onValueSet(dialogStatus.openYearId, dialogStatus.openMonthId, dialogStatus.entryId, value)}
            />
            <Table2
                    numRows={rows.length}
                    columnWidths={columnWidths}
                    defaultRowHeight={26}
                    enableRowHeader={true}
                    enableMultipleSelection={false}
                    selectionModes={SelectionModes.ROWS_AND_CELLS}
                    enableRowResizing={true}
                    onColumnWidthChanged={setColumnWidth}>
                <Column name="" cellRenderer={(rowId) => <Cell><Icon icon="euro"/><Icon icon={rows[rowId].entry.type == "income" ? "small-plus" : "small-minus"} /></Cell>} />
                <Column name="Názov" cellRenderer={(rowId) => <Cell>{rows[rowId].entry.name}</Cell>} />
                <Column name="Suma" cellRenderer={(rowId) => <Cell style={{textAlign: 'right'}}>{rows[rowId].sum.toFixed(2)}</Cell>} />
                <Column name="" cellRenderer={(rowId) => 
                            <Cell interactive={true}>
                                <Button icon="edit"
                                        small={true} 
                                        minimal={true} 
                                        onClick={() => setDialogStatus(new DialogStatus(props.yearId, props.monthId, rows[rowId].entryId, rows[rowId].entry.name, rows[rowId].sum, true))}
                                />
                            </Cell>}
                />
            </Table2>
        </>
    );
}

export interface IMonthEditorProps {
    yearId: number;
    monthId: MonthId;
    yearEntries: YearEntries;
    monthEntries: MonthEntries;
    onValueAdded: (yearId: number, monthId: MonthId, entryId: number, value: number) => void;
    onValueSet: (yearId: number, monthId: MonthId, entryId: number, value: number) => void;
    onPrint: (yearId: number, monthId: MonthId) => void;
}

export function MonthEditor(props: IMonthEditorProps): React.ReactElement {
    return (
        <Tabs id="monthEditor" renderActiveTabPanelOnly={true}>
            <Tab id="sumsEditor"
                title="Položky"
                panel={
                    <EntryTable
                        yearId={props.yearId}
                        monthId={props.monthId}
                        yearEntries={props.yearEntries}
                        monthEntries={props.monthEntries}
                        onValueAdded={props.onValueAdded}
                        onValueSet={props.onValueSet}
                    />
                }
            />
            <Tab id="sumsReport"
                title="Mesačný výpis"
                panel={
                    <MonthReport
                        key="monthSumsReport"
                        yearEntries={props.yearEntries}
                        monthEntries={props.monthEntries}
                        onPrint={() => props.onPrint(props.yearId, props.monthId)}
                    />
                }
            />
        </Tabs>
    );
}