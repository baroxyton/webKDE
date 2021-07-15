"use strict";
function parseTheme(rawTheme) {
    let result = {};
    let sections = rawTheme.split("\n\n");
    sections.forEach(section => {
        let sectionData = {};
        let sectionName;
        let sectionParts = section.split("\n");
        sectionParts.forEach((sectionPart, index) => {
            if (index == 0) {
                sectionName = sectionPart.slice(1, -1);
                return;
            }
            let data = sectionPart.split("=");
            sectionData[data[0]] = data[1];
        });
        result[sectionName] = sectionData;
    })
    return result;
}
class ThemeLoader {
    constructor(rawTheme) {
        this.parsedTheme = parseTheme(rawTheme);
        this.render()
    }
    render() {
        this.element = document.createElement("style");
        this.element.innerHTML = `
        .app:hover{
            background-color: rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal},0.4);
            box-shadow: inset 0px 0px 0px 1px rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal}, 0.8);
        }
        .selectedapp {
            background-color: rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal}, 0.8) !important;
            box-shadow: none !important;
        }
        .panel{
            background-color: rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
            color:rgb(${this.parsedTheme["Colors:View"].ForegroundNormal});
        }
        .menu{
            background-color:rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
            border: 1px rgb(${this.parsedTheme["Colors:Window"].BackgroundAlternate}) solid;
        }
        .menuText{
            color:rgb(${this.parsedTheme["Colors:View"].ForegroundNormal});
        }
        .menuItem:hover{
            background-color: rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal}, 0.4);
            box-shadow: inset 0px 0px 0px 1px rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal}, 0.8);
        }
        .desktopdrag{
            background-color: rgba(${this.parsedTheme["Colors:Selection"].BackgroundNormal}, 0.2);
            box-shadow: inset 0px 0px 0px 1px rgba(${this.parsedTheme["Colors:Selection"].ForegroundNormal}, 0.4);
        }
        `
        document.head.appendChild(this.element);
    }
    remove() {
        if (this.element) {
            this.element.outerHTML = "";
        }
    }
    changeTheme(rawtheme) {
        this.parsedTheme = parseTheme(rawtheme);
        this.render()
    }
}
export { ThemeLoader as default };