/* eslint-disable no-case-declarations */
import { cloneDeep } from "lodash-es";
import * as React from 'react';
import { useState } from 'react';
import { TreeNodeInfo, Tree } from "@blueprintjs/core";
import { MonthId, orderToMonth, monthLabel } from "../model";


type NodeData = {
    yearId: number;
    monthId?: MonthId;
}

function createMonthTreeNodes(yearId: number, treeState: TreeState): TreeNodeInfo<NodeData>[] {
    return Array(12).fill(0).map((_, idx) => {
        const nodeId = yearId * 100 + (idx + 1);
        const monthId = orderToMonth(idx + 1);
        const nodeState = treeState[nodeId];
        const node: TreeNodeInfo<NodeData> = {
            id: nodeId,
            label: monthLabel(monthId),
            nodeData: { yearId: yearId, monthId: monthId},
            isExpanded: nodeState?.isExpanded,
            isSelected: nodeState?.isSelected
            //icon: "moon"
        };
        return node;
    });
}

function dbToTreeNodes(dbYears: number[], treeState: TreeState): TreeNodeInfo<NodeData>[] {
    if (dbYears == null) {
        return [{
            id: -1,
            label: "Loading...",
            icon: "time"
        }];
    }

    const nodes: TreeNodeInfo<NodeData>[] = dbYears
        .sort((yearId1, yearId2) => yearId1 - yearId2)
        .map((yearId) => {
            const nodeState = treeState[yearId];
            const yearNode: TreeNodeInfo<NodeData> = {
                id: yearId,
                label: yearId.toString(),
                nodeData: { yearId: yearId},
                icon: "calendar",
                childNodes: createMonthTreeNodes(yearId, treeState),
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

export interface IExplorerProps {
    dbYears: number[],
    onYearSelected?: (yearId: number) => void,
    onMonthSelected?: (yearId: number, monthId: MonthId) => void
}

export function Explorer(props: IExplorerProps): React.ReactElement {
    const [treeState, setTreeState] = useState({} as TreeState);

    const handleNodeClick = (node: TreeNodeInfo<NodeData>) => {
            setTreeState(changeTreeState(treeState, node.id as number, (node) => node.isSelected = true, (node) => node.isSelected = false));
            if (!node.nodeData?.monthId && node.nodeData?.yearId) {
                if (props.onYearSelected) {
                    props.onYearSelected(node.nodeData.yearId);
                }
            } else if (node.nodeData.yearId && node.nodeData.monthId) {
                if (props.onMonthSelected) {
                    props.onMonthSelected(node.nodeData.yearId, node.nodeData.monthId);
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
            contents={dbToTreeNodes(props.dbYears, treeState)}
            onNodeCollapse={handleNodeCollapse}
            onNodeExpand={handleNodeExpand}
            onNodeClick={handleNodeClick}
        />
    )
}