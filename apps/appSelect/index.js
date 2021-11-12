import OSApi from "{{file:/usr/lib/api/api.js}}";
import toMime from "{{file:/usr/lib/api/toMime.js}}"
let file = "unknown";
let api = new OSApi();

api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}

// Got api data (user, application arguments and all that stuff)
api.gotData.then(async () => {
    file = api.data.args.file;
    // Render window
    api.done({
        title: "Open file with..",
        icon: "/usr/share/icons/breeze-dark/categories/applications-other.svg"
    });
});
function parseApp(data) {
    let result = {};
    let sections = data.split("\n\n");
    // Iterate over sections
    sections.forEach(section => {
        let sectionData = {};
        let sectionName;
        let sectionParts = section.split("\n");

        // Iterate over data in section
        sectionParts.forEach((sectionPart, index) => {

            // It's the title/name line
            if (index == 0) {
                // Remove the brackets at the start and end
                sectionName = sectionPart.slice(1, -1);
                return;
            }
            // Extract data of current row
            let data = sectionPart.split("=");
            sectionData[data[0]] = data[1].split(";");
        });
        result[sectionName] = sectionData;
    })
    return result;
}
let appList = [];
class DisplayApp {
    constructor(data, index) {
        this.index = index;
        this.data = data;
        appList.push(this);
        this.render();
        this.addListeners();
    }
    render() {
        this.element = document.createElement("div");
        this.element.classList.add("app");
        this.element.setAttribute("icon", this.data.icon);
        if (this.index % 2) {
            this.element.classList.add("dark");
        }
        this.element.innerText = this.data.name;
        document.getElementById("apps").appendChild(this.element);
    }
    select() {
        this.selected = true;
        this.element.classList.add("selected");
    }
    unselect() {
        this.selected = false;
        this.element.classList.remove("selected");
    }
    addListeners() {
        this.element.addEventListener("click", () => {
            appList.find(app => app.selected)?.unselect();
            this.select();
        })
        this.element.addEventListener("dblclick", ()=>{
            window.openWindow();
        })
    }
}
(async () => {
    let applications = (await api.filesystem("list", "/usr/share/applications")).read().content;
    let appData = await Promise.all(applications.map(async (app, index) => {
        let location = "/usr/share/applications/" + applications[index];
        let appContent = (await api.filesystem("read", "/usr/share/applications/" + app)).read().content;
        let parsedContent = parseApp(appContent);
        let data = { icon: parsedContent["Desktop Entry"].Icon[0], name: parsedContent["Desktop Entry"].Name[0], exec: parsedContent["Desktop Entry"].Exec[0].replace("%U", file), location:location };
        return data;
    }));
    appData.forEach((app, index) => new DisplayApp(app, index));
    appList[0].select();
    api.loadIcons();
})()
window.cancelOperation = function () {
    api.quit();
}
window.openWindow = async function () {
    let saveChoice = document.getElementById("always").checked;
    let selectedApplication = appList.find(app => app.selected);
    let applicationLocation = selectedApplication.data.location;
    api.simpleRunCommand(selectedApplication.data.exec);
    if(saveChoice){
        let configFile = "/home/"+api.data.user+"/.config/mime.json";
        let types = JSON.parse((await api.filesystem("read", configFile)).read().content);
        types[toMime(api.data.args.file)] = applicationLocation.split("/").slice(-1)[0].slice(0, -8);
        let modified = JSON.stringify(types);
        api.filesystem("write", configFile, {content:modified});
    }
    api.quit();
}