import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js'; // <--- 1. Import Here

const engine = new SceneSetup('scene-container');
const inputManager = new InputManager(engine.camera, engine.scene);

// --- 2. Create the Stars ---
// We pass the scene and the number of stars we want (e.g., 5000)
const starField = new StarField(engine.scene, 5000);

const planets = [];

// Create Sun
const sun = new Planet({
    name: "Sun",
    size: 5,
    distance: 0,
    speed: 0,
    texture: "./public/textures/sun.jpg",
    color: 0xFFFF00
}, engine.scene);
planets.push(sun);

// Create Planets
planetData.forEach(data => {
    const planet = new Planet(data, engine.scene);
    planets.push(planet);
});

// Initialize GUI
const guiManager = new GuiManager(planets);

function animate() {
    requestAnimationFrame(animate);

    const timeScale = guiManager.params.timeScale;

    planets.forEach(planet => {
        planet.update(timeScale);
    });

    inputManager.checkIntersections(planets);
    engine.render();
}

animate();