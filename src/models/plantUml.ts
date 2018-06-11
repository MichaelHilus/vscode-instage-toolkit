
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