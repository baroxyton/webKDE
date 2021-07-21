import Channel from "./communication.js"
class ProgramApi {
    constructor(user, windowObject) {
        this.window = windowObject;
        this.user = user;
        this.channel = new Channel(this.window.querySelector("iframe"));
    }
}
export {ProgramApi as default};