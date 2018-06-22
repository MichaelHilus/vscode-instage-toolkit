'use strict';

import * as vscode from 'vscode';

import { VariableType } from "./models/variableType";
import { Graph } from "./models/graph";
import { Context } from "./models/context";
import { Pattern, RelationIndex, OperationItem, SetOperationItem } from "./models/pattern";

export class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    private style = `<style>
                        html, body {
                            font-family: 'Consolas';
                        }

                        p {
                            margin: 0;
                        }

                        img {
                            margin-bottom: 16px;
                        }

                        .operation {
                            display: inline-block;
                            width: 60px;
                            margin-right: 8px;
                        }

                        .match {
                            color: #9CDCFE;
                        }

                        .return {
                            color: #569CD6;
                        }

                        .create {
                            color: #2AA8B0;
                        }

                        .delete {
                            color: #A586C0;
                        }

                        .indexNumber {
                            color: #B5CEA8;
                        }

                        .string {
                            color: #CE9178;
                        }
                    </style>`;

    public provideTextDocumentContent(uri: vscode.Uri): string {
        let {type, value} = JSON.parse(uri.fragment) as {type: VariableType, value: any};

        let operations: { name: string, indices: OperationItem[]}[] = [];
        let nodes = 0;
        let relations = 0;

        if (type === VariableType.Graph) {
            ({ nodes, relations } = this.computeGraphStats(value as Graph));
        }
        if (type === VariableType.Context) {
            let context = value as Context;
            ({ nodes, relations } = this.computeGraphStats(context.graph));
            operations.push({name: 'CONTEXT', indices: [ { nodeIndex: context.contextNodeIndex}] });
        }

        if (type === VariableType.Pattern) {
            let pattern = value as Pattern;
            ({ nodes, relations } = this.computeGraphStats(pattern.graph));
            
            pattern.operations.keys.forEach((key, keyIndex) => {
                let operation: { name: string, indices: OperationItem[]} = {name: key, indices: []};
                operation.indices = pattern.operations.values[keyIndex];
                operations.push(operation);
            });
        }

        const content = `<body>
            ${this.style}
            <p>Nodes: ${nodes}</p>
            <p>Relations: ${relations}</p>
            <img src="https://plantuml.progresso-group.de/png/${uri.query}.png"></img>
            ${operations.map(operation => {
                const indices = operation.indices.map(index => {
                    if (index.nodeIndex !== undefined) {
                        if ((index as SetOperationItem).newName) {
                            const setOperation = index as SetOperationItem;
                            return `{ <span class="indexNumber">${index.nodeIndex}</span>, <span class="string">"${setOperation.newName}"</span>, <span class="string">"${setOperation.newContent}"</span>}`;
                            
                        }
                        return `<span class="indexNumber">${index.nodeIndex}</span>`;
                    }

                    const relationIndex = (index as RelationIndex).relationIndex as [number, number];
                    return `[<span class="indexNumber">${relationIndex[0]}</span>, <span class="indexNumber">${relationIndex[1]}</span>]`;
                }).join(', ');
                return `<p><span class="${operation.name.toLowerCase()} operation">${operation.name}:</span> [${indices}]`;
            }).join(' ')}
        </body>`;

        return content;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private computeGraphStats(graph: Graph): { nodes: number, relations: number} {
        const nodes = graph.nodes.length;
        let relations = 0;
        graph.nodes.forEach(n => relations += n.relations.length);

        return { nodes, relations };
    }
}