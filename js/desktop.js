"use strict";
import config from "./config.js";
import DesktopApp from "./icons.js";
class Desktop {
    constructor(config) {
        this.config = config;
        this.apps = [];
        this.element = document.getElementById("desktop");
        this.render()
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
};
window.desktop = new Desktop(config);