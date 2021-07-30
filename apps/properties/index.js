import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.gotData.then(function () {
let filePath = api.data.args.path;
show(filePath);
});
let show = (path) => {
    api.done({
        title: "Properties of " + path,
        icon: "/usr/share/icons/breeze-dark/actions/gtk-properties.svg",
        minHeight: innerHeight,
        minWidth: innerWidth
    });
}