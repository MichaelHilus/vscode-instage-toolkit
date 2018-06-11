import { VariableType } from "../models/variableType";
import { PlantUmlNode } from "../models/plantUml";
import { Graph, GraphNode } from "../models/graph";
import { Context } from "../models/context";
import { Pattern, MatchOperationItem, ReturnOperationItem } from "../models/pattern";


export function generatePlantUmlScript(variableType: VariableType, variable: any): string {
    let plantUmlNodes: PlantUmlNode[] = [];
    switch(variableType) {
        case VariableType.Graph: {
            let graphVariable = variable as Graph;
            plantUmlNodes = mapNodesToPlantUmlNodes(graphVariable.nodes);
            break;
        }
        case VariableType.Context: {
            let contextVariable = variable as Context;
            plantUmlNodes = mapNodesToPlantUmlNodes(contextVariable.graph.nodes);
            plantUmlNodes[contextVariable.contextNodeIndex].isBold = true;

            break;
        }
        case VariableType.Pattern: {
            let patternVariable = variable as Pattern;
            plantUmlNodes = mapNodesToPlantUmlNodes(patternVariable.graph.nodes);
                        
            let matchIndex = patternVariable.operations.keys.indexOf('MATCH');
            let matchOperations = patternVariable.operations.values[matchIndex] as MatchOperationItem[];

            let returnIndex = patternVariable.operations.keys.indexOf('RETURN');
            let returnOperations = patternVariable.operations.values[returnIndex] as ReturnOperationItem[];

            matchOperations.forEach((matchOperation, index) => {
                if (!isNaN(matchOperation.nodeIndex as number)) {
                    plantUmlNodes[matchOperation.nodeIndex as number].isBold = true;
                } else {
                    plantUmlNodes[(matchOperation.relationIndex as [number, number])[0]]
                        .relations[(matchOperation.relationIndex as [number, number])[1]].isBold = true;
                }
            });

            returnOperations.forEach((returnOperation, index) => {
                if (!isNaN(returnOperation.nodeIndex as number)) {
                    plantUmlNodes[returnOperation.nodeIndex as number].isColored = true;
                } else {
                    plantUmlNodes[(returnOperation.relationIndex as [number, number])[0]]
                        .relations[(returnOperation.relationIndex as [number, number])[1]].isColored = true;
                }
            });

            break;
        }

        default: break;
    }

    return generateScript(plantUmlNodes);
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
    let boldAttributes = (isBold: boolean | undefined) => isBold ? ',penwidth="3",fontname="bold"' : '';
    let colorAttributes = (isColored: boolean | undefined) => isColored ? ',style="filled",fillcolor="#264F78"' : '';

    return `
        @startuml
        digraph graph1 {
            graph [ fontsize=9, bgcolor="transparent" ];
            node [ fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];
            edge [ fontsize=9, fontcolor="#CE9178" color="#CCCCCC" ];

            ${nodes.map(node => {
                return `${node.name} [${labelAttribute(node.label, node.index.toString())}${boldAttributes(node.isBold)}${colorAttributes(node.isColored)}]`;
            }).join('\n')}

            ${nodes.map(node => node.relations.map(relation => {
                return `${node.name}->${nodes[relation.targetNodeIndex].name} [${labelAttribute(relation.name, node.index + ', ' + relation.index)}${boldAttributes(relation.isBold)}${colorAttributes(relation.isColored)}]`;
            }).join('\n')).join('\n')}
        }
        @enduml`;
}