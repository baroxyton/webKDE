import { defaultfs } from "./defaultfs.js"
import { IndexedObject } from "../lib/indexedObject.js"
import { checkPermission } from "./checkPermission.js"
import { Pipe } from "./pipe.js"
import { sleep } from "./sleep.js"
import { path } from "../lib/path.js"
import * as builders from "./fileBuilder.js"
let fileParse = path;
let specialFiles = {
    "random": {
        read: function (pipe) {
            setInterval(function () {
                let randomChar = String.fromCharCode(Math.round(Math.random() * 300));
                pipe.write(randomChar);
            }, 10)
        },
        write: function () {
            return 0;
        }
    },
    "null": {
        read: async function (pipe) {
            await sleep(1);
            pipe.write(String.fromCharCode(0));
            pipe.done();
        },
        write: function () {
            return 0;
        }
    }
}
//filesystem database
let filesystem = new IndexedObject("filesystem", defaultfs);
window.fs = filesystem;
//get direct reference to file
export function getFile(fullpath) {
    // use path.resolve() to make processing easier
    //removes stuff like doubleslashes
    fullpath = path.resolve(fullpath);
    //remove / on end to make processing easier
    if (fullpath.endsWith("/")) {
        fullpath = fullpath.slice(0, -1);
    }
    //from string to array
    let steps = fullpath.split("/").slice(1);
    let currentLocation = filesystem.data["/"]
    //try getting to the file. If it fails, return error
    for (let step in steps) {
        step = steps[step]
        if (currentLocation.content[step]) {
            currentLocation = currentLocation.content[step];
        } else {
            return new Error("doesnt exist")
        }
    }
    return currentLocation
}
//file api
export const fileapi = {
    //this is called when the database is ready to read/write
    onready: filesystem.onready,
    //fast access for priviliged scripts
    internal: {
        read: function (path) {
            let file = getFile(path);
            if (file instanceof Error) {
                return "";
            }
            return file.content;
        },
        list: function (path) {
            let file = getFile(path);
            if (file instanceof Error) {
                return "";
            }
            return Object.keys(file.content);
        },
        write: function (user, path, content) {
            let file = getFile(path);
            let fileName;
            if (file instanceof Error) {
                fileName = fileParse.basename(path);
                let parentDir = path;
                parentDir = fileParse.join(parentDir, "..");
                file = getFile(parentDir);
                if (file instanceof Error) {
                    return file
                }
                if (file.meta.type != "dir") {
                    return new Error("not a directory")
                }
                file.content[fileName] = builders.buildFile(user);
                file.content[fileName].content = content;
            }
            else {
                file.content = content;
            }
        },
        mkdir: function (user, path) {
            if (!getFile(path) instanceof Error) {
                return;
            }
            let parentDir = fileParse.join(path, "..");
            let dirName = fileParse.basename(path);
            let file = getFile(parentDir);
            if (file instanceof Error) {
                return file
            }
            if (file.meta.type != "dir") {
                return new Error("cant create dir in file")
            }
            file.content[dirName] = builders.buildDir(user)
        },
        readMeta: function (path) {
            let file = getFile(path);
            if (file instanceof Error) {
                return "";
            }
            return file.meta;
        },
        delete: function (path) {
            if (getFile(path) instanceof Error) {
                return;
            }
            let parentDir = fileParse.join(path, "..");
            let dirName = fileParse.basename(path);
            let file = getFile(parentDir);
            delete file.content[dirName]
        },
        move: function (oldPath, newPath) {
            let file = getFile(oldPath);
            let newParentDir = getFile(fileParse.join(newPath, ".."));
            if (!(file instanceof Error) && !(newParentDir instanceof Error)) {
                let name = fileParse.basename(newPath);
                newParentDir.content[name] = file;
                this.delete(oldPath);
            }
        },
        getFile: function (file) {
            return getFile(file);
        }
    },
    read: function (user, path) {
        let file = getFile(path);
        if (file instanceof Error) {
            return file;
        }
        let hasPermissions = checkPermission(user, file, "r");
        if (!hasPermissions) {
            return new Error("Missing permission");
        }
        let outpipe = new Pipe();
        let fileType = file.meta.type;
        (async function solve() {
            switch (fileType) {
                case "dir":
                    await sleep(10);
                    outpipe.write(JSON.stringify([".", "..", ...Object.keys(file.content)]))
                    outpipe.done()
                    break;
                case "file":
                    if (!file.content) {
                        await sleep(1);
                        outpipe.write("")
                        outpipe.done();
                        break;
                    }
                    await sleep(10);
                    file.content.split("").forEach(async function (char, i, arr) {
                        await sleep(1);
                        outpipe.write(char);
                        if (i == arr.length - 1) {
                            outpipe.done();
                        }
                    });
                    break;
                case "specialFile":
                    specialFiles[file.content].read(outpipe)
                    break;
            }
        })();
        return outpipe;
    },
    readAsUrl: function (user, path) {
        let result = this.read(user, path);
        let outputPipe = new Pipe();
        result.ondone = function (result) {
            outputPipe.write(URL.createObjectURL(new Blob([String(result)])));
            outputPipe.done();
        }
        return outputPipe;
    },
    write: function (user, path, pipe, clear) {
        let file = getFile(path);
        if (file instanceof Error) {
            let fileName = fileParse.basename(path);
            let parentDir = path;
            parentDir = fileParse.join(parentDir, "..");
            file = getFile(parentDir);
            if (file instanceof Error) {
                return file
            }
            let hasPermissions = checkPermission(user, file, "w");
            if (!hasPermissions) {
                return new Error("Missing permission");
            }
            if (file.meta.type != "dir") {
                return new Error("not a directory")
            }
            file.content[fileName] = builders.buildFile(user);
            if (typeof pipe == "string") {
                file.content[fileName].content = pipe;
                return
            }
            pipe.onwrite = function (char) {
                file.content[fileName].content += char;

            }
            return undefined
        }
        let hasPermissions = checkPermission(user, file, "w");
        if (!hasPermissions) {
            return new Error("Missing permission");
        }
        let fileType = file.meta.type;
        switch (fileType) {
            case "dir":
                return new Error("can't write to directory");
            case "specialFile":
                specialFiles[file.content].write(pipe);
                break;
            case "file":
                file.meta.changeDate = new Date().getTime()
                if (clear) {
                    file.content = "";
                }
                if (typeof pipe == "string") {
                    file.content = pipe;
                    return
                }
                pipe.onwrite = function (char) {
                    file.content += char;
                }
        }

    },
    mkdir: function (user, path) {
        if (!getFile(path) instanceof Error) {
            return new Error("already exists")
        }
        let parentDir = fileParse.join(path, "..");
        let dirName = fileParse.basename(path);
        let file = getFile(parentDir);
        if (file instanceof Error) {
            return file
        }
        if (!checkPermission(user, file, "w")) {
            return new Error("missing permission");
        }
        if (file.meta.type != "dir") {
            return new Error("cant create dir in file")
        }
        file.content[dirName] = builders.buildDir(user)
    },
    readMeta: function (path) {
        let file = getFile(path);
        if (file instanceof Error) {
            return file;
        }
        return file.meta
    },
    rm: function (user, path) {
        if (getFile(path) instanceof Error) {
            return new Error("not found")
        }
        let parentDir = fileParse.join(path, "..");
        let dirName = fileParse.basename(path);
        let file = getFile(parentDir);
        if (!checkPermission(user, file, "w")) {
            return new Error("mssing permission")
        }
        delete file.content[dirName]
    },
    changeMeta: function (user, path, key, value) {
        let file = getFile(path);
        if (file instanceof Error) {
            return file;
        }
        if (!checkPermission(user, file, "w")) {
            return new Error("missing permission");
        }
        if (key == "owner" && user != file.meta.owner && user != "root") {
            return new Error("missing permission");
        }
        file.meta[key] = value;
    },
    fileExists: function (path) {
        let file = getFile(path);
        if (file instanceof Error) {
            return false
        }
        return true;
    },
    fs: filesystem.data
}