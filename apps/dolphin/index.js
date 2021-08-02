import OSApi from "../../appApi/frontend/api.js"
import Icon from "./icons.js"
let api = new OSApi();
api.done({
    title: "Dolphin",
    icon: "/usr/share/icons/breeze-dark/apps/system-file-manager.svg"
});
let loadedIcons = [];
async function loadContent(path) {
    if (!path.startsWith("/")) {
        path = "/home/demo/" + path;
    }
    loadedIcons.forEach(icon => icon.remove());
    loadedIcons = []; 
    api.resize({ title: "Dolphin - " + path });
    document.querySelector(".location.selected")?.classList.remove("selected");
    document.querySelector(`[location="${path}"]`)?.classList.add("selected");
    let contents = await api.filesystem("list", path);
    let promises = contents.read().content.map(function (file) {
        return (async file => {
            let icon = new Icon(api, path + "/" + file);
            loadedIcons.push(icon);
            await icon.render();
        })(file)
    });
    await Promise.all(promises);
    api.loadIcons();
}
loadContent("/home/demo");
document.getElementById("location").addEventListener("keyup", event => {
    if (event.key == "Enter") {
        loadContent(event.target.value);
    }
})
api.loadIcons();