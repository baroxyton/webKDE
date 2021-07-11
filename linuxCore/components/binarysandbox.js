AsyncFunction = (async function() {}).constructor

function Pipe() {
    let writeListener = [];
    let doneListener = [];
    this.listeners = { writeListener, doneListener }
    let fulltext = "";
    let self = this;
    Object.defineProperties(this, {
        "onwrite": {
            "set": function(lis) {
                writeListener.push(lis)
            }
        },
        "ondone": {
            "set": function(lis) {
                doneListener.push(lis)
            }
        }
    });
    this.ondone = function() {}
    this.write = function(text) {
        fulltext += String(text);
        writeListener.forEach(function(lis) {
            lis(text)
        })
    }
    this.done = function() {
        doneListener.forEach(function(lis) {
            lis(fulltext)
        })
    }
}
let callbackId = 0;
let callbackQueue = {}
    //this is to turn an api callback into a promise
function getCallback(data, isPersistent) {
    data.callbackId = callbackId;
    postMessage(data);
    callbackId++;
    return new Promise(function(res) {
        function onRes(data) {
            res(data)
        }
        callbackQueue[callbackId - 1] = {
            isPersistent,
            ondone: onRes
        }
    })
}
//api object
api = {
    //access current user with api.user
    user: "",
    //these are the input/output pipes
    io: {
        //write to stdout. can be piped wiht > >> or |
        //with with api.io.stdout.output.write("some text")
        stdout: {
            output: new Pipe()
        },
        //input. api.io.stdin.input.onwrite to access piped std
        //api.io.stdin.output.write to write to command input
        //write {{{clear}}} to input to clear it
        stdin: {
            input: new Pipe(),
            output: new Pipe()
        },
        //input is when someone types something, output is to show messages without piping them to stdout
        //write {{{clear}}} to clear console
        stderr: {
            input: new Pipe(),
            output: new Pipe()
        },
        //everytime user presses key, javascript event is sent
        keys: {
            input: new Pipe()
        }
    },
    //api.env.read(key) to read env value
    //api-env.write(key,value) to set env value
    env: {
        read: async function(key) {
            let env = await getCallback({
                type: "env",
                key
            });
            return env
        },
        write: function(key, value) {
            postMessage({
                type: "env",
                key,
                value
            })
        }
    },
    //api.exec(command) to exec command. Executed with current process user
    exec: async function(command) {
        let data = await getCallback({ type: "exec", command })
        return data;
    },
    //execute javascript outside of sandbox (Example: alert(1) )
    //requires root permissions
    execjs: async function(code) {
        let data = await getCallback({ type: "execjs", code });
        return data;
    },
    //use api.application.quit() to exit
    application: {
        quit: function() {
            api.io.stdout.output.done()
        }
    },
    //command arguments can be accessed using api.args
    args: [],
    //use api.fs("operation",[arguments]) to execute filesystem operation
    //binaryApi.js has all arguments and operations
    fs: async function(operation, args) {
        let data = await getCallback({ type: "fs", operation, args })
        console.log(data);
        return data;
    },
    //requests root permission
    //application is terminated if the user cancels the request
    elevate: async function() {
        let data = await getCallback({ type: "elevate" })
        if (!data) {
            api.io.stderr.output.write("Denied root access");
            api.application.quit()
        }
        //you cannot aquire root using this lol
        api.user = "root"
    },
    //makes web request, use proxy to avoid CORS
    web: async function(url) {
        let data = await (await fetch("https://proxy.ironblockhd.repl.co/?url=" + encodeURIComponent(url))).text();
        return data;
    }
}
api.io.stdout.output.onwrite = function(data) {
    postMessage({ type: "stdout", data })
}
api.io.stdin.output.onwrite = function(data) {
    postMessage({ type: "stdin", data })
}
api.io.stderr.output.onwrite = function(data) {
    postMessage({ type: "stderr", data })
}
api.io.stdout.output.ondone = function() {
    postMessage({ type: "exit" })
};
(function() {
    window = (function() { return this })();

    function hide(name) {
        window.__defineGetter__(name, function() {
            return null
        })
    }
    let ban = ["Caches", "localStorage", "indexed", "location", "navigator", "onerror", "performance", "webkitIndexedDB", "importScripts"]
    ban.forEach(function(obj) {
        hide(obj)
    })
})();
onmessage = function(e) {
    let data = e.data;
    console.log(data)
    switch (data.type) {
        case "run":
            api.user = data.user;
            try {
                api.args = data.args;
                let func = new AsyncFunction(atob(data.content));
                func()
            } catch (err) {
                console.log(err)
                api.io.stderr.output.write(String(err));
                api.application.quit();
            }
            break;
        case "callback":
            if (data.output == "{}") {
                api.io.stderr.output.write("API Error");
                api.application.quit()
            }
            let cb = callbackQueue[data.id];
            cb.ondone(data.output);
            if (!cb.isPersistent) {
                delete callbackQueue[data.id];
            }
            break;
        case "io":
            api.io[data.std].input.write(data.content);
            break;
        case "iodone":
            api.io[data.std].input.done(data.content);
            break;
        default:
            api.stderr.output.write("Error: Invalid message type: " + data.type);
            break;
    }
}