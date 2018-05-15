export interface GraphNode {
    name?: string;
    content?: string;
    relations: GraphRelation[];
}

export interface GraphRelation {
    name?: string;
    targetNodeIndex: number;
}

export interface Graph {
    nodes: GraphNode[];
}

export interface Pattern {
    graph: Graph;
    operations: {
        keys: string;
        values: (number | [number, number])[];
    };
}

export interface Context {
    graph: Graph;
    contextNodeIndex: number;
}

export interface PlantUmlNode {
    index: number;
    name: string;
    label: string;
    isBold?: boolean;
    isColored?: boolean;
    relations: PlantUmlRelation[];
}

export interface PlantUmlRelation {
    index: number;
    name: string;
    targetNodeIndex: number;
    isBold?: boolean;
    isColored?: boolean;
}

export enum VariableType {
    Graph,
    Pattern,
    Context,
    Other
}
