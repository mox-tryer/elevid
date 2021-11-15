import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { Explorer, IExplorerProps } from './Explorer';
import { MonthId, monthLabel } from '../model';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import { AnchorButton, Button,  Classes, Dialog, FormGroup, HTMLSelect, InputGroup, Intent, Navbar, NumericInput, Switch } from '@blueprintjs/core';
import { MonthEditorPanel, YearEditorPanel } from './editors';
import { Tooltip2 } from '@blueprintjs/popover2';
import { FileDialogResult } from './api';

const mosaicToolbarControls = React.Children.toArray([<ExpandButton />]);

interface AddYearButtonProps {
  onAddYear: () => void;
}

function AddYearButton(props: AddYearButtonProps): React.ReactElement {
  return (
      <Tooltip2 content={"Pridať nový rok"} openOnTargetFocus={false}>
          <Button className="bp3-minimal" icon="add" onClick={props.onAddYear}/>
      </Tooltip2>
  );
}

interface AddYearDialogProps {
  open: boolean;
  years: number[];
  onClose: () => void;
  onAddNewYear: (newYearId: number, copyYearId: number | null) => void;
}

function AddYearDialog(props: AddYearDialogProps) {
  const maxYearId = props.years?.reduce((prev, current) => Math.max(prev, current), 0);
  const currentYear = new Date().getFullYear();

  const [newYearId, setNewYearId] = React.useState(maxYearId ? (maxYearId + 1) : currentYear);
  React.useEffect(() => setNewYearId(maxYearId ? (maxYearId + 1) : currentYear), [maxYearId, currentYear]);

  const [copyYearId, setCopyYearId] = React.useState(maxYearId);
  React.useEffect(() => setCopyYearId(maxYearId), [maxYearId]);
  const [copyEntries, setCopyEntries] = React.useState(!!maxYearId);
  React.useEffect(() => setCopyEntries(!!maxYearId), [maxYearId]);

  const validData = newYearId && !props.years?.includes(newYearId);

  // ak su v db nejake roky, tak predvyplnit max(yearId) + 1, inak predvyplnit current year
  // ak su v db nejake roky, v copyYearId ich vyplnit, vybrat max(yearId) a vybrat zaskrnutie kopirovania
  // validny je vtedy, ak je v newYearId vyplnene cislo a to cislo nie je v zozname existujucich rokov
  return (
    <Dialog isOpen={props.open} onClose={props.onClose} className={Classes.DARK} title="Pridať Nový Rok">
      <form onSubmit={(e) => {
                    e.preventDefault();
                    if (validData) {
                       props.onAddNewYear(newYearId, copyEntries ? copyYearId : null);
                    }
                }}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Nový rok" labelFor="newYearId" inline={true} >
            <NumericInput
                  id="newYearId"
                  buttonPosition="right"
                  intent="primary"
                  minorStepSize={null}
                  value={newYearId}
                  onValueChange={setNewYearId}
            />
          </FormGroup>
          <FormGroup label={
                        <Switch
                            checked={copyEntries}
                            label="Kopírovať položky z roku"
                            onChange={(event) => setCopyEntries((event.target as HTMLInputElement).checked)}
                        />
                      }
                      labelFor="copyYearId" inline={true}
          >
              <HTMLSelect id="copyYearId" options={props.years?.sort((a, b) => a - b)} value={copyYearId} onChange={(event) => setCopyYearId(Number(event.target.value))} />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button type="submit" disabled={!validData} intent="primary" >Pridať</Button>
            <Button onClick={props.onClose} >Zatvoriť</Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

interface AppPanelProps {
  path: MosaicBranch[]
}

interface ExplorerPanelProps extends AppPanelProps, IExplorerProps {
  dbModified: boolean;
  onAddNewYear: (newYearId: number, copyYearId: number | null) => Promise<void>;
}

function ExplorerPanel(props: ExplorerPanelProps) {
  const [addYearDialogOpen, setAddYearDialogOpen] = React.useState(false);

  const addNewYear = async (newYearId: number, copyYearId: number | null) => {
    await props.onAddNewYear(newYearId, copyYearId);
    setAddYearDialogOpen(false);
  };

  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Roky" toolbarControls={React.Children.toArray([
              <AddYearButton onAddYear={() => setAddYearDialogOpen(true)} />
            ])}>
      <AddYearDialog open={addYearDialogOpen} years={props.dbYears} onClose={() => setAddYearDialogOpen(false)} onAddNewYear={addNewYear}/>
      <Explorer dbYears={props.dbYears} onYearSelected={props.onYearSelected} onMonthSelected={props.onMonthSelected}/>
    </MosaicWindow>
  );
}


type SelectedNodeData = {
  yearId?: number;
  monthId?: MonthId;
}

interface EditorPanelProps extends AppPanelProps {
  selectedNode: SelectedNodeData;
  dbPath: string;
  onChange: () => void;
}

function EditorPanel(props: EditorPanelProps) {
  const selectedNode = props.selectedNode;
  let innerPanel;
  let title;

  if (selectedNode?.monthId) {
    innerPanel = <MonthEditorPanel yearId={selectedNode.yearId} monthId={selectedNode.monthId} dbPath={props.dbPath} onChange={props.onChange} />;
    title = `Editor: ${selectedNode.yearId}, ${monthLabel(selectedNode.monthId)}`;
  } else if (selectedNode?.yearId) {
    innerPanel = <YearEditorPanel yearId={selectedNode.yearId} onChange={props.onChange} />;
    title = `Editor: ${selectedNode.yearId}`;
  } else {
    innerPanel = <span></span>;
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

interface SaveDbButtonProps {
  dbModified: boolean;
  onSaveDb: () => void;
}

function SaveDbButton(props: SaveDbButtonProps): React.ReactElement {
  return (
      <Tooltip2 content={"Uložiť databázu"} openOnTargetFocus={false} >
          <AnchorButton
              disabled={!props.dbModified}
              className="bp3-minimal"
              icon="floppy-disk"
              onClick={props.onSaveDb}
          />
      </Tooltip2>
  );
}

interface OpenDbButtonProps {
  onOpenDb: () => void;
}

function OpenDbButton(props: OpenDbButtonProps): React.ReactElement {
  return (
      <Tooltip2 content={"Otvoriť databázu"} openOnTargetFocus={false} >
          <AnchorButton
              className="bp3-minimal"
              icon="unarchive"
              onClick={props.onOpenDb}
          />
      </Tooltip2>
  );
}

interface OpenSaveDialogProps {
  type: "open" | "save";
  open: boolean;
  filePath: string;
  onClose: () => void;
  onSave: (path: string, password: string) => void;
  onOpen: (path: string, password: string) => void;
}

function OpenSaveDialog(props: OpenSaveDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const [filePath, setFilePath] = React.useState(props.filePath || "");
  React.useEffect(() => setFilePath(props.filePath || ""), [props.filePath]);

  const [password, setPassword] = React.useState("");
  React.useEffect(() => setPassword(""), [props.open]);

  const lockButton = (
    <Tooltip2 content={`${showPassword ? "Skryť" : "Zobraziť"} heslo`}>
        <Button
            icon={showPassword ? "unlock" : "lock"}
            intent={Intent.WARNING}
            minimal={true}
            onClick={() => setShowPassword(!showPassword)}
        />
    </Tooltip2>
  );

  const browseDb = async () => {
    let result: FileDialogResult;
    if (props.type == "open") {
      result = await window.evidAPI.invoke.showOpenDbDialog(filePath);
    } else {
      result = await window.evidAPI.invoke.showSaveDbDialog(filePath);
    }

    if (!result.canceled) {
      setFilePath(result.filePath);
    }
  };

  const browseButton = (
    <Tooltip2 content="Vybrať súbor">
        <Button
            icon="more"
            intent={Intent.PRIMARY}
            minimal={true}
            onClick={browseDb}
        />
    </Tooltip2>
  );

  const onOpenSave = () => {
    if (props.type == "open") {
      props.onOpen(filePath, password);
    } else {
      props.onSave(filePath, password);
    }
  }

  const validData = filePath && password;

  return (
    <Dialog isOpen={props.open} title="Heslo pre databázu" className={Classes.DARK} onClose={props.onClose} >
         <form onSubmit={(e) => {
                    e.preventDefault();
                    if (validData) {
                      onOpenSave();
                    }
                }}
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup label="Súbor" labelFor="dbPathInput" inline={true} >
              <InputGroup
                      id="dbPathInput" 
                      placeholder="Zadajte cestu k súboru..."
                      rightElement={browseButton}
                      type="text"
                      fill={true}
                      size={180}
                      value={filePath}
                      onChange={(event) => setFilePath(event.target.value)}
              />
            </FormGroup>
            <FormGroup label="Heslo" labelFor="dbPasswordInput" inline={true} >
              <InputGroup
                      id="dbPasswordInput" 
                      placeholder="Zadajte heslo..."
                      rightElement={lockButton}
                      type={showPassword ? "text" : "password"}
                      fill={true}
                      size={180}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
              />
            </FormGroup>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button type="submit" intent="primary" disabled={!validData}>{(props.type == "open" ? "Otvoriť" : "Uložiť")}</Button>
              <Button onClick={props.onClose} >Zrušiť</Button>
            </div>
          </div>
        </form>
      </Dialog>
  );
}


type EvidWindowId = "editor" | "explorer" | "output";

function App() {
  const [dbYears, setDbYears] = React.useState(null as number[]);
  const retrieveCurrentDbYears = async() => {
    const currentDbYears = await window.evidAPI.invoke.getYears();
    setDbYears(currentDbYears);
  };
  React.useEffect(() => { retrieveCurrentDbYears() }, []);

  const [dbModified, setDbModified] = React.useState(null as boolean);
  const retrieveDbModified = async() => {
    const isModified = await window.evidAPI.invoke.isDbModified();
    setDbModified(isModified);
  };
  React.useEffect(() => { retrieveDbModified() }, []);

  const saveDb = async () => {
    const hasFile = await window.evidAPI.invoke.isDbFileSet();
    if (hasFile) {
      await window.evidAPI.invoke.saveDb();
      await retrieveDbModified();
    } else {
      setDbDialogType("save");
      setShowDbDialog(true);
    }
  };

  const showOpenDbDialog = () => {
    setDbDialogType("open");
    setShowDbDialog(true);
  };

  const closeFileDialog = async () => {
    await retrieveDbModified();
    await retrieveDbFile();
    setLastDbFile(null);
    setShowDbDialog(false);
  };

  const openDb = async (filePath: string, password: string) => {
    await window.evidAPI.invoke.openDb(filePath, password);
    await retrieveCurrentDbYears();
    await closeFileDialog();
    setSelectedNode(null);
  };

  const saveDbAs = async (filePath: string, password: string) => {
    await window.evidAPI.invoke.saveDbAs(filePath, password);
    await closeFileDialog();
  };

  const [showDbDialog, setShowDbDialog] = React.useState(false);
  const [dbDialogType, setDbDialogType] = React.useState("open" as "open" | "save");
  const [dbFile, setDbFile] = React.useState(null as string);
  const retrieveDbFile = async () => {
    const file = await window.evidAPI.invoke.getDbPath();
    setDbFile(file);
  }
  React.useEffect(() => {
    retrieveDbFile();
  }, []);

  const [lastDbFile, setLastDbFile] = React.useState(null as string);
  const retrieveLastDbFile = async () => {
    const lastFile = await window.evidAPI.invoke.getLastUsedDbPath();
    setLastDbFile(lastFile);
  };
  React.useEffect(() => {
    retrieveLastDbFile();
  }, []);

  if (!dbFile && lastDbFile && !showDbDialog) {
    setDbDialogType("open");
    setDbFile(lastDbFile);
    setShowDbDialog(true);
  }

  const addNewYear = async (newYearId: number, copyYearId: number | null) => {
    await window.evidAPI.invoke.addNewYear(newYearId);
    if (copyYearId) {
      await window.evidAPI.invoke.copyEntries(copyYearId, newYearId);
    }
    await retrieveCurrentDbYears();
    await retrieveDbModified();
  };

  const [selectedNode, setSelectedNode] = React.useState(null as SelectedNodeData);

  // TODO: pri zmene dbPath (cize otvoreni novej DB - ale radsej poriesit save novej DB nejak) sa musi resetnut selectedNode na null - inak sa moze stat, ze sa bude chciet citat neexistujuci rok v editor paneli

  const tile = (id: EvidWindowId, path: MosaicBranch[]) => {
    switch (id) {
      case "editor":
        return <EditorPanel path={path} selectedNode={selectedNode} dbPath={dbFile} onChange={() => retrieveDbModified()}/>;
      case "explorer":
        return (
          <ExplorerPanel
              path={path}
              dbYears={dbYears}
              onYearSelected={(yearId) => setSelectedNode({yearId})}
              onMonthSelected={(yearId, monthId) => setSelectedNode({monthId, yearId})}
              dbModified={dbModified}
              onAddNewYear={addNewYear}
              />
        );
      case "output":
        return <OutputPanel path={path} />;
    }
    return <div>??</div>;
  };

  return (
    <div className="container">
      <OpenSaveDialog
          type={dbDialogType}
          open={showDbDialog}
          filePath={dbFile}
          onClose={closeFileDialog}
          onOpen={openDb}
          onSave={saveDbAs}
      />
      <Navbar className={Classes.DARK}>
        <Navbar.Group align="left">
          <OpenDbButton onOpenDb={showOpenDbDialog} />
          <SaveDbButton dbModified={dbModified} onSaveDb={saveDb} />
        </Navbar.Group>
      </Navbar>
      <Mosaic<EvidWindowId>
        renderTile={(id, path) => tile(id, path)}
        initialValue={{
          direction: 'row',
          first: 'explorer',
          // second: {
          //   direction: 'column',
          //   first: 'editor',
          //   second: 'output',
          //   splitPercentage: 80
          // },
          second: 'editor',
          splitPercentage: 30,
        }}
        className="mosaic-blueprint-theme bp3-dark"
      />
    </div>
  );
}

const root = document.getElementById("root");
ReactDOM.render(<App />, root);