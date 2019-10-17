import * as vs from "vscode";

const nonBreakingSpace = "\xa0";

export class DoubleIndentDecorations implements vs.Disposable {
	private disposables: vs.Disposable[] = [];

	private readonly decoration = vs.window.createTextEditorDecorationType({
		rangeBehavior: vs.DecorationRangeBehavior.OpenOpen,
	});

	constructor() {
		// Update any editor that becomes active.
		this.disposables.push(vs.window.onDidChangeActiveTextEditor((e) => this.buildForTextEditor(e)));
		this.disposables.push(vs.workspace.onDidChangeTextDocument((e) => {
			const editor = vs.window.visibleTextEditors.find((e) => e.document === e.document);
			this.buildForTextEditor(editor);
		}));

		// Update the current visible editor when we were registered.
		if (vs.window.activeTextEditor)
			this.buildForTextEditor(vs.window.activeTextEditor);
	}

	private buildForTextEditor(editor: vs.TextEditor): void {
		if (!editor || !editor.document)
			return;

		const decorations: vs.DecorationOptions[] = [];
		for (let i = 0; i < editor.document.lineCount; i++) {
			const line = editor.document.lineAt(i);
			const indentLength = line.firstNonWhitespaceCharacterIndex;
			decorations.push({
				range: line.range,
				renderOptions: {
					before: {
						contentText: nonBreakingSpace.repeat(indentLength),
					},
				},
			});
		}

		//editor.setDecorations(this.decoration, decorations);
	}

	public dispose() {
		this.disposables.forEach((s) => s.dispose());
	}
}
