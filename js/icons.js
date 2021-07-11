"use strict";
// app/icon that renders on desktop
class DesktopApp {
    constructor(name, icon, position, appConfig) {
        this.name = name;
        this.icon = icon;
        this.position = position;
        this.config = appConfig;
        this.appHolder = document.getElementById("apps");
        this.render();
    }
    remove() {
        if (this.appElement) {
            this.appElement.outerHTML = "";
        }
    }
    render() {
        this.remove();

        this.appElement = document.createElement("div");
        this.iconElement = document.createElement("div");
        this.nameElement = document.createElement("div");

        this.nameElement.classList.add("appname");
        this.appElement.classList.add("app");
        this.iconElement.classList.add("appicon");

        this.iconElement.style.backgroundImage = `url("${this.icon}")`;
        this.appElement.style.height = (65 * this.config.iconSize) + "px";
        this.appElement.style.width = (60 * this.config.iconSize) + "px";
        this.appElement.style.top = (65 * this.config.iconSize * this.position.y) + (30 * this.position.y) + "px";
        this.appElement.style.left = (60 * this.config.iconSize * this.position.x) + (30 * this.position.x) + "px";
        this.nameElement.innerText = this.name;
        this.nameElement.style.fontSize = this.config.fontSize;
        this.nameElement.style.color = this.config.fontColor;

        this.appElement.appendChild(this.iconElement);
        this.appElement.appendChild(this.nameElement);
        this.appHolder.appendChild(this.appElement);
        this.addListeners();
    }
    select() {
        this.appElement.classList.add("selectedapp");
    }
    unselect() {
        this.appElement.classList.remove("selectedapp");
    }
    addListeners() {
        this.mousedown = false;
        this.appElement.addEventListener("mousedown", event => {
            this.mousedown = true;
            desktop.apps.forEach(app => app.unselect());
            this.mousedownPosition = { x: event.pageX - this.appElement.offsetLeft, y: event.pageY - this.appElement.offsetTop }
            this.select();
        });
        this.appElement.addEventListener("mouseup", event => {
            this.mousedown = false;
            if (this.moving) {
                this.stopMoving();
            }
        });
        this.appElement.addEventListener("mousemove", event => {
            if (!this.mousedown) {
                return;
            }
            this.moving = true;
            this.movePosition = { x: event.pageX, y: event.pageY };
            this.appElement.style.left = (event.pageX - this.mousedownPosition.x) + "px";
            this.appElement.style.top = (event.pageY - this.mousedownPosition.y) + "px";
        });
        document.getElementById("desktop").addEventListener("mouseup", event => {
            if(event.target.id != "desktop"){
                return;
            }
            this.unselect();
            if(this.moving){
                this.stopMoving();
            }
        })
        this.appElement.addEventListener("mouseleave",event=>{
            if(this.moving){
                this.movePosition = { x: event.pageX, y: event.pageY };
            this.appElement.style.left = (event.pageX - this.mousedownPosition.x) + "px";
            this.appElement.style.top = (event.pageY - this.mousedownPosition.y) + "px";
            }
        });
    }

    stopMoving() {
        this.moving = false;
        this.position.x = Math.round((this.movePosition.x- this.mousedownPosition.x) / (30+(60 * this.config.iconSize)));
        this.position.y = Math.round((this.movePosition.y- this.mousedownPosition.y) / (30+(65 * this.config.iconSize)));
        this.render();
    }
};
export { DesktopApp as default };