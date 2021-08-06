import api from "../frontend/api.js";
import Channel from "./communication.js"
import { checkPermission } from "/linuxCore/components/checkPermission.js"
class ProgramApi {
    constructor(user, windowObject) {
        window.api = this;
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
                        font: desktop.theme.font,
                        args: this.windowObject.args
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
                    this.windowObject.width = data.read()?.width || data.read()?.minWidth || this.windowObject.width || innerHeight * 0.5;
                    this.windowObject.height = data.read()?.height || data.read()?.minHeight || this.windowObject.height || innerHeight * 0.3;
                    this.window.style.width = this.windowObject.width + "px";
                    this.window.style.height = this.windowObject.height + "px";
                    if (this.windowObject.maxHeight || this.windowObject.maxWidth) {
                        this.windowObject.actions.children[1].style.display = "none";
                    }
                    this.window.style.visibility = "visible";
                    break;
                case "filesystem":
                    this.filesystem(data);
                    break;
                case "menu":
                    this.windowObject.menu(data.read());
                    break;
                case "spawnWindow":
                    this.spawnWindow(data);
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
        }, 5000);
    }
    sigterm() {
        this.channel.write("sigterm");
    }
    changeTheme(rawTheme) {
        this.channel.write("changeTheme", rawTheme)
    }
    filesystem(request) {
        let data = request.read();
        let call = data.call;
        let target = data.target;
        let additionalArguments = data.args;
        let file = debug.fileapi.internal.getFile(target);
        if (file instanceof Error) {
            request.respond({
                type: "error",
                content: "File not found."
            });
            return;
        }
        switch (call) {
            case "read":
                if (!checkPermission("demo", file, "r")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                request.respond({
                    type: "result",
                    content: file.content
                })
                break;
            case "readMeta":
                if (!checkPermission("demo", file, "r")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                request.respond({
                    type: "result",
                    content: file.meta
                })
                break;
            case "list":
                if (!checkPermission("demo", file, "r")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                request.respond({
                    type: "result",
                    content: Object.keys(file.content)
                })
                break;
            case "delete":
                if (!checkPermission("demo", file, "w")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                debug.fileapi.internal.delete(target);
                request.respond({
                    type: "status",
                    content: 0
                });
                break;
        }
    }
    spawnWindow(request) {
        let url = request.read().url;
        let args = request.read().args;
        let spawnedWin = new this.windowObject.constructor(url, args);
        this.channel.onevent = function (data) {
            if (data.event == "windowApi") {
                spawnedWin.api.channel.write(...data.read().args);
            }
        };
        spawnedWin.api.channel.onevent = data => {
            let packet = { data: data.read(), event: data.event };
            this.channel.write("windowApiData", packet);
        }
    }
}
export { ProgramApi as default };