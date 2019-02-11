import * as vs from "vscode";
import { Analyzer } from "../analysis/analyzer";
import { isAnalyzable } from "../utils";

const nonBreakingSpace = " ";

export class TestLineDecorations implements vs.Disposable {
	private subscriptions: vs.Disposable[] = [];
	private activeEditor?: vs.TextEditor;

	private readonly decorationType = vs.window.createTextEditorDecorationType({
		// border: "1px solid white",
		// borderWidth: "0 0 0 1px",
		// color: "orange",
		before: {
			color: "#666666",
			width: "0",
		},
		// opacity: "0.1",
		rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	});
	// private readonly fadedDecorationType = vs.window.createTextEditorDecorationType({
	// 	opacity: "0.5",
	// 	rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	// });

	constructor(private readonly analyzer: Analyzer) {
		this.subscriptions.push(vs.window.onDidChangeActiveTextEditor((e) => this.setTrackingFile(e)));
		if (vs.window.activeTextEditor)
			this.setTrackingFile(vs.window.activeTextEditor);

	}

	private update() {
		if (!this.activeEditor)
			return;

		const decorations: vs.DecorationOptions[] = [];
		const lines = [
			{ start: [71, 4], children: [[73, 1]] },
			{ start: [73, 6], children: [[74, 1], [102, 1]] },
			{ start: [74, 8], children: [[76, 1], [97, 1]] },
			{ start: [102, 8], children: [[104, 2]] },
			{ start: [104, 10], children: [[107, 2]] },
			{ start: [107, 14], children: [[108, 2]] },
		];

		for (const line of lines) {
			const startColumn = line.start[1];
			const endLine = line.children[line.children.length - 1][0];

			for (let lineNumber = line.start[0] + 1; lineNumber <= endLine; lineNumber++) {
				decorations.push({
					range: new vs.Range(
						new vs.Position(lineNumber - 1, startColumn),
						new vs.Position(lineNumber - 1, startColumn),
					),
					renderOptions: {
						before: {
							contentText: lineNumber === endLine ? "┗" : "┃",
							width: "0",
						},
					},
				} as vs.DecorationOptions);
			}

			for (const child of line.children) {
				decorations.push({
					range: new vs.Range(
						new vs.Position(child[0] - 1, startColumn + 1),
						new vs.Position(child[0], startColumn + 1),
					),
					renderOptions: {
						before: {
							contentText: "━".repeat(child[1]),
						},
					},
				} as vs.DecorationOptions);
			}
		}

		// decorations.push({
		// 	range: new vs.Range(
		// 		this.activeEditor.document.lineAt(72).range.start.translate({ characterDelta: 6 }),
		// 		this.activeEditor.document.lineAt(72).range.start.translate({ characterDelta: 12 }),
		// 	),
		// } as vs.DecorationOptions);

		this.activeEditor.setDecorations(this.decorationType, decorations);
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
