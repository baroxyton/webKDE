import OSApi from "../../appApi/frontend/api.js"
import toMime from "/js/toMime.js"
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
    document.getElementById("typeImage").style.backgroundImage = `url("${iconUrl}")`;
}