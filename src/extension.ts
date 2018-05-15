'use strict';

import * as vscode from 'vscode';

import { compress } from './utils/compression';
import { TextDocumentContentProvider } from './textDocumentContentProvider';
import { generatePlantUmlScript } from './utils/scriptGenerator';
import { getTargetVariableName, getFrameIdOfDebugSession, getTargetVariableType, evaluateVariable } from './utils/debugging';

export function activate(context: vscode.ExtensionContext) {
    let provider = new TextDocumentContentProvider();
    let providerDisposable = vscode.workspace.registerTextDocumentContentProvider('instage-toolkit', provider);

    let commandDisposable = vscode.commands.registerCommand('extension.instageToolkit.inspect', async () => {
    
        const variableName = getTargetVariableName();
        const frameId = await getFrameIdOfDebugSession();
        const variableType = await getTargetVariableType(variableName, frameId);
        const evaluatedVariable = await evaluateVariable(variableName, frameId);
        const plantUmlScript = generatePlantUmlScript(variableType, evaluatedVariable);
        const compressedScript = compress(plantUmlScript);

        const uri = vscode.Uri.parse(`instage-toolkit://graph-preview?${compressedScript}`);
        vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Three, variableName + ' - Preview');
    });

    context.subscriptions.push(providerDisposable);
    context.subscriptions.push(commandDisposable);
}

export function deactivate() {
}