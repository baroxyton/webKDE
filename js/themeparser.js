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
    constructor(rawTheme, font) {
        this.font = font;
        this.parsedTheme = parseTheme(rawTheme);
        this.render()
    }
    generateFont() {
        if (!this.font) {
            return "";
        }
        return `@font-face {
            font-family: linuxFont;
            src: url("${this.font}");
          }
          *{
              font-family:linuxFont;
          }`
    }
    render() {
        this.element = document.createElement("style");
        this.element.innerHTML = `
        ${this.generateFont()}
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
            border: 1px rgb(${this.parsedTheme["Colors:Window"].ForegroundInactive}) solid;
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
        .kwin{
            background-color:rgb(${this.parsedTheme["Colors:View"].BackgroundNormal});
        }
        .knavbar{
            background-color:rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
        }
        .minimizeIcon {
            filter: drop-shadow(1px 1px 1px rgba(42,46,50, 1));
            background-image:url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read("/usr/share/icons/breeze-dark/actions/window-minimize.svg"))}");
            color:rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal});
            background-size: 100% 100%;
        }
        .maximizeIcon{
            filter: drop-shadow(1px 1px 1px rgba(42,46,50, 1));
            background-image:url("data:image/svg+xml;base64,${btoa(debug.fileapi.internal.read("/usr/share/icons/breeze-dark/actions/window-maximize.svg"))}");
            color:rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal});
            background-size: 100% 100%;
        }
        .minimizeIcon:hover, .maximizeIcon:hover{
            background-color:rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
            filter: invert(100%);
        }
        .closeIcon{
            box-shadow: 0px 0px 2px rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
            background-image: url("data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <circle fill="rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal})" cx="12" cy="12" r="7"/> 
            <g transform="translate(1,1)">
              <path d="M11 3a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8M7.707 7L11 10.294l3.293-3.293.707.707-3.293 3.293L15 14.294l-.707.707L11 11.708l-3.293 3.293L7 14.294l3.293-3.293L7 7.708l.707-.707" class="ColorScheme-NegativeText" fill="rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal})"/>
            </g>
          </svg>`)}");
          background-position: center;
          background-size: 150% 150%;
        }
        .closeIcon:hover{
            background-image: url("data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <circle fill="rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal})" cx="12" cy="12" r="7"/>    
            <g transform="translate(1,1)">
                  <path d="M11 3a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8M7.707 7L11 10.294l3.293-3.293.707.707-3.293 3.293L15 14.294l-.707.707L11 11.708l-3.293 3.293L7 14.294l3.293-3.293L7 7.708l.707-.707" class="ColorScheme-NegativeText" fill="rgb(${this.parsedTheme["Colors:Window"].ForegroundNegative})"/>
                </g>
              </svg>`)}");
        }
        .kwintitle{
            color: rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal});
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