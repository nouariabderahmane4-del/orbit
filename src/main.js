import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';
import { GuiManager } from './systems/GuiManager.js';
import { StarField } from './entities/StarField.js';
import { UIManager } from './systems/UIManager.js';
import { Spaceship } from './entities/Spaceship.js';
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

// --- SETUP CSS 2D RENDERER (For HTML Labels) ---
// This renderer is separate from the main 3D renderer. It handles the HTML tags floating on moons.
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'; // Clicks should pass through this to the canvas
document.body.appendChild(labelRenderer.domElement);

// --- MAIN SETUP ---
const engine = new SceneSetup('scene-container');
const uiManager = new UIManager();
const inputManager = new InputManager(engine.camera, engine.scene, engine.renderer, uiManager);
const starField = new StarField(engine.scene, 5000); // 5000 stars in background

// Helper function to create the initial solar system
function createDefaultSolarSystem(planetsArray, scene) {
    // 1. Manually make the Sun first
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

    // 2. Loop through our data file and make the rest
    planetData.forEach(data => {
        planetsArray.push(new Planet(data, scene));
    });
}

// Array to hold all our planet objects
const planets = [];
createDefaultSolarSystem(planets, engine.scene);

// --- SHIP MODE VARIABLES ---
const spaceship = new Spaceship(engine.scene, engine.camera);
let isShipMode = false;
spaceship.mesh.visible = false; // Hide ship at start

// Connect the UI search bar to our planet list
uiManager.setSearchCallback((query) => {
    if (isShipMode) {
        alert("Switch to Orbit Mode to use Search!");
        return;
    }
    // Find the planet where name matches query
    const target = planets.find(p => p.data.name.toLowerCase() === query);
    if (target) inputManager.focusOnPlanet(target);
    else alert(`Planet "${query}" not found!`);
});

const guiManager = new GuiManager(planets, engine.scene);

// --- OVERRIDE RESET FUNCTION ---
// We need to define what happens when "Reset" is clicked in the GUI
guiManager.resetSystem = () => {
    // Delete everything except Sun (index 0)
    for (let i = planets.length - 1; i > 0; i--) {
        const planet = planets[i];
        planet.dispose(); // Cleanup memory

        // Clean GUI
        const folder = guiManager.gui.folders.find(f => f._title === planet.data.name);
        if (folder) folder.destroy();

        planets.splice(i, 1);
    }

    // Re-create default planets from data
    planetData.forEach(data => {
        const newPlanet = new Planet(data, engine.scene);
        planets.push(newPlanet);
        guiManager.addPlanetFolder(newPlanet);
    });

    // Reset camera view
    inputManager.resetFocus();
    uiManager.hidePlanetInfo();

    if (!isShipMode) {
        engine.camera.position.set(0, 60, 140);
        engine.camera.lookAt(0, 0, 0);
    }
};


// --- MODE SWITCHING (Spaceship vs Orbit) ---
const gamemodeBtn = document.getElementById('gamemode-btn');
const customizeBtn = document.getElementById('customize-btn');
const modal = document.getElementById('ship-modal');

gamemodeBtn.addEventListener('click', () => {
    isShipMode = !isShipMode; // Toggle boolean

    if (isShipMode) {
        // Switch TO Spaceship Mode
        inputManager.controls.enabled = false; // Disable mouse orbit controls
        uiManager.hidePlanetInfo();

        spaceship.mesh.visible = true;

        gamemodeBtn.textContent = "EXIT SPACESHIP";
        gamemodeBtn.classList.add('active');
        customizeBtn.style.display = 'none';
        modal.classList.remove('open');

        // Reset ship position
        spaceship.velocity.set(0, 0, 0);
        spaceship.position.set(0, 50, 100);
        spaceship.mesh.position.copy(spaceship.position);
        spaceship.mesh.lookAt(0, 0, 0);

    } else {
        // Switch BACK TO Orbit Mode
        inputManager.controls.enabled = true; // Re-enable mouse controls

        spaceship.mesh.visible = false;

        // Reset Camera
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

// Global function for the HTML onclicks in the modal
window.selectShip = (index) => {
    spaceship.setShipType(index);
    modal.classList.remove('open');
};

// --- ANIMATION LOOP ---
function animate() {
    // Calls animate() again on the next frame (approx 60fps)
    requestAnimationFrame(animate);

    // Get speed from GUI
    const timeScale = guiManager.params.timeScale;

    // Update all planets
    planets.forEach(planet => planet.update(timeScale));

    if (isShipMode) {
        spaceship.update();
    } else {
        inputManager.update(planets);
    }

    engine.render();
    // Also render the HTML labels
    labelRenderer.render(engine.scene, engine.camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the loop!
animate();