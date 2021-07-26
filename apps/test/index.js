import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.showToolbar([
    { name: "test", items: [{ text: "test",icon:"/usr/share/icons/breeze-dark/actions/document-save.svg", action: function () { alert("works!") } }] },
    { name: "anotherTest", items: [{ text: "hello", action: function () { alert("hell-o") } }] },
    { name: "name", items: [{ text: "whats up", action: function () { console.log("just another test") } }] }
]);
api.done();