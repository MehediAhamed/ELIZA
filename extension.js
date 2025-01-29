const vscode = require('vscode');

function activate(context) {
    console.log('Congratulations, your extension "eliza" is now active!');

    const disposable = vscode.commands.registerCommand('eliza.helloWorld', async () => {
        const panel = vscode.window.createWebviewPanel(
            'browserView',
            'Embedded Browser',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const choices = {
            'DeepSeek': 'https://chat.deepseek.com/',
            'You': 'https://you.com/',
            'DeepAI':"https://deepai.org/chat"
        };

        let options = '';
        for (const [key, value] of Object.entries(choices)) {
            options += `<option value="${value}">${key}</option>`;
        }

        const initialUrl = Object.values(choices)[0];

        panel.webview.html = getWebviewContent(options, initialUrl);

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateIframe':
                        panel.webview.html = getWebviewContent(options, message.url);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(options, initialUrl) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Embedded Browser</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                select {
                    margin-bottom: 10px;
                }
                iframe {
                    width: 100%;
                    height: 90vh;
                    border: none;
                }
            </style>
            <meta http-equiv="Content-Security-Policy" content="
                default-src 'none'; 
                frame-src https: data:; 
                script-src 'unsafe-inline' 'unsafe-eval' https:; 
                style-src 'unsafe-inline' https:;">
        </head>
        <body>
            <select id="choices">${options}</select>
            <iframe id="browser" src="${initialUrl}"></iframe>
            <script>
                const vscode = acquireVsCodeApi();
                const select = document.getElementById('choices');
                const iframe = document.getElementById('browser');

                // Set the default selected option
                select.value = '${initialUrl}';
                
                select.addEventListener('change', (event) => {
                    const selectedUrl = event.target.value;
                    iframe.src = selectedUrl;
                    vscode.postMessage({ command: 'updateIframe', url: selectedUrl });
                });
            </script>
        </body>
        </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};