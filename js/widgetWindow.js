import ProgramApi from "../appApi/backend/api.js";
class WidgetWindow {
    constructor(position, url, args) {
        let urlProtocol = new URL(url, String(location)).protocol;
        if (urlProtocol == "javascript:") {
            console.log("prevented xss!");
            url = "https://en.wikipedia.org/wiki/Xss";
        }
        this.args = args || {};
        this.config = this.args.config;
        this.url = url;
        this.position = position;
        this.render();
        this.addListeners();
    }
    render() {
        if (!this.element) {
            this.element = this.contentElement = document.createElement("iframe");
            this.element.src = this.url;
            this.element.classList.add("widgetWindow");
        }
        this.api = new ProgramApi("demo", this, this.element);
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";
        document.body.appendChild(this.element);
    }
    addListeners() {

    }
    remove() {

    };
}
export { WidgetWindow as default };
window.WidgetWindow = WidgetWindow;