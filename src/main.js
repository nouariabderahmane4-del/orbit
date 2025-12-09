import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js'; // <--- Import this

const engine = new SceneSetup('scene-container');
const inputManager = new InputManager(engine.camera, engine.scene);

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
const guiManager = new GuiManager(planets); // <--- Start the GUI

function animate() {
    requestAnimationFrame(animate);

    // Get the global speed multiplier
    const timeScale = guiManager.params.timeScale;

    planets.forEach(planet => {
        // Pass the timeScale to the update method
        planet.update(timeScale);
    });

    inputManager.checkIntersections(planets);
    engine.render();
}

animate();