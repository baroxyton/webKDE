"use strict";
class Widget {
    constructor(icon, panel) {
        this.panel = panel;
        this.icon = icon;
        this.render()
    }

    render() {

        this.element = document.createElement("div");
        this.element.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.icon))}")`;
        this.element.classList.add("widget");
        this.panel.appendChild(this.element);

        // Addiitonal method, that widgets can add
        if (this.rendered) {
            this.rendered()
        }
    }

    // Put to correct posititon in panel using configuration
    align(styles) {
        for (let style in styles) {
            this.element.style[style] = styles[style];
        }
    }

    remove() {
        if (this.element) {
            this.element.outerHTML = "";
        }
    }

    // Called when clicking
    callAction(event) {
        if (this.action) {
            this.action(event);
        }
    }
}
// Start menu/search widget
export class SearchMenuWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/apps/kde.svg", panel);

    }
}

// Panel widget with apps you can click to start
class AppsWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    rendered() {
        // Use full height
        this.element.style.height = panel.style.height + "px";
        // Adjust width to icons
        this.element.style.width = "fit-content";
    }
}

// Space
export class SpaceWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    rendered() {
        this.element.style.width = (options.width || "5") + "%";
    }
}

// Digital clock widget

export class ClockWidget extends Widget {
    constructor(panel, options) {
        super("/", panel);
    }
    updateTime() {
        let date = new Date();
        let minutes = date.getMinutes();
        let hours = date.getHours();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let day = date.getDate()

        // Add zeros in beginning (e.g 9:2 becomes 09:02)
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }

        // Time big, date small 
        this.element.innerHTML = `<a style="font-size:1.2em;">${hours}:${minutes}</a><br><a style="font-size:1em;">${day}.${month}.${String(year).slice(-2)}</a>`;
    }
    rendered() {
        this.updateTime();
        this.element.style.width = "auto";
        setInterval(() => this.updateTime(), 1000)
    }
}
// Widget to click to minimize all windows and return to desktop
class ShowDesktopWidget extends Widget {
    constructor(panel, options) {
        super("/usr/share/icons/breeze-dark/places/desktop.svg", panel);

    }
}