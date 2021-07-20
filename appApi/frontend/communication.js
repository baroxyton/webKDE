let messageID = 0;

// Send an event/information
function write(id, subject, data, element, expectResponse = false) {
    let type = typeof data;
    let response = {
        type,
        event: subject,
        id,
        data
    };
    element.postMessage(response, "*");
}
// Write a response to a event
function writeResponse(id, data, element) {
    write(id, "response", data, element, false);
}
class Data {
    constructor(packet, element) {
        this.element = element;
        this.id = packet.id;
        this.data = data.data;
        this.event = data.event;
        this.type = data.type;
    }
    read() {
        return this.data;
    }
    respond(data) {
        return writeResponse(this.id, data, this.element);
    }
}
class Channel {
    constructor(element) {
        this.element = element;
        this.listeners = [];
        this.callbacks = {};
        element.addEventListener("message", event => {
            let data = event.data;
            let id = data.id;
            if (this.callbacks[id] && data.type == "response") {
                this.callbacks[id](new Data(data, this.element));
            }
            if (event.data != "response") {
                this.listeners.forEach(listener => listener(new Data(data, this.element)));
            }
        })
    }
    write(subject, data, expectResponse = false) {
        let id = messageID;
        write(id, subject, data, this.element, expectResponse);
        return new Promise(res => {
            if (expectResponse) {
                this.callbacks[id] = (data) => {
                    res(data);
                }
            }
        });
    }
    set onevent(func) {
        this.listeners.push(func);
    }
}
export {Channel as default};