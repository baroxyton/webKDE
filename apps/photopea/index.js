import OSApi from "../../appApi/frontend/api.js";
let api = new OSApi();

api.channel.onevent = async data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            let sure = await api.dialog("confirm", "close potentially unsaved work", ["stay", "close"]);
            if (sure == 1) {
                api.quit();
            }
            break;
    }
}
// Got api data (user, application arguments and all that stuff)
let currentFile;
api.gotData.then(async () => {
    // Render window
    api.done({
        title: "Photopea Intergration",
        icon: "/usr/share/icons/breeze-dark/apps/photolayoutseditor.svg"
    });
    currentFile = api.data.args.location;
    startIframe();
})
async function startIframe() {
    let apidata = {
        environment: {
            "customIO": {
                "open": "app.echoToOE('openFile');",
                "save": "app.activeDocument.saveToOE('png');"
            }
        }
    }
    document.querySelector("iframe").src = "https://photopea.com/#" + encodeURI(JSON.stringify(apidata));
}
window.initIntergration = async function () {
    let fileRaw = (currentFile ? "data:image/png;base64," + btoa((await api.filesystem("read", currentFile)).read().content) : undefined);
    if (fileRaw) {
        document.querySelector("iframe").contentWindow.postMessage("app.open('" + fileRaw + "', '" + currentFile + "')", '*')
    }
}
async function openFile() {
    let location = await api.fileDialog(["*.png", "*.jpg", "*.jpeg", "*.bmp"]);
    currentFile = location;
    let fileRaw = "data:image/png;base64," + btoa((await api.filesystem("read", location)).read().content);
    document.querySelector("iframe").contentWindow.postMessage("app.open('" + fileRaw + "', '" + location + "')", '*');
}
async function saveFile(blob){
    if(!currentFile){
        currentFile = await api.fileDialog(["*.png", "*.jpg", "*.jpeg", "*.bmp"]);
    }
    let filereader = new FileReader()
    filereader.readAsBinaryString(blob);
    filereader.onload = async function(){
        let result = filereader.result;
        api.filesystem("write", currentFile, {content:result});
    }
}
onmessage = function (msg) {
    let data = msg.data;
    if(data == "openFile"){
        openFile();
    }
    if(data instanceof ArrayBuffer){
        let blob = new Blob([data]);
        saveFile(blob);
    }
}