import * as vs from "vscode";
import * as as from "../analysis/analysis_server_types";
import { Analyzer } from "../analysis/analyzer";
import { OpenFileTracker } from "../analysis/open_file_tracker";
import { fsPath } from "../utils";

export class GutterIconsDecorations implements vs.Disposable {
	private analyzer: Analyzer;
	private subscriptions: vs.Disposable[] = [];

	private readonly decorationType = vs.window.createTextEditorDecorationType({
		after: {
			color: "#ff0000",
			margin: "2px",
		},
		rangeBehavior: vs.DecorationRangeBehavior.ClosedClosed,
	});

	constructor(analyzer: Analyzer) {
		this.analyzer = analyzer;

		this.subscriptions.push(this.analyzer.registerForFlutterOutline((o) => {
			const editor = vs.window.activeTextEditor;
			if (editor && o.file === fsPath(editor.document.uri))
				this.update(editor, o.outline);
		}));

		this.subscriptions.push(vs.window.onDidChangeActiveTextEditor((e) => this.update(e)));
		this.update(vs.window.activeTextEditor);
	}

	private update(editor: vs.TextEditor, outline?: as.FlutterOutline) {
		if (!editor)
			return;

		// If we weren't passed an outline, fetch the last one we have.
		outline = outline || OpenFileTracker.getFlutterOutlineFor(editor.document.uri);

		if (!outline)
			return;

		const decorations: vs.DecorationOptions[] = [];
		this.appendDecorations(decorations, outline);

		editor.setDecorations(this.decorationType, Object.keys(decorations).map((k) => parseInt(k, 10)).map((k) => decorations[k]));
	}

	private appendDecorations(decorations: vs.DecorationOptions[], outline: as.FlutterOutline): any {
		// if (outline.dartElement && outline.label)

		// 	if (outline.children)
		// 		outline.children.forEach((c) => this.appendDecorations(decorations, c));
	}

	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}
}
