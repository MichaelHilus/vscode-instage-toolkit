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