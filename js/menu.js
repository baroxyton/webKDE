"use strict";
class DesktopMenu{
    constructor(position,items){
        this.items = items;
        this.position = position;
        this.render();
        this.addListeners();
    }
    render(){
        this.element = document.createElement("div");
        this.itemElements = [];
        this.element.classList.add("menu");
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";
        this.items.forEach(item => {
            let itemElement = document.createElement("div");
            let textElement = document.createElement("div");
            itemElement.classList.add("menuItem");
            textElement.classList.add("menuText");
            textElement.innerText = item.text;
            if(item.icon){
            let iconElement = document.createElement("div");
            iconElement.classList.add("menuIcon");
            iconElement.innerHTML = "&nbsp;".repeat(5);
            iconElement.style.backgroundImage =  `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(item.icon))}")`;
            itemElement.appendChild(iconElement);
            }
            itemElement.appendChild(textElement);
            this.element.appendChild(itemElement)
        });
        document.getElementById("desktop").appendChild(this.element);
    }
    addListeners(){
        
    }
    remove(){
        this.element.outerHTML = "";
    }
}
export {DesktopMenu as default};