"use strict";
import WidgetWindow from "./widgetWindow.js";
import parseDesktopFile from "./parseDesktopFile.js";
import DesktopMenu from "./menu.js";
class Widget {
    constructor(icon, panel, config) {
        this.config = config;
        this.panel = panel;
        this.icon = icon;
        this.render()
    }

    render() {

        this.element = document.createElement("div");
        this.element.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;
        this.element.classList.add("widget");
        this.panel.appendChild(this.element);
        this.element.addEventListener("click", event => this.callAction(event));

        if (this.rendered) {
            setTimeout(()=>this.rendered())
        }
    }

    // Put to correct posititon in panel using configuration
    align(styles) {
        for (let style in styles) {
            this.element.style[style] = styles[style];
        }
    }

    remove() {
        this.removed = true;
        if (this.element) {
            this.element.outerHTML = "";
        }
    }

    // Called when clicking
    callAction(event) {
        if (this.popup) {
            let panelRect = this.panel.getBoundingClientRect();
            new WidgetWindow({ x: this.element.offsetTop, y: panelRect.top }, this.popup, { config: this.config || {} });
            return;
        }
        if (this.action) {
            this.action(event);
        }
    }
}
// Start menu/search widget
export class SearchMenuWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/apps/kde.svg", panel, options);
        this.popup = "file:///usr/share/widgets/startMenu/index.html"
    }
}

// Shortcut icon for AppsWidget
class StarterApp {
    constructor(appLocation, launcherElement, panelIndex) {
        this.appLocation = appLocation;
        this.panelIndex = panelIndex;
        this.launcherElement = launcherElement
        this.parsedApp  = parseDesktopFile(debug.fileapi.internal.read(appLocation));
    }
    render() {
        this.command = this.parsedApp["Desktop Entry"].Exec[0].replace("%U", "");
        this.icon = this.parsedApp["Desktop Entry"].Icon[0];
        this.element = document.createElement("div");
        this.element.classList.add("appLauncherIcon");
        this.element.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;
        this.launcherElement.appendChild(this.element);
        this.addListeners()
    }
    remove() {
        this.removed = true;
        this.element.outerHTML = null;
    }
    addListeners(){
        this.element.addEventListener("click", () => {
            debug.runCommand(this.command)
        });
        this.element.addEventListener("contextmenu", event=>{
            new DesktopMenu({x: event.clientX, y: event.clientY}, [{
                text: "Unpin",
                icon: "/usr/share/icons/breeze-dark/actions/window-unpin.svg",
                action:()=>{
                    let config = JSON.parse(debug.fileapi.internal.read("/home/demo/.config/plasma.json"));
                    let widgetConfig = config.desktop.panels[this.panelIndex].items.find(widget => widget.type == "AppsWidget");
                    widgetConfig.config.apps.splice(widgetConfig.config.apps.indexOf(this.appLocation));
                    debug.fileapi.internal.write("demo", "/home/demo/.config/plasma.json", JSON.stringify(config));
                    this.remove();
                }
            }])
        })
    }
}

// Panel widget with application shortcuts
export class AppsWidget extends Widget {
    constructor(panel, options) {
        super("/", panel, options);
        this.element.classList.add("appWidget")
        this.panel = panel;
        this.options = options;

        // Render shortcut icons
        this.apps = options.apps.map(appData => {
            let app = new StarterApp(appData, this.element, this.panel.panelIndex);
            app.render();
            return app;
        })
    }
    rendered() {
        // Use full height
        this.element.style.height = this.panel.style.height + "px";
        // Adjust width to icons
        this.element.style.width = this.options.apps.length * 42 + "px";
    }
}

// Space
export class SpaceWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    rendered() {
        this.element.style.width = (options.width || "5") + "px";
    }
}

// Digital clock widget
export class ClockWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    updateTime() {
        let date = new Date();
        let minutes = date.getMinutes();
        let hours = date.getHours();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let day = date.getDate()

        // Format date with zeros
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }

        // Time big, date small 
        this.element.innerHTML = `<a style="font-size:1.2em;">${hours}:${minutes}</a><br><a style="font-size:1em;">${day}.${month}.${String(year).slice(-2)}</a>`;
    }
    rendered() {
        this.updateTime();
        this.element.style.width = "auto";
        setInterval(() => this.updateTime(), 1000)
    }
}

// Show desktop widget
class ShowDesktopWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/places/desktop.svg", panel);

    }
}