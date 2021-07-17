// Class used mainly by binaries for standard inputs/outputs
export class Pipe {
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

    // When no more is expected
    done() {
        this.doneListener.forEach(listener => listener(this.result))
    }
}