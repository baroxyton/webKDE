"use strict";
class Widget{
    constructor(icon,panel){
        this.panel = panel;
        this.icon = icon;
        this.render()
    }
    render(){
        if(this.element){
            this.remove();
        }
        this.element = document.createElement("div");
        this.element.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;
        this.element.classList.add("widget");
        this.panel.appendChild(this.element);
    }
    remove(){
        this.element.outerHTML = "";
    }
    callAction(event){
        if(this.action){
            this.action(event);
        }
    }
}
export class SearchMenuWidget extends Widget{
    constructor(panel){
        super("/usr/share/icons/breeze-dark/apps/kde.svg",panel);

    }
}
class AppsWidget extends Widget{

}
class SpaceWidget extends Widget{

}
class ShowDesktopWidget extends Widget{

}