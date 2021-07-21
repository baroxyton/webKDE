import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
(async function(){
    let output = await api.channel.write("test","req",true);
    alert(output);
})()