import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';
import { Spaceship } from './entities/Spaceship.js'; // <--- 1. Import

const engine = new SceneSetup('scene-container');

const uiManager = new UIManager();
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);

const starField = new StarField(engine.scene, 5000);

// --- 2. Create the Ship ---
const spaceship = new Spaceship(engine.scene, engine.camera);
let isShipMode = false; // By default, we are in "God Mode" (Orbit)

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

// Search Logic
uiManager.setSearchCallback((query) => {
    // If we are flying the ship, we ignore search (or you could auto-pilot the ship!)
    if (isShipMode) {
        alert("Switch to Orbit Mode to use Search!");
        return;
    }

    const target = planets.find(p => p.data.name.toLowerCase() === query);
    if (target) {
        inputManager.focusOnPlanet(target);
    } else {
        alert(`Planet "${query}" not found!`);
    }
});

const guiManager = new GuiManager(planets);

// --- 3. Add a Toggle in the GUI ---
const modeParams = {
    mode: 'Orbit (God Mode)',
    toggle: () => {
        isShipMode = !isShipMode;

        if (isShipMode) {
            // SWITCH TO SHIP
            inputManager.controls.enabled = false; // Disable Orbit Controls
            uiManager.hidePlanetInfo(); // Hide HUD
            modeParams.mode = 'Spaceship (Pilot)';
        } else {
            // SWITCH TO ORBIT
            inputManager.controls.enabled = true; // Re-enable Orbit
            modeParams.mode = 'Orbit (God Mode)';

            // Reset camera to a safe spot so it doesn't get stuck in the ship
            engine.camera.position.set(0, 60, 140);
            engine.camera.lookAt(0, 0, 0);
        }
    }
};

// Add the button to the GUI
const folderModes = guiManager.gui.addFolder('Game Modes');
folderModes.add(modeParams, 'toggle').name('Toggle Ship/Orbit');
folderModes.add(modeParams, 'mode').listen().disable(); // Just a display label

function animate() {
    requestAnimationFrame(animate);

    const timeScale = guiManager.params.timeScale;

    planets.forEach(planet => {
        planet.update(timeScale);
    });

    if (isShipMode) {
        // Update Physics
        spaceship.update();
    } else {
        // Update Mouse/Click Interaction
        inputManager.update(planets);
    }

    engine.render();
}

animate();