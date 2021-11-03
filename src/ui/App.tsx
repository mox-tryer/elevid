import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { AddYearButton, Explorer, IExplorerProps, SaveDbButton } from './Explorer';
import { EntryType, MonthId, monthLabel, YearEntries } from '../model';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import { YearEditor } from './YearEditor';
import { IEntryOrder } from './api';
import { Button, Callout, Classes, Dialog, Navbar } from '@blueprintjs/core';

const mosaicToolbarControls = React.Children.toArray([<ExpandButton />]);

interface AppPanelProps {
  path: MosaicBranch[]
}

interface ExplorerPanelProps extends AppPanelProps, IExplorerProps {
  dbModified: boolean
}

function ExplorerPanel(props: ExplorerPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Roky" toolbarControls={React.Children.toArray([
              <AddYearButton />
            ])}>
      <Explorer dbYears={props.dbYears} onYearSelected={props.onYearSelected} onMonthSelected={props.onMonthSelected}/>
    </MosaicWindow>
  );
}

type YearEditorPanelProps = {
  yearId: number | undefined;
  onChange: () => void;
};

function YearEditorPanel(props: YearEditorPanelProps) {
  const [yearEntries, setYearEntries] = React.useState(null as YearEntries);
  const retrieveYearEntries = async (yearId: number) => {
    const yearEntries = await window.evidAPI.invoke.getCurrentDbYearEntries(yearId);
    setYearEntries(yearEntries);
  };
  React.useEffect(() => {
    retrieveYearEntries(props.yearId);
  }, [props.yearId]);
  
  const changeEntryName = async (yearId: number, entryId: number, entryName: string) => {
    await window.evidAPI.invoke.changeYearEntry(yearId, entryId, entryName);
    props.onChange();
    retrieveYearEntries(yearId);
  };

  const entryAdder = async (yearId: number, entryType: EntryType) => {
    await window.evidAPI.invoke.newYearEntry(yearId, entryType);
    props.onChange();
    retrieveYearEntries(yearId);
  }

  const entriesReorder = async (yearId: number, entriesOrder: IEntryOrder[]) => {
    await window.evidAPI.invoke.changeEntriesOrder(yearId, entriesOrder);
    props.onChange();
    retrieveYearEntries(yearId);
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

  if (yearEntries) {
    return (
      <>
        <Dialog
            isOpen={deleteConfirmDialogState.open}
            onClose={() => setDeleteConfirmDialogState(closeDeleteConfirmDialogState)}
            title="Potvrdenie vymazania"
            className={Classes.DARK}
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
            onEntryNameChange={changeEntryName}
            onNewEntry={entryAdder}
            onChangeEntriesOrder={entriesReorder}
            onEntryDelete={showDeleteConfirmDialog}
        />
      </>
    );
  } else {
    return <Callout icon="refresh">Načítavam...</Callout>
  }
}

type SelectedNodeData = {
  yearId?: number;
  monthId?: MonthId;
}

interface EditorPanelProps extends AppPanelProps {
  selectedNode: SelectedNodeData;
  onChange: () => void;
}

function EditorPanel(props: EditorPanelProps) {
  const selectedNode = props.selectedNode;
  let innerPanel;
  let title;

  if (selectedNode?.monthId) {
    innerPanel = <span>year: {selectedNode.yearId}, month: {selectedNode.monthId}</span>;
    title = `Editor: ${selectedNode.yearId}, ${monthLabel(selectedNode.monthId)}`;
  } else if (selectedNode?.yearId) {
    innerPanel = <YearEditorPanel yearId={selectedNode.yearId} onChange={props.onChange} />;
    title = `Editor: ${selectedNode.yearId}`;
  } else {
    innerPanel = <span>Select item...</span>;
    title = "Editor";
  }

  return (
    <MosaicWindow<EvidWindowId> path={props.path} title={title} toolbarControls={mosaicToolbarControls}>
      {innerPanel}
    </MosaicWindow>
  );
}

function OutputPanel(props: AppPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Správy" toolbarControls={mosaicToolbarControls}>
      <span>tu budu nejake vystupy alebo nieco podobne</span>
    </MosaicWindow>
  );
}

type EvidWindowId = "editor" | "explorer" | "output";

function App() {
  const [dbYears, setDbYears] = React.useState(null as number[]);
  const retrieveCurrentDbYears = async() => {
    const currentDbYears = await window.evidAPI.invoke.getCurrentDbYears();
    setDbYears(currentDbYears);
  };
  React.useEffect(() => { retrieveCurrentDbYears() }, []);

  const [dbModified, setDbModified] = React.useState(null as boolean);
  const retrieveDbModified = async() => {
    const isModified = await window.evidAPI.invoke.isDbModified();
    setDbModified(isModified);
  };
  React.useEffect(() => { retrieveDbModified() }, []);

  const [selectedNode, setSelectedNode] = React.useState(null as SelectedNodeData);

  const tile = (id: EvidWindowId, path: MosaicBranch[]) => {
    switch (id) {
      case "editor":
        return <EditorPanel path={path} selectedNode={selectedNode} onChange={() => retrieveDbModified()}/>;
      case "explorer":
        return (
          <ExplorerPanel
              path={path}
              dbYears={dbYears}
              onYearSelected={(yearId) => setSelectedNode({yearId})}
              onMonthSelected={(yearId, monthId) => setSelectedNode({monthId, yearId})}
              dbModified={dbModified}
              />
        );
      case "output":
        return <OutputPanel path={path} />;
    }
    return <div>??</div>;
  };

  return (
    <div className="container">
      <Navbar className={Classes.DARK}>
        <Navbar.Group align="left">
          <SaveDbButton dbModified={dbModified}/>
        </Navbar.Group>
      </Navbar>
      <Mosaic<EvidWindowId>
        renderTile={(id, path) => tile(id, path)}
        initialValue={{
          direction: 'row',
          first: 'explorer',
          second: {
            direction: 'column',
            first: 'editor',
            second: 'output',
            splitPercentage: 80
          },
          splitPercentage: 30,
        }}
        className="mosaic-blueprint-theme bp3-dark"
      />
    </div>
  );
}

const root = document.getElementById("root");
ReactDOM.render(<App />, root);