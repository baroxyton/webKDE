import OSApi from "../../appApi/frontend/api.js";
let api = new OSApi();
let inputContent = "";
let caretPosition = 0;
function loadInputContent() {
    document.getElementById("input").innerHTML = "";
    let chars = (inputContent + " ").split("");
    chars.forEach((char, index) => {
        let element = document.createElement("a");
        element.innerText = char.replace(" ", "\xA0");
        if (index == caretPosition) {
            element.classList.add("caret");
        }
        document.getElementById("input").appendChild(element);
    });
}
function addToLog(text){
document.getElementById("content").innerText += text;
document.body.scrollTop = document.body.scrollHeight;
}

document.body.addEventListener("keydown", event => {
    let key = event.key;
    switch (key) {
        case "ArrowLeft":
            if (caretPosition > 0) {
                caretPosition--;
                loadInputContent();
            }
            break;
        case "ArrowRight":
            if (caretPosition < inputContent.length) {
                caretPosition++;
                loadInputContent();
            }
            break;
        case "Backspace":
            if (caretPosition == 0) {
                return;
            }
            inputContent = inputContent.slice(0, caretPosition - 1) + inputContent.slice(caretPosition);
            caretPosition--;
            loadInputContent();
            break;
        case "Enter":
            addToLog(inputContent + "\n");
            inputContent = "";
            caretPosition = 0;
            loadInputContent();
            break;
        default:
            if (key.length > 1) {
                return;
            }
            inputContent = inputContent.slice(0, caretPosition) + key + inputContent.slice(caretPosition);
            caretPosition++;
            loadInputContent();
    }
})
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
        title: "Konsole",
        icon: "/usr/share/icons/breeze-dark/apps/utilities-terminal.svg"
    });
});
loadInputContent();