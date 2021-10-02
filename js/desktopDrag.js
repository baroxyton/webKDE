"use strict";
class DesktopDrag {
    // Initiate drag with position objects {x:xPos,y:yPos}
    constructor(startPosition, currentPosition) {
        this.startPosition = startPosition;
        this.currentPosition = currentPosition;
    }
    render() {
        // Generate element if it doesn't exist
        if (!this.element) {
            this.element = document.createElement("div");
            this.element.classList.add("desktopdrag");
            document.getElementById("desktop").appendChild(this.element, "selection");
        }
        // Normal drag. Change width to fit change
        if (this.currentPosition.x - this.startPosition.x > 0) {
            this.element.style.left = this.startPosition.x + "px";
            this.element.style.width = (this.currentPosition.x - this.startPosition.x) + "px";
        }
        // Drag backwards (current position nearer to screen start than starting position)
        else {
            this.element.style.left = this.currentPosition.x + "px";
            this.element.style.width = (this.startPosition.x - this.currentPosition.x) + "px";
        }
        // Normal drag. Change height to fit change
        if (this.currentPosition.y - this.startPosition.y > 0) {
            this.element.style.top = this.startPosition.y + "px";
            this.element.style.height = (this.currentPosition.y - this.startPosition.y) + "px";
        }
        // Drag backwards (current position nearer to screen start than starting position)
        else {
            this.element.style.top = this.currentPosition.y + "px";
            this.element.style.height = (this.startPosition.y - this.currentPosition.y) + "px";
        }
    }
    remove() {
        this.removed = true;
        this.element.outerHTML = "";
    }
    change(position) {
        this.currentPosition = position;
        this.render();
    }
}
export { DesktopDrag as default };