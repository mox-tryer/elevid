import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { AddYearButton, Explorer } from './Explorer';
import { EvidDb } from '../model';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

const mosaicToolbarControls = [<ExpandButton />];

interface AppPanelProps {
  path: MosaicBranch[]
}

interface ExplorerPanelProps extends AppPanelProps {
  db: EvidDb
}

function ExplorerPanel(props: ExplorerPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Years" toolbarControls={[<AddYearButton />]}>
      <Explorer db={props.db}/>
    </MosaicWindow>
  );
}

function EditorPanel(props: AppPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Editor" toolbarControls={mosaicToolbarControls}>
      <span>tu bude editor</span>
    </MosaicWindow>
  );
}

function OutputPanel(props: AppPanelProps) {
  return (
    <MosaicWindow<EvidWindowId> path={props.path} title="Spravy" toolbarControls={mosaicToolbarControls}>
      <span>tu budu nejaky vystupy alebo nieco podobne</span>
    </MosaicWindow>
  );
}

type EvidWindowId = "editor" | "explorer" | "output";

function tile(id: EvidWindowId, path: MosaicBranch[], db: EvidDb) {
  switch (id) {
    case "editor":
      return <EditorPanel path={path} />;
    case "explorer":
      return <ExplorerPanel path={path} db={db}/>;
    case "output":
      return <OutputPanel path={path} />;
  }
  return <div>??</div>;
}

function App() {
  const [db, setDb] = React.useState(null as EvidDb);
  React.useEffect(() => {
    async function retrieveCurrentDb() {
      const currentDb = await window.evidAPI.invoke.getCurrentDb();
      console.log("db fetched");
      console.log(currentDb);
      setDb(currentDb);
    }
    console.log("starting to fetch db");
    retrieveCurrentDb();
  }, []);

  return (
    <div className="container">
      <Mosaic<EvidWindowId>
        renderTile={(id, path) => tile(id, path, db)}
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