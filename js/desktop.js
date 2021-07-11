"use strict";
import config from "./config.js";
import DesktopApp from "./icons.js";
import Panel from "./panel.js"
class Desktop {
    constructor(config) {
        this.config = config;
        this.apps = [];
        this.panels = [];
        this.element = document.getElementById("desktop");
        this.render();
        this.renderPanels();
    }
    render() {
        this.element.style.backgroundImage = `url("${this.config.desktop.backgroundimage}")`;
        this.renderApps();
    };
    renderApps() {
        this.apps.forEach(app => app.remove());
        this.config.desktop.apps.forEach(element => {
            this.apps.push(new DesktopApp(element.name, element.icon, element.position, config.apps));
        });
    }
    renderPanels(){
        this.panels.forEach(panel => panel.remove());
        this.config.desktop.panels.forEach(panel=>{
            this.panels.push(new Panel(panel));
        })
    }
};
window.desktop = new Desktop(config);