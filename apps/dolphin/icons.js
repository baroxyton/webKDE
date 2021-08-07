"use strict";
import api from "../../appApi/frontend/api.js";
import getMime from "../../js/toMime.js"
class Icon {
    constructor(api, name) {
        this.name = name;
        this.api = api;
    }
    async render() {
        this.element = document.createElement("div");
        this.textElement = document.createElement("div");
        this.iconElement = document.createElement("div");

        this.element.classList.add("icon");
        this.textElement.classList.add("iconText");
        this.iconElement.classList.add("iconImage");

        this.textElement.innerText = this.name.split("/").slice(-1);
        let meta = (await this.api.filesystem("readMeta", this.name)).read().content;
        if (meta.type == "dir") {
            this.iconElement.setAttribute("icon", `/usr/share/icons/breeze-dark/places/folder.svg`);
        }
        else {
            this.iconElement.setAttribute("icon", `/usr/share/icons/breeze-dark/mimetypes/${getMime(this.name).replace("/", "-")}.svg`);
        }

        this.element.appendChild(this.iconElement);
        this.element.appendChild(this.textElement);

        document.getElementById("content").appendChild(this.element);
        this.addListeners();
    }
    remove() {
        this.element.outerHTML = "";
    }
    addListeners() {
        this.element.addEventListener("contextmenu", event => {
            this.api.menu({ x: event.pageX, y: event.pageY },
                [{
                    text: "Delete",
                    icon: "/usr/share/icons/breeze-dark/actions/edit-delete.svg",
                    action: () => {
                        this.api.filesystem("delete", this.name);
                        loadContent(this.name.split("/").slice(0, -1).join("/"));
                    }
                },
            {
                text:"Properties",
                icon:"/usr/share/icons/breeze-dark/actions/document-properties.svg",
                action:()=>{
                    this.api.spawnWindow("/apps/properties",{path:this.name});
                }
            }]);
        })
    }
}
export { Icon as default };