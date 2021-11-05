import OSApi from "../../appApi/frontend/api.js";
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
        if(this.index % 2 == 0){
            this.element.classList.add("dark");
        }
        this.element.innerText = this.data.name;
        document.getElementById("apps").appendChild(this.element);
    }
    select(){
        this.selected = true;
        this.element.classList.add("selected");
    }
    unselect(){
        this.selected = false;
        this.element.classList.remove("selected");
    }
    addListeners(){
        this.element.addEventListener("click", event=>{
            appList.find(app=>app.selected)?.unselect();
            this.select();
        })
    }
}
(async () => {
    let applications = (await api.filesystem("list", "/usr/share/applications")).read().content;
    let appData = await Promise.all(applications.map(async app => {
        let appContent = (await api.filesystem("read", "/usr/share/applications/" + app)).read().content;
        let parsedContent = parseApp(appContent);
        let data = { icon: parsedContent["Desktop Entry"].Icon[0], name: parsedContent["Desktop Entry"].Name[0], exec: parsedContent["Desktop Entry"].Exec[0].replace("%U", file) };
        return data;
    }));
    appData.forEach((app, index)=>new DisplayApp(app, index));
    appList[0].select();
    api.loadIcons();
})()