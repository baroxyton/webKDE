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
            itemElement.addEventListener("mouseup",event=>{item.action(); this.remove()})
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
        document.getElementById("desktop").addEventListener("mousedown",event=>{
            if(event.target.classList.contains("menu")||event.target.classList.contains("menuItem")||event.target.parentElement.classList.contains("menuItem")){
                return;
            }
            this.remove();
        });
    }
    remove(){
        this.element.outerHTML = "";
    }
}
export {DesktopMenu as default};