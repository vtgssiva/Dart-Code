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

	private readonly leftBorderDecoration = vs.window.createTextEditorDecorationType({
		border: "1px solid white",
		borderWidth: "0 0 0 1px",
		//color: "orange",
		before: {
			// backgroundColor: "#ff0000",
			// color: "#666666",
			// width: "10px",
			// contentText: ".",
		},
		// opacity: "0.1",
		rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	});
	private readonly bottomBorderDecoration = vs.window.createTextEditorDecorationType({
		border: "1px solid white",
		borderWidth: "0 0 1px 0",
		//color: "orange",
		before: {
			// backgroundColor: "#ff0000",
			// color: "#666666",
			// width: "10px",
			// contentText: ".",
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
		this.subscriptions.push(vs.workspace.onDidChangeTextDocument(async (e) => this.setTrackingFile(await vs.window.showTextDocument(e.document))));
		if (vs.window.activeTextEditor)
			this.setTrackingFile(vs.window.activeTextEditor);

	}

	private indexesOf(searchString: string, input: string, startPosition = 0) {
		const results = [];
		let i = startPosition;
		// tslint:disable-next-line: no-conditional-assignment
		while ((i = input.indexOf(searchString, i + 1)) >= 0) {
			results.push(i);
			i++;
		}
		return results;
	}

	private update() {
		if (!this.activeEditor)
			return;

		const leftDecorations: vs.DecorationOptions[] = [];
		const bottomDecorations: vs.DecorationOptions[] = [];

		const doc = this.activeEditor.document;
		const text = doc.getText();
		const demoStart = text.indexOf("// START-DEMO");
		const demoEnd = text.indexOf("// END-DEMO");
		const startIndex = text.indexOf("child: Column(", demoStart);

		const guides = this.indexesOf("KeyRow(<Widget>[", text, demoStart)
			.filter((i) => i <= demoEnd)
			.map(
				(i) => new WidgetGuide(doc.positionAt(startIndex), doc.positionAt(i)),
			);

		for (const guide of guides) {
			const startColumn = guide.start.character;
			const endLine = guide.end.line;

			for (let lineNumber = guide.start.line + 1; lineNumber <= guide.end.line; lineNumber++) {
				leftDecorations.push({
					range: new vs.Range(
						new vs.Position(lineNumber, startColumn),
						new vs.Position(lineNumber, startColumn),
					),
				} as vs.DecorationOptions);
			}
			bottomDecorations.push({
				range: new vs.Range(
					new vs.Position(endLine, startColumn),
					new vs.Position(endLine, guide.end.character),
				),
			} as vs.DecorationOptions);
		}

		this.activeEditor.setDecorations(this.leftBorderDecoration, leftDecorations);
		this.activeEditor.setDecorations(this.bottomBorderDecoration, bottomDecorations);
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
