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
            if(!item){
                return;
            }
            item.expanded = false;

            let itemElement = document.createElement("div");
            let textElement = document.createElement("div");

            itemElement.classList.add("menuItem");
            textElement.classList.add("menuText");
            textElement.innerText = item.text;

            if (item.icon) {
                let iconElement = document.createElement("div");
                iconElement.classList.add("menuIcon");

                // Empty space for icon
                iconElement.innerHTML = "&nbsp;".repeat(5);
                iconElement.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(item.icon))}")`;
                itemElement.appendChild(iconElement);
            }
            if (item.seperator) {
                itemElement.classList.add("menuSeparator");
            }
            if (item.disabled) {
                itemElement.classList.add("disabled");
            }
            // Menu item was clicked
            itemElement.addEventListener("mouseup", event => {
                // Ignore rightclick
                if (event.button != 0 || item.submenus) {
                    return;
                }

                if (item.action) {
                    item.action();
                }
                // Close menu
                this.remove();

                // If submenu, close parent menu
                if (this.parent) {
                    this.parent.parentElement.outerHTML = "";
                }
            });

            // Expand submenu
            itemElement.addEventListener("mousemove", event => {
                if (item.expanded || !item.submenus) {
                    return;
                }
                // Find submenu position
                let rect = itemElement.getBoundingClientRect();
                let positionX = rect.left + rect.width;
                let positionY = rect.top;

                item.expanded = true;
                itemElement.object = item;

                // Spawn submenu
                this.submenus.push(new DesktopSubmenu({ x: positionX, y: positionY }, item.submenus, itemElement));
            })
            itemElement.appendChild(textElement);
            this.element.appendChild(itemElement);
        });
        document.getElementById("desktop").appendChild(this.element, "menus");
    }

    // Close menu when clicking desktop
    addListeners() {
        document.getElementById("desktop").addEventListener("mousedown", event => {
            if (this.removed) {
                return;
            }
            if (event.target.classList.contains("menu") || event.target.classList.contains("menuItem") || event.target.parentElement.classList.contains("menuItem")) {
                return;
            }
            this.remove();
        });
    }
    remove() {
        this.removed = true;
        this.element.outerHTML = "";
    }
}

// Submenu class
class DesktopSubmenu extends DesktopMenu {
    constructor(position, items, parent) {
        super(position, items);
        this.element.style.minWidth = "10vw";
        this.parent = parent;
    }

    addListeners() {
        // Close submenu when moving off
        document.getElementById("desktop").addEventListener("mousemove", event => {
            if (this.removed) {
                return;
            }
            if (event.target != this.element && event.target.parentElement != this.element && event.target.parentElement.parentElement != this.element && event.target != this.parent && event.target.parentElement != this.parent) {
                this.parent.object.expanded = false;
                this.remove()
            }
        })
    }
}
export { DesktopMenu as default };