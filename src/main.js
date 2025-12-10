import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';
import { Spaceship } from './entities/Spaceship.js';
import * as THREE from 'three';

const engine = new SceneSetup('scene-container');
const uiManager = new UIManager();
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);
const starField = new StarField(engine.scene, 5000);

// --- SHIP SETUP ---
const spaceship = new Spaceship(engine.scene, engine.camera);
let isShipMode = false;

// Function to initialize planets (for use in reset)
function initializePlanets(planetsArray, scene) {
    // 1. Clear array contents
    planetsArray.length = 0;

    // 2. Create Sun
    const sun = new Planet({
        name: "Sun",
        size: 6.6825,
        distance: 0,
        speed: 0,
        texture: "./public/textures/sun.jpg",
        color: 0xFFFF00,
        description: "The Star.",
        details: { mass: "1.989 x 10^30 kg", temp: "5500 °C", gravity: "274 m/s²" }
    }, scene);
    planetsArray.push(sun);

    // 3. Create Default Planets
    planetData.forEach(data => {
        planetsArray.push(new Planet(data, scene));
    });

    return sun;
}

const planets = [];
const initialSun = initializePlanets(planets, engine.scene);
// Note: initializePlanets is now in main.js for easy resetting

uiManager.setSearchCallback((query) => {
    if (isShipMode) {
        alert("Switch to Orbit Mode to use Search!");
        return;
    }
    const target = planets.find(p => p.data.name.toLowerCase() === query);
    if (target) inputManager.focusOnPlanet(target);
    else alert(`Planet "${query}" not found!`);
});

const guiManager = new GuiManager(planets, engine.scene);

// --- OVERRIDE GUI MANAGER RESET TO HANDLE CAMERA/SHIP STATE ---
guiManager.resetSystem = () => {
    // 1. Delete all existing planets (except Sun)
    // We start from the back to delete user-added planets first.
    for (let i = planets.length - 1; i > 0; i--) {
        const planet = planets[i];

        // Scene Cleanup
        planet.dispose();

        // Remove UI Folder
        const folder = guiManager.gui.folders.find(f => f._title === planet.data.name);
        if (folder) {
            folder.destroy();
        }

        // Remove from array
        planets.splice(i, 1);
    }

    // 2. Reset Camera to Overview
    inputManager.resetFocus();

    // 3. Optional: Reset Ship position if in orbit mode
    if (!isShipMode) {
        engine.camera.position.set(0, 60, 140);
        engine.camera.lookAt(0, 0, 0);
    }

    // 4. Clean up any lingering focus/UI states
    uiManager.hidePlanetInfo();
};


// --- TOGGLE LOGIC ---
const gamemodeBtn = document.getElementById('gamemode-btn');
const customizeBtn = document.getElementById('customize-btn');
const modal = document.getElementById('ship-modal');

gamemodeBtn.addEventListener('click', () => {
    isShipMode = !isShipMode;
    if (isShipMode) {
        inputManager.controls.enabled = false;
        uiManager.hidePlanetInfo();

        gamemodeBtn.textContent = "EXIT SPACESHIP";
        gamemodeBtn.classList.add('active');
        customizeBtn.style.display = 'none';
        modal.classList.remove('open');

        spaceship.velocity.set(0, 0, 0);
        spaceship.position.set(0, 50, 100);
        spaceship.mesh.position.copy(spaceship.position);
        spaceship.mesh.lookAt(0, 0, 0);

    } else {
        inputManager.controls.enabled = true;
        engine.camera.position.set(0, 60, 140);
        engine.camera.lookAt(0, 0, 0);

        gamemodeBtn.textContent = "ENTER SPACESHIP";
        gamemodeBtn.classList.remove('active');
        customizeBtn.style.display = 'block';
    }
});

customizeBtn.addEventListener('click', () => {
    modal.classList.add('open');
});

window.selectShip = (index) => {
    spaceship.setShipType(index);
    modal.classList.remove('open');
};

function animate() {
    requestAnimationFrame(animate);
    const timeScale = guiManager.params.timeScale;
    planets.forEach(planet => planet.update(timeScale));

    if (isShipMode) {
        spaceship.update();
    } else {
        inputManager.update(planets);
    }
    engine.render();
}

animate();