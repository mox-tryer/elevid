import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IEntrySum, IMonthSums } from '../ui/api';
import { Entry, EntryType, MonthEntries, MonthId, monthLabel, YearEntries } from '../model';
import classNames from 'classnames';



function compareEntries(entry1: Entry, entry2: Entry): number {
    if (entry1.type == entry2.type) {
        return entry1.order - entry2.order;
    } else {
        if (entry1.type == "expense") {
            return -1;
        } else {
            return 1;
        }
    }
}

interface PrintMonthReportProps {
    yearId: number;
    monthId: MonthId;
}

function PrintMonthReport(props: PrintMonthReportProps) {
    const [yearEntries, setYearEntries] = React.useState(null as YearEntries);
    const retrieveYearEntries = async (yearId: number) => {
      const yearEntries = await window.evidAPI.invoke.getYearEntries(yearId);
      setYearEntries(yearEntries);
    };
    React.useEffect(() => {
      retrieveYearEntries(props.yearId);
    }, [props.yearId]);

    const [monthEntries, setMonthEntries] = React.useState(null as MonthEntries);
    const retrieveMonthEntries = async (yearId: number, monthId: MonthId) => {
      const monthEntries = await window.evidAPI.invoke.getMonthEntries(yearId, monthId);
      setMonthEntries(monthEntries);
    };
    React.useEffect(() => {
        retrieveMonthEntries(props.yearId, props.monthId);
    }, [props.yearId, props.monthId]);

    type ReportRow = {
        entryId: number;
        entry: Entry;
        total: boolean;
        sum: number;
    };
    function entriesSum(rows: ReportRow[], entryType: EntryType) {
        return rows
            .filter((row) => row.entry.type == entryType)
            .map((row) => row.sum)
            .reduce((totalSum, a) => totalSum + a, 0);
    }

    if (yearEntries && monthEntries) {
        const rows = (!yearEntries || !monthEntries) ? [] : Object.entries(yearEntries)
            .map(([entryIdStr, entry]) => {
                const entryId = Number(entryIdStr);
                return { entryId, entry, total: false, sum: monthEntries[entryId] || 0} as ReportRow;
            })
            .sort((a, b) => compareEntries(a.entry, b.entry));
        const totalIncome = entriesSum(rows, "income");
        const totalExpense = entriesSum(rows, "expense");
        const totalSavings = totalIncome - totalExpense;

        const rowComponents = rows.map((row) => (
            <tr key={"entry" + row.entryId}>
                <td className="mreport_entry_name">{row.entry.name}</td>
                <td className="mreport_entry_value">{row.sum.toFixed(2)}</td>
            </tr>
        ));
        
        window.evidAPI.invoke.printReportWindow("month");

        return (
            <table className="mreport_table" cellPadding="0" cellSpacing="0">
                <tr key="header"><td colSpan={2} className="mreport_header"><b>{monthLabel(props.monthId)} {props.yearId}</b></td></tr>
                {rowComponents}
                <tr key="totalExpense"><td className="mreport_total_expense_name">V&yacute;davky</td><td className="mreport_total_expense_value">{totalExpense.toFixed(2)}</td></tr>
                <tr key="totalSavings"><td className="mreport_savings_name">&Uacute;spory</td><td className="mreport_savings_value">{totalSavings.toFixed(2)}</td></tr>
            </table>
        );
    } else {
        return <div>{props.yearId}, {props.monthId}</div>;
    }
}

interface PrintYearReportProps {
    yearId: number;
}

type YearReportMonthId = MonthId | null | "year";

function yearReportMonthLabel(monthId: YearReportMonthId) {
    if (monthId == null) {
        return "";
    } else if (monthId == "year") {
        return "Rok";
    } else {
        return monthLabel(monthId);
    }
}

function yearReportMonthHeaders(segmentId: number, monthIds: YearReportMonthId[]) {
    return monthIds.map((monthId, idx) => {
        const first = idx == 0;
        const last = idx == monthIds.length - 1;
        const prevId = first ? null : monthIds[idx - 1];
        const nextId = last ? null : monthIds[idx + 1];
        const classes = {
            "yreport_table_header": !!monthId,  // ak to nie je medzera
            "border_l2": !!monthId && !prevId,  // ak to nie je medzera a vlavo je medzera alebo zaciatok
            "border_l1": !!monthId && !!prevId, // ak to nie je medzera a vlavo je mesiac
            "border_r2": !!monthId && !nextId   // ak to nie je medzera a vpravo je medzera, alebo koniec
        };

        return <td key={"header" + segmentId + "/" + monthId} className={classNames(classes)}>{yearReportMonthLabel(monthId)}</td>;
    });
}

type MonthSumsById = {
    [month in MonthId]: IMonthSums;
}

function toMonthSumsById(monthSums: IMonthSums[]): MonthSumsById {
    const monthSumsById: MonthSumsById = {
        jan: undefined,
        feb: undefined,
        mar: undefined,
        apr: undefined,
        may: undefined,
        jun: undefined,
        jul: undefined,
        aug: undefined,
        sep: undefined,
        oct: undefined,
        nov: undefined,
        dec: undefined
    };
    monthSums.forEach(monthSums => monthSumsById[monthSums.monthId] = monthSums);

    return monthSumsById;
}

function yearReportMonthEntryValues(segmentId: number, entryId: number, monthIds: YearReportMonthId[], monthSumsById: MonthSumsById, yearSums: IEntrySum[]) {
    return monthIds.map((monthId, idx) => {
        let value: number | string;
        if (monthId) {
            if (monthId == "year") {
                value = (yearSums.filter(s => s.entryId == entryId)[0]?.sum || 0).toFixed(2);
            } else {
                value = (monthSumsById[monthId].sums.filter(s => s.entryId == entryId)[0]?.sum || 0).toFixed(2);
            }
        } else {
            value = "";
        }

        const first = idx == 0;
        const last = idx == monthIds.length - 1;
        const prevId = first ? null : monthIds[idx - 1];
        const nextId = last ? null : monthIds[idx + 1];
        const classes = {
            "yreport_entry_value": !!monthId,  // ak to nie je medzera
            "border_l2": !!monthId && !prevId,  // ak to nie je medzera a vlavo je medzera alebo zaciatok
            "border_l1": !!monthId && !!prevId, // ak to nie je medzera a vlavo je mesiac
            "border_r2": !!monthId && !nextId   // ak to nie je medzera a vpravo je medzera, alebo koniec
        };

        return <td key={"entry" + segmentId + "/" + entryId + "/" + monthId} className={classNames(classes)}>{value}</td>;
    });
}

type TotalType = "expenses" | "savings";

function yearReportMonthTotalValues(segmentId: number, totalType: TotalType, monthIds: YearReportMonthId[], monthSumsById: MonthSumsById, totalYearExpenses: number, totalYearSavings: number) {
    return monthIds.map((monthId, idx) => {
        let value: number | string;
        if (monthId) {
            if (monthId == "year") {
                value = ((totalType == "expenses" ? totalYearExpenses : totalYearSavings) || 0).toFixed(2);
            } else {
                value = ((totalType == "expenses" ? monthSumsById[monthId].totalExpense : (monthSumsById[monthId].totalIncome - monthSumsById[monthId].totalExpense)) || 0).toFixed(2);
            }
        } else {
            value = "";
        }

        const first = idx == 0;
        const last = idx == monthIds.length - 1;
        const prevId = first ? null : monthIds[idx - 1];
        const nextId = last ? null : monthIds[idx + 1];
        const classes = {
            "yreport_entry_value": !!monthId,  // ak to nie je medzera
            "border_l2": !!monthId && !prevId,  // ak to nie je medzera a vlavo je medzera alebo zaciatok
            "border_l1": !!monthId && !!prevId, // ak to nie je medzera a vlavo je mesiac
            "border_r2": !!monthId && !nextId,  // ak to nie je medzera a vpravo je medzera, alebo koniec
            "border_t1": !!monthId && (totalType == "expenses"),
            "border_b2": !!monthId && (totalType == "savings"),
        };

        return <td key={"entry" + segmentId + "/" + totalType + "/" + monthId} className={classNames(classes)}>{value}</td>;
    });
}


function entriesSum(sums: IEntrySum[], entryType: EntryType): number {
    return sums
        .filter((row) => row.entry.type == entryType)
        .map((row) => row.sum)
        .reduce((totalSum, a) => totalSum + a, 0);
}

function yearReportSegment(segmentId: number, yearEntries: YearEntries, monthSums: IMonthSums[], yearSums: IEntrySum[], monthIds: YearReportMonthId[]) {
    const rows: JSX.Element[] = [];

    const orderedEntryIds = Object.entries(yearEntries)
        .sort(([, entry1], [, entry2]) => compareEntries(entry1, entry2))
        .map(([entryId, ]) => Number(entryId));

    const monthSumsById: MonthSumsById = toMonthSumsById(monthSums);

    rows.push(<tr key={"header" + segmentId}><td className="yreport_table_header border_l2">Položka</td>{yearReportMonthHeaders(segmentId, monthIds)}</tr>);

    for (const entryId of orderedEntryIds) {
        const entry = yearEntries[entryId];

        rows.push(<tr key={"entry" + segmentId + "/" + entryId}>
                    <td className="yreport_entry_name">{entry.name}</td>
                    {yearReportMonthEntryValues(segmentId, entryId, monthIds, monthSumsById, yearSums)}
                </tr>);
    }

    const totalYearIncome = entriesSum(yearSums, "income");
    const totalYearExpense = entriesSum(yearSums, "expense");
    const totalYearSavings = totalYearIncome - totalYearExpense;
    const totalExpenseCells = yearReportMonthTotalValues(segmentId, "expenses", monthIds, monthSumsById, totalYearExpense, totalYearSavings);
    const totalSavingsCells = yearReportMonthTotalValues(segmentId, "savings", monthIds, monthSumsById, totalYearExpense, totalYearSavings);

    // celkove vydavky
    rows.push(<tr key={"entry" + segmentId + "/income"}><td className="yreport_entry_name border_t1">V&yacute;davky</td>{totalExpenseCells}</tr>);
    // celkove uspory
    rows.push(<tr key={"entry" + segmentId + "/income"}><td className="yreport_entry_name border_b2">&Uacute;spory</td>{totalSavingsCells}</tr>);

    return rows;
}

function PrintYearReport(props: PrintYearReportProps) {
    const [yearEntries, setYearEntries] = React.useState(null as YearEntries);
    const retrieveYearEntries = async (yearId: number) => {
      const yearEntries = await window.evidAPI.invoke.getYearEntries(yearId);
      setYearEntries(yearEntries);
    };
    React.useEffect(() => {
      retrieveYearEntries(props.yearId);
    }, [props.yearId]);

    const [yearSums, setYearSums] = React.useState(null as IEntrySum[]);
    const retrieveYearSums = async (yearId: number) => {
      const sums = await window.evidAPI.invoke.getYearSums(yearId);
      setYearSums(sums);
    }
    React.useEffect(() => {
      retrieveYearSums(props.yearId);
    }, [props.yearId]);

    const [monthsSums, setMonthsSums] = React.useState(null as IMonthSums[]);
    const retrieveMonthsSums = async (yearId: number) => {
      setMonthsSums(await window.evidAPI.invoke.getMonthsSums(yearId));
    };
    React.useEffect(() => {
      retrieveMonthsSums(props.yearId);
    }, [props.yearId]);

    if (yearEntries && yearSums && monthsSums) {
        window.evidAPI.invoke.printReportWindow("year");

        const months1: YearReportMonthId[] = ["jan", "feb", "mar", "apr", "may", "jun", "jul"];
        const months2: YearReportMonthId[] = ["aug", "sep", "oct", "nov", "dec", null, "year"];

        return (
            <div className="yreport_page">
                <h1 className="yreport_title">Rok {props.yearId}</h1>
                <table className="yreport_table" cellSpacing={0} cellPadding={0}>
                    {yearReportSegment(1, yearEntries, monthsSums, yearSums, months1)}
                    <tr key="seg_break">
                        <td colSpan={8} className="yreport_seg_break"></td>
                    </tr>
                    {yearReportSegment(2, yearEntries, monthsSums, yearSums, months2)}
                </table>
            </div>
        );
    } else {
        return <div>{props.yearId}</div>;
    }
}

function Print() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const reportType = urlSearchParams.get("type");
    const yearId = Number(urlSearchParams.get("yearId"));

    if (reportType == "month") {
        const monthId = urlSearchParams.get("monthId") as MonthId;
        return <PrintMonthReport yearId={yearId} monthId={monthId}/>;
    } else {
        return <PrintYearReport yearId={yearId} />;
    }
}

const root = document.getElementById("root");
ReactDOM.render(<Print />, root);
