import OSApi from "../../appApi/frontend/api.js";
let api = new OSApi();

api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}
// Got api data (user, application arguments and all that stuff)
api.gotData.then(async () => {
// Render window
api.done({
    title: "Systemsettings",
    icon: "/usr/share/icons/breeze-dark/apps/systemsettings.svg"
});
})
api.loadIcons();