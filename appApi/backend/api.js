import Channel from "./communication.js"
class ProgramApi {
    constructor(user, windowObject) {
        this.windowObject = windowObject;
        this.window = windowObject.element;
        this.user = user;
        this.channel = new Channel(this.window.querySelector("iframe"));
        this.channel.onevent = data=>{
            switch(data.event){
                case "loaded":
                    data.respond({
                        user: this.user,
                        theme: desktop.theme.rawTheme,
                        font: desktop.theme.font
                    })
            }
        }
    }
}
export {ProgramApi as default};