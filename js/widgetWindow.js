import ProgramApi from "../appApi/backend/api.js";
import WebKWin from "./windowmanager.js";
import { checkPermission } from "../linuxCore/components/checkPermission.js"
import toMime from "./toMime.js";

// Popup for panel widgets
// Compatiple with app api
class WidgetWindow {
    constructor(position, url, args) {
        let urlData = new URL(url, String(location));
        let urlProtocol = urlData.protocol;
        if (urlProtocol == "javascript:") {
            console.log("prevented xss!");
            url = "https://en.wikipedia.org/wiki/Xss";
        }
        if (urlProtocol == "file:") {
            url = this.loadLocalFile(urlData.pathname);
        }
        this.args = args || {};
        this.config = this.args.config || {};
        this.url = url;
        this.position = position;
        this.render();
        this.addListeners();
        this.menu = WebKWin.prototype.menu;
    }

    // Load file from webstorage FS
    loadLocalFile(path) {
        let file = debug.fileapi.internal.getFile(path);
        if (file instanceof Error || file.meta.type == "dir" || !checkPermission("demo", file, "r")) {
            return "data:text/html,";
        }
        return `data:${toMime(path)};base64,${btoa(file.content.replaceAll(/\{\{file\:(.*?)\}\}/g, (_, location) => {
            return this.loadLocalFile(location, true);
        }))}`;
    }
    render() {
        if (!this.element) {
            this.element = this.contentElement = document.createElement("iframe");
            this.cover = document.createElement("div");
            this.element.src = this.url;
            this.element.classList.add("widgetWindow");
            this.cover.classList.add("windowcover");
        }
        this.api = new ProgramApi("demo", this, this.element);
        this.element.style.left = this.cover.style.left = this.position.x + "px";
        this.element.style.top = this.cover.style.top = this.position.y + "px";
        this.element.style.width = this.cover.style.width = this.config.width || "30vh";
        this.element.style.height = this.cover.style.height = this.config.height || "25vh";
        this.cover.style.transform = "translate(0, -100%)"
        document.getElementById("desktop").appendChild(this.element, "widgets");
        document.getElementById("desktop").appendChild(this.cover, "covers");
        document.body.addEventListener("mouseup",event=>{
            if(this.removed){
                return;
            }
            if(event.target == this.cover){
                return;
            }
            if(event.target.classList.contains("menu")||event.target.classList.contains("menuItem")||event.target.classList.contains("menuText")||event.target.classList.contains("menuIcon")){
                return;
            }
            this.remove();
        });
    }
    addListeners() {
        this.cover.addEventListener("mouseup", event => {
            if (event.button == 0) {
                event.target.style.display = "none";
            }
        });
    }
    remove() {
        this.removed = true;
        this.element.outerHTML = "";
        this.cover.outerHTML = "";
    };
}
export { WidgetWindow as default };
window.WidgetWindow = WidgetWindow;