const http = require("http");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const ServingStatus = require("../src/statusBar");

// extensions for header
const extensions = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

class WebApp {
  /*
   * Class constructor
   *
   * Ipv4, WebApp IP adresse
   * Port, WebApp port
   * ServerPath, Path to the built app folder
   * Server, Web server
   * ProjectName, Open project name
   * ProjectPath, Open project path
   */
  constructor(ipv4, port = "3000") {
    this.ipv4 = ipv4;
    this.port = port;
    this.serverPath = path.join(__dirname, "/www");
    this.server = http.createServer();
    this.projectName = vscode.workspace.workspaceFolders[0].name;
    this.projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    this.assetsFolders = ['/'];
  }

  async start() {
    await this.getDirectories(this.projectPath);
    // console.log(this.assetsFolders);
    // create the server
    this.server.on(
      "request",
      function (request, response) {
        let { headers, method, url } = request;
        // repalce "/" with "index.html"
        url = url == "/" ? "/index.html" : url;
        // requested file extension
        let ext = path.extname(this.serverPath + url);
        // add remove-bg to API
        response.setHeader(
          "Removebg-Api-Key",
          vscode.workspace.getConfiguration("pnger").RemoveBgApi
        );
        // add discovred folders
        response.setHeader("Workspace-Folders", this.assetsFolders.join("#"));

        // ignore for now
        // response.setHeader("token", "78968526329569526");

        // log the client's request
        console.log("client request URL: ", url);
        // init body
        let data = "";
        request
          .on("error", (err) => {
            //Error
            console.error(err);
            response.statusCode = 400;
            response.end();
          })
          .on("data", (chunk) => {
            // get data
            data += chunk;
          })
          .on("end", async () => {
            // console.log("headers", headers);
            // post only for imgBase64
            if (method === "POST" && url === "/imgBase64") {
              // change statut bar to receiving
              ServingStatus.receiving();

              let message = "Something went wrong";
              await vscode.window.withProgress(
                {
                  location: vscode.ProgressLocation.Notification,
                  title: "Receiving...",
                  cancellable: false,
                }, _ => {
                  return new Promise((resolve, reject) => {
                    // console.log({headers,data});
                    // get base64 img
                    try {
                      data = JSON.parse(data);
                    } catch (e) {
                      reject(new Error('Data format error'))
                    }
                    // @ts-ignore
                    let { filename, folder, imgBase64 } = data;
                    // save image
                    // @ts-ignore
                    if (this.writeFile(filename, folder, imgBase64)) {
                      // @ts-ignore
                      this.changeImgSrc(`${this.assetsFolders[folder]}/${filename}`);
                      // @ts-ignore
                      message = `${this.projectName} : \n ${filename} has been succefully created in '${this.assetsFolders[folder]}'`;
                      resolve(true);
                    } else {
                      message =
                        "Failed to create the image file, please try again or check VS code for more infromations.";
                      // vscode.window.showErrorMessage(message);
                      reject(new Error(message))
                    }
                  }).then(v => {
                    if (v) vscode.window.showInformationMessage(message);
                  }).catch(e => {
                    vscode.window.showErrorMessage(e.message);
                  })
                });
              // back to serving status
              ServingStatus.serving();
              // responding
              response.writeHead(200, { "Content-Type": "application/json" });
              response.end(`{"message": "${message.replace(/(\r\n|\n|\r)/gm, "")}"}`);
            } else if (extensions[ext]) {
              // serve file by it's extensions
              fs.readFile(this.serverPath + url, function (errors, contents) {
                response.writeHead(200, {
                  "Content-Type": extensions[ext],
                  "Content-Length": contents.length,
                });
                response.write(contents);
                response.end();
              });
              //
            } else {
              // response with 404 for any other request
              response.statusCode = 404;
              response.end();
            }
          });
      }.bind(this)
    );

    this.server.listen(this.port);

    return this.server.listening;
  }

  /*
  * kill the server
  */
  kill() {
    this.server.close()
  }

  /*
   * Ask user to choose a port
   */
  changeImgSrc(filename) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((selectedText) => {
        selectedText.replace(editor.selection, `${filename}.png`);
      });
    }
  }

  /*
   * Write image file to disk
   *
   * @param {string} filename, image name.
   * @param {base64} base64, image in base64.
   */
  async writeFile(filename, folder, base64) {
    let src = base64.replace(/^data:image\/png;base64,/, "");

    let writed = false;
    try {
      await fs.writeFile(
        path.join(this.projectPath + this.assetsFolders[folder], `${filename}.png`),
        src,
        { encoding: "base64" },
        (err) => {
          if (err) console.log(err);
          writed = true;
        }
      );
    } catch (error) {
      console.log(error);
    }
    return writed;
  }

  /*
   * Get allowed directories and sub-directories of workspace
   *
   * @param {string} dir, directory to look for sub directories on.
   */
  async getDirectories(dir) {
    let allowed_fodlers = vscode.workspace.getConfiguration("pnger").Folders.split(',');
    await fs.readdirSync(dir).forEach(function (file) {
      file = dir + "/" + file;
      if (fs.statSync(file).isDirectory() && allowed_fodlers.includes(file.split('/').reverse()[0])) {
        this.assetsFolders.push(file.replace(this.projectPath, ""));
        this.getDirectories(file);
      }
    }, this);
  }
}

module.exports = WebApp;
