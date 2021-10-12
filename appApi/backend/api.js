import Channel from "./communication.js"
import { path as pathRequest } from "../../linuxCore/lib/path.js";
import { checkPermission } from "../../linuxCore/components/checkPermission.js"
import { getFile } from "../../linuxCore/components/fileapi.js";
import WebKWin from "../../js/windowmanager.js";
class ProgramApi {
    constructor(user, windowObject, iframe) {
        this.focused = false;
        this.tty = new desktop.Tty("/", user);
        window.api = this;
        this.windowObject = windowObject;
        this.window = windowObject.element;
        this.user = user;
        this.channel = new Channel(iframe || this.window.querySelector("iframe"));
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
                    this.windowObject?.showToolbar(data.read());
                    break;
                case "done":
                case "resize":
                    if (!this.windowObject.title) {
                        this.window.classList.add("loaded");
                        this.window.style.visibility = "visible";
                        break;
                    }
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
                    if (this.windowObject.position.x + this.windowObject.width + 5 > innerWidth) {
                        this.windowObject.position.x = innerWidth - innerHeight;
                    }
                    if (this.windowObject.position.y + this.windowObject.height + 45 > innerHeight) {
                        this.windowObject.position.y = innerHeight - this.windowObject.height;
                    }
                    this.windowObject.element.style.left = this.windowObject.position.x + "px";
                    this.windowObject.element.style.top = this.windowObject.position.y + "px";
                    this.window.style.width = this.windowObject.width + "px";
                    this.window.style.height = this.windowObject.height + "px";
                    if ((this.windowObject.maxHeight || this.windowObject.maxWidth) && !this.windowObject.fullscreen) {
                        this.windowObject.actions.children[1].style.display = "none";
                    }
                    this.window.style.visibility = "visible";
                    break;
                case "filesystem":
                    this.filesystem(data);
                    break;
                case "menu":
                    this.windowObject?.menu(data.read());
                    break;
                case "spawnWindow":
                    this.spawnWindow(data);
                    break;
                case "openFile":
                    desktop.openFile(data.read().path);
                    break;
                case "simpleRunCommand":
                    debug.getCommandOutput(data.read().command).then(output => {
                        data.respond(output);
                    });
                    break;
                case "updateMousePosition":
                    let x = Number(data.read().x);
                    let y = Number(data.read().y);
                    let rect = this.window.getBoundingClientRect();
                    x += rect.left;
                    y += rect.top;
                    desktop.mousePosition = { x, y };
                    break;
                case "tty":
                    this.ttyData(data);
                    break;
                case "quit":
                    this.windowObject?.remove();
                    break;
                case "listenv":
                    data.respond(Object.keys(this.tty.env))
                    break;
                case "readenv":
                    data.respond(this.tty.env[data.read().key] || "");
                    break;
                case "setenv":
                    this.tty.env[data.read().key] = String(data.read().value);
                    break;
                case "focus":
                    this.windowObject.focus();
                    this.focus();
                    break;
                case "unfocus":
                    this.windowObject.unfocus();
                    this.unfocus();
                    break;
            }
        }
        setTimeout(() => {
            if (this.supported) {
                return;
            }
            if (!this.windowObject.title) {
                this.window.style.visibility = "visible";
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
        }, 1000);
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
        let parent = debug.fileapi.internal.getFile(pathRequest.join(target, ".."));
        if ((file instanceof Error && ["readMeta", "list", "delete", "read"].includes(call)) || parent instanceof Error) {
            request.respond({
                type: "error",
                content: "File not found."
            });
            return;
        }
        switch (call) {
            case "move":
                if (!checkPermission(this.user, file, "w")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                if (!checkPermission(this.user, getFile(pathRequest.join(additionalArguments.new, "..")), "w")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                debug.fileapi.internal.move(target, additionalArguments.new);
                break;
            case "write":
                if (!checkPermission(this.user, parent, "w")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                debug.fileapi.internal.write(this.user, target, additionalArguments.content);
                break;
            case "mkdir":
                if (!checkPermission(this.user, parent, "w")) {
                    request.respond({
                        type: "error",
                        content: "Missing permission"
                    });
                    return;
                }
                debug.fileapi.internal.mkdir(this.user, target);
                break;
            case "read":
                if (!checkPermission(this.user, file, "r")) {
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
                request.respond({
                    type: "result",
                    content: file.meta
                })
                break;
            case "list":
                if (!checkPermission(this.user, file, "r")) {
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
                if (!checkPermission(this.user, file, "w")) {
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
    };
    ttyData(request) {
        let data = request.read();
        let call = data.call;
        let additionalArguments = data.args;
        switch (call) {
            case "run":
                let hook = {
                    changeCommand: (api, binary, args, pid) => {
                        this.commandApi = api;
                        this.commandApi.io.stdout.onwrite = data => {
                            this.channel.write("ttyData", {
                                type: "io",
                                io: "stdout",
                                event: "write",
                                data
                            });
                        }
                        this.commandApi.io.stdout.ondone = data => {
                            this.channel.write("ttyData", {
                                type: "io",
                                io: "stdout",
                                event: "done",
                                data
                            });
                        }
                        this.commandApi.io.stderr.output.onwrite = data => {
                            this.channel.write("ttyData", {
                                type: "io",
                                io: "stderr",
                                event: "write",
                                data
                            });
                        }
                        this.commandApi.io.stdin.output.onwrite = data => {
                            this.channel.write("ttyData", {
                                type: "io",
                                io: "stdin",
                                event: "write",
                                data
                            });
                        }
                    },
                    ondone: () => {
                        this.channel.write("ttyData", {
                            type: "process",
                            event: "quit"
                        })
                    },
                }
                this.tty.runCommand(additionalArguments.command, hook);
                break;
            case "sendKey":
                this.commandApi?.io.keys.write(additionalArguments.event);
                break;
            case "io":
                let pipe = this.commandApi?.io[additionalArguments.io];
                if (pipe.input) {
                    pipe = pipe.input;
                }
                pipe?.write(additionalArguments.data);
                break;
            case "quit":
                this.commandApi.io.stdout.done();
                break;
        }
    }

    spawnWindow(request) {
        let url = request.read().url;
        let args = request.read().args;
        let spawnedWin = new WebKWin(url, args);
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
    focus() {
        this.focused = true;
        this.channel.write("focus");
    }
    unfocus() {
        this.focused = false;
        this.channel.write("unfocus");
    }
}
export { ProgramApi as default };
