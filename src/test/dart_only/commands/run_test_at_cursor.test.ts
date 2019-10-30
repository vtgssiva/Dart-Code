import * as assert from "assert";
import * as vs from "vscode";
import { fsPath } from "../../../shared/vscode/utils";
import { activate, delay, extApi, getPackages, helloWorldTestMainFile, openFile, positionOf, rangeString, waitForResult } from "../../helpers";

describe("run test at cursor", () => {

	before("get packages", () => getPackages());
	beforeEach("activate and wait for outline", async () => {
		await activate(helloWorldTestMainFile);
		await waitForResult(() => !!extApi.fileTracker.getOutlineFor(helloWorldTestMainFile));
	});

	it("Debug testing...", async () => {
		const disp = vs.window.onDidChangeTextEditorSelection((e) => {
			extApi.logger.info(`Selection changed for ${fsPath(e.textEditor.document.uri)} to ${e.selections.length ? rangeString(e.selections[0]) : "nothing"}`);
			console.log(`Selection changed for ${fsPath(e.textEditor.document.uri)} to ${e.selections.length ? rangeString(e.selections[0]) : "nothing"}`);
		});

		extApi.logger.info(`Showing ${fsPath(helloWorldTestMainFile)}`);
		console.log(`Showing ${fsPath(helloWorldTestMainFile)}`);
		const doc = await vs.workspace.openTextDocument(helloWorldTestMainFile);
		const editor = await vs.window.showTextDocument(doc);

		await delay(100);

		extApi.logger.info(`Setting selection 1`);
		console.log(`Setting selection 1`);
		editor.selection = new vs.Selection(editor.document.positionAt(0), editor.document.positionAt(0));

		await delay(100);
		extApi.logger.info(`Setting selection 2`);
		console.log(`Setting selection 2`);
		editor.selection = new vs.Selection(editor.document.positionAt(2), editor.document.positionAt(4));

		await delay(100);
		extApi.logger.info(`Setting selection 3`);
		console.log(`Setting selection 3`);
		editor.selection = new vs.Selection(editor.document.positionAt(3), editor.document.positionAt(6));

		await delay(100);
		extApi.logger.info(`Done! Doc length is ${editor.document.getText().length}, selection is ${rangeString(editor.selection)}`);
		console.log(`Done! Doc length is ${editor.document.getText().length}, selection is ${rangeString(editor.selection)}`);
		disp.dispose();
	});

	it("command is available when cursor is inside a test", async () => {
		const editor = await openFile(helloWorldTestMainFile);
		editor.selection = new vs.Selection(positionOf("expect^("), positionOf("^expect("));

		// Allow some time to check, because the flag is flipped in a selection change handler
		await waitForResult(() => extApi.cursorIsInTest);

		// Also ensure the command exists.
		const command = (await vs.commands.getCommands(true)).filter((id) => id === "dart.runTestAtCursor");
		assert.ok(command);
		assert.ok(command.length);
	});

	it("command is not available when cursor is not inside a test", async () => {
		const editor = await openFile(helloWorldTestMainFile);
		editor.selection = new vs.Selection(positionOf("main^("), positionOf("^main("));

		// Allow some time to check, because the flag is flipped in a selection change handler
		await waitForResult(() => !extApi.cursorIsInTest);
	});
});
