export const planetData = [
    {
        name: "Mercury",
        color: 0xA5A5A5,
        size: 0.8,
        distance: 10,
        speed: 0.04,
        texture: "./public/textures/mercury.jpg"
    },
    {
        name: "Venus",
        color: 0xE3BB76,
        size: 1.5,
        distance: 15,
        speed: 0.02,
        texture: "./public/textures/venus.jpg",
        atmosphere: { color: 0xFFA500, opacity: 0.6 } // Venus has a thick atmosphere
    },
    {
        name: "Earth",
        color: 0x2233FF,
        size: 1.6,
        distance: 20,
        speed: 0.015,
        texture: "./public/textures/earth.jpg",
        // NEW: Cloud layer
        clouds: "./public/textures/earth_clouds.png",
        // NEW: Atmosphere Glow
        atmosphere: { color: 0x00aaff, opacity: 0.4 }
    },
    {
        name: "Mars",
        color: 0xDD4522,
        size: 1.2,
        distance: 25,
        speed: 0.01,
        texture: "./public/textures/mars.jpg",
        atmosphere: { color: 0xff5500, opacity: 0.2 } // Thin red atmosphere
    },
    {
        name: "Jupiter",
        color: 0xD9A066,
        size: 3.5,
        distance: 35,
        speed: 0.005,
        texture: "./public/textures/jupiter.jpg"
    },
    {
        name: "Saturn",
        color: 0xEAD6B8,
        size: 3.0,
        distance: 45,
        speed: 0.003,
        texture: "./public/textures/saturn.jpg"
    },
    {
        name: "Uranus",
        color: 0xD1E7E7,
        size: 2.0,
        distance: 55,
        speed: 0.002,
        texture: "./public/textures/uranus.jpg"
    },
    {
        name: "Neptune",
        color: 0x5B5DDF,
        size: 2.0,
        distance: 65,
        speed: 0.001,
        texture: "./public/textures/neptune.jpg"
    }
];