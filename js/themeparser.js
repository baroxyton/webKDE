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

function inactiveTheme(parsedTheme){
  let result = {...parsedTheme};
  for(let section in result){
  for(let element  in result[section]){
   if(element.includes("Inactive")){
    let normalName = element.slice(0, -8) + 'Normal';
    result[section][normalName] = result[section][element];
    }
   }
  }
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
    generateVars() {
        let result = `:root {
            `;
        for (let section in this.parsedTheme) {
            for (let data in this.parsedTheme[section]) {
                let value = this.parsedTheme[section][data];
                if (!value || section.includes("[") || !value.match(/^(((\d){1,3})(\,)?){3}$/)) {
                    continue;
                }
                result += `--${section.replace(":", "_")}_${data}: rgb(${value});\n`;
                result += `--${section.replace(":", "_")}_${data}_raw: ${value};\n`
            }
        }
        result += "}";
        return result;
    }
    render() {
        this.element = document.createElement("style");
        // Generate CSS from theme
        this.element.innerHTML = `
        ${this.generateFont()}
        ${this.generateVars()}
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
              <path d="M11 3a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8M7.707 7L11 10.294l3.293-3.293.707.707-3.293 3.293L15 14.294l-.707.707L11 11.708l-3.293 3.293L7 14.294l3.293-3.293L7 7.708l.707-.707" class="ColorScheme-NegativeText" fill="rgb(${this.parsedTheme["Colors:Tooltip"].BackgroundNormal})"/>
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
