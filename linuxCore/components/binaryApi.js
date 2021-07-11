import { Pipe } from "/linuxSimulator/components/pipe.js"
import { fileapi } from "/linuxSimulator/components/fileapi.js"
import { path } from "/linuxSimulator/lib/path.js"
export function generateApi(data, execAs) {
    let api = {
        data: {
            env: data.env,
            user: execAs
        },
        io: {
            stdin: new Pipe(),
            stdout: new Pipe(),
            stderr: {
                input: new Pipe(),
                output: new Pipe()
            },
            keys: new Pipe()
        },
        fs: {
            read: function(path) {
                return fileapi.read(api.data.user, path);
            },
            write: function(path, pipe, clear) {
                return fileapi.write(api.data.user, path, pipe, clear);
            },
            mkdir: function(path) {
                return fileapi.mkdir(api.data.user, path)
            },
            readMeta: fileapi.readMeta,
            changeMeta: function(path, key, value) {
                return fileapi.changeMeta(api.data.user, path, key, value)
            },
            rm: function(path) {
                return fileapi.rm(api.data.user, path);
            },
            fileExists: fileapi.fileExists,
            join: path.join,
            resolve: path.resolve
        }
    };
    api.io.stdin.output = new Pipe()
    return api
}