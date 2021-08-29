//import OSApi from "../../appApi/frontend/api.js"
import OSApi from "{{file:/usr/lib/api/api.js}}";
let api = new OSApi();
let categories = [
    "education",
    "engeineering",
    "system",
    "development",
    "internet",
    "games",
    "office",
    "graphics",
    "all",
    "utilities",
    "multimedia",
    "science",
    "network",
    "other"
];
let assignedApplications = {};
function parseApp(data){
    let result = {};
    let sections = data.split("\n\n");
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
            sectionData[data[0]] = data[1].split(";");
        });
        result[sectionName] = sectionData;
    })
    return result;
}
async function updateApps(){
    let appData = [];
    let appList =  (await api.filesystem("list", "/usr/share/applications")).read().content;
    appData = await Promise.all(appList.map(async app=>(await api.filesystem("read", "/usr/share/applications/"+app)).read().content));
    assignedApplications = {};
    appData.forEach(data=>{
        let parsedFile = parseApp(data);
        let name = parsedFile["Desktop Entry"].Name[0];
        let cmd = parsedFile["Desktop Entry"].Exec[0];
        let icon = parsedFile["Desktop Entry"].Icon[0];
        let fileCategories = parsedFile["Desktop Entry"].Categories||[];
        let app = {name, cmd, icon};
        categories.forEach(category=>{
            if(fileCategories.includes(category)||category=="all"){
                assignedApplications[category] = assignedApplications[category]||[];
                assignedApplications[category].push(app);
            }
        });
    });
    console.log(assignedApplications);
}
api.channel.onevent = data => {
    switch (data.event) {
        case "sigterm":

            // Add custom exit handler here
            api.quit();
            break;
    }
}
// Got api data (user, application arguments and all that stuff)
api.loadIcons()
api.gotData.then(async () => {
    // Render window
    api.done({
        title: "Title",
        icon: "/usr/share/icons/breeze-dark/categories/applications-development.svg"
    });
})
updateApps();