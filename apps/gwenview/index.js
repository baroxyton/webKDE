import OSApi from "../../appApi/frontend/api.js";
import toMime from "../../js/toMime.js"
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
window.canSave = false;
window.canEdit = false;
function updateToolbar(){
api.showToolbar([{
    name: "File", items: [{
        text:"Open",
        icon:"/usr/share/icons/breeze-dark/actions/document-open.svg",
        action:openFile,
        seperator:true
    },
        {
        text: "Save",
        icon: "/usr/share/icons/breeze-dark/actions/document-save.svg",
        disabled:!canSave
    },
    {
        text: "Save As",
        icon: "/usr/share/icons/breeze-dark/actions/document-save-as.svg",
        disabled:!canSave
    }, {
        text: "Delete",
        icon: "/usr/share/icons/breeze-dark/actions/edit-delete.svg",
        disabled:!canEdit,
        seperator:true
    },{
        text:"Quit",
        icon:"/usr/share/icons/breeze-dark/actions/gtk-quit.svg",
        action:()=>api.quit()
    }]
}, {
    name: "Tools", items: [
        {
            text: "Crop",
            icon: "/usr/share/icons/breeze-dark/actions/transform-crop.svg",
            disabled:!canEdit
        },
        {
            text: "Draw",
            icon: "/usr/share/icons/breeze-dark/actions/draw-brush.svg",
            disabled:!canEdit
        }
    ]
}]);
}
updateToolbar();
let canvasContext = document.getElementById("imageCanvas").getContext("2d");
async function openFile(){
    let fileLocation = await api.fileDialog(["*.png","*.jpg","*.bpm","*.jpeg"]);
    let fileContent = (await api.filesystem("read",fileLocation)).data.content;
    let imageURL = `data:${toMime(fileLocation)};base64,${btoa(fileContent)}`;
    document.getElementById("noImage").style.display = "none";
    document.getElementById("imageDisplay").style.display = "flex";
    document.getElementById("selectedImage").src = imageURL;
    document.getElementById("selectedImage").onload = event=>{
        let imageCanvas = document.getElementById("imageCanvas");
        imageCanvas.height = event.target.height;
        imageCanvas.width = event.target.width;
        canvasContext.drawImage(event.target,0,0);
        canEdit = true;
        updateToolbar();
    }
}
document.querySelector("#noImage > button").addEventListener("click",openFile);