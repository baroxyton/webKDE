import ProgramApi from "../appApi/backend/api.js";
import WebKWin from "./windowmanager.js";
class WidgetWindow {
    constructor(position, url, args) {
        let urlProtocol = new URL(url, String(location)).protocol;
        if (urlProtocol == "javascript:") {
            console.log("prevented xss!");
            url = "https://en.wikipedia.org/wiki/Xss";
        }
        this.args = args || {};
        this.config = this.args.config || {};
        this.url = url;
        this.position = position;
        this.render();
        this.addListeners();
        this.menu = WebKWin.prototype.menu;
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
        document.getElementById("desktop").appendChild(this.element);
        document.getElementById("desktop").appendChild(this.cover)
    }
    addListeners() {
        this.cover.addEventListener("mouseup", event => {
            if (event.button == 0) {
                console.log(event);
                event.target.style.display = "none";
            }
        })
    }
    remove() {
        this.element.outerHTML = "";
        this.cover.outerHTML = "";
    };
}
export { WidgetWindow as default };
window.WidgetWindow = WidgetWindow;