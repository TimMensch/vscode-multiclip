import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Range = vscode.Range;

export function activate(context: vscode.ExtensionContext) {

	let bufSize = 5;
	let defaultValue = " nothing in buffer yet ";
	var copyBuffer = new Array;
	
	var _channel = Window.createOutputChannel('Multiclip Log');
	_channel.appendLine("Multiclip Log Output");
	
	var disposables = [];
	disposables.push( vscode.commands.registerCommand('multiclip.copy', () => {
		let e = Window.activeTextEditor;
		let d = e.document;
		let sel = e.selection;
		
		let txt: string = d.getText(new Range(sel.start, sel.end));
		copyBuffer.unshift(txt);
		if (copyBuffer.length > bufSize){
			copyBuffer = copyBuffer.slice(0, bufSize);
		}
		
		vscode.commands.executeCommand("editor.action.clipboardCopyAction");
	}));
	disposables.push( vscode.commands.registerCommand('multiclip.cut', () => {
		let e = Window.activeTextEditor;
		let d = e.document;
		let sel = e.selection;
		
		let txt: string = d.getText(new Range(sel.start, sel.end));
		copyBuffer.unshift(txt);
		if (copyBuffer.length > bufSize){
			copyBuffer = copyBuffer.slice(0, bufSize);
		}
		
		vscode.commands.executeCommand("editor.action.clipboardCutAction");
	}));
	disposables.push( vscode.commands.registerCommand('multiclip.list', () => {
		_channel.show();
		if (copyBuffer.length ==0) {
			_channel.appendLine("buffer is empty")
			return;
		}
		for (var i=0; i<copyBuffer.length; i++){
			_channel.appendLine("Entry #" + (i+1));
			_channel.appendLine("--------------------------------------");
			_channel.append(copyBuffer[i]);
			_channel.appendLine("");
			_channel.appendLine("--------------------------------------");
		}
		
	}));
	disposables.push( vscode.commands.registerCommand('multiclip.paste', () => {
		var opts: QuickPickOptions = { matchOnDescription: true, placeHolder: "What to paste" };
		var items: QuickPickItem[] = [];
		
		if (copyBuffer.length == 0) {
			Window.showInformationMessage("nothing to paste");
			return;
		}
		
		for (var i=0; i<copyBuffer.length; i++){
			items.push({ label: i.toString(), description: copyBuffer[i]});
		};
		
		Window.showQuickPick(items).then( (item) => {
			if (!item) {
				return;
			}
			let e = Window.activeTextEditor;
			let d = e.document;
			let sel = e.selections;
			
			e.edit( function(edit) {
				e.selections.forEach(sel => {
					let txt = item.description;
					edit.replace(sel, txt);
					//TODO: Put selection in clipboard
				});
			});
			
		})

	}));
	
	context.subscriptions.concat(disposables);
}

export function deactivate() {
}