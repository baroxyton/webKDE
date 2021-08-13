"use strict";
import api from "../../appApi/frontend/api.js";
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
        this.render();
    }
    select() {
        let currentlySelected = tabList.find(element => element.selected);
        if (currentlySelected != this) {
            currentlySelected?.unselect();
        }
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
        if (this.removed) {
            return;
        }
        if (!this.element) {
            this.element = document.createElement("div");
            this.element.innerText = this.name;
            this.iconElement = document.createElement("div");
            this.saveElement = document.createElement("div");

            this.iconElement.classList.add("tabIcon");
            this.saveElement.classList.add("saveIcon");
            this.iconElement.setAttribute("icon", "/usr/share/icons/breeze-dark/actions/window-close.svg");
            this.saveElement.setAttribute("icon", "/usr/share/icons/breeze-dark/actions/document-save.svg");
            this.element.appendChild(this.iconElement);
            this.element.appendChild(this.saveElement);
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
        if (this.unsaved) {
            this.element.classList.add("unsaved");
        }
        else {
            this.element.classList.remove("unsaved");
        }
    }
    async loadContent() {
        let text = "";
        if (this.unsaved) {
            text = this.text;
        }
        else {
            if (this.path) {
                this.text = text = (await this.api.filesystem("read", this.path)).read().content;
            }
        }
        console.log("set text to", text);
        document.getElementById("input").value = text;
    }
    addListeners() {
        this.element.addEventListener("click", event => {
            if (event.button != 0) {
                return;
            }
            if (event.target == this.element) {
                this.select();
            }
        });
        this.iconElement.addEventListener("click", event => {
            this.remove();
        })
        document.getElementById("input").addEventListener("keyup", event => {
            console.log(this);
            if (!this.selected) {
                console.log(this.name);
                return;
            }
            this.unsaved = true;
            this.text = event.target.value;
            this.render();
        });
        this.element.addEventListener("contextmenu", event => {
            this.api.menu({ x: event.pageX, y: event.pageY }, [{
                text: "Close Document",
                icon: "/usr/share/icons/breeze-dark/actions/document-close.svg",
                action: () => {this.remove()}
            }, {
                text: "Close other Documents",
                icon: "/usr/share/icons/breeze-dark/actions/document-close.svg",
                action: () => {
                    let otherDocs = tabList.filter(tab=>tab!=this);
                    otherDocs.forEach(tab=>tab.remove());
                },
                seperator:true
            },
            {
                text: "Save",
                icon: "/usr/share/icons/breeze-dark/actions/document-save.svg",
                action: () => this.save()
            }]);
        })
    }
    async remove() {
        if (this.unsaved) {
            let doSave = await this.api.dialog("confirm", "save file", ["Don't save", "Save"]);
            if (doSave) {
                await this.save();
            }
        }
        this.removed = true;
        this.element.outerHTML = null;
        this.unselect();
        tabList.splice(tabList.indexOf(this), 1);
        let tab = tabList[0] || new Tab(this.api);
        tab.select();
    }
    async save() {
        if (!this.unsaved) {
            return;
        }
        if (!this.path) {
            await this.saveAs();
            return;
        }
        this.api.filesystem("write", this.path, { content: this.text });
        this.unsaved = false;
        this.render();
    }
    async saveAs() {
        this.path = await this.api.fileDialog(["*.txt", "*.json"]);
        this.name = pathParser.basename(this.path);
        this.save();
    }
}
export { Tab as default };