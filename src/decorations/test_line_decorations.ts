import * as vs from "vscode";
import { Analyzer } from "../analysis/analyzer";
import { isAnalyzable } from "../utils";

export class TestLineDecorations implements vs.Disposable {
	private subscriptions: vs.Disposable[] = [];
	private activeEditor?: vs.TextEditor;

	private readonly decorationType = vs.window.createTextEditorDecorationType({
		border: "1px solid white",
		borderWidth: "0 0 0 1px",
		color: "orange",
		rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	});
	private readonly fadedDecorationType = vs.window.createTextEditorDecorationType({
		opacity: "0.5",
		rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	});

	constructor(private readonly analyzer: Analyzer) {
		this.subscriptions.push(vs.window.onDidChangeActiveTextEditor((e) => this.setTrackingFile(e)));
		if (vs.window.activeTextEditor)
			this.setTrackingFile(vs.window.activeTextEditor);

	}

	private update() {
		if (!this.activeEditor)
			return;

		const decorations: vs.DecorationOptions[] = [];
		// const lines: { [key: number]: number[] } = {
		// 	70: [4],
		// 	71: [4],
		// 	72: [4, 6],
		// 	73: [4, 6, 8],
		// 	74: [4, 6, 8],
		// 	75: [4, 6, 8],
		// 	76: [4, 6, 8],
		// 	77: [4, 6, 8],
		// 	78: [4, 6, 8],
		// 	79: [4, 6, 8],
		// 	80: [4, 6, 8],
		// 	81: [4, 6, 8],
		// 	82: [4, 6, 8],
		// 	83: [4, 6, 8],
		// 	84: [4, 6, 8],
		// 	85: [4, 6, 8],
		// 	86: [4, 6, 8],
		// 	87: [4, 6, 8],
		// 	88: [4, 6, 8],
		// };

		// Object.keys(lines).forEach((l) => {
		// 	const lineNumber = parseInt(l, 10);
		// 	const line = lines[lineNumber];
		// 	line.forEach((char) => {
		// 		decorations.push({
		// 			range: new vs.Range(
		// 				this.activeEditor.document.lineAt(lineNumber).range.start.translate({ characterDelta: char }),
		// 				this.activeEditor.document.lineAt(lineNumber).range.start.translate({ characterDelta: char + 1 }),
		// 			)
		// 		} as vs.DecorationOptions);
		// 	});
		// });

		decorations.push({
			range: new vs.Range(
				this.activeEditor.document.lineAt(72).range.start.translate({ characterDelta: 6 }),
				this.activeEditor.document.lineAt(72).range.start.translate({ characterDelta: 12 }),
			),
		} as vs.DecorationOptions);

		this.activeEditor.setDecorations(this.fadedDecorationType, decorations);
	}

	private setTrackingFile(editor: vs.TextEditor) {
		if (editor && isAnalyzable(editor.document)) {
			this.activeEditor = editor;
			this.update();
		} else
			this.activeEditor = undefined;
	}

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach((s) => s.dispose());
	}
}
