import OSApi from "{{file:/usr/lib/api/api.js}}"
import Tab from "{{file:/usr/share/apps/kate/tab.js}}";
let api = new OSApi();
window.tabList = [];
api.gotData.then(async () => {
    let tabLocation = api.data.args.location;
    let tab = new Tab(api, tabLocation);
    tab.select();

    api.loadIcons();
    api.showToolbar([
        {
            name: "File",
            items: [
                {
                    text: "New Tab", icon: "/usr/share/icons/breeze-dark/actions/project_add.svg", action: () => {
                        new Tab(api);
                    }
                },
                {
                    text: "Open", icon: "/usr/share/icons/breeze-dark/actions/document-open.svg", seperator: true, action: async () => {
                        let location = await api.fileDialog(["*.json", "*.txt"]);
                        new Tab(api, location);
                    }
                },
                {
                    text: "Save", icon: "/usr/share/icons/breeze-dark/actions/document-save.svg", action: () => {
                        tabList.find(tab => tab.selected).save()
                    }
                },
                {
                    text: "Save as..", icon: "/usr/share/icons/breeze-dark/actions/document-save-as.svg", action: () => {
                        tabList.find(tab => tab.selected).saveAs()
                    },
                    seperator: true
                },
                {
                    text: "Quit",
                    icon: "/usr/share/icons/breeze-dark/actions/gtk-quit.svg",
                    action: () => api.quit()
                }
            ],
        },
        {
            name: "Help",
            items: [
                { text: "About WebKDE", icon: "/usr/share/icons/breeze-dark/apps/kdeapp.svg" }
            ]
        }
    ]);
    api.done({
        icon: "/usr/share/icons/breeze-dark/apps/kate.svg"
    });
});
api.channel.onevent = async data => {
    switch (data.event) {
        case "sigterm":
            // Add custom exit handler here
            if (tabList.find(tab => {
                return tab.unsaved;
            })) {
                let quit = await api.dialog("confirm", "discard changes and quit", ["No", "Yes"]);
                if (quit == 1) { api.quit() }
            }
            else {
                api.quit();
            }
            break;
    }
}
api.addShortcut("Ctrl+S", () => { tabList.find(tab => tab.selected).save() });
api.addShortcut("Ctrl+Shift+S", () => { tabList.find(tab => tab.selected).saveAs() });
api.addShortcut("Ctrl+O", async () => { let location = await api.fileDialog(["*.json", "*.txt"]); new Tab(api, location) });
api.addShortcut(["Ctrl+T", "Ctrl+N"], () => { new Tab() });
api.addShortcut("Ctrl+W", () => { tabList.find(tab => tab.selected).close() })