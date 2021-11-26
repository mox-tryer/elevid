import * as React from 'react';
import { EntryType, YearEntries } from '../../model';
import { Button, Callout, Classes, Dialog } from '@blueprintjs/core';
import { EvidTheme, IEntryOrder, IEntrySum } from '../api';
import { YearEditor } from './YearEditor';
import classNames from 'classnames';
import { themeClasses } from '../theme';

export type IYearEditorPanelProps = {
    yearId: number | undefined;
    currentTheme: EvidTheme;
    onChange: () => void;
  };
  
export function YearEditorPanel(props: IYearEditorPanelProps): React.ReactElement {
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
    
    const changeEntryName = async (yearId: number, entryId: number, entryName: string) => {
      await window.evidAPI.invoke.changeYearEntry(yearId, entryId, entryName);
      props.onChange();
      retrieveYearEntries(yearId);
      retrieveYearSums(yearId);
    };
  
    const entryAdder = async (yearId: number, entryType: EntryType) => {
      await window.evidAPI.invoke.newYearEntry(yearId, entryType);
      props.onChange();
      retrieveYearEntries(yearId);
      retrieveYearSums(yearId);
    }
  
    const entriesReorder = async (yearId: number, entriesOrder: IEntryOrder[]) => {
      await window.evidAPI.invoke.changeEntriesOrder(yearId, entriesOrder);
      props.onChange();
      retrieveYearEntries(yearId);
      retrieveYearSums(yearId);
    }
  
    type DeleteDialogState = {
      open: boolean,
      yearId: number,
      entryId: number,
      entryName: string,
      entrySum: number,
    };
    const closeDeleteConfirmDialogState: DeleteDialogState = {open: false, yearId: 0, entryId: -1, entryName: null, entrySum: 0};
    const [deleteConfirmDialogState, setDeleteConfirmDialogState] = React.useState(closeDeleteConfirmDialogState);
  
    const showDeleteConfirmDialog = async (yearId: number, entryId: number) => {
      if (yearId != props.yearId) {
        // nejaka chyba
        return;
      }
      const yearEntrySum = await window.evidAPI.invoke.getYearEntrySum(yearId, entryId);
  
      setDeleteConfirmDialogState({open: true, yearId: yearId, entryId: entryId, entryName: yearEntries[entryId].name, entrySum: yearEntrySum});
    }
  
    const deleteEntry = async (yearId: number, entryId: number) => {
      await window.evidAPI.invoke.deleteYearEntry(yearId, entryId);
      setDeleteConfirmDialogState(closeDeleteConfirmDialogState);
    };

    const printReport = async (yearId: number) => {
      await window.evidAPI.invoke.printYearReport(yearId);
  }
  
    if (yearEntries) {
      return (
        <>
          <Dialog
              isOpen={deleteConfirmDialogState.open}
              onClose={() => setDeleteConfirmDialogState(closeDeleteConfirmDialogState)}
              title="Potvrdenie vymazania"
              className={classNames(themeClasses(props.currentTheme))}
          >
            <div className={Classes.DIALOG_BODY}>
              <p>Naozaj kompletne vymazať položku {deleteConfirmDialogState.entryName} z roku {deleteConfirmDialogState.yearId}?</p>
              <Callout intent={(deleteConfirmDialogState.entrySum != 0) ? "warning" : "primary"}>
                Celková suma na položke je <strong>{deleteConfirmDialogState.entrySum}</strong>.
              </Callout>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={() => deleteEntry(deleteConfirmDialogState.yearId, deleteConfirmDialogState.entryId)}>OK</Button>
                <Button onClick={() => setDeleteConfirmDialogState(closeDeleteConfirmDialogState)}>Zrušiť</Button>
              </div>
            </div>
          </Dialog>
          <YearEditor 
              yearId={props.yearId}
              yearEntries={yearEntries}
              yearSums={yearSums}
              onEntryNameChange={changeEntryName}
              onNewEntry={entryAdder}
              onChangeEntriesOrder={entriesReorder}
              onEntryDelete={showDeleteConfirmDialog}
              onPrint={printReport}
          />
        </>
      );
    } else {
      return <Callout icon="refresh">Načítavam...</Callout>
    }
  }