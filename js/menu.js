"use strict";
// Context menu
class DesktopMenu {
    constructor(position, items) {
        this.items = items;
        this.position = position;
        this.render();
        this.addListeners();
    }
    render() {
        // Generate element that contains item elements
        this.element = document.createElement("div");
        this.element.classList.add("menu");

        // Position of click
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";

        this.itemElements = [];
        this.submenus = [];

        // Render all items
        this.items.forEach(item => {
            item.expanded = false;

            let itemElement = document.createElement("div");
            let textElement = document.createElement("div");

            itemElement.classList.add("menuItem");
            textElement.classList.add("menuText");
            textElement.innerText = item.text;

            if (item.icon) {
                let iconElement = document.createElement("div");
                iconElement.classList.add("menuIcon");
                // Hacky way to get space for icons without dealing with painful alignment
                iconElement.innerHTML = "&nbsp;".repeat(5);
                iconElement.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(item.icon))}")`;
                itemElement.appendChild(iconElement);
            }
            // Item was clicked
            itemElement.addEventListener("mouseup", event => {
                // Ignore anything other than leftclick. Ignore, if it's a menu with submenus
                if (event.button != 0 || item.submenus) {
                    return;
                }
                //  Function that is added on initialisation
                if (item.action) {
                    item.action();
                }
                // Close when clicked
                this.remove();
                // If submenu, close parent menu
                if (this.parent) {
                    this.parent.parentElement.outerHTML = "";
                }
            });
            // If element has submenus and mouse is moving on it, expand
            itemElement.addEventListener("mousemove", event => {
                // Make sure it's not expanded already
                if (item.expanded || !item.submenus) {
                    return;
                }
                // Get positions of submenu: ending position of parent
                let rect = itemElement.getBoundingClientRect();

                let positionX = rect.left + rect.width;
                let positionY = rect.top;

                item.expanded = true;
                itemElement.object = item;

                //spawn submenu
                this.submenus.push(new DesktopSubmenu({ x: positionX, y: positionY }, item.submenus, itemElement));
            })
            itemElement.appendChild(textElement);
            this.element.appendChild(itemElement);
        });
        document.body.appendChild(this.element);
    }
    // Close menu when clicking desktop
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
// Submenu class

class DesktopSubmenu extends DesktopMenu {
    constructor(position, items, parent) {
        super(position, items);
        // Submenu is smaller than normal menu
        this.element.style.minWidth = "10vw";
        this.parent = parent;
    }

    addListeners() {
        // Detect moving off element instead of clicking to close submenu
        document.getElementById("desktop").addEventListener("mousemove", event => {
            if (event.target != this.element && event.target.parentElement != this.element && event.target.parentElement.parentElement != this.element && event.target != this.parent && event.target.parentElement != this.parent) {
                this.parent.object.expanded = false;
                this.remove()
            }
        })
    }
}
export { DesktopMenu as default };