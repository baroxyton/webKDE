"use strict";

// Window manager class

class WebKWin {
    constructor(url, theme) {
        this.url = url;
        this.theme = theme;
        this.height = innerHeight * 0.3;
        this.width = innerWidth * 0.7;
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

            // Append elements
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
            
            // Calculate position relative to element
            this.mousePos = { x: event.pageX - this.position.x, y: event.pageY - this.position.y };
        });

        // Mouse move: drag & resize window
        document.body.addEventListener("mousemove", event => {
            if (this.mousePos) {
                this.position = { x: event.pageX - this.mousePos.x, y: event.pageY - this.mousePos.y };
                this.element.style.left = this.position.x + "px";
                this.element.style.top = this.position.y + "px";
            }
            if(this.resize){

                // Change width of kwin element
                if(this.resize[0] == 1){
                    this.width = event.pageX - this.position.x;
                    this.element.style.width = this.width + "px";
                }

                // Change height of kwin element
                if(this.resize[1] == 1){
                    this.height = event.pageY - this.position.y;
                    this.element.style.height = this.height + "px";
                }

                // Change start x position & width
                if(this.resize[0] == -1){
                    this.width = this.width - (event.pageX - this.position.x);
                    this.position.x = event.pageX;
                    this.element.style.left = this.position.x + "px";
                    this.element.style.width = this.width + "px";
                }
                // Change start y position & height
                if(this.resize[1] == -1){
                    this.height = this.height - (event.pageY - this.position.y);
                    this.position.y = event.pageY;
                    this.element.style.top = this.position.y + "px";
                    this.element.style.height = this.height + "px";
                }
            }
        });
        document.body.addEventListener("mouseup",event=>{
            this.resize = null;
            document.body.style.cursor = "default";
        });

        // Resize window
/*
        Directions:

              North
                |
          NW    |    NE
                |      
    West ---------------- East
                |
          SW    |    SE
                |
              South

*/
        document.body.addEventListener("mousedown", event => {

            // Resize box
            let pixelsIn = 2;
            let pixelsAround = 5;

            // Test if click was within our window drag area

            // Corner coords
            let ax = this.position.x-pixelsAround, ay = this.position.y-pixelsAround, bx = this.position.x-pixelsAround, by = this.position.y+this.height+pixelsAround, dx = this.position.x+this.width+pixelsAround, dy = this.position.y-pixelsAround;
            
            let x= event.pageX,y=event.pageY;
            let bax = bx - ax,bay = by - ay, dax = dx - ax, day = dy - ay;

            let isInArea = !(((x - ax) * bax + (y - ay) * bay < 0.0)||((x - bx) * bax + (y - by) * bay > 0.0)||((x - ax) * dax + (y - ay) * day < 0.0)||((x - dx) * dax + (y - dy) * day > 0.0));
            
            if(!isInArea){
                //exit
                return;
            }
            // Prevent desktop dragclick selection

            desktop.mousedown = null;
            

            // Top left corner
            if ((this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) && (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nwse-resize";
                this.resize = [-1,-1];
                event.preventDefault();
                return;
            }

            // Top right corner
            if (((this.position.x+this.width) - event.pageX < pixelsAround && (this.position.x+this.width) - event.pageX > -pixelsIn) && (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn)) {
                // North-East -> South-West
                document.body.style.cursor = "nesw-resize";
                this.resize = [1,-1];
                event.preventDefault();
                return;
            }

            // Bottom left corner
            if ((this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) && ((this.position.y+this.height) - event.pageY < pixelsAround && (this.position.y+this.height) - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nesw-resize";
                this.resize = [-1,1];
                event.preventDefault();
                return;
            }

            // Bottom right corner
            if (((this.position.x+this.width) - event.pageX < pixelsAround && (this.position.x+this.width) - event.pageX > -pixelsIn) && ((this.position.y+this.height) - event.pageY < pixelsAround && (this.position.y+this.height) - event.pageY > -pixelsIn)) {
                // North-West -> South-East 
                document.body.style.cursor = "nwse-resize";
                this.resize = [1,1];
                event.preventDefault();
                return;
            }

            // Left side
            if (this.position.x - event.pageX < pixelsAround && this.position.x - event.pageX > -pixelsIn) {
                // East -> West
                document.body.style.cursor = "ew-resize";
                this.resize = [-1, 0];
                event.preventDefault();
                return;
            }
            
            // Right side
            if ((this.position.x+this.width) - event.pageX < pixelsAround && (this.position.x+this.width) - event.pageX > -pixelsIn) {
                // East -> West
                document.body.style.cursor = "ew-resize";
                this.resize = [1, 0];
                event.preventDefault();
                return;
            }

            // Top
            if (this.position.y - event.pageY < pixelsAround && this.position.y - event.pageY > -pixelsIn) {
                // North -> South
                document.body.style.cursor = "ns-resize";
                this.resize = [0, -1];
                event.preventDefault();
                return;
            }

            // Bottom
            if ((this.position.y+this.height) - event.pageY < pixelsAround && (this.position.y+this.height) - event.pageY > -pixelsIn) {
                // North -> South
                document.body.style.cursor = "ns-resize";
                this.resize = [0, 1];
                event.preventDefault();
                return;
            }
        })
        this.navbar.addEventListener("mouseup", event => {
            this.navbar.style.cursor = "default";
            this.mousePos = null;
        });
    }
}
setTimeout(function () {
    new WebKWin()
}, 3000)
