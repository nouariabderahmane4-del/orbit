import GUI from 'lil-gui';

export class GuiManager {
    constructor(planets) {
        this.planets = planets;
        this.gui = new GUI();

        // 1. Global Simulation Speed
        // We create a simple object to hold the value
        this.params = {
            timeScale: 1.0,
            stop: () => { this.params.timeScale = 0; },
            play: () => { this.params.timeScale = 1.0; }
        };

        const folderGlobal = this.gui.addFolder('Simulation Control');
        folderGlobal.add(this.params, 'timeScale', 0, 5, 0.1).name('Speed Multiplier');
        folderGlobal.add(this.params, 'stop').name('Stop');
        folderGlobal.add(this.params, 'play').name('Play');
        folderGlobal.close();

        // 2. Planet Controls
        // Loop through every planet and give it a folder
        planets.forEach(planet => {
            const folder = this.gui.addFolder(planet.data.name);

            // Size Slider (0.1 to 10)
            folder.add(planet.data, 'size', 0.1, 10).onChange(val => {
                // When slider moves, we must rebuild the geometry
                planet.planetMesh.geometry.dispose();
                planet.planetMesh.geometry = new THREE.SphereGeometry(val, 32, 32);
            });

            // Distance Slider (0 to 100)
            folder.add(planet.data, 'distance', 0, 100).name('Distance').onChange(val => {
                planet.planetMesh.position.x = val;
            });

            // Color Picker
            const colorParam = { color: planet.data.color };
            folder.addColor(colorParam, 'color').onChange(val => {
                planet.planetMesh.material.color.set(val);
            });

            // Speed Slider
            folder.add(planet.data, 'speed', 0, 0.1).name('Orbit Speed');
        });
    }
}

// Helper to access THREE because we used it inside the class without importing
import * as THREE from 'three';