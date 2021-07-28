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
let config;

class Desktop {
    constructor(config) {

        this.apps = [];
        this.selectedApps = [];
        this.panels = [];

        this.config = config;
        // load current theme from config, with font
        this.theme = new ThemeLoader(linux.fileapi.internal.read("/usr/share/themes/" + this.config.desktop.theme), "data:application/octet-stream;base64," + linux.fileapi.internal.read(this.config.font));
        this.element = document.getElementById("desktop");

        this.render();
        this.addListeners()
    }
    render() {
        this.element.style.backgroundImage = `url("data:image/png;base64,${linux.fileapi.internal.read(this.config.desktop.backgroundimage)}")`;
        this.renderApps();
        this.renderPanels();
    };
    // (re-)render icons on desktop
    renderApps() {
        //clear all icons
        this.apps.forEach(app => app.remove());

        // get list of file names on desktop
        let apps = linux.fileapi.internal.list("/home/demo/Desktop");

        // generate appropriate app elements using the name 
        let preparedApps = apps.map((app, index, apps) => {
            let result = {};
            result.name = app;
            // attempt to set correct icon using mime type
            if (linux.fileapi.internal.readMeta("/home/demo/Desktop/" + app).type == "dir") {
                result.icon = "/usr/share/icons/breeze-dark/places/folder.svg";
            }
            else {
                result.icon = "/usr/share/icons/breeze-dark/mimetypes/" + toMime(app).replace("/", "-") + ".svg";
            }
            //position in desktop grid
            result.position = { x: 0, y: 0 };
            if (this.config.desktop.icons[app]) {
                result.position = this.config.desktop.icons[app].position;
            };
            return result;
        })
        // generate app icons and store them in desktop instance
        preparedApps.forEach(element => {
            this.apps.push(new DesktopApp(element.name, element.icon, element.position, config.apps));
        });
    }
    // grab panels from config and render them
    renderPanels() {
        this.panels.forEach(panel => panel.remove());
        this.config.desktop.panels.forEach(panel => {
            this.panels.push(new Panel(panel));
        })
    }
    // add all event listeners needed
    addListeners() {

        this.element.addEventListener("contextmenu", event => {
            // prevent browser context menu
            event.preventDefault();
            // clicked another element. Let it handle it
            if (event.target != this.element) {
                return;
            }
            // spawn context menu
            new DesktopMenu({ x: event.pageX, y: event.pageY }, [{
                text: 'Create new...',
                icon: "/usr/share/icons/breeze-dark/actions/document-new.svg",
                submenus: [{
                    text: "Folder",
                    icon: "/usr/share/icons/breeze-dark/actions/folder-new.svg",
                    action: () => {
                        let prompt = new WebKWin("/apps/dialog", {
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
                    icon: "/usr/share/icons/breeze-dark/actions/x-shape-text.svg"
                }]
            },
            {
                text: "Open with file manager",
                icon: "/usr/share/icons/breeze-dark/apps/system-file-manager.svg"
            },
            {
                text: "Refresh desktop",
                icon: "/usr/share/icons/breeze-dark/places/desktop.svg",
                action: () => { this.render() }
            }]);
        });
        // track mousedown position to allow drag click selection later

        this.element.addEventListener("mousedown", event => {
            if (event.target == this.element) {
                this.mousedown = true;
                this.mousepos = { x: event.pageX, y: event.pageY };
            }
        });
        // when the mouse is released and the user is performinng drag selection, stop it
        this.element.addEventListener("mouseup", event => {
            this.mousedown = false;
            if (this.drag) {
                this.drag.remove();
                this.drag = null;
            }
        })
        // mouse was moved
        this.element.addEventListener("mousemove", event => {
            // mouse button wasn't down. Nothing to do.
            // Or: bubbled up from other element. Let it handle it.
            if (!this.mousedown || (!this.drag && event.target != this.element && !event.target.classList.contains("desktopdrag"))) {
                return;
            }
            // Not currently utilizing click drag selection. Start to.
            if (!this.drag) {
                this.drag = new DesktopDrag(this.mousepos, { x: event.pageX, y: event.pageY });
            }
            // Currently dragging. Report position change to respective drag instance.
            if (this.drag) {
                this.drag.change({ x: event.pageX, y: event.pageY });
            }
        });
        // Translate various touch events for a (hacky) mobile suppot
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
};
// wait for file system to load and render desktop
linux.fileapi.onready.then(() => {
    // start config and
    config = JSON.parse(linux.fileapi.internal.read("/home/demo/.config/plasma.json"));
    window.desktop = new Desktop(config);
    // set flag to not download filesystem assets on next reload
    localStorage.downloaded = true;
});
