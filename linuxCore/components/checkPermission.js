//all permissions possible
let permissions = {
    0: [],
    1: ["x"],
    2: ["w"],
    3: ["w", "x"],
    4: ["r"],
    5: ["r", "x"],
    6: ["r", "w"],
    7: ["r", "w", "x"]
}
export function checkPermission(user, file, operation) {
    //cuz he's root!
    if (user == "root") {
        return true
    }
    let owner = file.meta.owner;
    //assume that you aren't the owner
    let permission = file.meta.permission[2]
    if (owner == user) {
        permission = file.meta.permission[0]
    }
    if (permissions[permission].includes(operation)) {
        return true
    }
    return false
}