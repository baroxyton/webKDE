import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.gotData.then(function (data) {
    let type = data.args.type;
    let title;
    switch (type) {
        case "error":
            title = `Error: ${data.args.subject}`
            break;
        case "confirm":
            title = `Are you sure to ${data.args.subject}`;
            break;
        case "prompt":
            title = `Enter ${data.args.subject}`
            break;
        case "ok":
            title = `Info`;
            break;
    }
    api.done({
        height: innerHeight,
        width: innerWidth,
        minWidth: innerWidth,
        maxWidth: innerWidth,
        minHeight: innerHeight,
        maxHeight: innerHeight
    });
})

api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            alert("sigterm'd")
            api.quit();
            break;
    }
}
function loadBody() {

}