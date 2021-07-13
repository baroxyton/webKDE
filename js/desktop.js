"use strict";
import config from "./config.js";
import DesktopApp from "./icons.js";
import Panel from "./panel.js";
import DesktopMenu from "./menu.js";
import toMime from "./toMime.js";
import DesktopDrag from "./desktopDrag.js";
import * as linux from "../linuxCore/index.js";
class Desktop {
    constructor(config) {
        this.config = config;
        this.apps = [];
        this.selectedApps = [];
        this.panels = [];
        this.element = document.getElementById("desktop");
        this.render();
        this.addListeners()
    }
    render() {
        this.element.style.backgroundImage = `url("${this.config.desktop.backgroundimage}")`;
        this.renderApps();
        this.renderPanels();
    };
    renderApps() {
        this.apps.forEach(app => app.remove());
        let apps = linux.fileapi.internal.list("/home/demo/Desktop");
        let preparedApps = apps.map(function (app, index, apps) {
            let result = {};
            result.name = app;
            result.icon = "/usr/share/icons/breeze-dark/mimetypes/" + toMime(app).replace("/", "-") + ".svg";
            result.position = { x: 0, y: 0 };
            return result;
        })
        preparedApps.forEach(element => {
            this.apps.push(new DesktopApp(element.name, element.icon, element.position, config.apps));
        });
    }
    renderPanels() {
        this.panels.forEach(panel => panel.remove());
        this.config.desktop.panels.forEach(panel => {
            this.panels.push(new Panel(panel));
        })
    }
    addListeners() {
        this.element.addEventListener("contextmenu", event => {
            if (event.target.id != "desktop") {
                return;
            }
            event.preventDefault();
            this.menu = new DesktopMenu({ x: event.pageX, y: event.pageY }, [{
                text: 'create new file',
                action: function () { alert(1) }
            },
            {
                text: "refresh desktop",
                icon: "/usr/share/icons/hicolor/48x48/apps/firefox.png",
                action: function () { this.render() }
            }]);
        });
        this.element.addEventListener("mousedown", event => {
            if (this.menu && (event.target.id == "desktop" || event.target.classList.contains("panel") || event.target.classList.contains("app"))) {
                this.menu.remove();
            }
            if (event.target == this.element) {
                this.mousedown = true;
                this.mousepos = { x: event.pageX, y: event.pageY };
            }
            if(event.target.classList.contains("app")||event.target.classList.contains("appicon")||event.target.classList.contains("appname")){

            }
        });
        this.element.addEventListener("mouseup", event => {
            this.mousedown = false;
            if (this.drag) {
                this.drag.remove();
                this.drag = null;
            }
        })
        this.element.addEventListener("mousemove", event => {
            if (!this.mousedown || (!this.drag&&event.target != this.element&&!event.target.classList.contains("desktopdrag"))) {
                return;
            }
            if (!this.drag) {
                this.drag = new DesktopDrag(this.mousepos, { x: event.pageX, y: event.pageY });
            }
            if (this.drag) {
                this.drag.change({ x: event.pageX, y: event.pageY });
            }
        });
        window.addEventListener("touchstart",event=>{
            document.body.requestFullscreen();
            let node = event.target;
            let clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent("mousedown",true,true,window,0,event.touches[0].screenX,event.touches[0].screenY,event.touches[0].clientX,event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
        window.addEventListener("touchmove",event=>{
            let node = event.target;
            let clickEvent = document.createEvent('MouseEvents');
            this.lastTouch = event;
            clickEvent.initMouseEvent("mousemove",true,true,window,0,event.touches[0].screenX,event.touches[0].screenY,event.touches[0].clientX,event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
        window.addEventListener("touchend",()=>{
            event = this.lastTouch;
            let node = event.target;
            let clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent("mouseup",true,true,window,0,event.touches[0].screenX,event.touches[0].screenY,event.touches[0].clientX,event.touches[0].clientY);
            event.target.dispatchEvent(clickEvent);
        });
    }
};

window.desktop = new Desktop(config);
