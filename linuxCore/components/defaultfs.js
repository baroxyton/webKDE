import { defaultBinaries } from "./defaultBinaries.js"
function downloadSync(url) {
    let xhr = new XMLHttpRequest();
    try{
    xhr.open("GET", url, false);
    xhr.send();
    }
    catch(err){
        alert(err);
    }
    return xhr.response;
}
export const defaultfs = {
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
                                        content: "Desktop comming soon? ;)"
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
                                    "plasma":{
                                        meta: {
                                            changeDate: 0,
                                            owner: "demo",
                                            permission: [7, 5, 5],
                                            type: "dir"
                                        },
                                        content:{}
                                    }
                                }
                            },
                            "Pictures":{
                                meta: {
                                    changeDate: 0,
                                    owner: "demo",
                                    permission: [7, 5, 5],
                                    type: "dir"
                                },
                                content:{
                                    "wallpaper.png":{
                                        meta: {
                                            changeDate: 0,
                                            owner: "demo",
                                            permission: [7, 5, 5],
                                            type: "file"
                                        },
                                        content:downloadSync("/assets/icecold2.png")
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
                                content: JSON.parse(downloadSync("assets/icons.json"))
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
                                        content: downloadSync("assets/NotoSans-Regular.ttf")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}