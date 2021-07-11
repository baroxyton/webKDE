export function Pipe() {
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