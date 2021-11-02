/* eslint-disable no-case-declarations */
import { cloneDeep } from "lodash-es";
import * as React from 'react';
import { useState } from 'react';
import { TreeNodeInfo, Tree, Button } from "@blueprintjs/core";
import { EvidDb, EvidYear, MonthEntries, MonthId, orderToMonth, monthLabel } from "../model";


//type NodePath = number[];

type NodeData = {
    yearId: number;
    year: EvidYear;
    monthId?: MonthId;
    month?: MonthEntries;
}

function createMonthTreeNodes(year: number, evidYear: EvidYear, treeState: TreeState): TreeNodeInfo<NodeData>[] {
    return Array(12).fill(0).map((_, idx) => {
        const nodeId = year * 100 + (idx + 1);
        const monthId = orderToMonth(idx + 1);
        const nodeState = treeState[nodeId];
        const node: TreeNodeInfo<NodeData> = {
            id: nodeId,
            label: monthLabel(monthId),
            nodeData: { yearId: year, year: evidYear, monthId: monthId, month: evidYear.months[monthId]},
            isExpanded: nodeState?.isExpanded,
            isSelected: nodeState?.isSelected
            //icon: "moon"
        };
        return node;
    });
}

function dbToTreeNodes(db: EvidDb, treeState: TreeState): TreeNodeInfo<NodeData>[] {
    if (db == null) {
        return [{
            id: -1,
            label: "Loading...",
            icon: "time"
        }];
    }

    const nodes: TreeNodeInfo<NodeData>[] = Object.entries(db)
        .sort(([yearStr1], [yearStr2]) => Number(yearStr1) - Number(yearStr2))
        .map(([yearStr, evidYear]) => {
            const year = Number(yearStr);
            const nodeState = treeState[year];
            const yearNode: TreeNodeInfo<NodeData> = {
                id: year,
                label: yearStr,
                nodeData: { yearId: year, year: evidYear},
                icon: "calendar",
                childNodes: createMonthTreeNodes(year, evidYear, treeState),
                isExpanded: nodeState?.isExpanded,
                isSelected: nodeState?.isSelected
            };
            return yearNode;
        });

    return nodes;
}

interface TreeNodeState {
    isExpanded?: boolean,
    isSelected?: boolean
}

type TreeState = Record<number, TreeNodeState>;

function changeTreeState(oldTreeState: TreeState, nodeId: number, nodeChange: (nodeState: TreeNodeState) => void, allNodesChanges?: (nodeState: TreeNodeState) => void) {
    const newTreeState = cloneDeep(oldTreeState);
    if (!newTreeState[nodeId]) {
        newTreeState[nodeId] = {};    
    }
    if (allNodesChanges) {
        Object.entries(newTreeState).forEach(([, nodeState]) => allNodesChanges(nodeState));
    }
    nodeChange(newTreeState[nodeId]);
    return newTreeState;
}

export function AddYearButton(): React.ReactElement {
    return (
        <Button className="bp3-minimal" icon="add" onClick={() => window.evidAPI.invoke.showOpenFile("k").then((f) => console.log("opened: " + f))}/>
    );
}

export interface IExplorerProps {
    db: EvidDb,
    onYearSelected?: (year: EvidYear, yearId: number) => void,
    onMonthSelected?: (month: MonthEntries, year: EvidYear, monthId: MonthId, yearId: number) => void
}

export function Explorer(props: IExplorerProps): React.ReactElement {
    const [treeState, setTreeState] = useState({} as TreeState);

    const handleNodeClick = (node: TreeNodeInfo<NodeData>) => {
            setTreeState(changeTreeState(treeState, node.id as number, (node) => node.isSelected = true, (node) => node.isSelected = false));
            if (!node.nodeData?.month && node.nodeData?.year) {
                if (props.onYearSelected) {
                    props.onYearSelected(node.nodeData.year, node.nodeData.yearId);
                }
            } else if (node.nodeData.year && node.nodeData.month) {
                if (props.onMonthSelected) {
                    props.onMonthSelected(node.nodeData.month, node.nodeData.year, node.nodeData.monthId, node.nodeData.yearId);
                }
            }
        };

    const handleNodeCollapse = (node: TreeNodeInfo) => {
        setTreeState(changeTreeState(treeState, node.id as number, (node) => node.isExpanded = false));
    };

    const handleNodeExpand = (node: TreeNodeInfo) => {
        setTreeState(changeTreeState(treeState, node.id as number, (node) => node.isExpanded = true));
    };

    return (
        <Tree<NodeData>
            contents={dbToTreeNodes(props.db, treeState)}
            onNodeCollapse={handleNodeCollapse}
            onNodeExpand={handleNodeExpand}
            onNodeClick={handleNodeClick}
        />
    )
}