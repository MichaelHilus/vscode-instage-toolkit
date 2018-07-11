
export interface PlantUmlStyleInformation {
    border?: string;
    dashed: boolean;
    background?: string;
}

export interface PlantUmlNode extends PlantUmlStyleInformation {
    index: number;
    name: string;
    label: string;
    relations: PlantUmlRelation[];
}

export interface PlantUmlRelation extends PlantUmlStyleInformation {
    index: number;
    name: string;
    targetNodeIndex: number;
}