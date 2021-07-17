// Wait within promise. Usage: await sleep(1000)
export const sleep = ms => {
    return new Promise(function (res) {
        setTimeout(res, ms)
    })
}