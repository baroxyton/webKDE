"use strict";
import ProgramApi from "../appApi/backend/api.js";
import DesktopMenu from "./menu.js"
import { checkPermission } from "../linuxCore/components/checkPermission.js"
import toMime from "./toMime.js";

// Window manager class
class WebKWin {
    constructor(url, args) {
        this.isFocused = false;
        let urlData = new URL(url, String(location));
        if (urlData.protocol == "javascript:") {
            console.log("prevented xss!");
            url = "https://en.wikipedia.org/wiki/Xss";
        }
        if (urlData.protocol == "file:") {
            url = this.loadLocalFile(urlData.pathname);
        }
        this.args = args || {};
        this.url = url;
        this.position = desktop.mousePosition;
        this.render();
        this.addListeners();
    }

    loadLocalFile(path) {
        let file = debug.fileapi.internal.getFile(path);
        if (file instanceof Error || file.meta.type == "dir" || !checkPermission("demo", file, "r")) {
            return "data:text/html,";
        }
        return `data:${toMime(path)};base64,${btoa(file.content.replaceAll(/\{\{file\:(.*?)\}\}/g, (_, location) => {
            return this.loadLocalFile(location, true);
        }))}`;
    }

    render() {
        if (!this.element) {

            // Create & style elements
            this.contentElement = document.createElement("iframe");
            this.iframeHolder = document.createElement("div");
            this.element = document.createElement("div");
            this.navbar = document.createElement("div");
            this.actions = document.createElement("div");
            this.title = document.createElement("div");
            this.cover = document.createElement("div");
            this.icon = document.createElement("div");
            this.toolbar = document.createElement("div");

            this.element.classList.add("kwin");
            this.navbar.classList.add("knavbar");
            this.title.classList.add("kwintitle");
            this.actions.classList.add("kwinActions");
            this.icon.classList.add("kwinIcon");
            this.iframeHolder.classList.add("iframeHolder");
            this.contentElement.classList.add("programIframe");
            this.cover.classList.add("windowcover");
            this.toolbar.classList.add("toolbar");

            this.contentElement.width = "100%";
            this.contentElement.height = "100%";
            this.contentElement.src = this.url;
            this.actions.innerHTML = `<div class="minimizeIcon"></div><div class="maximizeIcon"></div><div class="closeIcon"></div>`;

            // Append elements
            this.navbar.appendChild(this.actions);
            this.navbar.appendChild(this.icon);
            this.navbar.appendChild(this.title);
            this.element.appendChild(this.navbar);
            this.element.appendChild(this.toolbar);
            this.iframeHolder.appendChild(this.cover);
            this.iframeHolder.appendChild(this.contentElement);
            this.element.appendChild(this.iframeHolder);
            document.getElementById("desktop").appendChild(this.element, "windows");
            this.api = new ProgramApi("demo", this);
            this.element.style.left = this.position.x + "px";
            this.element.style.top = this.position.y + "px";

        }
    }
    addListeners() {
        this.cover.addEventListener("mouseup", event => {
            if (event.button == 0) {

                event.target.style.display = "none";
            }
        });
        this.actions.children[1].addEventListener("mouseup", () => this.toggleFullscreen())
        this.actions.children[2].addEventListener("mouseup", () => {
            if (!this.api.supported) {
                this.remove();
                return;
            }
            this.sigterm()
        });
        // Mouse down: set initial data for dragging window
        this.navbar.addEventListener("contextmenu", event=>{
            let x = event.clientX;
            let y = event.clientY;
            new DesktopMenu({x,y}, [{
                text:"Close",
                icon:"/usr/share/icons/breeze-dark/actions/gtk-close.svg",
                action:()=>{
                    if (!this.api.supported) {
                        this.remove();
                        return;
                    }
                    this.sigterm()
                },
                seperator:true
            },
        {
            text:"Maximize/Restore",
            icon:"/usr/share/icons/breeze-dark/actions/view-fullscreen.svg",
            action:()=>{
                this.toggleFullscreen();
            }
        }])
        })
        this.navbar.addEventListener("mousedown", event => {
            if(event.button !== 0){
                return;
            }
            if (this.fullscreen) {
                return;
            }
            // Change cursor icon
            this.navbar.style.cursor = "grab";

            // Calculate position relative to element
            this.mousePos = { x: event.pageX - this.position.x, y: event.pageY - this.position.y };

            // Cover iframe
            this.cover.style.display = "flex";
        });

        // Mouse move: drag & resize window
        document.body.addEventListener("mousemove", event => {
            if (this.removed) {
                return;
            }
            if (this.mousePos) {
                this.position = { x: event.pageX - this.mousePos.x, y: event.pageY - this.mousePos.y };
                this.element.style.left = this.position.x + "px";
                this.element.style.top = this.position.y + "px";
            }
            if (this.resize) {

                // Change width of kwin element
                if (this.resize[0] == 1) {
                    if (event.pageX - this.position.x > this.maxWidth || event.pageX - this.position.x < this.minWidth) {
                        return;
                    }
                    this.width = event.pageX - this.position.x;
                    this.element.style.width = this.width + "px";
                }

                // Change height of kwin element
                if (this.resize[1] == 1) {
                    if (event.pageY - this.position.y > this.maxHeight || event.pageY - this.position.y < this.minHeight) {
                        return;
                    }
                    this.height = event.pageY - this.position.y;
                    this.element.style.height = this.height + "px";
                }

                // Change start x position & width
                if (this.resize[0] == -1) {
                    if (this.width - (event.pageX - this.position.x) > this.maxWidth || this.width - (event.pageX - this.position.x) < this.minWidth) {
                        return;
                    }
                    this.width = this.width - (event.pageX - this.position.x);
                    this.position.x = event.pageX;
                    this.element.style.left = this.position.x + "px";
                    this.element.style.width = this.width + "px";
                }
                // Change start y position & height
                if (this.resize[1] == -1) {
                    if (this.height - (event.pageY - this.position.y) > this.maxHeight || this.height - (event.pageY - this.position.y) < this.minHeight) {
                        return;
                    }
                    this.height = this.height - (event.pageY - this.position.y);
                    this.position.y = event.pageY;
                    this.element.style.top = this.position.y + "px";
                    this.element.style.height = this.height + "px";
                }
            }
        });
        document.body.addEventListener("mouseup", event => {
            if (this.removed) {
                return;
            }
            if (this.resize) {
                this.resize = null;
                document.body.style.cursor = "default";
                this.cover.style.display = "none";
            }
        });

        // Resize window
        /*
                Directions:
        
                      North
                        |
                  NW    |    NE
                        |      
            West ---------------- East
                        |
                  SW    |    SE
                        |
                      South
        
        */
        document.body.addEventListener("mousedown", event => {
            if (this.removed) {
                return;
            }
            // Resize box
            let pixelsIn = 2;
            let pixelsAround = 5;

            // Test if click was within our window drag area

            // Corner coords
            let ax = this.position.x - pixelsAround, ay = this.position.y - pixelsAround, bx = this.position.x - pixelsAround, by = this.position.y + this.height + pixelsAround, dx = this.position.x + this.width + pixelsAround, dy = this.position.y - pixelsAround;

            let x = event.pageX, y = event.pageY;
            let bax = bx - ax, bay = by - ay, dax = dx - ax, day = dy - ay;

            let isInArea = !(((x - ax) * bax + (y - ay) * bay < 0.0) || ((x - bx) * bax + (y - by) * bay > 0.0) || ((x - ax) * dax + (y - ay) * day < 0.0) || ((x - dx) * dax + (y - dy) * day > 0.0));

            if (!isInArea) {
                //exit
                return;
            }
            // Prevent desktop dragclick selection

            desktop.mousedown = null;

            // Top left corner
            if ((this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) && (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nwse-resize";
                this.resize = [-1, -1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Top right corner
            if (((this.position.x + this.width) - event.pageX < pixelsAround && (this.position.x + this.width) - event.pageX > -pixelsIn) && (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn)) {
                // North-East -> South-West
                document.body.style.cursor = "nesw-resize";
                this.resize = [1, -1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Bottom left corner
            if ((this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) && ((this.position.y + this.height) - event.pageY < pixelsAround && (this.position.y + this.height) - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nesw-resize";
                this.resize = [-1, 1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Bottom right corner
            if (((this.position.x + this.width) - event.pageX < pixelsAround && (this.position.x + this.width) - event.pageX > -pixelsIn) && ((this.position.y + this.height) - event.pageY < pixelsAround && (this.position.y + this.height) - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nwse-resize";
                this.resize = [1, 1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Left side
            if (this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) {
                // East -> West
                document.body.style.cursor = "ew-resize";
                this.resize = [-1, 0];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Right side
            if ((this.position.x + this.width) - event.pageX < pixelsAround && (this.position.x + this.width) - event.pageX > -pixelsIn) {
                // East -> West
                document.body.style.cursor = "ew-resize";
                this.resize = [1, 0];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Top
            if (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn) {
                // North -> South
                document.body.style.cursor = "ns-resize";
                this.resize = [0, -1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }

            // Bottom
            if ((this.position.y + this.height) - event.pageY < pixelsAround && (this.position.y + this.height) - event.pageY > -pixelsIn) {
                // North -> South
                document.body.style.cursor = "ns-resize";
                this.resize = [0, 1];
                event.preventDefault();
                // Cover iframe
                this.cover.style.display = "flex";
                return;
            }
        })
        this.navbar.addEventListener("mouseup", event => {
            this.navbar.style.cursor = "default";
            this.mousePos = null;
        });
        this.element.addEventListener("mousedown", event => {
            this.contentElement.focus();
        })
        
        // Focused window, but not iframe: simulate keydown via api
        document.body.addEventListener("keydown", event => {
            if (this.removed || !this.focused) {
                return;
            }
        
            // Filter out unsendable properties
            let filteredEvent = {};
            for (let eventKey in event) {
                let eventValue = event[eventKey];
                if (typeof eventValue == "object" || typeof eventValue == "function") {
                    continue;
                }
                filteredEvent[eventKey] = eventValue;
            }
            this.api.channel.write("keypress", { event: filteredEvent });
        });
    
        // Focus/unfocus window
        document.body.addEventListener("mousedown", event => {
            if (this.removed) {
                return;
            }
            if (this.element.contains(event.target)) {
                if (!this.focused) {
                    this.focus();
                }
            }
            else {
                if (this.focused) {
                    this.unfocus();
                }
            }
        })
    }

    // Show toolbar of window with options
    showToolbar(data) {
        if (data) {
            this.toolbar.innerHTML = "";
            let elements = data.map(data => {
                let element = document.createElement("div");
                element.classList.add("toolbarItem");
                element.innerText = data.name;
                let items = data.items.map(item => {
                    item.submenus = null;
                    item.action = () => {
                        this.api.channel.write(item.event, true);
                    };
                    return item;
                });
                element.addEventListener("mousedown", event => {
                    let rect = element.getBoundingClientRect();
                    setTimeout(() => new DesktopMenu({ x: rect.left, y: rect.bottom }, items), 10);
                });
                return element;
            });
            elements.forEach(element => this.toolbar.appendChild(element));
        }
        this.iframeHolder.style.height = "calc(100% - 55px)";
        this.toolbar.style.display = "block";
    }

    // Hide the toolbar
    hideToolbar() {
        this.iframeHolder.style.height = "calc(100% - 30px)";
        this.toolbar.style.display = "none";
    }

    // Tell program to selfterminate
    sigterm() {
        this.api.sigterm()
    }

    remove() {
        this.removed = true;
        this.element.outerHTML = "";
    }

    enterFullscreen() {
        // Backup inital window geometry. Set geometry to fullscreen
        let height = innerHeight - (desktop.panels[0].panelElement.offsetHeight + 0);
        this.beforeFullscreen = {
            height: this.height,
            width: this.width,
            minHeight: this.minHeight,
            minWidth: this.minWidth,
            position: this.position
        }
        this.height = this.minHeight = this.maxHeight = height;
        this.width = this.innerWidth = this.maxWidth = innerWidth;
        this.position = { x: 0, y: 0 };
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.fullscreen = true;
    }

    exitFullscreen() {
        // Restore window geometry
        this.fullscreen = false;
        for (let prop in this.beforeFullscreen) this[prop] = this.beforeFullscreen[prop]
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }

    toggleFullscreen() {
        this.fullscreen ? this.exitFullscreen() : this.enterFullscreen();
    }

    // Show menu popup from within application. Called by api
    menu(data) {
        console.log(data);
        let position = data.position;
        let rect = this.contentElement.getBoundingClientRect()
        position.x += rect.left;
        position.y += rect.top;
        let items = data.items.map(item => {
            if(!item){
                return;
            }
            item.submenus = null;
            item.action = () => {
                this.api.channel.write(item.event, true);
            };
            return item;
        });
        new DesktopMenu(position, items);
        this.cover.style.display = "flex";
    }

    focus() {
        this.focused = true;
        this.element.classList.add("focused");
        this.setHighest();
    }

    unfocus() {
        this.focused = false;
        this.element.classList.remove("focused");
    }

    // Set to highest window
    setHighest() {
        let items = desktop.zindex.find(element => element.name == "windows").instances;
        items.push(items.splice(items.indexOf(this.element), 1)[0]);
        desktop.renderZ()
    }
}
window.win = WebKWin;
export { WebKWin as default };
