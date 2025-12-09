import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';
import { planetData } from './data/planetData.js';
import { InputManager } from './systems/InputManager.js';

const engine = new SceneSetup('scene-container');
const inputManager = new InputManager(engine.camera, engine.scene);

const planets = [];

const sun = new Planet({
    name: "Sun",
    size: 5,
    distance: 0,
    speed: 0,
    texture: "./public/textures/sun.jpg",
    color: 0xFFFF00
}, engine.scene);

planets.push(sun);

planetData.forEach(data => {
    const planet = new Planet(data, engine.scene);
    planets.push(planet);
});

function animate() {
    requestAnimationFrame(animate);

    planets.forEach(planet => {
        planet.update();
    });

    inputManager.checkIntersections(planets);

    engine.render();
}

animate();