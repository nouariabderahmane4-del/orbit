import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';

const engine = new SceneSetup('scene-container');

// --- 1. Setup UI & Input ---
const uiManager = new UIManager();
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
    color: 0xFFFF00,
    description: "The star around which the earth orbits.",
    details: { mass: "1.989 x 10^30 kg", temp: "5500 °C", gravity: "274 m/s²" }
}, engine.scene);
planets.push(sun);

// Create Planets
planetData.forEach(data => {
    const planet = new Planet(data, engine.scene);
    planets.push(planet);
});

// --- 2. Connect Search Logic ---
// When the user hits Enter in the search bar, this runs:
uiManager.setSearchCallback((query) => {
    // A. Find the planet (Case insensitive)
    const target = planets.find(p => p.data.name.toLowerCase() === query);

    if (target) {
        // B. Fly to it
        inputManager.focusOnPlanet(target);
    } else {
        // C. Error feedback
        alert(`Planet "${query}" not found! Try 'Earth', 'Mars', or 'Saturn'.`);
    }
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