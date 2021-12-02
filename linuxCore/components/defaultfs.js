import { defaultBinaries } from "./defaultBinaries.js"
async function download(url) {
    if (localStorage.downloaded) {
        return "{}";
    }
    let response = await fetch("./" + url);
    let result = await response.text();
    return result;
}
async function downloadBinary(url) {
    if (localStorage.downloaded) {
        return "{}";
    }
    let response = await fetch("./" + url);
    let blob = await response.blob();
    let fr = new FileReader();
    fr.readAsBinaryString(blob);
    return new Promise(function (res) {
        fr.onload = function () {
            res(fr.result);
        }
    })
}
function generateFile(content) {
    return {
        meta: {
            changeDate: 0,
            owner: "root",
            permission: [7, 5, 5],
            type: "file"
        },
        content
    }
}
async function downloadDirectory(url, isbinary) {
    let dirData = {
        meta: {
            changeDate: 0,
            owner: "root",
            permission: [7, 5, 5],
            type: "dir"
        },
        content: {

        }
    };

    if (localStorage.downloaded) {
        return "{}";
    }
    let downloadCmd = (isbinary ? downloadBinary : download);
    let fileIndex = (await downloadCmd(url + "/index.txt")).split("\n");
    await Promise.all(fileIndex.map(async function (item) {
        if (!item) {
            return;
        }
        let content;
        if (item.endsWith("/")) {
            content = (await downloadDirectory(["/", url, item].join("/").replace(/(\/){1,}/g, "/")));
            console.log(content);
            item = item.slice(0, -1);
        }
        else {
            content = generateFile(await downloadCmd(["/", url, item].join("/").replace(/(\/){1,}/g, "/")));
        }
        dirData.content[item] = content;
    }));
    return dirData;
};

export const defaultfs = async function () {
    let fs = {
        "/": {
            meta: {
                changeDate: 0,
                owner: "root",
                permission: [7, 5, 5],
                type: "dir"
            },
            content: {
                bin: {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: {

                    }
                },
                "home": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: {
                        "demo": {
                            meta: {
                                changeDate: 0,
                                owner: "demo",
                                permission: [7, 5, 5],
                                type: "dir"
                            },
                            content: {
                                "welcome.txt": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "file"
                                    },
                                    content: "Welcome! This is your home directory"
                                },
                                "Desktop": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "credits.txt": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: "Credits: \n\nKDE idea & concept: https://kde.org\n\nBreeze dark & light theme\nLicense: LGPL\nSource: https://github.com/KDE/breeze/\n\npath.js browserify port\nLicense: MIT\nSource: https://github.com/browserify/path-browserify/blob/master/LICENSE\n\nbash tokonizer\nLicense: MIT\nSource: https://github.com/substack/node-shell-quote"
                                        }
                                    }
                                },
                                ".config": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "plasma.json": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: await download("/assets/plasmaConfig.json")
                                        },
                                        "mime.json": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: `{
                                                "text/plain":"kate",
                                                "application/json":"kate",
                                                "inode/directory":"dolphin"
                                            }`
                                        },
                                        "apps": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "dir"
                                            },
                                            content: {}
                                        }
                                    }
                                },
                                "Pictures": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "wallpaper.png": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: await downloadBinary("/assets/next.png")
                                        }
                                    }
                                },
                                "Downloads": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {}
                                },
                                "Documents": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {}
                                }
                            }
                        }
                    }
                },
                "root": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 0, 0],
                        type: "dir"
                    },
                    content: {}
                },
                "dev": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: {
                        "random": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "specialFile"
                            },
                            content: "random"
                        },
                        "urandom": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "specialFile"
                            },
                            content: "random"
                        },
                        "zero": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "file"
                            },
                            content: "0"
                        }
                    }
                },
                "bin": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: defaultBinaries
                },
                "usr": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: {
                        "lib": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "dir"
                            },
                            content: {
                                "api": await downloadDirectory("/assets/portapi"),
                                "binary": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "root",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "binarySandbox.js": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "root",
                                                permission: [7, 5, 5],
                                                type: "dir"
                                            },
                                            content: await download("/assets/binarySandbox.js")
                                        }
                                    }
                                }
                            }
                        },
                        "bin": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "dir"
                            },
                            content: {

                            }
                        },
                        "share": {
                            meta: {
                                changeDate: 0,
                                owner: "root",
                                permission: [7, 5, 5],
                                type: "dir"
                            },
                            content: {
                                "icons": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "root",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: JSON.parse(await download("assets/icons.json"))
                                },
                                "themes": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "root",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: JSON.parse(await download("assets/themes.json"))
                                },
                                "fonts": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "root",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "NotoSans-Regular.ttf": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "root",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: await downloadBinary("assets/NotoSans-Regular.ttf")
                                        }
                                    }
                                },
                                "applications": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "root",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: JSON.parse(await download("assets/apps.json"))
                                },
                                "widgets": await downloadDirectory("/widgets"),
                                "apps": await downloadDirectory("/apps")
                            }
                        }
                    }
                }
            }
        }
    };
    return fs;

}