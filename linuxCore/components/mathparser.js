export function mathParser(string) {
    let regex = /(\((.*?)\))|((\d){1,})|(\*\*)|(\+)|(\-)|(\*)|(\/)/g;
    let numreg = /(\d){1,}/;
    let patreg = /\(/;
    let result = 0;
    string.match(regex).forEach(function(item, index, arr) {
        if (!index) {
            if (item.match(patreg)) {
                result += parseMath(item.slice(1, -1));
                return
            }
            if (item.match(numreg)) {
                result += parseFloat(item);
                return
            }
        }
        if (item.match(numreg) || item.match(patreg)) {
            return
        }
        let num = parseFloat(arr[index + 1]);
        if (!num) {
            num = parseMath(arr[index + 1].slice(1, -1))
        }
        if (item == "+") {
            result += num
        }
        if (item == "-") {
            result -= num;
        }
        if (item == "*") {
            result *= num;
        }
        if (item == "/") {
            result = result / num
        }
        if (item == "**") {
            result = result ** num
        }
    })
    return result
}