import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.channel.onevent = e=>{alert(JSON.stringify(e))}
api.channel.write("test",{},true);