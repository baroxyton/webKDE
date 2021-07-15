"use strict";
class Widget {
    constructor(icon, panel) {
        this.panel = panel;
        this.icon = icon;
        this.render()
    }
    render() {
        if (this.element) {
            this.remove();
        }
        this.element = document.createElement("div");
        this.element.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;
        this.element.classList.add("widget");
        this.panel.appendChild(this.element);
        if (this.rendered) {
            this.rendered()
        }
    }
    align(styles) {
        for (let style in styles) {
            this.element.style[style] = styles[style];
        }
    }
    remove() {
        this.element.outerHTML = "";
    }
    callAction(event) {
        if (this.action) {
            this.action(event);
        }
    }
}
export class SearchMenuWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/apps/kde.svg", panel);

    }
}
class AppsWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    rendered() {
        this.element.style.height = panel.style.height + "px";
        this.element.style.width = "fit-content";
    }
}
export class SpaceWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    rendered() {
        this.element.style.width = options.width + "%";
    }
}
export class ClockWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    updateTime() {
        let date = new Date();
        let minutes = date.getMinutes();
        let hours = date.getHours();
        let month = date.getMonth();
        let year = date.getFullYear();
        let day = date.getDay();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        this.element.innerHTML = `<a>${hours}:${minutes}</a><br><a style="font-size:1em;">${day}.${month}.${String(year).slice(-2)}</a>`;
    }
    rendered() {
        this.updateTime();
        this.element.style.fontSize = "1.3em";
        this.element.style.width = "auto";
        setInterval(() => this.updateTime(), 1000)
    }
}
class ShowDesktopWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/places/desktop.svg", panel);

    }
}