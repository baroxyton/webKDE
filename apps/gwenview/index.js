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
    if (api.data.args.location) {
        openFile(api.data.args.location);
    }
})
window.canSave = false;
window.canEdit = false;
function updateToolbar() {
    api.showToolbar([{
        name: "File", items: [{
            text: "Open",
            icon: "/usr/share/icons/breeze-dark/actions/document-open.svg",
            action: openFile,
            seperator: true
        },
        {
            text: "Save",
            icon: "/usr/share/icons/breeze-dark/actions/document-save.svg",
            disabled: !canSave
        },
        {
            text: "Save As",
            icon: "/usr/share/icons/breeze-dark/actions/document-save-as.svg",
            disabled: !canSave
        }, {
            text: "Delete",
            icon: "/usr/share/icons/breeze-dark/actions/edit-delete.svg",
            disabled: !canEdit,
            seperator: true
        }, {
            text: "Quit",
            icon: "/usr/share/icons/breeze-dark/actions/gtk-quit.svg",
            action: () => api.quit()
        }]
    },
    {
        name: "Edit",
        items: [
            {
                text: "Undo",
                disabled: !canEdit,
                icon: "/usr/share/icons/breeze-dark/actions/edit-undo.svg"
            },
            {
                text: "Redo",
                disabled: !canEdit,
                icon: "/usr/share/icons/breeze-dark/actions/edit-redo.svg"
            }
        ]
    }, {
        name: "Tools",
        items: [
            {
                text: "Crop",
                icon: "/usr/share/icons/breeze-dark/actions/transform-crop.svg",
                disabled: !canEdit
            },
            {
                text: "Draw",
                icon: "/usr/share/icons/breeze-dark/actions/draw-brush.svg",
                disabled: !canEdit,
                action: startDrawing
            }
        ]
    }]);
}
updateToolbar();
let canvasContext = document.getElementById("imageCanvas").getContext("2d");
async function openFile(locationArg) {
    let fileLocation = locationArg || await api.fileDialog(["*.png", "*.jpg", "*.bpm", "*.jpeg"]);
    api.resize({ title: "Gwenview - " + fileLocation.split("/").slice(-1) });
    let fileContent = (await api.filesystem("read", fileLocation)).data.content;
    let imageURL = `data:${toMime(fileLocation)};base64,${btoa(fileContent)}`;
    document.getElementById("noImage").style.display = "none";
    document.getElementById("imageDisplay").style.display = "flex";
    document.getElementById("selectedImage").src = imageURL;
    document.getElementById("selectedImage").onload = event => {
        let imageCanvas = document.getElementById("imageCanvas");
        imageCanvas.height = event.target.height;
        imageCanvas.width = event.target.width;
        canvasContext.drawImage(event.target, 0, 0);
        canEdit = true;
        updateToolbar();
    }
}
let isDrawing = false;
let mouseDown = false;
let drawingSize = 5;
let drawingColor = "#000000";
let editingHistory = [];
let editingIndex = 0;
let startedPath = false;
let oldPos = {};
function startDrawing() {
    isDrawing = true;
    document.getElementById("imageDisplay").style.height = "90vh";
    document.getElementById("imageDisplay").style.top = "10vh";
    document.getElementById("drawMenu").style.display = "flex";
}
function stopDrawing() {
    isDrawing = false;
    document.getElementById("imageDisplay").style.height = "100vh";
    document.getElementById("imageDisplay").style.top = "0vh";
    document.getElementById("drawMenu").style.display = "none";
}
document.querySelector("#noImage > button").addEventListener("click", openFile);
document.getElementById("imageCanvas").addEventListener("mouseup", event => {
    mouseDown = false;
    startedPath = false;
    oldPos = {};
});
document.getElementById("imageCanvas").addEventListener("mousedown", event => {
    mouseDown = true;
    drawingSize = Number(document.querySelector("input[type='number']").value);
    canvasContext.lineWidth = drawingSize;
    drawingColor = document.querySelector("input[type='color']").value;
    canvasContext.strokeStyle = drawingColor;
});
document.getElementById("drawMenu").querySelector("button").addEventListener("click", stopDrawing);
document.getElementById("imageCanvas").addEventListener("mousemove", event => {
    let ratioY = event.target.scrollHeight/event.target.height;
    let ratioX = event.target.scrollWidth/event.target.width;
    if (!isDrawing || !mouseDown) {
        return;
    }
    if (!startedPath) {
        canvasContext.beginPath();
        startedPath = true;
    }
    canvasContext.lineCap = "round";
    let rect = event.target.getBoundingClientRect()
    let pos = { x: (event.clientX-rect.left)/ratioX, y: (event.clientY-rect.top)/ratioY };
    canvasContext.moveTo(oldPos.x || pos.x, oldPos.y || pos.y);
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
    oldPos = pos;
})