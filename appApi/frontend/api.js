import Channel from "./communication.js"
import ThemeLoader from "./themeLoader.js"
class OSApi{
    constructor(){
        this.channel = new Channel(window.parent);
        this.events();
    }
    async events(){
        this.data = (await this.channel.write("loaded",true, true)).data;
        new ThemeLoader(this.data.theme, this.data.font)
    }
}
export {OSApi as default};