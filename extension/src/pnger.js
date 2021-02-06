const vscode = require("vscode");
const os = require("os");
const webApp = require("../web_app/app");
const ServingStatus = require("./statusBar");

class PNGER {

  constructor() {
    this.web = null
  }

  /*
   * Ask user to choose a port
   */
  askForPort() {
    // Get the ipv4 else ask the user to access a network
    let ipv4 = this.findIPv4();
    if (!ipv4) {
      // show error in statut bar
      ServingStatus.error();
      vscode.window.showErrorMessage(
        "PNGER : You should be connected to a network to use this exension."
      );
      return;
    }
    // Ask for a port to serve the this.webApp
    vscode.window
      .showInputBox({
        value: "3000", // default port
        prompt: "Please choose a port to serve the app.",
      })
      .then((v) => {
        // Start server and show it's infos if the listening has started, else show error
        this.web = new webApp(ipv4, v);
        if (this.web.start()) {
          console.log(`Server running a http:/${this.web.ipv4}:${this.web.port}/`);
          vscode.window.showInformationMessage(
            `App served at http:/${this.web.ipv4}:${this.web.port}/`
          );
          // show serving status
          ServingStatus.serving();
        } else {
          console.log(`Error`);
          vscode.window.showErrorMessage(`An error has occured!`);
        }
      });
  }

  /*
   * Kill created http server of current instant
   */
  killServer() {
    this.web?.kill();
  }

  /*
   * Get current local IPv4 addresses to be used for accessing our app locally
   */
  findIPv4() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
      let iface = interfaces[devName];

      for (let i = 0; i < iface.length; i++) {
        let alias = iface[i];
        if (
          alias.family === "IPv4" &&
          alias.address !== "127.0.0.1" &&
          !alias.internal
        )
          return alias.address;
      }
    }
    return false;
  }
}

module.exports = new PNGER();
