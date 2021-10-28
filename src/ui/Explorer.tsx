/* eslint-disable no-case-declarations */
import { cloneDeep } from "lodash-es";
import * as React from 'react';
import { useCallback, useReducer } from 'react';
import { TreeNodeInfo, Tree, Button } from "@blueprintjs/core";
import * as evidApi from "./api";


type NodePath = number[];

type TreeAction =
    | { type: "SET_IS_EXPANDED"; payload: { path: NodePath; isExpanded: boolean } }
    | { type: "DESELECT_ALL" }
    | { type: "SET_IS_SELECTED"; payload: { path: NodePath; isSelected: boolean } };

function forEachNode(nodes: TreeNodeInfo[] | undefined, callback: (node: TreeNodeInfo) => void) {
    if (nodes === undefined) {
        return;
    }

    for (const node of nodes) {
        callback(node);
        forEachNode(node.childNodes, callback);
    }
}

function forNodeAtPath(nodes: TreeNodeInfo[], path: NodePath, callback: (node: TreeNodeInfo) => void) {
    callback(Tree.nodeFromPath(path, nodes));
}

function treeReducer(state: TreeNodeInfo[], action: TreeAction) {
    switch (action.type) {
        case "DESELECT_ALL":
            const newState1 = cloneDeep(state);
            forEachNode(newState1, node => (node.isSelected = false));
            return newState1;
        case "SET_IS_EXPANDED":
            const newState2 = cloneDeep(state);
            forNodeAtPath(newState2, action.payload.path, node => (node.isExpanded = action.payload.isExpanded));
            return newState2;
        case "SET_IS_SELECTED":
            const newState3 = cloneDeep(state);
            forNodeAtPath(newState3, action.payload.path, node => (node.isSelected = action.payload.isSelected));
            return newState3;
        default:
            return state;
    }
}

const INITIAL_STATE: TreeNodeInfo[] = [
    {
        id: 2021,
        label: "2021",
        childNodes: [
            {
                id: 202101,
                label: "January"
            },
            {
                id: 202102,
                label: "February"
            }
        ]
    }
];

export function AddYearButton(): React.ReactElement {
    return (
        <Button className="bp3-minimal" icon="add" onClick={() => window.evidAPI.invoke.showOpenFile("k").then((f) => console.log("opened: " + f))}/>
    );
}

// export interface IExplorerProps {
//     path: MosaicBranch[]
// }

export function Explorer(/*props: IExplorerProps*/): React.ReactElement {
    const [nodes, dispatch] = useReducer(treeReducer, INITIAL_STATE);

    const handleNodeClick = useCallback(
        (node: TreeNodeInfo, nodePath: NodePath, e: React.MouseEvent<HTMLElement>) => {
            const originallySelected = node.isSelected;
            if (!e.shiftKey) {
                dispatch({ type: "DESELECT_ALL" });
            }
            dispatch({
                payload: { path: nodePath, isSelected: originallySelected == null ? true : !originallySelected },
                type: "SET_IS_SELECTED",
            });
        },
        [],
    );

    const handleNodeCollapse = useCallback((_node: TreeNodeInfo, nodePath: NodePath) => {
        dispatch({
            payload: { path: nodePath, isExpanded: false },
            type: "SET_IS_EXPANDED",
        });
    }, []);

    const handleNodeExpand = useCallback((_node: TreeNodeInfo, nodePath: NodePath) => {
        dispatch({
            payload: { path: nodePath, isExpanded: true },
            type: "SET_IS_EXPANDED",
        });
    }, []);

    return (
        <Tree
            contents={nodes}
            onNodeCollapse={handleNodeCollapse}
            onNodeExpand={handleNodeExpand}
            onNodeClick={handleNodeClick}
        />
    )
}