"use strict";
import DesktopMenu from "./menu.js";
import WebKWin from "./windowmanager.js";

// Desktop icon
class DesktopApp {
    constructor(name, icon, position, appConfig) {
        this.name = name;
        this.icon = icon;
        this.position = position;
        this.config = appConfig;

        // App container
        this.appHolder = document.getElementById("apps");
        this.render();
    }
    remove() {
        if (this.appElement) {
            this.appElement.outerHTML = "";
        }
        this.removed = true;
    }
    render() {
        this.remove();
        this.removed = false;

        // Create elements
        this.appElement = document.createElement("div");
        this.iconElement = document.createElement("div");
        this.nameElement = document.createElement("div");

        // Add classes for CSS
        this.nameElement.classList.add("appname");
        this.appElement.classList.add("app");
        this.iconElement.classList.add("appicon");

        // Generate icon passed in argument
        this.iconElement.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;

        // Grid system: 
        let iconWidth = (60 * this.config.iconSize);
        let iconHeight = (65 * this.config.iconSize);

        this.appElement.style.width = iconWidth + "px";
        this.appElement.style.height = iconHeight + "px";

        this.appElement.style.left = /*screen start margin*/ 5 + (iconWidth * /*grid position times icon size*/ this.position.x) + (/*margin and padding of each icon*/40 * this.position.x) + "px";
        this.appElement.style.top = /*screen start margin*/ 5 + (iconHeight * /*grid position times icon size*/ this.position.y) + (/*margin and padding of each icon*/ 40 * this.position.y) + "px";

        this.nameElement.innerText = this.name;

        // Load icon config
        this.nameElement.style.fontSize = this.config.fontSize;
        this.nameElement.style.color = this.config.fontColor;

        // Append elements to the desired parent
        this.appElement.appendChild(this.iconElement);
        this.appElement.appendChild(this.nameElement);
        this.appHolder.appendChild(this.appElement, "icons");
        this.addListeners();
    }
    // Highlight app on click
    select() {
        this.appElement.classList.add("selectedapp");
    }
    unselect() {
        this.appElement.classList.remove("selectedapp");
    }

    addListeners() {
        // After render, reset event data
        this.mousedown = false;

        // Icon context menu
        this.appElement.addEventListener("contextmenu", event => {
            new DesktopMenu({ x: event.pageX, y: event.pageY }, [{
                text: "Open",
                icon: "/usr/share/icons/breeze-dark/actions/quickopen-file.svg",
                action: () => {
                    desktop.openFile("/home/demo/Desktop/" + this.name)
                }
            },
            {
                text: "Open with..",
                icon: "/usr/share/icons/breeze-dark/categories/applications-other.svg",
                seperator: true,
                action: () => {
                    new desktop.window("file:///usr/share/apps/appSelect/index.html", { file: "/home/demo/Desktop/" + this.name });
                }
            },
            {
                text: "Rename..",
                icon: "/usr/share/icons/breeze-dark/actions/edit-rename.svg",
                action: () => {
                    let namePrompt = new WebKWin("file:///usr/share/apps/dialog/index.html", {
                        type: "prompt",
                        subject: "new file name",
                        buttons: ["Rename"],
                        inputText: this.name
                    });
                    namePrompt.api.channel.onevent = data => {
                        if (data.event != "quit") {
                            return;
                        }
                        let newName = data.read();
                        debug.fileapi.internal.move("/home/demo/Desktop/" + this.name, "/home/demo/Desktop/" + newName);
                        this.name = newName;
                        this.render();
                    }
                }
            }, {
                text: "Delete",
                icon: "/usr/share/icons/breeze-dark/actions/edit-delete.svg",
                seperator: true,
                action: () => {
                    let confirm = new WebKWin("file:///usr/share/apps/dialog/index.html", {
                        type: "confirm",
                        subject: "permanently delete " + this.name,
                        buttons: ["Don't delete", "<a style='color:red'>Delete</a>"]
                    });
                    confirm.api.channel.onevent = data => {
                        if (data.event != "quit") {
                            return;
                        }
                        if (data.read() == "1") {
                            debug.fileapi.internal.delete("/home/demo/Desktop/" + this.name);
                            this.remove();
                        }
                    }
                }
            }, {
                text: "Properties",
                icon: "/usr/share/icons/breeze-dark/actions/document-properties.svg",
                action: () => {
                    new WebKWin("file:///usr/share/apps/properties/index.html", {
                        path: "/home/demo/Desktop/" + this.name
                    })
                }
            }]);
        })

        // Highlight app on click
        this.appElement.addEventListener("mousedown", event => {
            this.mousedown = true;
            desktop.apps.forEach(app => app.unselect());
            this.mousedownPosition = { x: event.pageX - this.appElement.offsetLeft, y: event.pageY - this.appElement.offsetTop }
            this.select();
        });

        // Stop dragging
        this.appElement.addEventListener("mouseup", event => {
            this.mousedown = false;
            if (this.moving) {
                this.stopMoving();
            }
        });

        // Remove highlighting
        document.getElementById("desktop").addEventListener("mouseup", event => {
            if (this.removed) {
                return;
            }
            this.mousedown = null;
            if (this.moving) {
                this.stopMoving();
            }
            if (event.target.id != "desktop") {
                return;
            }
            this.unselect();
        })

        // Move icon on click drag
        this.appElement.addEventListener("mousemove", async event => {
            if (!this.mousedown) {
                return;
            }
            this.moving = true;
            this.movePosition = { x: event.pageX, y: event.pageY };
            this.appElement.style.left = (event.pageX - this.mousedownPosition.x) + "px";
            this.appElement.style.top = (event.pageY - this.mousedownPosition.y) + "px";
        });
        document.getElementById("desktop").addEventListener("mousemove", async event => {
            if (this.removed) {
                return;
            }
            if (!this.mousedown) {
                return;
            }
            this.movePosition = { x: event.pageX, y: event.pageY };
            this.appElement.style.left = (event.pageX - this.mousedownPosition.x) + "px";
            this.appElement.style.top = (event.pageY - this.mousedownPosition.y) + "px";
        });
        this.appElement.addEventListener("dblclick", () => {
            desktop.openFile("/home/demo/Desktop/" + this.name)
        });
    }

    // Stop moving, place app in grid
    stopMoving() {
        let iconWidth = (60 * this.config.iconSize);
        let iconHeight = (65 * this.config.iconSize);

        this.moving = false;
        this.position.x = Math.round((this.movePosition.x + 5 - this.mousedownPosition.x) / (40 + iconWidth));
        this.position.y = Math.round((this.movePosition.y + 5 - this.mousedownPosition.y) / (40 + iconHeight));

        desktop.config.desktop.icons[this.name] = { position: { x: this.position.x, y: this.position.y } };
        debug.fileapi.internal.write("demo", "/home/demo/.config/plasma.json", JSON.stringify(desktop.config));
        this.render();
    }
};
export { DesktopApp as default };