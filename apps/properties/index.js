import OSApi from "{{file:/usr/lib/api/api.js}}";
import toMime from "{{file:/usr/lib/api/toMime.js}}";
let api = new OSApi();
api.gotData.then(async function () {
    let filePath = api.data.args.path;
    let meta = await api.filesystem("readMeta",filePath);
    await loadData(filePath,meta.read().content);
    show(filePath);
});
let show = (path) => {
    api.done({
        title: "Properties of " + path,
        icon: "/usr/share/icons/breeze-dark/actions/gtk-properties.svg",
        minHeight: innerHeight*2,
        minWidth: innerWidth
    });
}
async function getSize(file){
    console.log(file);
    let byteSize = JSON.stringify((await api.filesystem("read", file)).data.content).length;
    let stringSize = byteSize + "B";
    if(byteSize > 1000){
        stringSize = (byteSize/1000).toFixed(1) + "KB";
    }
    if(byteSize > 10e5){
        stringSize = (byteSize/10e5).toFixed(1) + "MiB";
    }
    if(byteSize > 10e8){
        stringSize = (byteSize/10e8).toFixed(1) + "GB";
    }
    return stringSize;
}
async function loadData(filepath,meta) {
    let mime  = toMime(filepath);
    let iconPath = `/usr/share/icons/breeze-dark/mimetypes/`+mime.replace("/","-") + ".svg";
    if(meta.type == "dir"){
        iconPath = "/usr/share/icons/breeze-dark/places/folder.svg";
    }
    let iconContent = await api.filesystem("read",iconPath);
    let iconUrl = `data:image/svg+xml;base64,${btoa(iconContent.read().content)}`;
    document.getElementById("fileName").innerText = `Name: ${filepath.split("/").slice(-1)}`;
    document.getElementById("fileType").innerText = `Mime Type: ${mime}`;
    document.getElementById("filePermission").innerText = `File Permission: ${meta.permission.join("")}`;
    document.getElementById("fileOwner").innerText = `Owner: ${meta.owner}`;
    document.getElementById("fileSize").innerText = `Size: ${await getSize(filepath)}`
    document.getElementById("typeImage").style.backgroundImage = `url("${iconUrl}")`;
}
window.quit = (data)=>api.quit(data);
api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}