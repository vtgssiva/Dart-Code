import * as vs from "vscode";
import { Analyzer } from "../analysis/analyzer";
import { isAnalyzable } from "../utils";

const nonBreakingSpace = " ";

export class WidgetGuide {
	constructor(public readonly start: vs.Position, public readonly end: vs.Position) { }
}

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

		const doc = this.activeEditor.document;
		const pos = doc.positionAt;
		const guides = [
			new WidgetGuide(pos(4648), pos(4717)),
		];

		for (const guide of guides) {
			const startColumn = guide.start.character;
			const endLine = guide.end.line;

			for (let lineNumber = guide.start.line + 1; lineNumber <= endLine; lineNumber++) {
				decorations.push({
					range: new vs.Range(
						new vs.Position(lineNumber, startColumn),
						new vs.Position(lineNumber, startColumn),
					),
					renderOptions: {
						before: {
							contentText: lineNumber === endLine ? "┗" : "┃",
							width: "0",
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
