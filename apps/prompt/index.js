import OSApi from "../../appApi/frontend/api.js"
let api = new OSApi();
api.done({
    height:innerHeight,
    width:innerWidth,
    minWidth:innerWidth,
    maxWidth:innerWidth,
    minHeight:innerHeight,
    maxHeight:innerHeight
})