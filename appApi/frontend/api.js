import Channel from "./communication.js"
class OSApi{
    constructor(){
        this.channel = new Channel(window.parent);
    }
}
export {OSApi as default};