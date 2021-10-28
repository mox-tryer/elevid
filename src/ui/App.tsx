import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { AddYearButton, Explorer} from './Explorer';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

const mosaicToolbarControls = [<ExpandButton/>];

type EvidWindowId = "editor" | "explorer" | "output";

function App() {
  function tile(id: EvidWindowId, path: MosaicBranch[]) {
    switch (id) {
      case "editor":
        return (
          <MosaicWindow<EvidWindowId> path={path} title="Editor" toolbarControls={mosaicToolbarControls}>
              <span>tu bude editor</span>
          </MosaicWindow>
          );
      case "explorer":
        return (
          <MosaicWindow<EvidWindowId> path={path} title="Roky" toolbarControls={[<AddYearButton/>]}>
            <Explorer/>
          </MosaicWindow>
        );
      case "output":
        return (
          <MosaicWindow<EvidWindowId> path={path} title="Spravy" toolbarControls={mosaicToolbarControls}>
            <span>tu budu nejaky vystupy alebo nieco podobne</span>
          </MosaicWindow>
        );
    }
    return <div>??</div>;
  }
  return (
    <div className="container">
      <Mosaic<EvidWindowId>
        renderTile={tile}
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