"use strict";
import { path as pathParser } from "../../linuxCore/lib/path.js";
class Tab {
    constructor(api, path) {
        this.api = api;
        this.path = path;
        this.name = pathParser.basename(this.path);
        this.unsaved = false;
        this.selected = false;
        this.render();
    }
    render() {
        if (!this.element) {
            this.element = document.createElement("div");
            this.element.innerText = this.name;
            this.iconElement = document.createElement("div");

            this.iconElement.classList.add("tabIcon");
            this.iconElement.setAttribute("icon", "/usr/share/icons/breeze-dark/actions/window-close.svg");
            this.element.appendChild(this.iconElement);
            this.element.classList.add("tab");

            document.querySelector(".tabs").appendChild(this.element);
            this.api.loadIcons();
        }
        if (this.selected) {
            this.element.classList.add("selected");
        }
    }
    remove() {
        this.element.outerHTML = null;
    }
}
export { Tab as default };