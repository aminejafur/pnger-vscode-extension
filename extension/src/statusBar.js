const { window, StatusBarAlignment } = require("vscode");

class ServingStatus {

    constructor() {
        this.item = window.createStatusBarItem(StatusBarAlignment.Right);
        this.served = false;
        this.item.show();
    }

    start() {
        this.item.command = "pnger.start"
        this.item.text = "$(file-symlink-file) Start PNGER.";
    }

    dispose() {
        this.item.dispose();
    }

    stop() {
        this.item.text = "$(debug-disconnect) PNGER: Shutting down...";
        setTimeout(() => {
            this.start();
        }, 500);
    }

    serving() {
        this.item.command = "pnger.stop"
        this.item.text = "$(radio-tower) PNGER: Serving...";
    }

    receiving() {
        this.item.text = "$(new-file) PNGER: Receiving...";
    }

    error() {
        this.item.text = "$(error) PNGER: An error has occured...";
        setTimeout(() => {
            this.start();
        }, 500);
    }

}

module.exports = new ServingStatus();