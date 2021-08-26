import OSApi from "../../appApi/frontend/api.js";
import toMime from "../../js/toMime.js"
let api = new OSApi();

let fileLocation;
let canvasContext = document.getElementById("imageCanvas").getContext("2d");

let isDrawing = false;
let mouseDown = false;

let drawingSize = 5;
let drawingColor = "#000000";

let editingHistory = [];
let editingIndex = 0;
let canSave = false;
let canEdit = false;

let startedPath = false;

// Old touch position for drawing
let oldPos = {};

api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}

// Update toolbar with disabled status
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
            disabled: !canSave,
            action: saveFile
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
                disabled: (!canEdit) || (!editingHistory[editingIndex - 1]),
                action: historyBack,
                icon: "/usr/share/icons/breeze-dark/actions/edit-undo.svg"
            },
            {
                text: "Redo",
                action: historyForward,
                disabled: (!canEdit) || (!editingHistory[editingIndex + 1]),
                icon: "/usr/share/icons/breeze-dark/actions/edit-redo.svg"
            }
        ]
    }, {
        name: "Tools",
        items: [
            {
                text: "Crop",
                icon: "/usr/share/icons/breeze-dark/actions/transform-crop.svg",
                disabled: true
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


async function openFile(locationArg) {
    fileLocation = locationArg || await api.fileDialog(["*.png", "*.jpg", "*.bpm", "*.jpeg"]);
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
function saveToHistory() {
    let data = canvasContext.getImageData(0, 0, document.getElementById("imageCanvas").width, document.getElementById("imageCanvas").height);
    if (editingIndex != editingHistory.length - 1) {
        editingHistory.splice(editingIndex);
    }
    editingHistory.push(data);
    editingIndex = editingHistory.length - 1;
    canSave = true;
    updateToolbar();
}
function historyBack() {
    editingIndex--;
    updateToolbar();
    canvasContext.putImageData(editingHistory[editingIndex], 0, 0);
}
function historyForward() {
    editingIndex++;
    updateToolbar();
    canvasContext.putImageData(editingHistory[editingIndex], 0, 0);
}
async function saveFile() {
    canSave = false;
    let imageUrl = document.getElementById("imageCanvas").toDataURL();
    let imageBlob = (await (await fetch(imageUrl)).blob());
    let fileReader = new FileReader();
    fileReader.onload = () => {
        api.filesystem("write", fileLocation, { content: fileReader.result });
    }
    fileReader.readAsBinaryString(imageBlob);
}
function startDrawing() {
    if (!editingHistory.length) {
        saveToHistory();
    }
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
    saveToHistory();
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
    let ratioY = event.target.scrollHeight / event.target.height;
    let ratioX = event.target.scrollWidth / event.target.width;
    if (!isDrawing || !mouseDown) {
        return;
    }
    if (!startedPath) {
        canvasContext.beginPath();
        startedPath = true;
    }
    canvasContext.lineCap = "round";
    let rect = event.target.getBoundingClientRect()
    let pos = { x: (event.clientX - rect.left) / ratioX, y: (event.clientY - rect.top) / ratioY };
    canvasContext.moveTo(oldPos.x || pos.x, oldPos.y || pos.y);
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
    oldPos = pos;
});

// Got api data (user, application arguments and all that stuff)
api.gotData.then(async () => {
    // Render window
    api.done({
        title: "Gwenview - Select Image",
        icon: "/usr/share/icons/breeze-dark/apps/gwenview.svg"
    });
    updateToolbar();
    if (api.data.args.location) {
        openFile(api.data.args.location);
    }
});