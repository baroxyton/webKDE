import OSApi from "../../appApi/frontend/api.js";
let api = new OSApi();

api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}
// Got api data (user, application arguments and all that stuff)
api.gotData.then(async () => {
// Render window
api.done({
    title: "Systemsettings",
    icon: "/usr/share/icons/breeze-dark/apps/systemsettings.svg"
});
})
api.loadIcons();
class SettingPage{
    constructor(header, customIO, htmlcontent){
        this.htmlcontent = htmlcontent;
        this.header = header;
        this.settings = []
        this.customIO = customIO;
    }
    async render(){
        this.settings = await this.customIO?.read()||[];
        document.getElementById("content").innerHTML = "";
        this.element = document.createElement("div");
        this.headerelm = document.createElement("h2");
        this.headerelm.innerHTML = this.header||"";
        this.element.appendChild(this.headerelm);
        this.htmlcontent?this.element.innerHTML=this.htmlcontent:0;
        document.getElementById("content").appendChild(this.element);
    }
}
class StartPage extends SettingPage{
    constructor(){
        super("Select a setting page");
        this.render();
    }
}
class AboutPage extends SettingPage{
    constructor(){
        super();
        this.htmlcontent = `
        <div style="text-align:left">
        <h2>About this OS</h2>
        <b>Inspired By:</b> KDE<br>
        <b>Github repo:</b> <a target="_blank" href='https://github.com/ironblockhd/webKDE'>https://github.com/ironblockhd/webKDE</a><br>
        <b>Theme:</b> Breeze<br>
        <b>Version:</b> 1.0
        </div>
        `;
        this.render();
    }
}
new AboutPage();