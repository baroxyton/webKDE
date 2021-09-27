import OSApi from "../../appApi/frontend/api.js";
import { data } from "../../linuxCore/index.js";
let api = new OSApi();
let inputContent = "";
let caretPosition = 0;
let ttyLocation = "/";
let user = "demo";
let commandIsRunning = false;
let preinput = "demo@linux:/ $";
async function updatePreinput() {
    user = api.data.user;
    ttyLocation = (await api.readEnv("PWD")).read();
    preinput = `${user}@linux:${ttyLocation.replace((await api.readEnv("HOME")).read(), "~")} $`;
    document.getElementById("user").innerText = preinput;
}
function runCommand(command) {
    commandIsRunning = true;
    document.getElementById("user").innerText = "";
    let isDone = false;
    api.tty.onData.add(function (data) {
        if (isDone) {
            return;
        }
        switch (data.type) {
            case "io":
                if (data.io == "stdout" || data.io == "stderr") {
                    if (data.event == "write") {
                        addToLog(data.data);
                    }
                    if (data.data == "{{{clear}}}") {
                        document.getElementById("content").innerHTML = "";
                    }
                }
                if (data.io == "stdin") {
                    inputContent += data.data;
                    if (data.data == "{{{clear}}}") {
                        inputContent = "";
                        caretPosition = 0;
                    }
                    loadInputContent();
                }
            case "process":
                if (data.event == "quit") {
                    isDone = true;
                    commandIsRunning = false;
                    updatePreinput();
                }
        }
    });
    api.tty.run(command);
}
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
function addToLog(text) {
    document.getElementById("content").innerText += text;
    document.body.scrollTop = document.body.scrollHeight;
}

document.body.addEventListener("keydown", event => {
    event.preventDefault();
    if (commandIsRunning) {
        api.tty.sendKey(event);
    }
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
            let command = inputContent;
            addToLog(`${preinput} ${inputContent}\n`);
            inputContent = "";
            caretPosition = 0;
            loadInputContent();
            if (commandIsRunning) {
                api.tty.sendIo("stderr", inputContent);
                return;
            }
            runCommand(command)
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
    setTimeout(a => api.tty.run("ls"), 1000);
    await updatePreinput();
});
api.tty.onData.add(function (data) {
    console.log(data)
})
loadInputContent();