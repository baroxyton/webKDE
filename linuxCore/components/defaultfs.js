import { defaultBinaries } from "./defaultBinaries.js"
async function download(url) {
    if (localStorage.downloaded) {
        return "{}";
    }
    let response = await fetch(url);
    let result = await response.text();
    return result;
}
async function downloadBinary(url){
    if (localStorage.downloaded) {
        return "{}";
    }
    let response = await fetch(url);
    let blob = await response.blob();
    let fr = new FileReader();
    fr.readAsBinaryString(blob);
    return new Promise(function(res){
        fr.onload = function(){
            res(fr.result);
        }
    })
}
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
                                    content: "Welcome! This is a linux simulator"
                                },
                                "Desktop": {
                                    meta: {
                                        changeDate: 0,
                                        owner: "demo",
                                        permission: [7, 5, 5],
                                        type: "dir"
                                    },
                                    content: {
                                        "info.txt": {
                                            meta: {
                                                changeDate: 0,
                                                owner: "demo",
                                                permission: [7, 5, 5],
                                                type: "file"
                                            },
                                            content: "A web clone of linux and KDE!"
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
                    content: {
                        "echo": defaultBinaries.echo,
                        "sleep": defaultBinaries.sleep,
                        "ls": defaultBinaries.ls,
                        "whoami": defaultBinaries.whoami,
                        "cd": defaultBinaries.cd,
                        "cat": defaultBinaries.cat,
                        "sudo": defaultBinaries.sudo,
                        "touch": defaultBinaries.touch,
                        "rm": defaultBinaries.rm,
                        "grep": defaultBinaries.grep,
                        "curl": defaultBinaries.curl,
                        "clear": defaultBinaries.clear,
                        "pwd": defaultBinaries.pwd,
                        "compile": defaultBinaries.compile,
                        "nano": defaultBinaries.nano,
                        "javascript": defaultBinaries.javascript,
                        "mkdir": defaultBinaries.mkdir,
                        "err:notfound": defaultBinaries["err:notfound"]
                    }
                },
                "usr": {
                    meta: {
                        changeDate: 0,
                        owner: "root",
                        permission: [7, 5, 5],
                        type: "dir"
                    },
                    content: {
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
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return fs;

}