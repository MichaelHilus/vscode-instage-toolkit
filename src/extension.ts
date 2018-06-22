'use strict';

import * as vscode from 'vscode';

import { compress } from './utils/compression';
import { TextDocumentContentProvider } from './textDocumentContentProvider';
import { generatePlantUmlScript } from './utils/scriptGenerator';
import { getTargetVariableName, getFrameIdOfDebugSession, getTargetVariableType, evaluateVariable } from './utils/debugging';
import { getFolderPathOfPath } from './utils/filePath';

export function activate(context: vscode.ExtensionContext) {
    let openPowershellCommand = vscode.commands.registerCommand('extension.instageToolkit.openPowershell', (fileUri: vscode.Uri) => {
        let folderPath = getFolderPathOfPath(fileUri.fsPath);
        let terminal  = vscode.window.createTerminal('open powershell');
        terminal.sendText(`start powershell -WorkingDirectory "${folderPath}"`);
    });

    let provider = new TextDocumentContentProvider();
    let inspectProvider = vscode.workspace.registerTextDocumentContentProvider('instage-toolkit', provider);

    let inspectCommand = vscode.commands.registerCommand('extension.instageToolkit.inspect', async () => {
    
        const variableName = getTargetVariableName();
        const frameId = await getFrameIdOfDebugSession();
        const variableType = await getTargetVariableType(variableName, frameId);
        const evaluatedVariable = await evaluateVariable(variableName, frameId);
        const plantUmlScript = generatePlantUmlScript(variableType, evaluatedVariable);
        const compressedScript = compress(plantUmlScript);

        const uri = vscode.Uri.parse(`instage-toolkit://graph-preview?${compressedScript}#${JSON.stringify({type: variableType, value: evaluatedVariable})}`);
        vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Three, variableName + ' - Preview');
    });

    context.subscriptions.push(openPowershellCommand);
    context.subscriptions.push(inspectProvider);
    context.subscriptions.push(inspectCommand);
}

export function deactivate() {
}