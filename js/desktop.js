"use strict";
import config from "./config.js";
import DesktopApp from "./icons.js";
import Panel from "./panel.js"
import DesktopMenu from "./menu.js"
import toMime from "./toMime.js"
import * as linux from "../linuxCore/index.js"; 
class Desktop {
    constructor(config) {
        this.config = config;
        this.apps = [];
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
        let preparedApps = apps.map(function(app,index,apps){
            let result = {};
            result.name = app;
            result.icon = "/usr/share/icons/breeze-dark/mimetypes/" + toMime(app).replace("/","-") + ".svg";
            result.position = {x:0,y:0};
            return result;
        })
        preparedApps.forEach(element => {
            this.apps.push(new DesktopApp(element.name, element.icon, element.position, config.apps));
        });
    }
    renderPanels(){
        this.panels.forEach(panel => panel.remove());
        this.config.desktop.panels.forEach(panel=>{
            this.panels.push(new Panel(panel));
        })
    }
    addListeners(){
        this.element.addEventListener("contextmenu",event=>{
            if(event.target.id != "desktop"){
                return;
            }
            event.preventDefault();
            this.menu = new DesktopMenu({x:event.pageX, y:event.pageY}, [{
                text:'create new file',
                action:function(){alert(1)}
            },
        {
            text:"refresh desktop",
            icon:"/usr/share/icons/hicolor/48x48/apps/firefox.png",
            action:function(){this.render()}
        }]);
        });
        this.element.addEventListener("mousedown",event=>{
            if(this.menu&&(event.target.id == "desktop"||event.target.classList.contains("panel")||event.target.classList.contains("app"))){
                this.menu.remove();
            }
        })
    }
};

    window.desktop = new Desktop(config);
