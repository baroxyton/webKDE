//default/example binaries. Source code and documentation for api can be found in binarysandbox.js
import { compile } from "/linuxSimulator/components/binarycompile.js"
let defaultBinaries = {
    //change directory command for navigation
    cd: compile(async function() {
        //get current path
        let currentDir = await api.env.read("PWD");
        //combine paths with api
        let newPath = await api.fs("resolve", [currentDir, api.args[0]]);
        //if no argument is passed, return to users home
        if (!api.args[0]) {
            newPath = "/home/" + api.user
        }
        //set new path
        api.env.write("PWD", newPath);
        //quit
        api.application.quit();
    }),
    //sleep command for waiting after the next command
    sleep: compile(async function() {
        //parse argument
        let ms = parseFloat(api.args[0]) * 1000
            //use promises to exit after specified time
        await new Promise(function(res) {
            setTimeout(res, ms)
        });
        api.application.quit();
    }),
    //ls command for listing directory contents
    ls: compile(async function() {
        //get current path/working directory
        let currentDir = await api.env.read("PWD");
        //check if "a"-argument is passed
        let specialArgs = [];
        if (api.args[0] && api.args[0].startsWith("-")) {
            specialArgs = api.args[0].slice(1).split(" ")
        }
        //parse directory argument
        let dir = api.args[0];
        if (specialArgs.length) {
            dir = api.args[1];
        }
        if (!dir) {
            dir = "."
        }
        dir = await api.fs("resolve", [currentDir, dir]);
        //print error if target is no directory
        let meta = await api.fs("readMeta", [dir]);
        meta = JSON.parse(meta)
        if (meta.type != "dir") {
            console.log(meta)
            api.io.stderr.output.write("Unable to list contents of a " + meta.type);
            api.application.quit();
        }
        //get file list from api
        let output = await api.fs("read", [dir]);
        output = JSON.parse(output);
        //if a argument wasnt passed hide dot-files
        if (!specialArgs.includes("a")) {
            output = output.filter(function(file) {
                if (!file.startsWith(".")) {
                    return true
                }
            })
        }
        //print output
        api.io.stdout.output.write(output.join(" "));
        api.application.quit();
    }),
    //cat-command for reading files
    cat: compile(async function() {
        //get specified file
        let currentDir = await api.env.read("PWD");
        let dir = await api.fs("resolve", [currentDir, api.args[0]]);
        //if no arg was passed quit
        if (!api.args[0]) {
            api.io.stderr.output.write("You must enter a flle");
            api.application.quit()
            return
        }
        //check if target exists, if not quit
        let fileExists = await api.fs("fileExists", [dir]);
        if (fileExists != "true") {
            api.io.stderr.output.write("File doesnt exist");
            api.application.quit()
        }
        //print file content and quit
        let content = await api.fs("read", [dir]);
        api.io.stdout.output.write(content);
        api.application.quit();
    }),
    //echo command for printing arguments
    echo: compile(async function() {
        //concat all args
        let output = api.args.join(" ");
        //print concated args and quit
        api.io.stdout.output.write(output);
        api.application.quit()
    }),
    //whoami command for printing current user
    whoami: compile(async function() {
        //get current user
        let name = api.user;
        //print and quit
        api.io.stdout.output.write(name);
        api.application.quit()
    }),
    //sudo command for executing commands as root-user
    sudo: compile(async function() {
        //concat all arguments
        let command = api.args.join(" ");
        //elevate to root user if user confirms
        await api.elevate()
            //execute command with elevated privilages,
            //print output and quit.
        let result = await api.exec(command);
        api.io.stdout.output.write(result);
        api.application.quit();
    }),
    //touch command for creating file
    touch: compile(async function() {
        //get path
        let currentDir = await api.env.read("PWD");
        let dir = await api.fs("resolve", [currentDir, api.args[0]]);
        //exit if file exists
        if ((await api.fs("fileExists", [dir])) == "true") {
            api.application.quit();
        }
        //create file and exit
        api.fs("write", [dir, ""]);
        api.application.quit()
    }),
    //rm command for removing files
    rm: compile(async function() {
        //get path
        let currentDir = await api.env.read("PWD");
        let dir = await api.fs("resolve", [currentDir, api.args[0]]);
        //if specified file doesnt exist, print error and quit
        if (!(await api.fs("fileExists", [dir])) == "true") {
            api.io.stderr.output.write("No such file");
            api.application.quit();
        }
        //delete file with api and quit
        api.fs("rm", [dir]);
        api.application.quit();
    }),
    //grep command for filtering output
    grep: compile(async function() {
        //when input process writes data, filter and output
        api.io.stdin.input.onwrite = function(txt) {
                txt = txt.split("\n");
                txt.forEach(function(item) {
                    if (item.includes(api.args[0])) {
                        api.io.stdout.output.write(item);
                    }
                })
            }
            //when input process ends, exit as well
        api.io.stdin.input.ondone = function() {
            api.application.quit()
        }
    }),
    //curl command for making requests
    curl: compile(async function() {
        //make sure url is valid
        let url = api.args[0];
        if (!url.startsWith("https://")) {
            api.io.stderr.output.write("invalid URL");
            api.application.quit()
        }
        //make web request. Uses proxy to avoid CORS problems
        let output = await api.web(url);
        //print output and quit
        output.split("\n").forEach(function(line) {
            api.io.stdout.output.write(line + "\n");
        });
        api.application.quit();
    }),
    //clear command for clearing terminal
    clear: compile(async function() {
        //inbuilt in my REPL demo
        api.io.stderr.output.write("{{{clear}}}");
        api.application.quit();
    }),
    //pwd for printing current path
    pwd: compile(async function() {
        //get path
        let path = await api.env.read("PWD");
        //print output and quit
        api.io.stdout.output.write(path);
        api.application.quit()
    }),
    //nano, a terminal editor
    nano: compile(async function() {
        //key event. Refresh screen after every possibility to make experience smooth
        api.io.keys.input.onwrite = function(e) {
                //when a key is pressed, clear the command input to prevent misunderstandings
                api.io.stdin.output.write("{{{clear}}}");
                //when ctrl+o is pressed save and exit
                if (e.key == "o" && e.ctrlKey) {
                    console.log("pressed combination")
                    api.fs("write", [path, content]);
                    api.application.quit()
                }
                //when right arrow is pressed, move carret to right
                if (e.key == "ArrowRight") {
                    if (cursor_position < content.length) {
                        cursor_position++;
                        render_frame();
                        return
                    }
                }
                //when left arrow is pressed, move carret to left
                if (e.key == "ArrowLeft") {
                    if (cursor_position != 0) {
                        cursor_position--;
                        render_frame();
                        return
                    }
                }
                //when backspace is pressed, remove character and move carret to left
                if (e.key == "Backspace") {
                    content = content.slice(0, cursor_position - 1) + content.slice(cursor_position);
                    cursor_position--;
                    render_frame();
                    return
                }
                //when enter key is pressed, add linefeed character and move carret to right
                if (e.key == "Enter") {
                    content = content.slice(0, cursor_position) + "\n" + content.slice(cursor_position);
                    cursor_position++;
                    render_frame();
                    return
                }
                //when normal key (letter, symbol etc) is pressed, add linefeed character and move carret to right
                if (e.key.length == 1) {
                    content = content.slice(0, cursor_position) + e.key + content.slice(cursor_position);
                    cursor_position++;
                    render_frame();
                    return
                }
            }
            //current carret visibility
        let show_cursor = true;
        let content = "";
        //toggle carret visibility twice a second
        setInterval(function() {
                show_cursor = !show_cursor;
                render_frame();
            }, 500)
            //current caret position
        let cursor_position = 0;
        //function to re-render the screen
        function render_frame() {
            console.log(cursor_position, "pos")
            let start = content.slice(0, cursor_position);
            let end = content.slice(cursor_position);
            let cursor = " ";
            if (show_cursor) {
                cursor = "|"
            }
            api.io.stderr.output.write("{{{clear}}}");
            api.io.stderr.output.write(start + cursor + end);
        }
        let currentDir = await api.env.read("PWD");
        let path = await api.fs("resolve", [currentDir, api.args[0]]);
        let fileExists = await api.fs("fileExists", [path]);
        if (fileExists == "true") {
            let fileContent = await api.fs("read", [path]);
            content = fileContent;
            cursor_position = content.length
        }
        //render file when command is started
        render_frame()
    }),
    //compile-command to create binaries from within the simulation
    compile: compile(async function() {
        let currentDir = await api.env.read("PWD");
        let path = await api.fs("resolve", [currentDir, api.args[0]]);
        let fileContent = await api.fs("read", [path]);
        let compiled = btoa(fileContent);
        api.fs("write", [path + ".compiled", compiled]);
        api.application.quit();
    }),
    //javascript command for executing javascript
    javascript: compile(function() {
        output = "";
        api.io.stderr.input.onwrite = function(code) {
            output += "> " + code + "\n";
            output += eval(code) + "\n";
            api.io.stderr.output.write("{{{clear}}}");
            api.io.stdout.output.write(output);
        }
    }),
    //mkdir command to create directory
    mkdir: compile(async function() {
        //get specified path
        let currentDir = await api.env.read("PWD");
        let dir = await api.fs("resolve", [currentDir, api.args[0]]);
        //if no arg was passed quit
        if (!api.args[0]) {
            api.io.stderr.output.write("You must enter a flle");
            api.application.quit()
            return
        }
        //check if target exists, if it does quit
        let fileExists = await api.fs("fileExists", [dir]);
        if (fileExists == "true") {
            api.io.stderr.output.write("Already exists");
            api.application.quit()
        }
        //create directory and quit
        api.fs("mkdir", [dir]);
        api.application.quit();
    }),
    //shows "command not found"-error
    "err:notfound": compile(async function() {
        api.io.stderr.output.write("this command was not found");
        api.application.quit()
    }),

};
//commands implemented so far:
//cd, sleep, ls, cat, echo, whoami, sudo, touch, rm, grep, curl, nano, compile, javascript, mkdir
export { defaultBinaries }