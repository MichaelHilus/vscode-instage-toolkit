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

            setColorsOfElements(plantUmlNodes, matchOperations, '#9CDCFE', '#004E4E');
            setColorsOfElements(plantUmlNodes, returnOperations, '#569CD6', '#264F78');
            setColorsOfElements(plantUmlNodes, createOperations, '#2AA8B0');
            setColorsOfElements(plantUmlNodes, deleteOperations, '#A586C0');

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

function setColorsOfElements(elements: PlantUmlNode[], opertaions: OperationItem[], borderColor: string, backgroundColor?: string) {
    opertaions.forEach(operation => {
        if (!isNaN(operation.nodeIndex as number)) {
            elements[operation.nodeIndex as number].border = borderColor;
            elements[operation.nodeIndex as number].background = backgroundColor;
        } else {
            const relationOperation = operation as RelationIndex;
            elements[(relationOperation.relationIndex as [number, number])[0]]
                .relations[(relationOperation.relationIndex as [number, number])[1]].border = borderColor;
                elements[(relationOperation.relationIndex as [number, number])[0]]
                .relations[(relationOperation.relationIndex as [number, number])[1]].background = backgroundColor;
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
                    targetNodeIndex: relation.targetNodeIndex
                };
            })
        };
    });
}

function generateScript(nodes: PlantUmlNode[]): string {

    let labelAttribute = (label: string, index: string) => `label=<${label === 'null' ? `<FONT color="#569CD6">${label}</FONT>` : label} <SUB><FONT color="#B5CEA8" face="times">[${index}]</FONT></SUB>>`;
    let colorAttributes = (border?: string, background?: string) => (border ? `pencolor="${border}",color="${border}"` : '') + (background ? `,style="filled",fillcolor="${background}"` : '');

    return `
        @startuml
        digraph graph1 {
            graph [ fontsize=9, bgcolor="transparent" ];
            node [ penwidth=2, fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];
            edge [ penwidth=2, fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];

            ${nodes.map(node => {
                return `${node.name} [${labelAttribute(node.label, node.index.toString())},${colorAttributes(node.border, node.background)}]`;
            }).join('\n')}

            ${nodes.map(node => node.relations.map(relation => {
                return `${node.name}->${nodes[relation.targetNodeIndex].name} [${labelAttribute(relation.name, node.index + ', ' + relation.index)},${colorAttributes(relation.border)}]`;
            }).join('\n')).join('\n')}
        }
        @enduml`;
}