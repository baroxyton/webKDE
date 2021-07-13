"use strict";
export default {
    desktop: {
        backgroundimage: "/assets/icecold2.png",
        apps: [
            {
                name: "test.svg",
                icon: "/usr/share/icons/breeze-dark/mimetypes/application-vnd.openxmlformats-officedocument.wordprocessingml.document.svg",
                position:
                {
                    x: 0,
                    y: 0
                }
            },
            {
                name: "Kate",
                icon: "/usr/share/icons/breeze-dark/apps/kate.svg",
                position:
                {
                    x: 5,
                    y: 5
                }
            },
            {
                name: "Dolphin",
                icon: "/usr/share/icons/breeze-dark/places/folder.svg",
                position: {
                    x: 2,
                    y: 0
                }
            }],
        panels: [
            {
                height: 45,
                top: 100,
                width: 100,
                left: 0,
                items:[{type:"SearchMenuWidget"}]
            }
        ]
    },
    apps: {
        iconSize: 1,
        fontSize: "1em",
        fontColor: "white"
    }
}