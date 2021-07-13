import * as widgets from "./widgets.js"; 
"use strict";
class Panel{
    constructor(config){
        this.widgets = [];
        this.config = config;
        this.render();
    }
    render(){
        this.remove();

        this.panelElement = document.createElement("div");
        this.panelElement.classList.add("panel");
        this.panelElement.style.height = this.config.height + "px";
        this.panelElement.style.width = this.config.width + "%";
        this.panelElement.style.left = this.config.left + "%";
        this.panelElement.top = this.config.top + "%";
        this.config.items.forEach(item=>{
            this.widgets.push(new widgets[item.type](this.panelElement));
        })
        document.getElementById("desktop").appendChild(this.panelElement);
    }
    remove(){
        if(this.panelElement){
        this.panelElement.outerHTML = "";
        }
    }
}
export {Panel as default};