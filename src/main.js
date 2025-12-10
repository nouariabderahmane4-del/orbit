import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';
import { Spaceship } from './entities/Spaceship.js';

const engine = new SceneSetup('scene-container');

const uiManager = new UIManager();
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);

const starField = new StarField(engine.scene, 5000);

// --- Create the Ship ---
const spaceship = new Spaceship(engine.scene, engine.camera);
let isShipMode = false; // Default: Orbit Mode

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

// Initialize GUI (Keep for planet sliders, but remove Game Modes folder)
const guiManager = new GuiManager(planets);

// --- NEW: UI BUTTON TOGGLE LOGIC ---
const gamemodeBtn = document.getElementById('gamemode-btn');

gamemodeBtn.addEventListener('click', () => {
    // 1. Toggle State
    isShipMode = !isShipMode;

    if (isShipMode) {
        // --- ENTER SPACESHIP MODE ---
        inputManager.controls.enabled = false; // Disable Orbit Controls
        uiManager.hidePlanetInfo();            // Hide HUD

        // Update Button Visuals
        gamemodeBtn.textContent = "EXIT SPACESHIP";
        gamemodeBtn.classList.add('active');
    } else {
        // --- EXIT TO ORBIT MODE ---
        inputManager.controls.enabled = true;  // Re-enable Orbit

        // Reset camera safely
        engine.camera.position.set(0, 60, 140);
        engine.camera.lookAt(0, 0, 0);

        // Update Button Visuals
        gamemodeBtn.textContent = "ENTER SPACESHIP";
        gamemodeBtn.classList.remove('active');
    }
});

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