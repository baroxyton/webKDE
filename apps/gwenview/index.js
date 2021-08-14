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
        title: "Gwenview - Select Image",
        icon: "/usr/share/icons/breeze-dark/apps/gwenview.svg"
    });
})
api.showToolbar([{
    name: "File", items: [{
        text: "Save",
        icon: "/usr/share/icons/breeze-dark/actions/document-save.svg"
    },
    {
        text: "Save As",
        icon: "/usr/share/icons/breeze-dark/actions/document-save-as.svg"
    }, {
        text: "Delete",
        icon: "/usr/share/icons/breeze-dark/actions/edit-delete.svg"
    },{
        text:"Quit",
        icon:"/usr/share/icons/breeze-dark/actions/gtk-quit.svg"
    }]
}, {
    name: "Tools", items: [
        {
            text: "Crop",
            icon: "/usr/share/icons/breeze-dark/actions/transform-crop.svg"
        },
        {
            text: "Draw",
            icon: "/usr/share/icons/breeze-dark/actions/draw-brush.svg"
        }
    ]
}])