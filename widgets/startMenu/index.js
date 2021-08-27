//import OSApi from "../../appApi/frontend/api.js"
import OSApi from "{{file:/usr/lib/api/api.js}}";
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
api.loadIcons()
api.gotData.then(async () => {
    // Render window
    api.done({
        title: "Title",
        icon: "/usr/share/icons/breeze-dark/categories/applications-development.svg"
    });
})