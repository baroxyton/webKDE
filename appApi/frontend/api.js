import Channel from "./communication.js"
import ThemeLoader from "./themeLoader.js"
class OSApi {
    constructor() {
        this.channel = new Channel(window.parent);
        this.events();
    }
    async events() {
        this.data = (await this.channel.write("loaded", true, true)).data;
        this.theme = new ThemeLoader(this.data.theme, this.data.font)
        this.channel.onevent = data => {
            switch (data.event) {
                case "changeTheme":
                    this.theme.changeTheme(data.data);
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
    // Optianally, pass height, width, maxHeight, maxWidth in an object
    done(dimensions){
        this.channel.write("done",dimensions);
    }
}
export { OSApi as default };