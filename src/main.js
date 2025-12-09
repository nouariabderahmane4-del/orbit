import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';

// 1. Initialize Engine
const engine = new SceneSetup('scene-container');

// 2. Create the Solar System
// The Sun (Center, Distance 0)
// The Earth
const earth = new Planet({
    name: "Earth",
    size: 2,
    distance: 20,
    speed: 0.01,
    texture: "./public/textures/earth.jpg" // <--- Path to your image
}, engine.scene);

// The Sun
const sun = new Planet({
    name: "Sun",
    size: 5,
    distance: 0,
    speed: 0,
    texture: "./public/textures/sun.jpg" // <--- Path to your image
}, engine.scene);

// 3. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // NOW UNCOMMENT THESE:
    sun.update();
    earth.update();

    engine.render();
}


animate();