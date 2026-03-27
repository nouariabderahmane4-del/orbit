export const planetData = [
    {
        name: "Mercury",
        color: 0xA5A5A5,
        size: 0.8,
        distance: 10,
        speed: 0.04,
        texture: "./public/textures/mercury.jpg",
        description: "The smallest planet in our solar system and closest to the Sun.",
        details: { mass: "0.330 x 10^24 kg", temp: "167 °C", gravity: "3.7 m/s²" }
    },
    {
        name: "Venus",
        color: 0xE3BB76,
        size: 1.5,
        distance: 15,
        speed: 0.02,
        texture: "./public/textures/venus.jpg",
        atmosphere: { color: 0xFFA500, opacity: 0.6 },
        description: "Spinning in the opposite direction to most planets, Venus is the hottest planet.",
        details: { mass: "4.87 x 10^24 kg", temp: "464 °C", gravity: "8.87 m/s²" }
    },
    {
        name: "Earth",
        color: 0x2233FF,
        size: 1.6,
        distance: 20,
        speed: 0.015,
        texture: "./public/textures/earth.jpg",
        clouds: "./public/textures/earth_clouds.png",
        atmosphere: { color: 0x00aaff, opacity: 0.4 },
        description: "Our home planet is the only place we know of so far that’s inhabited by living things.",
        details: { mass: "5.97 x 10^24 kg", temp: "15 °C", gravity: "9.8 m/s²" },
        // --- NEW: MOONS ---
        moons: [
            { name: "Moon", size: 0.45, distance: 3, speed: 0.05, color: 0xcccccc }
        ]
    },
    {
        name: "Mars",
        color: 0xDD4522,
        size: 1.2,
        distance: 25,
        speed: 0.01,
        texture: "./public/textures/mars.jpg",
        atmosphere: { color: 0xff5500, opacity: 0.2 },
        description: "Mars is a dusty, cold, desert world with a very thin atmosphere.",
        details: { mass: "0.642 x 10^24 kg", temp: "-65 °C", gravity: "3.71 m/s²" },
        // --- NEW: MOONS ---
        moons: [
            { name: "Phobos", size: 0.1, distance: 2.0, speed: 0.08, color: 0x888888 },
            { name: "Deimos", size: 0.1, distance: 2.5, speed: 0.06, color: 0x999999 }
        ]
    },
    {
        name: "Jupiter",
        color: 0xD9A066,
        size: 3.5,
        distance: 35,
        speed: 0.005,
        texture: "./public/textures/jupiter.jpg",
        description: "Jupiter is more than twice as massive as the other planets combined.",
        details: { mass: "1898 x 10^24 kg", temp: "-110 °C", gravity: "24.79 m/s²" },
        // --- NEW: MOONS (The Galilean Moons) ---
        moons: [
            { name: "Io", size: 0.3, distance: 4.5, speed: 0.06, color: 0xeebb33 },
            { name: "Europa", size: 0.25, distance: 5.5, speed: 0.05, color: 0xffffff },
            { name: "Ganymede", size: 0.5, distance: 7.0, speed: 0.04, color: 0x998877 },
            { name: "Callisto", size: 0.4, distance: 8.5, speed: 0.03, color: 0x666666 }
        ]
    },
    {
        name: "Saturn",
        color: 0xEAD6B8,
        size: 3.0,
        distance: 45,
        speed: 0.003,
        texture: "./public/textures/saturn.jpg",
        description: "Adorned with a dazzling, complex system of icy rings, Saturn is unique.",
        details: { mass: "568 x 10^24 kg", temp: "-140 °C", gravity: "10.44 m/s²" },
        moons: [
            { name: "Titan", size: 0.6, distance: 6, speed: 0.04, color: 0xffcc33 }
        ]
    },
    {
        name: "Uranus",
        color: 0xD1E7E7,
        size: 2.0,
        distance: 55,
        speed: 0.002,
        texture: "./public/textures/uranus.jpg",
        description: "Uranus rotates at a nearly 90-degree angle from the plane of its orbit.",
        details: { mass: "86.8 x 10^24 kg", temp: "-195 °C", gravity: "8.69 m/s²" }
    },
    {
        name: "Neptune",
        color: 0x5B5DDF,
        size: 2.0,
        distance: 65,
        speed: 0.001,
        texture: "./public/textures/neptune.jpg",
        description: "Neptune is dark, cold and whipped by supersonic winds.",
        details: { mass: "102 x 10^24 kg", temp: "-200 °C", gravity: "11.15 m/s²" }
    }
];