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
                    });
                    break;
                case "showToolbar":
                    this.windowObject.showToolbar(data.read());
                    break;
                    case "done":
                    this.window.style.visibility = "visible";
                    this.windowObject.maxWidth = data.read()?.maxWidth||innerWidth;
                    this.windowObject.maxHeight = data.read()?.maxHeight||innerHeight;
                    this.windowObject.minWidth = data.read()?.minWidth||150;
                    this.windowObject.minHeight = data.read()?.minHeight||100;
                    this.windowObject.width = data.read()?.width||innerHeight*0.5;
                    this.windowObject.height = data.read()?.height||innerHeight*0.3;
                    this.window.style.width = this.windowObject.width+"px";
                    this.window.style.height = this.windowObject.height+"px";
            }
        }
    }
}
export {ProgramApi as default};