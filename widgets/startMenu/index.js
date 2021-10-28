//import OSApi from "../../appApi/frontend/api.js"
import OSApi from "{{file:/usr/lib/api/api.js}}";
let api = new OSApi();
let categories = [
    "education",
    "engeineering",
    "system",
    "development",
    "internet",
    "games",
    "office",
    "graphics",
    "all",
    "utilities",
    "multimedia",
    "science",
    "network",
    "other"
];
let assignedApplications = {};
let renderedCategories = [];
let renderedApps = [];
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
class App {
    constructor(appData) {
        this.appData = appData;
        renderedApps.push(this);
        this.render();
        this.addListeners();
    }
    render() {
        this.element = document.createElement("div");
        this.element.setAttribute("icon", this.appData.icon);
        this.element.classList.add("app");
        this.element.innerText = this.appData.name;
        document.querySelector(".content").appendChild(this.element);
    }
    remove() {
        this.element.outerHTML = "";
        renderedApps.splice(renderedApps.indexOf(this), 1);
    }
    addListeners() {
        this.element.addEventListener("click", event => {
            api.simpleRunCommand(this.appData.cmd.replaceAll(" %U", ""));
            api.quit();
        });
        this.element.addEventListener("contextmenu", event => {
            api.menu({ x: event.clientX, y: event.clientY }, [{
                text: "Run",
                icon: "/usr/share/icons/breeze-dark/actions/gtk-execute.svg",
                action: () => {
                    api.simpleRunCommand(this.appData.cmd.replaceAll(" %U", ""));
                }
            }, {
                text: "Pin to panel",
                icon: "/usr/share/icons/breeze-dark/actions/pin.svg",
                action: async () => {
                    let config = JSON.parse((await api.filesystem("read", "/home/demo/.config/plasma.json")).read().content);
                    console.log(config);
                    config.desktop.panels[0].items.find(item=>item.type == "AppsWidget").config.apps.push(this.appData.location);
                    await api.filesystem("write", "/home/demo/.config/plasma.json", {content:JSON.stringify(config)});
                    this.remove();
                }
            }])
        })
    }
}
class Category {
    constructor(category) {
        this.category = category;
        this.selected = false;
        renderedCategories.push(this);
        this.render();
        this.addListeners()
    }
    render() {
        this.element = document.createElement("div");
        this.element.setAttribute("icon", "/usr/share/icons/breeze-dark/actions/arrow-right.svg");
        this.element.classList.add("categoryElement");
        this.iconElement = document.createElement("div");
        this.iconElement.classList.add("categoryIcon")
        this.iconElement.setAttribute("icon", `/usr/share/icons/breeze-dark/categories/applications-${this.category}.svg`);
        this.iconElement.innerHTML = "&nbsp;".repeat(5)
        this.element.innerHTML = this.iconElement.outerHTML + this.category;
        document.getElementById("categories").appendChild(this.element);
    }
    addListeners() {
        this.element.addEventListener("click", e => this.select());
        this.element.addEventListener("mouseover", e => this.select());
    }
    select() {
        if (this.selected) {
            return;
        }
        renderedCategories.find(category => category.unselect())
        this.selected = true;
        this.element.classList.add("selected");
        this.renderApps();
    }
    unselect() {
        this.selected = false;
        this.element.classList.remove("selected");
        renderedApps.forEach(app => app.remove());
    }
    remove() {
        this.element.outerHTML = "";
        renderedCategories.splice(renderedCategories.indexOf(this), 1);
    }
    renderApps() {
        let apps = assignedApplications[this.category];
        apps.forEach(app => new App(app));
        api.loadIcons();
    }
}
async function updateApps() {
    assignedApplications = {};
    renderedCategories.forEach(category => category.remove());
    let appData = [];
    let appList = (await api.filesystem("list", "/usr/share/applications")).read().content;
    appData = await Promise.all(appList.map(async app => (await api.filesystem("read", "/usr/share/applications/" + app)).read().content));
    appData.forEach((data, index) => {
        let parsedFile = parseApp(data);
        let location = "/usr/share/applications/" + appList[index];
        let name = parsedFile["Desktop Entry"].Name[0];
        let cmd = parsedFile["Desktop Entry"].Exec[0];
        let icon = parsedFile["Desktop Entry"].Icon[0];
        let fileCategories = parsedFile["Desktop Entry"].Categories || [];
        let app = { name, cmd, icon, location };
        categories.forEach(category => {
            if (fileCategories.includes(category) || category == "all") {
                assignedApplications[category] = assignedApplications[category] || [];
                assignedApplications[category].push(app);
            }
        });
    });
    filterApps();
    Object.keys(assignedApplications).forEach(category => new Category(category));
    api.loadIcons();
}

function filterApps() {
    renderedApps.forEach(app => {
        if (app.appData.name.toLowerCase().includes(document.getElementById("search").value.toLowerCase())) {
            app.element.style.display = 'grid';
        }
        else {
            app.element.style.display = 'none';
        }
    })
}

document.getElementById("search").addEventListener("keyup", filterApps);
// Got api data (user, application arguments and all that stuff)
api.loadIcons()
api.gotData.then(async () => {
    // Render window
    api.done();
});
updateApps();