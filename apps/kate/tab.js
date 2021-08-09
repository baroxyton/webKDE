"use strict";
import { path as pathParser } from "../../linuxCore/lib/path.js";
class Tab {
    constructor(api, path) {
        tabList.push(this);
        this.text = "";
        this.api = api;
        this.path = path;
        this.name = pathParser.basename(this.path || "/prevent/crash");
        if (!this.path) {
            this.name = "Untitled"
        }
        this.unsaved = false;
        this.selected = false;
        this.render();
    }
    select() {
        let currentlySelected = tabList.find(element => element.selected);
        console.log(currentlySelected, tabList);
        currentlySelected?.unselect();
        this.selected = true;
        this.api.resize({
            title: `${this.name} - Kate`
        });
        this.render();
    }
    unselect() {
        console.log("unselect");
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
            this.addListeners();
        }
        if (this.selected) {
            this.element.classList.add("selected");
            this.loadContent();
        }
        else {
            this.element.classList.remove("selected");
        }
    }
    async loadContent() {
        let text = "";
        if (this.unsaved) {
            text = this.text;
        }
        else {
            text = "";
            if (this.path) {
                this.text = text = (await this.api.filesystem("read", this.path)).read().content;
            }
        }
        document.getElementById("input").value = text;
    }
    addListeners() {
        this.element.addEventListener("click", event => {
            this.select();
        });
    }
    remove() {
        this.element.outerHTML = null;
    }
}
export { Tab as default };