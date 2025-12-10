import GUI from 'lil-gui';
import * as THREE from 'three';

export class GuiManager {
    constructor(planets) {
        this.planets = planets;
        // The root GUI container
        this.gui = new GUI({ title: 'Controls' });

        // --- 1. GLOBAL SPEED CONTROLS ---
        this.params = {
            timeScale: 1.0,
            stop: () => { this.params.timeScale = 0; },
            play: () => { this.params.timeScale = 1.0; }
        };

        const folderGlobal = this.gui.addFolder('Simulation Control');
        folderGlobal.add(this.params, 'timeScale', 0, 5, 0.1).name('Speed Multiplier');
        folderGlobal.add(this.params, 'stop').name('Stop');
        folderGlobal.add(this.params, 'play').name('Play');

        // FIX: This forces the "Simulation Control" block to start CLOSED
        folderGlobal.close();

        // --- 2. PLANET CONTROLS ---
        planets.forEach(planet => {
            const folder = this.gui.addFolder(planet.data.name);

            // Size Slider
            folder.add(planet.data, 'size', 0.1, 10).onChange(val => {
                planet.planetMesh.geometry.dispose();
                planet.planetMesh.geometry = new THREE.SphereGeometry(val, 32, 32);
            });

            // Distance Slider
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

            // FIX: This forces every Planet folder (Sun, Mercury, etc.) to start CLOSED
            folder.close();
        });
    }
}