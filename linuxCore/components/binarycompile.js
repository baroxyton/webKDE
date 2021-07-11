export function compile(func) {
    func = func.toString();
    func = btoa(func.slice(func.indexOf("{") + 1, func.lastIndexOf("}")));
    return {
        meta: {
            changeDate: 0,
            owner: "root",
            permission: [7, 5, 5],
            type: "file"
        },
        content: func
    }
}