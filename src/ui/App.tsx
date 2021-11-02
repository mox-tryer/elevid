import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { AddYearButton, Explorer } from './Explorer';
import { EvidDb, EvidYear, MonthEntries, MonthId, monthLabel } from '../model';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';
import { YearEditor } from './YearEditor';

const mosaicToolbarControls = React.Children.toArray([<ExpandButton />]);

interface AppPanelProps {
  path: MosaicBranch[]
}

interface ExplorerPanelProps extends AppPanelProps {
  db: EvidDb;
  onYearSelected?: (year: EvidYear, yearId: number) => void;
  onMonthSelected?: (month: MonthEntries, year: EvidYear, monthId: MonthId, yearId: number) => void;
}

function ExplorerPanel(props: ExplorerPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Roky" toolbarControls={React.Children.toArray([<AddYearButton />])}>
      <Explorer db={props.db} onYearSelected={props.onYearSelected} onMonthSelected={props.onMonthSelected}/>
    </MosaicWindow>
  );
}

type SelectedNodeData = {
  yearId?: number;
  year?: EvidYear;
  monthId?: MonthId;
  month?: MonthEntries;
}

interface EditorPanelProps extends AppPanelProps {
  selectedNode: SelectedNodeData
}

function EditorPanel(props: EditorPanelProps) {
  const selectedNode = props.selectedNode;
  let innerPanel;
  let title;

  if (selectedNode?.month) {
    innerPanel = <span>year: {selectedNode.yearId}, month: {selectedNode.monthId}</span>;
    title = `Editor: ${selectedNode.yearId}, ${monthLabel(selectedNode.monthId)}`;
  } else if (selectedNode?.year) {
    innerPanel = <YearEditor year={selectedNode.year} />;
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
      <span>tu budu nejaky vystupy alebo nieco podobne</span>
    </MosaicWindow>
  );
}

type EvidWindowId = "editor" | "explorer" | "output";

function App() {
  const [db, setDb] = React.useState(null as EvidDb);
  React.useEffect(() => {
    async function retrieveCurrentDb() {
      const currentDb = await window.evidAPI.invoke.getCurrentDb();
      setDb(currentDb);
    }
    retrieveCurrentDb();
  }, []);

  const [selectedNode, setSelectedNode] = React.useState(null as SelectedNodeData);

  const tile = (id: EvidWindowId, path: MosaicBranch[], db: EvidDb, selectedNode: SelectedNodeData) => {
    switch (id) {
      case "editor":
        return <EditorPanel path={path} selectedNode={selectedNode}/>;
      case "explorer":
        return <ExplorerPanel path={path} db={db} onYearSelected={(year, yearId) => setSelectedNode({year, yearId})} onMonthSelected={(month, year, monthId, yearId) => setSelectedNode({month, year, monthId, yearId})}/>;
      case "output":
        return <OutputPanel path={path} />;
    }
    return <div>??</div>;
  };

  return (
    <div className="container">
      <Mosaic<EvidWindowId>
        renderTile={(id, path) => tile(id, path, db, selectedNode)}
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