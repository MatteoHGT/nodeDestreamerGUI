const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require("path");
const child_process = require("child_process");
const fs = require("fs");
var outputDirectory = "videos";
if(!fs.existsSync("./videos"))
    fs.mkdirSync("./videos");
if(!fs.existsSync("./destreamer.js")){
    console.log("You should download destreamer before using this program.")
    app.quit();
}
ipcMain.on('commandExecuted', (event, arg) => {
    if(arg != null && typeof arg === "string")
    {
        arg = JSON.parse(arg);
        let stdOutput = "";
        let stdError = "";
        const childProcessHwnd = child_process.spawn("node", ["destreamer.js", "--username", arg.userName, "--outputDirectory", outputDirectory, "--videoUrls", arg.videoUrls.join(" ")]);
        event.reply('commandExecuted', "destreamer is spawned.");
        childProcessHwnd.stdout.on("data", (chunkData) => {
            stdOutput += chunkData;
        });
        childProcessHwnd.stderr.on("data", (chunkData) => {
            stdError += chunkData;
            stdOutput += chunkData;
        });
        childProcessHwnd.on("close", (code) => {
            if(code != 0)
            {
                console.error(stdError);
                app.quit();
            }
            event.reply('commandExecuted', stdOutput);
        })
    }
});
async function runWindow() {
    var browserWindow = new BrowserWindow({
        width: 680,
        height: 520,
        resizable: false,
        minHeight: 520,
        maxHeight: 520,
        minWidth: 680,
        maxWidth: 680,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    browserWindow.on("will-resize", (event) => {
        event.preventDefault();
    });
    await session.defaultSession.clearStorageData();
    await session.defaultSession.clearCache();
    browserWindow.loadFile('index.html');
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0)
        runWindow();
});
app.whenReady().then(runWindow);