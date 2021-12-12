import OSApi from "../../appApi/frontend/api.js";
let api = new OSApi();

api.channel.onevent = async data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            let sure = await api.dialog("confirm", "close potentially unsaved work", ["stay", "close"]);
            if(sure == 1){
                api.quit();
            }
            break;
    }
}
// Got api data (user, application arguments and all that stuff)
api.gotData.then(async () => {
// Render window
api.done({
    title: "Photopea Intergration",
    icon: "/usr/share/icons/breeze-dark/apps/photolayoutseditor.svg"
});
})