import { SceneSetup } from './core/SceneSetup.js';
import { Planet } from './entities/Planet.js';

// 1. Initialize Engine
const engine = new SceneSetup('scene-container');

// 2. Create the Solar System
// The Sun (Center, Distance 0)
const sun = new Planet({
    name: "Sun",
    color: 0xffff00, // Yellow
    size: 5,
    distance: 0,
    speed: 0
}, engine.scene);

// The Earth (Distance 20)
const earth = new Planet({
    name: "Earth",
    color: 0x0000ff, // Blue
    size: 2,
    distance: 20,
    speed: 0.01
}, engine.scene);

// 3. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // We will enable movement in the next step!
    // sun.update();
    // earth.update();

    engine.render();
}

animate();