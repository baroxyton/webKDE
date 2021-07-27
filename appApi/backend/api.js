import Channel from "./communication.js"
class ProgramApi {
    constructor(user, windowObject) {
        this.windowObject = windowObject;
        this.window = windowObject.element;
        this.user = user;
        this.channel = new Channel(this.window.querySelector("iframe"));
        this.channel.onevent = data => {
            switch (data.event) {
                case "loaded":
                    this.supported = true;
                    data.respond({
                        user: this.user,
                        theme: desktop.theme.rawTheme,
                        font: desktop.theme.font
                    });
                    break;
                case "showToolbar":
                    this.windowObject.showToolbar(data.read());
                    break;
                case "done":
                case "resize":
                    this.windowObject.titleText = data.read().title || this.windowObject.titleText || this.windowObject.url;
                    this.windowObject.iconLocation = data.read().icon || this.windowObject.iconLocation || "/usr/share/icons/breeze-dark/categories/applications-all.svg";
                    this.windowObject.title.innerText = this.windowObject.titleText;
                    this.windowObject.icon.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.windowObject.iconLocation))}")`;
                    this.windowObject.maxWidth = data.read()?.maxWidth || this.windowObject.maxWidth;
                    this.windowObject.maxHeight = data.read()?.maxHeight || this.windowObject.maxHeight;
                    this.windowObject.minWidth = data.read()?.minWidth || this.windowObject.minWidth || 150;
                    this.windowObject.minHeight = data.read()?.minHeight || this.windowObject.minHeight || 100;
                    this.windowObject.width = data.read()?.width || this.windowObject.width || innerHeight * 0.5;
                    this.windowObject.height = data.read()?.height || this.windowObject.height || innerHeight * 0.3;
                    this.window.style.width = this.windowObject.width + "px";
                    this.window.style.height = this.windowObject.height + "px";
                    if (this.windowObject.maxHeight || this.windowObject.maxWidth) {
                        this.windowObject.actions.children[1].style.display = "none";
                    }
                    this.window.style.visibility = "visible";
                    break;
                case "quit":
                    this.windowObject.remove();
                    break;
            }
        }
        setTimeout(() => {
            if (this.supported) {
                return;
            }
            this.window.style.visibility = "visible";
            this.windowObject.titleText = this.windowObject.url;
            this.windowObject.iconLocation = "/usr/share/icons/breeze-dark/categories/applications-all.svg";
            this.windowObject.title.innerText = this.windowObject.titleText;
            this.windowObject.icon.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read(this.windowObject.iconLocation))}")`;
            this.windowObject.maxWidth = innerWidth;
            this.windowObject.maxHeight = innerHeight;
            this.windowObject.minWidth = 150;
            this.windowObject.minHeight = 100;
            this.windowObject.width = innerHeight * 0.5;
            this.windowObject.height = innerHeight * 0.3;
            this.window.style.width = this.windowObject.width + "px";
            this.window.style.height = this.windowObject.height + "px";
        }, 1500);
    }
    sigterm() {
        this.channel.write("sigterm");
    }
}
export { ProgramApi as default };