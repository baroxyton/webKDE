AsyncFunction = (async function () { }).constructor

class Pipe {
    constructor() {

        // Array of all events to keep track of
        this.writeListener = [];
        this.doneListener = [];

        this.result = "";
    }

    // Enables adding listeners like this:
    // instance.onwrite = [Object Function]
    set onwrite(listener) {
        this.writeListener.push(listener);
    }

    // Enables adding listeners like this:
    // instance.ondone = [Object Function]
    set ondone(listener) {
        this.doneListener.push(listener);
    }

    // To write data to the pipe. Events receive current part of input
    write(input) {
        this.result += input;
        this.writeListener.forEach(listener => listener(input));
    }

    // When no more output is expected
    done() {
        this.doneListener.forEach(listener => listener(this.result))
    }
}

let callbackId = 0;
let callbackQueue = {}

// Get callback result as promise
function getCallback(data, isPersistent) {
    data.callbackId = callbackId;
    postMessage(data);
    callbackId++;
    return new Promise(function (res) {
        function onRes(data) {
            res(data)
        }
        callbackQueue[callbackId - 1] = {
            isPersistent,
            ondone: onRes
        }
    })
}
// Api object
api = {
    // Access current user with api.user
    user: "",
    // These are the input/output pipes
    io: {

        // Usage: api.io.stdout.output.write("some text")
        stdout: {
            output: new Pipe()
        },

        // Write {{{clear}}} to input to clear it
        stdin: {
            input: new Pipe(),
            output: new Pipe()
        },

        stderr: {
            input: new Pipe(),
            output: new Pipe()
        },
        // Everytime user presses key, javascript event is sent
        keys: {
            input: new Pipe()
        }
    },
    // api.env.read(key) to read env value
    // api-env.write(key, value) to set env value
    env: {
        read: async function (key) {
            let env = await getCallback({
                type: "env",
                key
            });
            return env
        },
        write: function (key, value) {
            postMessage({
                type: "env",
                key,
                value
            })
        }
    },
    // api.exec(command) to exec command. Executed with current process user
    exec: async function (command) {
        let data = await getCallback({ type: "exec", command })
        return data;
    },
    spawnWindow: async function (url, args) {
        getCallback({ type: "spawnWindow", url, args })
    },
    openFile: async function(location){
        getCallback({type:"openFile",location});
    },
    // Execute javascript outside of sandbox (Example: alert(1) )
    // Requires root permissions
    execjs: async function (code) {
        let data = await getCallback({ type: "execjs", code });
        return data;
    },
    // Terminate own process
    application: {
        quit: function () {
            api.io.stdout.output.done()
        }
    },
    // Command arguments can be accessed using api.args
    args: [],
    // Use api.fs("operation",[arguments]) to execute filesystem operation
    // binaryApi.js has all arguments and operations
    fs: async function (operation, args) {
        let data = await getCallback({ type: "fs", operation, args })
        console.log(data);
        return data;
    },

    // Prompt user for root permission
    // Application is terminated if the user cancels the request
    elevate: async function () {
        let data = await getCallback({ type: "elevate" })
        if (!data) {
            api.io.stderr.output.write("Denied root access");
            api.application.quit()
        }
        api.user = "root"
    },
    // Makes web request, use proxy to avoid CORS
    web: async function (url) {
        let data =  (await (await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)).json()).contents;
        return data;
    }
}
api.io.stdout.output.onwrite = function (data) {
    postMessage({ type: "stdout", data })
}
api.io.stdin.output.onwrite = function (data) {
    postMessage({ type: "stdin", data })
}
api.io.stderr.output.onwrite = function (data) {
    postMessage({ type: "stderr", data })
}
api.io.stdout.output.ondone = function () {
    postMessage({ type: "exit" })
};
(function () {
    window = (function () { return this })();

    function hide(name) {
        window.__defineGetter__(name, function () {
            return null
        })
    }
    let ban = ["Caches", "localStorage", "indexed", "location", "navigator", "onerror", "performance", "webkitIndexedDB", "importScripts"]
    ban.forEach(function (obj) {
        hide(obj)
    })
})();
onmessage = function (e) {
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