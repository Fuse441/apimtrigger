const vscode = require('vscode');

const outputChannel = vscode.window.createOutputChannel("Apim Trigger");
function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.apimTrigger', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                outputChannel.clear(); 
                outputChannel.appendLine("👩🏻‍💻 Apim Trigger Active ! 👩🏻‍💻");
               
                const lineNumber = editor.selection.active.line; // ดึงบรรทัดที่เคอร์เซอร์อยู่
                const lineText = editor.document.lineAt(lineNumber).text;
                // outputChannel.appendLine(String(lineText));
              
                if (lineText.includes("@TABLE")) {
                    const match = lineText.match(/@TABLE\.(.+)/);
                    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
                    const parts = match[1].split('.'); 
                    let condition = ""
                    if(parts.length > 2) {
                        condition = parts[2] 
                        condition = condition.replace(/[,]/g, "")
                    }

                    // console.log("condition ==> ", condition);
                    const dotCount = parts.length - 1;
                    
                    if (dotCount == 1) {
                        let fileName = ""
                      
                        if(match[1].includes("condition")){
                            dotCount == 1 ? fileName = ".json" : fileName = ""
                            
                        }else{
                            fileName = ".json"
                        }
                        
                        const filePath = workspaceFolder.concat("/", match[1].replace(/\./g, "/").replace(/[" ,]/g, ""), fileName);
                        
                        
                        
                      outputChannel.appendLine("👉 redirectStep to ==> " + String(parts).trim());
                    //  vscode.window.showInformationMessage(filePath);
                     outputChannel.show(); 
                       return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
                        
                    }else{
                        const filePath = vscode.Uri.file( match[1].split('.').slice(0, -1).join('/') + '.json'); // เอาทุกส่วนที่เป็น path (ยกเว้น object ท้ายสุด)
                        const fullFilePath = workspaceFolder + '/' + filePath.path.substring(1); // ใช้ path ที่แปลงแล้ว
                       
                        
                        return vscode.workspace.openTextDocument(vscode.Uri.file(fullFilePath)).then((doc) => {
                            vscode.window.showTextDocument(doc).then((editor) => {
                                const text = doc.getText();
                                // console.log("text ==> ", text);
                        
                                // ใช้ Regex หา key ที่ตรงกับ condition
                                const regex = new RegExp(`"(${condition})\\s*:`, "g");
                                const match = regex.exec(text);
                        
                                if (match) {
                                    const index = match.index; // ตำแหน่งที่พบ Key
                                    // console.log("index ==> ", index);
                        
                                    const position = doc.positionAt(index);
                                    // console.log("position ==> ", position);
                                    editor.selection = new vscode.Selection(position, position);
                                    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                                    outputChannel.appendLine("👉 redirectStep condition to ==> " + String(condition).trim());

                                } else {
                                    vscode.window.showInformationMessage(`Key "${condition}" not found`);
                                }
                            });
                        });
                        
                

                        //  return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(fullFilePath));

                        
                           

          
                    }
                    }
                } else {
                    vscode.window.showInformationMessage('Please select text with @TABLE');
                }
            
        })
    );
}

exports.activate = activate;
