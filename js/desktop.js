"use strict";
import DesktopApp from "./icons.js";
import Panel from "./panel.js";
import DesktopMenu from "./menu.js";
import toMime from "./toMime.js";
import DesktopDrag from "./desktopDrag.js";
import * as linux from "../linuxCore/index.js";
import ThemeLoader from "./themeparser.js"
let config;
class Desktop {
    constructor(config) {
        this.config = config;
        this.theme = new ThemeLoader(linux.fileapi.internal.read("/usr/share/themes/"+this.config.desktop.theme),"data:application/octet-stream;base64,"+linux.fileapi.internal.read(this.config.font));
        this.apps = [];
        this.selectedApps = [];
        this.panels = [];
        this.element = document.getElementById("desktop");
        this.render();
        this.addListeners()
    }
    render() {
        this.element.style.backgroundImage = `url("data:image/png;base64,${linux.fileapi.internal.read(this.config.desktop.backgroundimage)}")`;
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
            event.preventDefault();
            if (event.target.id != "desktop") {
                return;
            }
            new DesktopMenu({ x: event.pageX, y: event.pageY }, [{
                text: 'Create new file',
                action: function () { alert(1) },
                icon:"/usr/share/icons/breeze-dark/actions/document-new.svg"
            },
            {
                text:"Create new..",
                action:function(){},
                submenus:[{text:"hello"},{text:"goodbye",submenus:[{text:"hello again"}]}],
                icon:"/usr/share/icons/breeze-dark/actions/folder-new.svg"
            },
            {
                text:"Open with file manager",
                icon:"/usr/share/icons/breeze-dark/apps/system-file-manager.svg"
            },
            {
                text: "Refresh desktop",
                icon: "/usr/share/icons/breeze-dark/places/desktop.svg",
                action: ()=> { this.render() }
            }]);
        });
        this.element.addEventListener("mousedown", event => {
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
linux.fileapi.onready.then(()=>{
config = JSON.parse(linux.fileapi.internal.read("/home/demo/.config/plasma.json"));
window.desktop = new Desktop(config);
localStorage.downloaded = true;
});
