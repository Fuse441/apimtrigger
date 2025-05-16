const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const outputChannel = vscode.window.createOutputChannel("Apim Trigger");

const decorationType = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  after: {
    contentText: "", // จะแก้ไขแบบ dynamic ทีหลัง
    color: "#888",
    margin: "0 0 0 1em",
  },
});

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.apimTrigger", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      outputChannel.clear();
      outputChannel.appendLine("👩🏻‍💻 Apim Trigger Active ! 👩🏻‍💻");

      const lineNumber = editor.selection.active.line;
      const lineText = editor.document.lineAt(lineNumber).text;
      const documentUri = editor.document.uri;

      if (lineText.includes("@TABLE")) {
        const match = lineText.match(/@TABLE\.(.+)/);
        const workspaceFolder = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri.fsPath
          : null;
        const parts = match[1].split(".");
        let condition = parts[2]?.replace(/[,]/g, "") || "";
        const dotCount = parts.length - 1;

        if (dotCount === 1) {
          const filePath = workspaceFolder.concat(
            "/",
            match[1].replace(/\./g, "/").replace(/[" ,]/g, ""),
            ".json"
          );

          outputChannel.appendLine(
            "👉 redirectStep to ==> " + String(parts).trim()
          );
          outputChannel.show();

          return vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.file(filePath)
          );
        } else {
          const filePath = vscode.Uri.file(
            match[1].split(".").slice(0, -1).join("/") + ".json"
          );
          const fullFilePath =
            workspaceFolder + "/" + filePath.path.substring(1);

          return vscode.workspace
            .openTextDocument(vscode.Uri.file(fullFilePath))
            .then((doc) => {
              vscode.window.showTextDocument(doc).then((editor) => {
                const text = doc.getText();
                const regex = new RegExp(`"(${condition})\\s*:`, "g");
                const match = regex.exec(text);

                if (match) {
                  const index = match.index;
                  const position = doc.positionAt(index);
                  editor.selection = new vscode.Selection(position, position);
                  editor.revealRange(
                    new vscode.Range(position, position),
                    vscode.TextEditorRevealType.InCenter
                  );
                  outputChannel.appendLine(
                    "👉 redirectStep condition to ==> " +
                      String(condition).trim()
                  );
                } else {
                  vscode.window.showInformationMessage(
                    `Key "${condition}" not found`
                  );
                }
              });
            });
        }
      } else {
        vscode.window.showInformationMessage("Please select text with @TABLE");
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.languageId === "json") {
        analyzeDocument(editor);
      }
    })
  );
}

function analyzeDocument(editor) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceFolder) return;
  // const editor = vscode.window.activeTextEditor;

  if (!editor) return;
  const decorations = [];
  const textLines = editor.document.getText().split("\n");

  for (let lineNumber = 0; lineNumber < textLines.length; lineNumber++) {
    const lineText = textLines[lineNumber];
    const matches = [...lineText.matchAll(/@TABLE\.([a-zA-Z0-9_.]+)/g)];

    for (const match of matches) {
      const rawPath = match[1];
      const parts = rawPath.split(".");
      console.log("parts ==> ", parts);
      const checkFile = path.join(...parts.slice(0, 2)) + ".json";
      console.log("checkFile ==> ", checkFile);
      // fs.readFileSync(path.join(parts));
      const dotCount = parts.length - 1;
      const condition = parts[2]?.replace(/[,]/g, "") || "";

      let decorationText = "";
      console.log(
        "path ==> ",
        path.join(workspaceFolder, checkFile),
        fs.existsSync(path.join(workspaceFolder, checkFile))
      );
      if (fs.existsSync(path.join(workspaceFolder, checkFile))) {
        decorationText = `🔄️ redirectStep ➜ ${rawPath.replace(
          /\./g,
          "/"
        )}.json`;
      } else {
        decorationText = `❌ Unable to locate file or condition`;
      }

      const range = new vscode.Range(
        lineNumber,
        match.index,
        lineNumber,
        match.index + match[0].length
      );

      decorations.push({
        range,
        renderOptions: {
          after: {
            contentText: decorationText,
            color: "#888",
            margin: "0 0 0 1em",
          },
        },
      });
    }
  }

  editor.setDecorations(decorationType, decorations);
}

exports.activate = activate;
