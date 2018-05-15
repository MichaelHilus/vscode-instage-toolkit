import * as vscode from 'vscode';
import { VariableType } from '../interfaces';
import { DebugProtocol } from 'vscode-debugProtocol/lib/debugProtocol';

export function getTargetVariableName(): string {
    let word = '';
    let words: string[] = [];

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let position = editor.selection.active;
        let range = editor.document.getWordRangeAtPosition(position) as vscode.Range;
        range = range.with(range.start.translate(0, -1), range.end);
        word = editor.document.getText(range);
        words.push(word);

        while (word.startsWith('.')) {
            position = (range as vscode.Range).start.translate(0, -1);
            range = editor.document.getWordRangeAtPosition(position) as vscode.Range;
            range = range.with(range.start.translate(0, -1), range.end);
            word = editor.document.getText(range);
            words.push(word);
        }

        words = words.map(w => w.substr(1)).reverse();
    }

    return words.join('.');
}

export async function getFrameIdOfDebugSession(): Promise<number> {
    const session = vscode.debug.activeDebugSession;
    let frameId = 0;
    if (session) {
        const stacksResponse: Partial<DebugProtocol.StackTraceResponse> = { body: await session.customRequest('stackTrace', { threaadId: 1 }) };
        const frame = stacksResponse.body? stacksResponse.body.stackFrames[0] : { id: 0 };
        frameId = frame.id;
    }

    return frameId;
}

export async function getTargetVariableType(variableName: string, frameId: number): Promise<VariableType> {
    let variableType: VariableType = VariableType.Other;

    const session = vscode.debug.activeDebugSession;
    if (session) {
        const evaluateResponse: Partial<DebugProtocol.EvaluateResponse> = { body: await session.customRequest('evaluate', { expression: variableName, frameId: frameId }) };
        const result = evaluateResponse.body ? evaluateResponse.body.result as string : 'undefined';
        if (result.includes('Object {nodes:')) {
            variableType = VariableType.Graph;
        } else if (result.startsWith('Pattern' || result.includes('operations: '))) {
            variableType = VariableType.Pattern;
        } else if (result.startsWith('Context') || result.includes('contextNodeIndex: ')) {
            variableType = VariableType.Context;
        } else {
            variableType = VariableType.Other;
        }
    }

    return variableType;
}

export async function evaluateVariable(variableName: string, frameId: number): Promise<any> {
    let serializedVariable = '';

    const session = vscode.debug.activeDebugSession;
    if (session) {
        const evaluateResponse: Partial<DebugProtocol.EvaluateResponse> = {
            body: await session.customRequest('evaluate', { expression: `JSON.stringify(${variableName})`, frameId: frameId })
        };

        serializedVariable = evaluateResponse.body ? evaluateResponse.body.result : '';
        serializedVariable = serializedVariable.substring(1, serializedVariable.length - 1);
    }
    return JSON.parse(serializedVariable);
}
