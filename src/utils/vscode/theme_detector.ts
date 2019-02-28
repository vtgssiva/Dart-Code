import * as vs from "vscode";

export enum Theme {
	Unknown,
	Dark,
	Light,
	HighContrast,
}

export function detectTheme(disposables?: vs.Disposable[]): Promise<Theme> {
	return new Promise((resolve) => {
		let panel = createPanel();
		const messageHandler = (bodyCssClass?: string) => {
			if (panel) {
				panel.dispose();
				panel = undefined;
			}
			resolve(bodyCssClass ? parseClass(bodyCssClass) : Theme.Unknown);
		};

		// After a second, just resolve as unknown.
		setTimeout(() => messageHandler(), 1000);

		panel.webview.onDidReceiveMessage(
			messageHandler,
			undefined,
			disposables,
		);
		panel.webview.html = themeDetectorScript;
	});
}

const themeDetectorScript = `<html><body><script>
	(function() {
		const vscode = acquireVsCodeApi();
		vscode.postMessage(document.body.className);
	})();
</script></body></html>`;

function createPanel() {
	return vs.window.createWebviewPanel(
		"theme-detector",
		"",
		{
			preserveFocus: true,
			viewColumn: vs.ViewColumn.Beside,
		},
		{
			enableScripts: true,
			localResourceRoots: [],
		},
	);
}

function parseClass(bodyCssClass: string): Theme {
	if (bodyCssClass && bodyCssClass.indexOf("vscode-dark") !== -1) {
		return Theme.Dark;
	} else if (bodyCssClass && bodyCssClass.indexOf("vscode-light") !== -1) {
		return Theme.Light;
	} else if (bodyCssClass && bodyCssClass.indexOf("vscode-high-contrast") !== -1) {
		return Theme.HighContrast;
	} else {
		return Theme.Unknown;
	}
}
