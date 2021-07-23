import Channel from "./communication.js"
import ThemeLoader from "./themeLoader.js"
class OSApi{
    constructor(){
        this.channel = new Channel(window.parent);
        this.events();
    }
    async events(){
        this.data = (await this.channel.write("loaded",true, true)).data;
        this.theme = new ThemeLoader(this.data.theme, this.data.font)
        this.channel.onevent = data=>{
            switch(data.event){
                case "changeTheme":
                    this.theme.changeTheme(data.data);
                    break;
            }
        }
    }
}
export {OSApi as default};