"use strict";
import ProgramApi from "../appApi/backend/api.js";
import DesktopMenu from "./menu.js"
// Window manager class

class WebKWin {
    constructor(url, theme) {
        this.url = url;
        this.theme = theme;
        this.position = { x: 100, y: 200 };
        this.render();
        this.addListeners();
    }

    render() {
        if (!this.element) {

            // Create & style elements
            this.contentElement = document.createElement("iframe");
            this.iframeHolder = document.createElement("div");
            this.element = document.createElement("div");
            this.navbar = document.createElement("div");
            let actions = document.createElement("div");
            this.title = document.createElement("div");
            this.cover = document.createElement("div");
            this.icon = document.createElement("div");
            this.toolbar = document.createElement("div");

            this.element.classList.add("kwin");
            this.navbar.classList.add("knavbar");
            this.title.classList.add("kwintitle");
            actions.classList.add("kwinActions");
            this.icon.classList.add("kwinIcon");
            this.iframeHolder.classList.add("iframeHolder");
            this.contentElement.classList.add("programIframe");
            this.cover.classList.add("windowcover");
            this.toolbar.classList.add("toolbar");

            this.contentElement.width = "100%";
            this.contentElement.height = "100%";
            this.contentElement.src = this.url;
            actions.innerHTML = `<div class="minimizeIcon"></div><div class="maximizeIcon"></div><div class="closeIcon"></div>`;
            actions.children[2].addEventListener("mouseup", () => {
                if (!this.api.supported) {
                    this.remove();
                    return;
                }
                this.sigterm()
            });

            // Append elements
            this.navbar.appendChild(actions);
            this.navbar.appendChild(this.icon);
            this.navbar.appendChild(this.title);
            this.element.appendChild(this.navbar);
            this.element.appendChild(this.toolbar);
            this.iframeHolder.appendChild(this.cover);
            this.iframeHolder.appendChild(this.contentElement);
            this.element.appendChild(this.iframeHolder);
            document.getElementById("desktop").appendChild(this.element);

            this.element.style.left = this.position.x + "px";
            this.element.style.top = this.position.y + "px";
        }

        this.api = new ProgramApi("demo", this);
    }
    addListeners() {
        // Mouse down: set initial data for dragging window
        this.navbar.addEventListener("mousedown", event => {
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
            this.resize = null;
            document.body.style.cursor = "default";
            this.cover.style.display = "none";
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
    }
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
    hideToolbar() {
        this.iframeHolder.style.height = "calc(100% - 30px)";
        this.toolbar.style.display = "none";
    }
    sigterm() {
        this.api.sigterm()
    }
    remove() {
        this.element.outerHTML = "";
    }
    enterFullscreen() {
        this.beforeFullscreen = {
            height: this.height,
            width: this.width,
            minHeight: this.minHeight,
            minWidth: this.minWidth,
            maxHeight: this.maxHeight,
            maxWidth: this.maxWidth,
            position: this.position
        }
        this.height = this.minHeight = this.maxHeight = innerHeight;
        this.width = this.innerWidth = this.maxWidth = innerWidth;
        this.position = { x: 0, y: 0 };
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.fullscreen = true;
    }
    exitFullscreen() {
        this.fullscreen = false;
        for(let prop in this.beforeFullscreen) this[prop] = this.beforeFullscreen[prop]
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }
}
let win = new WebKWin("https://playpager.com/embed/checkers/index.html");
window.win = win;

