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
                "save":"app.activeDocument.saveToOE('png');"
            }
        }
    }
    document.querySelector("iframe").src = "https://photopea.com/#" + encodeURI(JSON.stringify(apidata));
}
window.initIntergration = async function(){
    let fileRaw = (currentFile ? "data:image/png;base64,"+btoa((await api.filesystem("read", currentFile)).read().content) : undefined);
    if(fileRaw){
    document.querySelector("iframe").contentWindow.postMessage("app.open('"+fileRaw+"', '"+currentFile+"')", '*')
    }
}

onmessage = console.log