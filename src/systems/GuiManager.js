import GUI from 'lil-gui';
import * as THREE from 'three';
import { Planet } from '../entities/Planet.js';

export class GuiManager {
    // We add a reference to the main planets array so we can clear it.
    constructor(planets, scene) {
        this.planets = planets;
        this.scene = scene;
        this.gui = new GUI({ title: 'Controls' });

        // --- 1. GLOBAL SPEED CONTROLS ---
        this.params = {
            timeScale: 0.4,
            stop: () => { this.params.timeScale = 0; },
            play: () => { this.params.timeScale = 1.0; },
            reset: () => this.resetSystem() // <--- NEW RESET FUNCTION
        };

        const folderGlobal = this.gui.addFolder('Simulation Control');
        folderGlobal.add(this.params, 'timeScale', 0, 5, 0.1).name('Speed Multiplier');
        folderGlobal.add(this.params, 'stop').name('Stop');
        folderGlobal.add(this.params, 'play').name('Play');
        folderGlobal.add(this.params, 'reset').name('⚠️ Reset All Planets'); // <--- NEW BUTTON

        folderGlobal.close();

        // --- 2. PLANET CREATOR (CRUD: CREATE) ---
        this.creationParams = {
            name: "New Planet",
            size: 2.0,
            distance: 80,
            color: "#ff00ff",
            speed: 0.01,
            create: () => this.createNewPlanet()
        };

        const folderCreator = this.gui.addFolder('🛠️ Planet Factory');
        folderCreator.add(this.creationParams, 'name');
        folderCreator.add(this.creationParams, 'size', 0.1, 10);
        folderCreator.add(this.creationParams, 'distance', 10, 200);
        folderCreator.addColor(this.creationParams, 'color');
        folderCreator.add(this.creationParams, 'speed', 0, 0.1);
        folderCreator.add(this.creationParams, 'create').name("✨ Create Planet");
        folderCreator.open();

        // --- 3. EXISTING PLANETS ---
        planets.forEach(planet => {
            this.addPlanetFolder(planet);
        });
    }

    // --- NEW METHOD: DELETES ALL PLANETS EXCEPT THE SUN ---
    resetSystem() {
        // Find the Sun (assumed to be the first planet in the array)
        const sun = this.planets[0];

        // Start from the end of the array (easier to delete while iterating)
        for (let i = this.planets.length - 1; i >= 0; i--) {
            const planet = this.planets[i];

            // We only delete if the planet is NOT the Sun
            if (planet !== sun) {
                // 1. Scene Cleanup
                planet.dispose();

                // 2. Remove UI Folder
                // We must find and remove the lil-gui folder
                const folder = this.gui.folders.find(f => f._title === planet.data.name);
                if (folder) {
                    folder.destroy();
                }

                // 3. Remove from planets array
                this.planets.splice(i, 1);
            }
        }

        // Optional: Re-focus camera on the Sun after reset
        // We'll handle the camera reset in main.js for clarity.
    }

    createNewPlanet() {
        const newData = {
            name: this.creationParams.name,
            size: this.creationParams.size,
            distance: this.creationParams.distance,
            color: this.creationParams.color,
            speed: this.creationParams.speed,
            description: "A custom planet created by the user.",
            details: { mass: "Unknown", temp: "Unknown", gravity: "Unknown" }
        };

        const newPlanet = new Planet(newData, this.scene);
        this.planets.push(newPlanet);
        this.addPlanetFolder(newPlanet);
    }

    addPlanetFolder(planet) {
        const folder = this.gui.addFolder(planet.data.name);

        // UPDATE (Change values live)
        folder.add(planet.data, 'size', 0.1, 10).name('Size').onChange(val => {
            planet.planetMesh.geometry.dispose();
            planet.planetMesh.geometry = new THREE.SphereGeometry(val, 32, 32);
        });

        folder.add(planet.data, 'distance', 0, 200).name('Distance').onChange(val => {
            planet.planetMesh.position.x = val;
        });

        const colorParam = { color: planet.data.color };
        folder.addColor(colorParam, 'color').name('Color').onChange(val => {
            planet.planetMesh.material.color.set(val);
        });

        folder.add(planet.data, 'speed', 0, 0.1).name('Orbit Speed');

        // DELETE 
        const deleteParams = {
            delete: () => {
                // Prevent deleting the Sun!
                if (planet.data.name === "Sun") {
                    alert("The Sun must remain! Use the sliders to change its properties instead.");
                    return;
                }

                planet.dispose();
                const index = this.planets.indexOf(planet);
                if (index > -1) {
                    this.planets.splice(index, 1);
                }
                folder.destroy();
            }
        };

        // Only show delete button if it's not the Sun
        if (planet.data.name !== "Sun") {
            folder.add(deleteParams, 'delete').name('❌ DELETE PLANET');
        } else {
            // Add a warning for the Sun instead of a delete button
            folder.add({ warning: 'Cannot Delete Sun' }, 'warning').name('⚠️ Central Star').disable();
        }


        // Default to closed
        folder.close();
    }
}