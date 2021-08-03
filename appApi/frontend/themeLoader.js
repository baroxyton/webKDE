"use strict";
// Parses a KDE color scheme and returns an object
function parseTheme(rawTheme) {
    /*
    // Example input:
    //    [Colors:Window]
    //    BackgroundNormal=5,20,7
    //    ForegroundNormal=200,200,200
    //
    //    [Colors:View]
    //    BackgroundNormal=5,20,7
    //    ForegroundNormal=200,200,200
    */

    let result = {};
    let sections = rawTheme.split("\n\n");
    // Iterate over sections
    sections.forEach(section => {
        let sectionData = {};
        let sectionName;
        let sectionParts = section.split("\n");

        // Iterate over data in section
        sectionParts.forEach((sectionPart, index) => {

            // It's the title/name line
            if (index == 0) {
                // Remove the brackets at the start and end
                sectionName = sectionPart.slice(1, -1);
                return;
            }
            // Extract data of current row
            let data = sectionPart.split("=");
            sectionData[data[0]] = data[1];
        });
        result[sectionName] = sectionData;
    })
    return result;
}
// Theme loader class generates and loads a CSS file from a font and raw theme

class ThemeLoader {
    constructor(rawTheme, font) {
        this.rawTheme = rawTheme;
        this.font = font;
        this.parsedTheme = parseTheme(rawTheme);

        this.render()
    }

    generateFont() {
        // Make font optional
        if (!this.font) {
            return "";
        }
        // Add font and make all elements use it
        return `@font-face {
            font-family: linuxFont;
            src: url("${this.font}");
          }
          *{
              font-family:linuxFont;
          }`
    }
    generateVars(){
        let result = `:root {
            `;
        for(let section in this.parsedTheme){
            for(let data in this.parsedTheme[section]){
                let value = this.parsedTheme[section][data];
                if(!value||section.includes("[")||!value.match(/^(((\d){1,3})(\,)?){3}$/)){
                    continue;
                }
                result += `--${section.replace(":","_")}_${data}: rgb(${value});\n`;
                result += `--${section.replace(":","_")}_${data}_raw: ${value};\n`
            }
        } 
        result += "}";
        console.log(result);
        return result;
    }

    render() {
        this.element = document.createElement("style");
        // Generate CSS from theme
        this.element.innerHTML = `
        ${this.generateVars()}
        ${this.generateFont()}
        body{
        background-color: rgb(${this.parsedTheme["Colors:Window"].BackgroundNormal});
        color: rgb(${this.parsedTheme["Colors:Window"].ForegroundNormal});
        user-select:none;
        text-align:center;
        }
        input,button,textarea,table{
            border:0px;
            padding:5px;
            background-color: rgb(${this.parsedTheme["Colors:Button"].BackgroundNormal});
            color: rgb(${this.parsedTheme["Colors:Button"].ForegroundNormal});
            box-shadow: 0px 0px 1px rgb(${this.parsedTheme["Colors:Button"].ForegroundInactive});
        }
        input:focus,button:focus,textarea:focus{
            box-shadow: 0px 0px 1px rgb(${this.parsedTheme["Colors:Button"].DecorationFocus});
        }
        button:focus{
            color: rgb(${this.parsedTheme["Colors:Button"].ForegroundActive});
        }
        `
        
        document.head.appendChild(this.element);
    }

    remove() {
        // Unloads the CSS element
        if (this.element) {
            this.element.outerHTML = "";
        }
    }
    // Changes the theme loaded by the class and regenerate
    changeTheme(rawtheme) {
        this.parsedTheme = parseTheme(rawtheme);
        this.render()
    }
}
export { ThemeLoader as default };