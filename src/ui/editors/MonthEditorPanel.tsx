import * as React from 'react';
import { MonthEntries, MonthId, YearEntries } from '../../model';
import { MonthEditor } from './MonthEditor';

export type IMonthEditorPanelProps = {
    dbPath: string;
    yearId: number | undefined;
    monthId: MonthId | undefined;
    onChange: () => void;
};

export function MonthEditorPanel(props: IMonthEditorPanelProps): React.ReactElement {
    const [yearEntries, setYearEntries] = React.useState(null as YearEntries);
    const retrieveYearEntries = async (yearId: number) => {
      const yearEntries = await window.evidAPI.invoke.getYearEntries(yearId);
      setYearEntries(yearEntries);
    };
    React.useEffect(() => {
      retrieveYearEntries(props.yearId);
    }, [props.yearId, props.dbPath]);

    const [monthEntries, setMonthEntries] = React.useState(null as MonthEntries);
    const retrieveMonthEntries = async (yearId: number, monthId: MonthId) => {
      const monthEntries = await window.evidAPI.invoke.getMonthEntries(yearId, monthId);
      setMonthEntries(monthEntries);
    };
    React.useEffect(() => {
        retrieveMonthEntries(props.yearId, props.monthId);
    }, [props.yearId, props.monthId, props.dbPath]);

    const valueAdder = async (yearId: number, monthId: MonthId, entryId: number, value: number) => {
        await window.evidAPI.invoke.incrementMonthEntry(yearId, monthId, entryId, value);
        props.onChange();
        retrieveMonthEntries(props.yearId, props.monthId);
    }

    const valueSetter = async (yearId: number, monthId: MonthId, entryId: number, value: number) => {
        await window.evidAPI.invoke.setMonthEntry(yearId, monthId, entryId, value);
        props.onChange();
        retrieveMonthEntries(props.yearId, props.monthId);
    }

    const printReport = async (yearId: number, monthId: MonthId) => {
        await window.evidAPI.invoke.printMonthReport(yearId, monthId);
    }
    
    return (
        <MonthEditor
            yearId={props.yearId}
            monthId={props.monthId}
            yearEntries={yearEntries}
            monthEntries={monthEntries}
            onValueAdded={valueAdder}
            onValueSet={valueSetter}
            onPrint={printReport}
        />
    );
}