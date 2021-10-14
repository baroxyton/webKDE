import * as widgets from "./widgets.js";
"use strict";
class Panel {
    constructor(config, panelIndex) {
        this.panelIndex = panelIndex;
        this.widgets = [];
        this.config = config;
        this.render();
    }
    // Render widgets and dimensions from config
    render() {
        this.remove();
        this.removed = false;
        
        this.panelElement = document.createElement("div");
        this.panelElement.panelIndex = this.panelIndex;
        this.panelElement.classList.add("panel");

        this.panelElement.style.height = this.config.height + "px";
        this.panelElement.style.width = this.config.width + "%";
        this.panelElement.style.left = this.config.left + "%";
        this.panelElement.top = this.config.top + "%";
        
        this.config.items.forEach(item => {
            let newWidget = new widgets[item.type](this.panelElement,item.config);
            if (item.styles) {
                newWidget.align(item.styles);
            }
            this.widgets.push(newWidget);
        })
        document.getElementById("desktop").appendChild(this.panelElement, "panels");
    }
    
    remove() {
        this.removed = true;
        if (this.panelElement) {
            this.panelElement.outerHTML = "";
        }
    }
}
export { Panel as default };