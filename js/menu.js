"use strict";
class DesktopMenu {
    constructor(position, items) {
        this.items = items;
        this.position = position;
        this.render();
        this.addListeners();
    }
    render() {
        this.element = document.createElement("div");
        this.itemElements = [];
        this.submenus = [];
        this.element.classList.add("menu");
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";
        this.items.forEach(item => {
            item.expanded = false;
            let itemElement = document.createElement("div");
            itemElement.addEventListener("mouseup", event => {
                if (event.button != 0||item.submenus) {
                    return;
                }
                if (item.action) {
                    item.action();
                }
                this.remove();
                if(this.parent){
                    this.parent.parentElement.outerHTML = "";
                }
            });
            itemElement.addEventListener("mousemove",event=>{
                if(!item.expanded&&item.submenus){
                    let rect = itemElement.getBoundingClientRect();

                    let positionX =rect.left + rect.width;
                    let positionY = rect.top;
                    item.expanded = true;
                    itemElement.object = item;
                    this.submenus.push(new DesktopSubmenu({x:positionX,y:positionY},item.submenus,itemElement));
                }
            })
            let textElement = document.createElement("div");
            itemElement.classList.add("menuItem");
            textElement.classList.add("menuText");
            textElement.innerText = item.text;
            if (item.icon) {
                let iconElement = document.createElement("div");
                iconElement.classList.add("menuIcon");
                iconElement.innerHTML = "&nbsp;".repeat(5);
                iconElement.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(item.icon))}")`;
                itemElement.appendChild(iconElement);
            }
            itemElement.appendChild(textElement);
            this.element.appendChild(itemElement)
        });
        document.getElementById("desktop").appendChild(this.element);
    }
    addListeners() {
        document.getElementById("desktop").addEventListener("mousedown", event => {
            if (event.target.classList.contains("menu") || event.target.classList.contains("menuItem") || event.target.parentElement.classList.contains("menuItem")) {
                return;
            }
            this.remove();
        });
    }
    remove() {
        this.element.outerHTML = "";
    }
}
class DesktopSubmenu extends DesktopMenu {
    constructor(position, items, parent) {
        super(position, items);
        this.element.style.minWidth = "10vw";
        this.parent = parent;
    }
    addListeners() {
        document.getElementById("desktop").addEventListener("mousemove", event => {
            if (event.target != this.element &&event.target.parentElement != this.element&&event.target.parentElement.parentElement != this.element&& event.target != this.parent&&event.target.parentElement!=this.parent) {
                this.parent.object.expanded = false;
                this.remove()
            }
        })
    }
}
export { DesktopMenu as default };