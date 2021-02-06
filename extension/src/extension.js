const vscode = require("vscode");
const PNGER = require("./pnger");
const ServingStatus = require("./statusBar");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // activation
  console.log('Congratulations, your extension "PNGER" is now active!');
  // vscode.window.showInformationMessage(
  //   'Congratulations, "PNGER" is now active!'
  // );
  // show statusBar
  ServingStatus.start();
  // register our command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "pnger.start",
      () => {
        // check the existing of a workspace, else request it
        if (vscode.workspace.workspaceFolders) {
          // Starting...
          vscode.window.showInformationMessage("PNGER starting...");
          // ask for port and serve the web app
          PNGER.askForPort();
        } else {
          vscode.window.showErrorMessage(
            "PNGER : Please open a project first"
          );
          // show error in statut bar
          ServingStatus.error();
        }
      }
    ),
    vscode.commands.registerCommand(
      "pnger.stop",
      async () => {
        const close = await vscode.window.showInformationMessage('PNGER is going to shutdown.', 'confirm', 'cancel');
        if (close === "confirm") {
          PNGER.killServer() // call kill method of app
          ServingStatus.stop();
        }
      }
    )
  );
}

// exports.activate = activate;

module.exports = {
  activate,
};
