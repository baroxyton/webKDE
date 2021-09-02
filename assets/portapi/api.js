import Channel from "{{file:/usr/lib/api/communication.js}}"
import ThemeLoader from "{{file:/usr/lib/api/themeLoader.js}}"
class OSApi {
    constructor() {
        this.iconCache = {};
        this.channel = new Channel(window.parent);
        this.events();
        this.gotData = new Promise(res => {
            this.gotDataRes = res;
        });
        this.menuCount = 0;
    }
    async events() {
        this.data = (await this.channel.write("loaded", true, true)).data;
        this.gotDataRes(this.data);
        this.theme = new ThemeLoader(this.data.theme, this.data.font)
        this.channel.onevent = data => {
            switch (data.event) {
                case "changeTheme":
                    this.theme.changeTheme(data.read());
                    break;
            }
        }
    }

    // Data structure:
    // Array containing toolbar objects. Toolbar objects
    // contain a "name"-key with the displayed name and
    // an "items"-array with the menu entries of the 
    // toolbars menu entries.
    // Menu entries are objects, containing a "text"
    // key with the displayed text, an "icon"-key
    // with the icon location (optional) and a
    // "action"-function that is called when the element is clicked
    showToolbar(data) {
        let events = {};
        data.forEach((toolbar, toolIndex) => {
            toolbar.items.forEach((item, itemIndex) => {
                item.event = `toolbar-${toolIndex}-${itemIndex}`;
                events[item.event] = item.action;
                item.action = null;
            });
        });
        this.channel.write("showToolbar", data, false);
        this.channel.onevent = data => {
            if (events[data.event]) {
                events[data.event]();
            }
        }
    }

    // Done with rendering etc. Ready to display window
    // Optianally, pass height, width, maxHeight, maxWidth, minHeight, minWidth, icon, title in an object
    done(dimensions) {
        this.channel.write("done", dimensions);
    }

    // Resize own window
    // Optianally, pass height, width, maxHeight, maxWidth, minHeight, minWidth, icon, title in an object
    resize(dimensions) {
        this.channel.write("done", dimensions);
    }

    // Exit with return-value
    quit(data = 0) {
        this.channel.write("quit", data);
    }

    // Promise-Driven filesystem request
    async filesystem(call, target, args) {
        let request = {
            call,
            target,
            args
        };
        let result = await this.channel.write("filesystem", request, true);
        if (result.read().type == "error") {
            console.log(request);
            this.dialog("error", result.read().content);
        }
        return result;
    }
    // Load icons
    // add 'icon'-attribute to elements with icon, then use this function
    async loadIcons() {
        document.querySelectorAll("[icon]").forEach(async element => {
            let iconLocation = element.getAttribute("icon");
            if (this.iconCache[iconLocation]) {
                element.style.backgroundImage = this.iconCache[iconLocation];
                return;
            }
            let iconContent = await this.filesystem("read", iconLocation);
            element.style.backgroundImage = this.iconCache[iconLocation] = `url("data:image/svg+xml;base64,${btoa(iconContent.data.content)}")`;
        })
    }
    menu(position, menuitems) {
        let events = {};
        let items = menuitems.map(item => {
            item.event = `menu-${this.menuCount}`;
            this.menuCount++;
            events[item.event] = item.action;
            delete item.action;
            return item;
        });
        this.channel.onevent = data => {
            if (events[data.event]) {
                events[data.event]();
            }
        }
        this.channel.write("menu", { position, items });
    }
    spawnWindow(url, winArgs) {
        let self = this;
        class FakeWinApi {
            constructor() {
                this.listeners = [];
                self.channel.onevent = data => {
                    if (data.event == "windowApiData") {
                        this.listeners.forEach(listener => listener(data.read()));
                    }
                }
            }
            send(...args) {
                self.channel.write("windowApi", { args: [...args] });
            }
            set onevent(what) {
                this.listeners.push(what);
            }
        }
        let request = { url, args: winArgs };
        this.channel.write("spawnWindow", request);
        let output = new FakeWinApi();
        return output
    }
    dialog(type = "prompt", subject = "[unspecified]", buttons = [], inputText = "") {
        let win = this.spawnWindow("/apps/dialog", { type, subject, buttons, inputText });
        return new Promise(res => {
            win.onevent = data => {
                if (data.event == "quit") {
                    res(data.data);
                }
            }
        })
    }
    openFile(path) {
        this.channel.write("openFile", { path })
    }
    fileDialog(allowedTypes, startingPoint) {
        let win = this.spawnWindow("/apps/dolphin", { chooser:true, location: startingPoint, allowedFiletypes: allowedTypes });
        return new Promise(res => {
            win.onevent = data => {
                if (data.event == "quit") {
                    res(data.data);
                }
            }
        })
    }
}
document.body.addEventListener("contextmenu", e => e.preventDefault());
export { OSApi as default };