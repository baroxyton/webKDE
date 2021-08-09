import OSApi from "../../appApi/frontend/api.js"
import Tab from "./tab.js";
let api = new OSApi();
api.gotData.then(async () => {
    new Tab(api, "/path/test")
    api.loadIcons();
    api.showToolbar([
        {
            name: "File",
            items: [
                { text: "Open", icon: "/usr/share/icons/breeze-dark/actions/document-open.svg", seperator:true },
                { text: "Save", icon: "/usr/share/icons/breeze-dark/actions/document-save.svg" },
                { text: "Save as..", icon: "/usr/share/icons/breeze-dark/actions/document-save-as.svg" }
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
        title: "Kate",
        icon: "/usr/share/icons/breeze-dark/apps/kate.svg"
    });
});