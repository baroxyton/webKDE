import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.channel.write("showToolbar",[
    { name: "test",items:[{text:"test"}] },
    { name: "anotherTest",items:[{text:"hello"}]},
    { name: "name" ,items:[{text:"whats up"}]}
])