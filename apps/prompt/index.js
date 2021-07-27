import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.gotData.then(function (data) {
    let type = data.args.type || "prompt";
    let icon, title = "undefined";
    switch (type) {
        case "error":
            title = `Error: ${data.args.subject}`;
            icon = "/usr/share/icons/breeze-dark/status/dialog-error.svg";
            break;
        case "confirm":
            title = `Are you sure to ${data.args.subject}`;
            icon = "/usr/share/icons/breeze-dark/status/dialog-question.svg";
            break;
        case "prompt":
            title = `Enter ${data.args.subject}`
            icon = "/usr/share/icons/breeze-dark/status/dialog-question.svg"
            break;
        case "ok":
            title = `Info: ${data.args.subject}`;
            icon = "/usr/share/icons/breeze-dark/actions/dialog-ok.svg";
            break;
    }
    loadBody(type, data.args.subject, data.args.buttonText, data.args.inputTextt);
    api.done({
        height: innerHeight,
        width: innerWidth,
        minWidth: innerWidth,
        maxWidth: innerWidth,
        minHeight: innerHeight,
        maxHeight: innerHeight,
        title,
        icon
    });
})
window.quit = (data)=>api.quit(data);
api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            alert("sigterm'd")
            api.quit();
            break;
    }
}
function loadBody(type = "prompt", subject = "[unspecified]", buttonText = [], inputText = "") {
    switch (type) {
        case "error":
            document.body.innerHTML = `<h2>Error: ${subject}.</h2>
        <button onclick="quit(0);">${buttonText[0] || "ok"}</button>`;
            break;
        case "confirm":
            document.body.innerHTML = `<h2>Are you sure to ${subject}?</h2>
            <br>
            <button onclick="quit(0)">${buttonText[0] || "Abort"}</button>
            <button onclick="quit(1)">${buttonText[1] || "Continue"}</button>`;
            break;
        case "prompt":
            document.body.innerHTML = `<h2>Enter ${subject}</h2>
                <input id="promptInput" type="text" value="${inputText}">
                <button onclick="quit(document.getElementById('promptInput').value)">${buttonText[0] || "Done"}</button>`
            break;
        case "ok":
            document.body.innerHTML = `<h2>Info: ${subject}.</h2>
                <button onclick="quit(0);">${buttonText[0] || "ok"}</button>`;
            break;
    }
}