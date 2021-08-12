import parseDesktopFile from "./parseDesktopFile.js";
import toMime from "./toMime.js"
function openFile(filePath, mime) {
    let defaultMimes = JSON.parse(debug.fileapi.internal.read("/home/demo/.config/mime.json"));
    mime = mime || toMime(filePath);
    let application;
    let apps = debug.fileapi.internal.read("/usr/share/applications/");
    if (defaultMimes[mime]) {
        application = defaultMimes[mime];
    }
    else {
        for (testapplication in apps) {
            let mimes = parseDesktopFile(apps[testapplication].content).MimeType;
            if (mimes.includes(mime)) {
                application = testapplication.split(".")[0];
            }
        }
    }
    if (!application) {
        new desktop.window("/apps/appSelect");
        return;
    }
    let file = apps[application + ".desktop"];
    let command = parseDesktopFile(file.content)["Desktop Entry"].Exec[0].replace("%U", filePath);
    debug.runCommand(command);
}
export {openFile as default};