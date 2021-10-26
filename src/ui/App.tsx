import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mosaic, MosaicBranch, MosaicWindow, ExpandButton } from 'react-mosaic-component';
import { Explorer} from './Explorer';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

function App() {
  function tile(id: string, path: MosaicBranch[]) {
    if (id == "editor") {
      return (
        <MosaicWindow<string> path={path} title="Editor" toolbarControls={React.Children.toArray([<ExpandButton />])}>
            <span>okienko</span>
        </MosaicWindow>
        );
    } else if (id == "explorer") {
        return <Explorer/>;
    } else {
      return <div>{id}</div>;
    }
  }
  return (
    <div className="container">
      <Mosaic<string>
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