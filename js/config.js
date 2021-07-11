export default {
    desktop: {
        backgroundimage: "/home/iron/Downloads/icecold2.png",
        apps: [
            {
                name: "Firefox",
                icon: "/usr/share/icons/hicolor/48x48/apps/firefox.png",
                position:
                {
                    x: 0,
                    y: 0
                }
            },
            {
                name: "Kate",
                icon: "/usr/share/icons/breeze-dark/apps/48/kate.svg",
                position:
                {
                    x: 5,
                    y: 5
                }
            },
            {
                name: "Dolphin",
                icon: "/usr/share/icons/breeze-dark/places/48/folder.svg",
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
                left: 0
            }
        ]
    },
    apps: {
        iconSize: 1,
        fontSize: "1em",
        fontColor: "white"
    }
}