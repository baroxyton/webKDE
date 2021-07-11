//library for parsing paths
import { path } from "/linuxSimulator/lib/path.js"
//library for parsing basic bash synthax
import { bashParser } from "/linuxSimulator/lib/parseBash.js"
//default filesystem
import { fileapi, getFile } from "/linuxSimulator/components/fileapi.js"
import { mathParser } from "/linuxSimulator/components/mathparser.js"
import { generateApi } from "/linuxSimulator/components/binaryApi.js"
import { Pipe } from "/linuxSimulator/components/pipe.js"
window.debug = { Pipe, bashParser, path, fileapi, parseCommand, runCommand, getCommandOutput, getFile }
export let allCommands = []
fileapi.onready.then(refreshCommands);

function refreshCommands() {
    allCommands = []
    data.env.PATH.split(":").forEach(function(dir) {
        let commands = Object.keys(getFile(dir).content);
        commands.forEach(function(command) {
            allCommands.push({
                command: command,
                dir: dir + "/" + command
            })
        })
    })
}
//some defaults
export let data = {
    env: {
        HOME: "/home/demo",
        PWD: "/home/demo",
        PATH: "/bin:/usr/bin",
        LOGNAME: "demo"
    },
    computer: "linux",
    user: "demo"
}

export function parseCommand(command) {
    //parse arguments and operators
    command = bashParser.parse(command, data.env);
    let execTree = [];
    let commands = [];
    let currentCommand = { items: [], end: "none" }
        //split commands
    command.forEach(function(item, index, arr) {
        if (typeof item == "string") {
            currentCommand.items.push(item);
            if (index + 1 == arr.length) {
                commands.push(currentCommand);
            }
            return
        }
        if ([";", "&", ">", "&&", ">>", "|"].includes(item.op)) {
            currentCommand.end = item.op;
            commands.push(currentCommand);
            currentCommand = { items: [], end: "none" }
            return;
        }
        currentCommand.items.push(item);
        if (index + 1 == arr.length) {
            commands.push(currentCommand);
        }
    })
    commands.forEach(function(command, index) {
        let execRegex = /\$\((.*?)\)/;
        let mathRegex = /\$\(\((.*?)\)\)/;
        command.items = command.items.map(function(arg, index) {
            let type = "argument";
            if (index == 0) {
                type = "command"
            }
            if (typeof arg == "string") {
                return { type: type, parse: "string", content: arg }
            }
            if (arg.comment) {
                return { type: "comment" }
            }
            if (arg.op.match(mathRegex)) {
                return { type: type, parse: "math", content: arg.op.match(mathRegex)[1] }
            }
            if (arg.op.match(execRegex)) {
                return { type: type, parse: "exec", content: arg.op.match(execRegex)[1] }
            }
        });
        command.items = command.items.filter(function(item) {
            if (item.type != "comment") {
                return item
            }
        })
        execTree.push({
            command
        })
    })
    return execTree
}

function findBinary(name) {
    refreshCommands();
    if (name.includes("/")) {
        return path.resolve(data.env.PWD, name);
    }
    let cmd = allCommands.find(function(item) {
        if (item.command == name) {
            return true
        }
    });
    if (!cmd) {
        return "/bin/err:notfound"
    }
    return cmd.dir
}

function getCommandOutput(command) {
    return new Promise(function(res) {
        let output = "";
        let hook = {
            changeCommand: function(api) {
                api.io.stdout.ondone = function(txt) {
                    output += txt;
                }
            },
            ondone: function() {
                res(output)
            }
        }
        runCommand(command, hook)
    })
}
export let processes = [{
    name: "init",
    user: "root",
    api: {}
}]
export async function runCommand(command, hook) {
    let apiGen = (hook && hook.generateApi || generateApi)
    let parsed = parseCommand(command);

    async function parseArgsRun(treeBranch, index, api) {
        api = api || apiGen(data, data.user);
        let binary;
        let args = [];
        let end = treeBranch.command.end;
        await Promise.all(treeBranch.command.items.map(async function(arg, index, arr) {

            let type = arg.type;
            switch (arg.parse) {
                case "string":
                    arg = arg.content;
                    break;
                case "math":
                    arg = mathParser(arg.content);
                    break;
                case "exec":
                    arg = await getCommandOutput(arg.content);
            }
            if (type == "command") {
                binary = findBinary(arg)
                return;
            }
            args.push(arg)
        }));
        api.pid = processes.length;
        processes.push({
            name: command,
            user: api.data.user,
            api
        })
        if (hook && hook.changeCommand) {
            hook.changeCommand(api, binary, args, api.pid)
        }
        runBinary(binary, args, api);
        switch (end) {
            case "none":
                api.io.stdout.ondone = function() {
                    if (hook && hook.ondone) {
                        hook.ondone()
                    }
                }
                break;
            case ";":
            case "\n":
                let nextCmd = parsed[index + 1];
                api.io.stdout.ondone = function() {
                    if (nextCmd) {
                        parseArgsRun(nextCmd, index + 1);
                    }
                }
                break;
            case "&":
                parseArgsRun(parsed[index + 1], index + 1);
                break;
            case ">":
                api.hideout = true
                api.io.stdout.onwrite
                api.fs.write(path.resolve(api.data.env.PWD, parsed[index + 1].command.items[0].content), api.io.stdout, true);
                api.io.stdout.ondone = function() {
                    let nextCommand = parsed[index + 2];
                    if (nextCommand) {
                        parseArgsRun(nextCommand, index + 2);
                        return
                    }
                    if (hook && hook.ondone) {
                        hook.ondone()
                    }
                }
                break;
            case ">>":
                api.hideout = true
                api.fs.write(path.resolve(api.data.env.PWD, parsed[index + 1].command.items[0].content), api.io.stdout);
                api.io.stdout.ondone = function() {
                    let nextCommand = parsed[index + 2];
                    if (nextCommand) {
                        parseArgsRun(nextCommand, index + 2);
                        return
                    }
                    if (hook && hook.ondone) {
                        hook.ondone()
                    }
                }
                break;
            case "|":
                api.hideout = true
                let newApi = apiGen(data, data.user);
                parseArgsRun(parsed[index + 1], index + 1, newApi);
                api.io.stdout.onwrite = function(txt) {
                    newApi.io.stdin.write(txt)
                }
                api.io.stdout.ondone = function() {
                    api.io.stdin.done()
                }
            default:
                console.log(end);
                break;
        }
        return api;
    }
    await parseArgsRun(parsed[0], 0)
}

export async function runBinary(path, args, api) {
    let content = getFile(path).content;
    let execWorker = new Worker("/linuxSimulator/components/binarysandbox.js");
    api.worker = execWorker
    execWorker.postMessage({
        type: "run",
        user: api.data.user,
        args,
        content
    });
    api.io.stdin.onwrite = function(txt) {
        execWorker.postMessage({
            type: "io",
            std: "stdin",
            content: txt
        });
    }
    api.io.stderr.input.onwrite = function(txt) {
        execWorker.postMessage({
            type: "io",
            std: "stderr",
            content: txt
        });
    }
    api.io.keys.onwrite = function(txt) {
        execWorker.postMessage({
            type: "io",
            std: "keys",
            content: txt
        });
    }
    api.io.stdin.ondone = function() {
        execWorker.postMessage({
            type: "ioend",
            std: "stdin"
        });
    }
    api.io.stdout.ondone = function() {
        api.worker.terminate()
    }
    execWorker.onmessage = function(e) {
        console.log(e.data)
        let data = e.data;
        switch (data.type) {
            case "exit":
                api.io.stdout.done()
                break;
            case "stdout":
                api.io.stdout.write(data.data);
                break;
            case "stderr":
                api.io.stderr.output.write(data.data);
                break;
            case "stdin":
                api.io.stdin.output.write(data.data);
                break;
            case "fs":
                let desiredFunc = api.fs[data.operation];
                let pipe = desiredFunc(...data.args);
                if (typeof pipe == "string") {
                    console.log("its string")
                    execWorker.postMessage({
                        type: "callback",
                        id: data.callbackId,
                        output: pipe
                    });
                    break;
                }
                if (!pipe.write) {
                    execWorker.postMessage({
                        type: "callback",
                        id: data.callbackId,
                        output: JSON.stringify(pipe)
                    });
                    return
                }
                pipe.ondone = function(output) {
                    execWorker.postMessage({
                        type: "callback",
                        id: data.callbackId,
                        output
                    })
                }
                break;
            case "env":
                if (data.value) {
                    api.data.env[data.key] = data.value;
                    console.log("changed env to ", api.data.env)
                    return
                }
                if (data.key) {
                    execWorker.postMessage({
                        type: "callback",
                        id: data.callbackId,
                        output: api.data.env[data.key]
                    });
                    return
                }
                execWorker.postMessage({
                    type: "callback",
                    id: data.callbackId,
                    output: JSON.stringify(api.data.env)
                });
                break;
            case "elevate":
                let allow = confirm("Give program root/admin access?");
                if (allow) {
                    api.data.user = "root";
                    console.log("gave root", api)
                }
                execWorker.postMessage({
                    type: "callback",
                    id: data.callbackId,
                    output: allow
                });
                break;
            case "exec":
                let output = "";
                let user = api.data.user;
                let hook = {
                    ondone: function() {
                        execWorker.postMessage({
                            type: "callback",
                            id: data.callbackId,
                            output
                        });
                    },
                    generateApi: function(data) {
                        return generateApi(data, user)
                    },
                    changeCommand: function(api) {
                        api.io.stdout.onwrite = function(data) {
                            output += data;
                        }
                    }
                }
                runCommand(data.command, hook)
                break;
            case "execjs":
                if (api.data.user != "root") {
                    execWorker.postMessage({
                        type: "callback",
                        id: data.callbackId,
                        output: "{}"
                    });
                    return
                }
                execWorker.postMessage({
                    type: "callback",
                    id: data.callbackId,
                    output: eval(data.code)
                });
                break;
        }
    }
}