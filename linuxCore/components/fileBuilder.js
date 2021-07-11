export function buildFile(user, content) {
    content = content || "";
    return {
        meta: {
            changeDate: new Date().getTime(),
            owner: user,
            permission: [6, 6, 6],
            type: "file"
        },
        content: content
    }
}
export function buildDir(user) {
    return {
        meta: {
            changeDate: new Date().getTime(),
            owner: user,
            permission: [7, 7, 7],
            type: "dir"
        },
        content: {}
    }
}