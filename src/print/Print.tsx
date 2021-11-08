import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IEntrySum, IMonthSums } from '../ui/api';
import { Entry, EntryType, MonthEntries, MonthId, monthLabel, YearEntries } from '../model';

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
        const totalIncome = entriesSum(rows, "income");
        const totalExpense = entriesSum(rows, "expense");
        const totalSavings = totalIncome - totalExpense;

        const rowComponents = rows.map((row) => (
            <tr key={"entry" + row.entryId}>
                <td className="mreport_entry_name">{row.entry.name}</td>
                <td className="mreport_entry_value">{row.sum.toFixed(2)}</td>
            </tr>
        ));
        
        window.evidAPI.invoke.contentRendered();

        return (
            <table className="mreport_table" cellPadding="0" cellSpacing="0">
                <tr key="header"><td colSpan={2} className="mreport_header"><b>{props.yearId} {monthLabel(props.monthId)}</b></td></tr>
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

function PrintYearReport(props: PrintYearReportProps) {
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

    if (yearSums && monthsSums) {
        window.evidAPI.invoke.contentRendered();

        //todo("vyrobit report... nadpis... prva tabulka ma mesiace jan-jul, druha tabulka aug-dec a na konci este jedna, ktora vyzera byt oddelena, kde je cely rok");
        return <div>{props.yearId}</div>;
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
