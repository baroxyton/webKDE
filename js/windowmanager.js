"use strict";
class WebKWin{
    constructor(url,theme){
        this.url = url;
        this.theme = theme;
        this.render();
    }
    render(){
        this.element = document.createElement("div");
        this.element.classList.add("kwin");
        this.navbar = document.createElement("div");
        this.navbar.classList.add("knavbar");
        this.title = document.createElement("div");
        this.title.classList.add("kwintitle");
        this.title.innerText = "test"
        this.icon = document.createElement("div");
        this.icon.classList.add("kwinIcon");
        this.icon.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read("/usr/share/icons/breeze-dark/apps/com.visualstudio.code.oss.svg"))}")`;
        let actions = document.createElement("div");
        actions.innerHTML = `<div class="minimizeIcon"></div>
        <div class="maximizeIcon"></div>
        <div class="closeIcon"></div>`;
        actions.classList.add("kwinActions");
        this.navbar.appendChild(actions);
        this.navbar.appendChild(this.icon);
        this.navbar.appendChild(this.title);
        this.element.appendChild(this.navbar);
        document.body.appendChild(this.element);
    }
}
setTimeout(function(){
    new WebKWin()
},3000)
