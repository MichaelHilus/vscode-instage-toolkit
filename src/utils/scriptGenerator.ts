import { VariableType } from "../models/variableType";
import { PlantUmlNode } from "../models/plantUml";
import { Graph, GraphNode } from "../models/graph";
import { Context } from "../models/context";
import { Pattern, MatchOperationItem, ReturnOperationItem, CreateOperationItem, DeleteOperationItem, OperationItem, RelationIndex, Operations } from "../models/pattern";


export function generatePlantUmlScript(variableType: VariableType, variable: any): string {
    let plantUmlNodes: PlantUmlNode[] = [];
    switch(variableType) {
        case VariableType.Graph: {
            const graphVariable = variable as Graph;
            plantUmlNodes = mapNodesToPlantUmlNodes(graphVariable.nodes);
            break;
        }
        case VariableType.Context: {
            const contextVariable = variable as Context;
            plantUmlNodes = mapNodesToPlantUmlNodes(contextVariable.graph.nodes);
            plantUmlNodes[contextVariable.contextNodeIndex].border = "#569CD6";
            plantUmlNodes[contextVariable.contextNodeIndex].background = "#264F78";

            break;
        }
        case VariableType.Pattern: {
            const patternVariable = variable as Pattern;
            plantUmlNodes = mapNodesToPlantUmlNodes(patternVariable.graph.nodes);
        
            const matchOperations = getOperationByType<MatchOperationItem>( patternVariable.operations, 'MATCH');
            const returnOperations = getOperationByType<ReturnOperationItem>( patternVariable.operations, 'RETURN');
            const createOperations = getOperationByType<CreateOperationItem>( patternVariable.operations, 'CREATE');
            const deleteOperations = getOperationByType<DeleteOperationItem>( patternVariable.operations, 'DELETE');

            setStyleOfElements(plantUmlNodes, matchOperations, { borderColor: '#9CDCFE', backgroundColor: '#004E4E' });
            setStyleOfElements(plantUmlNodes, returnOperations, { borderColor: '#569CD6', backgroundColor: '#264F78' });
            setStyleOfElements(plantUmlNodes, createOperations,  { borderColor: '#2AA8B0' });
            setStyleOfElements(plantUmlNodes, deleteOperations,  { borderColor:  '#A586C0' });

            break;
        }

        default: break;
    }

    return generateScript(plantUmlNodes);
}

function getOperationByType<T>(operations: { keys: Operations[]; values: OperationItem[][]; }, key: Operations): T[] {
    let index = operations.keys.indexOf(key);
    if (index < 0) {
        return [];
    }

    return operations.values[index] as T[];
}

function setStyleOfElements(elements: PlantUmlNode[], operations: OperationItem[], style: { borderColor: string, backgroundColor?: string, dashed?: boolean }) {
    operations.forEach(operation => {
        if (!isNaN(operation.nodeIndex as number)) {
            const element = elements[operation.nodeIndex as number];

            if ((operation as MatchOperationItem).isOptional)
            {
                element.dashed = true;
            }
            element.border = style.borderColor;
            element.background = style.backgroundColor;
        } else {
            const relationOperation = operation as RelationIndex;
            const element = elements[(relationOperation.relationIndex as [number, number])[0]]
                .relations[(relationOperation.relationIndex as [number, number])[1]];

            if ((operation as MatchOperationItem).isOptional)
            {
                element.dashed = true;
            }
            element.border = style.borderColor;
            element.background = style.backgroundColor;
        }
    });
}

function mapNodesToPlantUmlNodes(nodes: GraphNode[]): PlantUmlNode[] {
    return nodes.map((node, index) => {
        return {
            index: index,
            name: 'n' + index,
            label: node.name ? node.name : 'null',
            relations: node.relations.map((relation, relationIndex) => {
                return {
                    index: relationIndex,
                    name: relation.name ? relation.name : 'null',
                    targetNodeIndex: relation.targetNodeIndex,
                    dashed: false
                };
            }),
            dashed: false
        };
    });
}

function generateScript(nodes: PlantUmlNode[]): string {

    let labelAttribute = (label: string, index: string) => `label=<${label === 'null' ? `<FONT color="#569CD6">${label}</FONT>` : label} <SUB><FONT color="#B5CEA8" face="times">[${index}]</FONT></SUB>>`;
    let colorAttributes = (border?: string, background?: string, dashed?: boolean) => {
        const borderString = border ? `pencolor="${border}",color="${border}"` : '';
        const backgroundString = background ? `,fillcolor="${background}"` : '';
        const styleString = ((background || dashed) ? ',style="' : '') + (background ? 'filled' : '') + ((background && dashed) ? ',' : '')  + (dashed ? 'dashed' : '') + ((background || dashed) ? '"' : '');
        return borderString + backgroundString + styleString;
    }; 

    return `
        @startuml
        digraph graph1 {
            graph [ fontsize=9, bgcolor="#1E1E1E" ];
            node [ penwidth=2, fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];
            edge [ penwidth=2, fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];

            ${nodes.map(node => {
                return `${node.name} [${labelAttribute(node.label, node.index.toString())},${colorAttributes(node.border, node.background, node.dashed)}]`;
            }).join('\n')}

            ${nodes.map(node => node.relations.map(relation => {
                return `${node.name}->${nodes[relation.targetNodeIndex].name} [${labelAttribute(relation.name, node.index + ', ' + relation.index)},${colorAttributes(relation.border, undefined, relation.dashed)}]`;
            }).join('\n')).join('\n')}
        }
        @enduml`;
}