import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { AddYearButton, Explorer, IExplorerProps, SaveDbButton } from './Explorer';
import { MonthId, monthLabel } from '../model';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import { Classes, Navbar } from '@blueprintjs/core';
import { MonthEditorPanel, YearEditorPanel } from './editors';

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
    innerPanel = <MonthEditorPanel yearId={selectedNode.yearId} monthId={selectedNode.monthId} onChange={props.onChange} />;
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