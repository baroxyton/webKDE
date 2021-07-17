"use strict";

// Window manager class

class WebKWin {
    constructor(url, theme) {
        this.url = url;
        this.theme = theme;
        this.height = innerHeight*0.3;
        this.width = innerWidth*0.7;
        this.position = { x: 100, y: 200 };
        this.render();
        this.addListeners();
    }

    render() {
        if (!this.element) {

            // Create & style elements
            this.element = document.createElement("div");
            this.navbar = document.createElement("div");
            this.title = document.createElement("div");
            this.icon = document.createElement("div");
            let actions = document.createElement("div");

            this.element.classList.add("kwin");
            this.navbar.classList.add("knavbar");
            this.title.classList.add("kwintitle");
            actions.classList.add("kwinActions");
            this.icon.classList.add("kwinIcon");

            this.title.innerText = "test"
            this.icon.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read("/usr/share/icons/breeze-dark/apps/com.visualstudio.code.oss.svg"))}")`;
            actions.innerHTML = `<div class="minimizeIcon"></div><div class="maximizeIcon"></div><div class="closeIcon"></div>`;

            this.navbar.appendChild(actions);
            this.navbar.appendChild(this.icon);
            this.navbar.appendChild(this.title);
            this.element.appendChild(this.navbar);
            document.body.appendChild(this.element);
        }

        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";
    }
    addListeners() {
        // Mouse down: set initial data for dragging window
        this.navbar.addEventListener("mousedown", event => {

            // Change cursor icon
            this.navbar.style.cursor = "grab";

            let rect = this.navbar.getBoundingClientRect();
            this.mousePos = { x: event.pageX - rect.left, y: event.pageY - rect.top };
        });

        // Mouse move: drag window
        document.body.addEventListener("mousemove", event => {
            if (this.mousePos) {
                this.position = { x: event.pageX - this.mousePos.x, y: event.pageY - this.mousePos.y };
                this.element.style.left = this.position.x + "px";
                this.element.style.top = this.position.y + "px";
            }
        });
        this.navbar.addEventListener("mouseup", event => {
            this.navbar.style.cursor = "default";
            this.mousePos = null;
        });
    }
}
setTimeout(function () {
    new WebKWin()
}, 3000)
