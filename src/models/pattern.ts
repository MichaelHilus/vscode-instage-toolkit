import { Graph } from './graph';

export type Operations = 'MATCH' | 'RETURN' | 'CREATE' | 'DELETE' | 'ORDER_BY' | 'SET';

export type OperationItem = (MatchOperationItem | ReturnOperationItem | CreateOperationItem | DeleteOperationItem | SetOperationItem | OrderByOperationItem);

export interface RelationIndex {
    relationIndex?: [number, number];
}

export interface NodeIndex {
    nodeIndex?: number;
}

export interface MatchOperationItem extends NodeIndex, RelationIndex {
    isOptional?: boolean;
}

export interface ReturnOperationItem extends NodeIndex, RelationIndex {
}

export interface CreateOperationItem extends NodeIndex, RelationIndex {
}

export interface DeleteOperationItem extends NodeIndex, RelationIndex {
}

export interface SetOperationItem {
    nodeIndex: number;
    newName?: string;
    newContent?: string;
}

export interface OrderByOperationItem {
    nodeIndex: number;
}

export interface Pattern {
    graph: Graph;
    operations: {
        keys: Operations[];
        values: OperationItem[][];
    };
}

