"use strict";
import DesktopApp from "./icons.js";
import Panel from "./panel.js";
import DesktopMenu from "./menu.js";
import toMime from "./toMime.js";
import DesktopDrag from "./desktopDrag.js";
import "./windowmanager.js"
import * as linux from "../linuxCore/index.js";
import ThemeLoader from "./themeparser.js"
import WebKWin from "./windowmanager.js"
import openFile from "./openFile.js"
let config;

// Override appendChild to keep track of z-index
let originalAppend = Element.prototype.appendChild;
Element.prototype.appendChild = function (element, type) {
    if (type && desktop) {
        desktop.zindex.find(layer => layer.name == type).instances.push(element);
    }
    desktop.renderZ && desktop.renderZ();
    return originalAppend.call(this, element);
}

class Desktop {
    constructor(config) {
        window.desktop = this;
        this.apps = [];
        this.selectedApps = [];
        this.panels = [];

        // zindex priority of different elements
        this.zindex = [{
            name: "icons",
            level: 0,
            instances: []
        },
        {
            name: "selection",
            level: 1,
            instances: []
        },
        {
            name: "windows",
            level: 2,
            instances: []
        },
        {
            name: "widgets",
            level: 3,
            instances: []
        },
        {
            name: "covers",
            level: 4,
            instances: []
        },
        {
            name: "panels",
            level: 5,
            instances: []
        },
        {
            name: "menus",
            level: 6,
            instances: []
        }
        ];

        this.config = config;

        // load current theme from config, with font
        this.theme = new ThemeLoader(linux.fileapi.internal.read("/usr/share/themes/" + this.config.desktop.theme), "data:application/octet-stream;base64," + btoa(linux.fileapi.internal.read(this.config.font)));
        this.element = document.getElementById("desktop");
        this.window = WebKWin;
        this.openFile = openFile;
        this.Tty = linux.Tty;
        this.mainTty = linux.mainTty;

        this.render();
        this.addListeners();
    }
    // (Re-)render desktop
    render() {
        this.theme.changeTheme(linux.fileapi.internal.read("/usr/share/themes/" + this.config.desktop.theme));
        this.element.style.backgroundImage = `url("data:image/png;base64,${btoa(linux.fileapi.internal.read(this.config.desktop.backgroundimage))}")`;
        this.renderApps();
        this.renderPanels();
    };

    // (Re-)render icons on desktop
    renderApps() {
        // Clear all currently rendered icons
        this.apps.forEach(app => app.remove());
        this.apps = [];

        // Get list of file names on desktop
        let apps = linux.fileapi.internal.list("/home/demo/Desktop");

        // Generate correct app elements using the name 
        let preparedApps = apps.map((app, index, apps) => {
            let result = {};
            result.name = app;
            let meta = linux.fileapi.internal.readMeta("/home/demo/Desktop/" + app);
            result.meta = meta;

            // Attempt to set correct icon using MIME type
            if (meta.type == "dir") {
                result.icon = "/usr/share/icons/breeze-dark/places/folder.svg";
            }
            else {
                result.icon = "/usr/share/icons/breeze-dark/mimetypes/" + toMime(app).replace("/", "-") + ".svg";
            }

            // Position in desktop grid
            result.position = { x: 0, y: 0 };
            if (this.config.desktop.icons[app]) {
                result.position = this.config.desktop.icons[app].position;
            };
            return result;
        });

        // Generate app icons and store them in desktop instance
        preparedApps.forEach(element => {
            let app = new DesktopApp(element.name, element.icon, element.position, config.apps);
            this.apps.push(app);
        });
    }

    // Grab panels from config and render them
    renderPanels() {
        this.panels.forEach(panel => panel.remove());
        this.panels = [];
        this.config.desktop.panels.forEach(panel => {
            this.panels.push(new Panel(panel));
        })
    }

    // Add all event listeners needed
    addListeners() {

        // Context menu
        this.element.addEventListener("contextmenu", event => {
            event.preventDefault();

            // Not desktop element
            if (event.target != this.element) {
                return;
            }

            // Spawn context menu
            new DesktopMenu({ x: event.pageX, y: event.pageY }, [{
                text: 'Create new...',
                seperator: true,
                icon: "/usr/share/icons/breeze-dark/actions/document-new.svg",
                submenus: [{
                    text: "Folder",
                    icon: "/usr/share/icons/breeze-dark/actions/folder-new.svg",
                    action: () => {
                        let prompt = new WebKWin("file:///usr/share/apps/dialog/index.html", {
                            type: "prompt",
                            subject: "new folder name",
                            buttons: ["Create"],
                            inputText: "New Folder"
                        });
                        prompt.api.channel.onevent = data => {
                            if (data.event == "quit") {
                                let name = data.read();
                                linux.fileapi.internal.mkdir("demo", `/home/demo/Desktop/${name}`);
                                this.renderApps();
                            }
                        }
                    }
                }, {
                    text: "Text Document",
                    icon: "/usr/share/icons/breeze-dark/actions/x-shape-text.svg",
                    action: () => {
                        let prompt = new WebKWin("file:///usr/share/apps/dialog/index.html", {
                            type: "prompt",
                            subject: "new file name",
                            buttons: ["Create"],
                            inputText: "NewFile.txt"
                        });
                        prompt.api.channel.onevent = data => {
                            if (data.event == "quit") {
                                let name = data.read();
                                linux.fileapi.internal.write("demo", `/home/demo/Desktop/${name}`, "");
                                this.renderApps();
                            }
                        }
                    }
                }]
            },
            {
                text: "Open with file manager",
                icon: "/usr/share/icons/breeze-dark/apps/system-file-manager.svg",
                action: () => {
                    new WebKWin("file:///usr/share/apps/dolphin/index.html", {
                        location: "/home/demo/Desktop"
                    })
                }
            },
            {
                text: "Refresh desktop",
                icon: "/usr/share/icons/breeze-dark/places/desktop.svg",
                action: () => { this.render() }
            },
            {
                text: "Properties",
                icon: "/usr/share/icons/breeze-dark/actions/document-properties.svg",
                action: () => {
                    new WebKWin("file:///usr/share/apps/properties/index.html", {
                        path: "/home/demo/Desktop/"
                    })
                }
            }
            ]);
        });

        // Track mousedown event for dragclick selection
        this.element.addEventListener("mousedown", event => {
            if (event.target == this.element) {
                this.mousedown = true;
                this.mousepos = { x: event.pageX, y: event.pageY };
            }
        });

        // Stop drag selection
        this.element.addEventListener("mouseup", () => {
            this.mousedown = false;
            if (this.drag) {
                this.drag.remove();
                this.drag = null;
            }
        })

        // Drag selection
        this.element.addEventListener("mousemove", event => {
            this.mousePosition = { x: event.clientX, y: event.clientY };

            // Mouse not down or wrong element
            if (!this.mousedown || (!this.drag && event.target != this.element && !event.target.classList.contains("desktopdrag"))) {
                return;
            }

            // Start drag selection
            if (!this.drag) {
                this.drag = new DesktopDrag(this.mousepos, this.mousePosition);
            }
            // Track mouse position
            if (this.drag) {
                this.drag.change(this.mousePosition);
            }
        });

        // Mobile support
        window.addEventListener("touchstart", event => {
            document.body.requestFullscreen();
            let clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent("mousedown", true, true, window, 0, event.touches[0].screenX, event.touches[0].screenY, event.touches[0].clientX, event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
        window.addEventListener("touchmove", event => {
            let clickEvent = document.createEvent('MouseEvents');
            this.lastTouch = event;
            clickEvent.initMouseEvent("mousemove", true, true, window, 0, event.touches[0].screenX, event.touches[0].screenY, event.touches[0].clientX, event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
        window.addEventListener("touchend", () => {
            event = this.lastTouch;
            let clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent("mouseup", true, true, window, 0, event.touches[0].screenX, event.touches[0].screenY, event.touches[0].clientX, event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
    }
    // Render Z index of elements
    renderZ() {
        let layers = this.zindex.sort(function (a, b) {
            return a["level"] - b["level"];

        });
        let allElements = [];
        layers.forEach(layer => {
            layer.instances.forEach(instance => {
                instance?.outerHTML && allElements.push(instance);
            })
        });
        allElements.forEach((element, index)=>{
            element.style.zIndex = index;
        })
    }
};

// Render desktop
linux.fileapi.onready.then(() => {
    // Load config
    config = JSON.parse(linux.fileapi.internal.read("/home/demo/.config/plasma.json"));
    new Desktop(config);
    // Flag to prevent needless downloading
    localStorage.downloaded = true;
    console.log("downloaded")
});