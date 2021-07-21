import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.channel.write("test","hello",true);