import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';
import { Spaceship } from './entities/Spaceship.js';
import * as THREE from 'three'; // Import THREE for Vector3

const engine = new SceneSetup('scene-container');
const uiManager = new UIManager();
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);
const starField = new StarField(engine.scene, 5000);

// --- SHIP SETUP ---
const spaceship = new Spaceship(engine.scene, engine.camera);
let isShipMode = false;

const planets = [];
const sun = new Planet({
    name: "Sun",
    size: 6.6825,
    distance: 0,
    speed: 0,
    texture: "./public/textures/sun.jpg",
    color: 0xFFFF00,
    description: "The Star.",
    details: { mass: "1.989 x 10^30 kg", temp: "5500 °C", gravity: "274 m/s²" }
}, engine.scene);
planets.push(sun);

planetData.forEach(data => {
    planets.push(new Planet(data, engine.scene));
});

uiManager.setSearchCallback((query) => {
    if (isShipMode) {
        alert("Switch to Orbit Mode to use Search!");
        return;
    }
    const target = planets.find(p => p.data.name.toLowerCase() === query);
    if (target) inputManager.focusOnPlanet(target);
    else alert(`Planet "${query}" not found!`);
});

const guiManager = new GuiManager(planets);

// --- TOGGLE LOGIC ---
const gamemodeBtn = document.getElementById('gamemode-btn');
const customizeBtn = document.getElementById('customize-btn');
const modal = document.getElementById('ship-modal');

gamemodeBtn.addEventListener('click', () => {
    isShipMode = !isShipMode;
    if (isShipMode) {
        // --- ENTER SPACESHIP MODE ---
        inputManager.controls.enabled = false;
        uiManager.hidePlanetInfo();

        // 1. UPDATE UI
        gamemodeBtn.textContent = "EXIT SPACESHIP";
        gamemodeBtn.classList.add('active');
        customizeBtn.style.display = 'none';
        modal.classList.remove('open');

        // 2. RESET SHIP PHYSICS (The Fix)
        spaceship.velocity.set(0, 0, 0); // Stop moving
        spaceship.position.set(0, 50, 100); // Reset Position
        spaceship.mesh.position.copy(spaceship.position); // Sync mesh

        // 3. FORCE LOOK AT SUN
        spaceship.mesh.lookAt(0, 0, 0);

    } else {
        // --- EXIT TO ORBIT MODE ---
        inputManager.controls.enabled = true;

        // Reset Camera for Orbit Mode
        engine.camera.position.set(0, 60, 140);
        engine.camera.lookAt(0, 0, 0);

        // Update UI
        gamemodeBtn.textContent = "ENTER SPACESHIP";
        gamemodeBtn.classList.remove('active');
        customizeBtn.style.display = 'block';
    }
});

// --- CUSTOMIZE LOGIC ---
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