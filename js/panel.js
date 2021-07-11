"use strict";
class Panel{
    constructor(config){
        this.config = config;
        this.render();
    }
    render(){
        this.panelElement = document.createElement("div");
        this.panelElement.classList.add("panel");
        this.panelElement.style.height = this.config.height + "px";
        this.panelElement.style.width = this.config.width + "%";
        this.panelElement.style.left = this.config.left + "%";
        this.panelElement.top = this.config.top + "%";
        document.getElementById("desktop").appendChild(this.panelElement);
    }
    remove(){

    }
}
export {Panel as default};