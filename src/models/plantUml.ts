
export interface PlantUmlNode {
    index: number;
    name: string;
    label: string;
    isBold?: boolean;
    color?: string;
    relations: PlantUmlRelation[];
}

export interface PlantUmlRelation {
    index: number;
    name: string;
    targetNodeIndex: number;
    isBold?: boolean;
    color?: string;
}