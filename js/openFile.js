import parseDesktopFile from "./parseDesktopFile.js";
import toMime from "./toMime.js"

// Open file in correct application
// Usage: openFile(filePath, Mime type (optional))
function openFile(filePath, mime) {
    let defaultMimes = JSON.parse(debug.fileapi.internal.read("/home/demo/.config/mime.json"));
    mime = mime || toMime(filePath);
    let application;
    let apps = debug.fileapi.internal.read("/usr/share/applications/");
    
    // Try to find application in mime config
    if (defaultMimes[mime]) {
        application = defaultMimes[mime];
    }
    // Try to find application in .desktop file
    else {
        for (let testapplication in apps) {
            let mimes = parseDesktopFile(apps[testapplication].content)["Desktop Entry"].MimeType||[];
            if (mimes.includes(mime)) {
                application = testapplication.split(".")[0];
            }
        }
    }

    // None found: spawn app selector
    if (!application) {
        new desktop.window("/apps/appSelect");
        return;
    }

    // Found application, open
    let file = apps[application + ".desktop"];
    let command = parseDesktopFile(file.content)["Desktop Entry"].Exec[0].replace("%U", `"${filePath}"`);
    debug.runCommand(command);
}
export {openFile as default};