const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showValueMessage', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selectedText = editor.document.getText(editor.selection);
                if (selectedText.includes("@TABLE")) {
                    const match = selectedText.match(/@TABLE\.(.+)/);
                    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
                    const parts = match[1].split('.'); // แยก string ตาม .
                    const dotCount = parts.length - 1;
                    // vscode.window.showInformationMessage(dotCount.toString());
                    if (dotCount == 1) {
                        let fileName = ""
                        if(match[1].includes("condition")){
                            dotCount == 1 ? fileName = ".json" : fileName = ""
                        }else{
                            fileName = ".json"
                        }
                        const filePath = workspaceFolder.concat("/",match[1].replace(/\./g, '/'),fileName);
                  
                     vscode.window.showInformationMessage(filePath);
                       return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
                        
                    }else{
                        const filePath = vscode.Uri.file( match[1].split('.').slice(0, -1).join('/') + '.json'); // เอาทุกส่วนที่เป็น path (ยกเว้น object ท้ายสุด)
                        const fullFilePath = workspaceFolder + '/' + filePath.path.substring(1); // ใช้ path ที่แปลงแล้ว
                       
                        const objectKey = parts[parts.length - 1]; // คำสุดท้ายคือ object key

                        // vscode.window.showInformationMessage('Selected object: ' + objectKey);
                         return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(fullFilePath));

                        //  fs.readFile(fullFilePath, 'utf8', (err, data) => {
    
                        //     try {
                        //         const jsonData = JSON.parse(data);
                        //         vscode.window.showInformationMessage(jsonData);
                             
                        //         if (jsonData[objectKey]) {
                        //             // ถ้าเจอ object, ค้นหาตำแหน่งของ object ในไฟล์
                        //             const objectText = JSON.stringify(jsonData[objectKey], null, 2);
                        //             const document = vscode.window.activeTextEditor.document;

                        //             // ค้นหาตำแหน่งของ object ในไฟล์
                        //             const index = document.getText().indexOf(objectText);
                        //             if (index >= 0) {
                        //                 // สร้าง Range ไปยังตำแหน่งที่เจอ
                        //                 const position = document.positionAt(index);
                        //                 const range = new vscode.Range(position, position);
                                        
                        //                 // เลื่อน cursor ไปยังตำแหน่ง
                        //                 vscode.window.activeTextEditor.selection = new vscode.Selection(position, position);
                        //                 vscode.window.activeTextEditor.revealRange(range);
                        //             }
                        //         }                                
                        //     } catch (error) {
                        //         vscode.window.showInformationMessage(error);
                        //     }
                        //  })
                           

          
                    }
                    }
                } else {
                    vscode.window.showInformationMessage('Please select text with @TABLE');
                }
            
        })
    );
}

exports.activate = activate;
