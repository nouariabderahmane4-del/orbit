import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js'; // <--- 1. Import

const engine = new SceneSetup('scene-container');

// --- 2. Create UI Manager ---
const uiManager = new UIManager();

// --- 3. Pass it to Input Manager ---
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);

const starField = new StarField(engine.scene, 5000);

const planets = [];

// Create Sun
const sun = new Planet({
    name: "Sun",
    size: 6.6825,
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

    inputManager.update(planets);

    engine.render();
}

animate();