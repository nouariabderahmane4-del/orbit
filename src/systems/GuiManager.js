import GUI from 'lil-gui';
import GUI from 'lil-gui';
import * as THREE from 'three';
import { Planet } from '../entities/Planet.js';

export class GuiManager {
    // I need to pass in the 'planets' array and the 'scene' so I can add/remove things from them later.
    constructor(planets, scene) {
        this.planets = planets;
        this.scene = scene;
        // This creates the little control box in the top right corner
        this.gui = new GUI({ title: 'Controls' });

        // --- 1. GLOBAL SPEED CONTROLS ---
        // These are the variables and functions the GUI buttons will talk to.
        this.params = {
            timeScale: 0.4, // Default speed
            stop: () => { this.params.timeScale = 0; }, // Sets speed to 0 to pause
            play: () => { this.params.timeScale = 1.0; }, // Sets speed to normal
            reset: () => this.resetSystem() // Calls my custom reset function below
        };

        // Create a folder to group the speed controls
        const folderGlobal = this.gui.addFolder('Simulation Control');
        // Add a slider for timeScale (min: 0, max: 5, step: 0.1)
        folderGlobal.add(this.params, 'timeScale', 0, 5, 0.1).name('Speed Multiplier');
        folderGlobal.add(this.params, 'stop').name('Stop');
        folderGlobal.add(this.params, 'play').name('Play');
        folderGlobal.add(this.params, 'reset').name('⚠️ Reset All Planets');

        folderGlobal.close(); // Keep it closed by default to save space

        // --- 2. PLANET CREATOR (MAKING NEW STUFF) ---
        // Default values for when we want to make a new planet
        this.creationParams = {
            name: "New Planet",
            size: 2.0,
            distance: 80,
            color: "#ff00ff",
            speed: 0.01,
            create: () => this.createNewPlanet() // The function that actually builds it
        };

        const folderCreator = this.gui.addFolder('🛠️ Planet Factory');
        folderCreator.add(this.creationParams, 'name');
        folderCreator.add(this.creationParams, 'size', 0.1, 10);
        folderCreator.add(this.creationParams, 'distance', 10, 200);
        folderCreator.addColor(this.creationParams, 'color'); // Special color picker
        folderCreator.add(this.creationParams, 'speed', 0, 0.1);
        folderCreator.add(this.creationParams, 'create').name("✨ Create Planet");
        folderCreator.open(); // Open this one so the user sees it first

        // --- 3. EXISTING PLANETS ---
        // Loop through the list of planets we already have and make a folder for each one
        planets.forEach(planet => {
            this.addPlanetFolder(planet);
        });
    }

    // --- FUNCTION TO DELETE EVERYTHING EXCEPT THE SUN ---
    resetSystem() {
        // The Sun is always the first item in my array
        const sun = this.planets[0];

        // I have to loop BACKWARDS here. 
        // If I loop forwards and delete item [1], then item [2] becomes the new [1],
        // and I might skip things or crash. Going backwards is safer for deleting.
        for (let i = this.planets.length - 1; i >= 0; i--) {
            const planet = this.planets[i];

            // Don't delete the Sun!
            if (planet !== sun) {
                // 1. Remove the 3D object from the screen
                planet.dispose();

                // 2. Remove the GUI folder for this planet
                // I have to search through the GUI folders to find the one with the matching name
                const folder = this.gui.folders.find(f => f._title === planet.data.name);
                if (folder) {
                    folder.destroy();
                }

                // 3. Finally, remove it from our data array
                this.planets.splice(i, 1);
            }
        }
    }

    createNewPlanet() {
        // Take the values currently in the "Planet Factory" inputs
        const newData = {
            name: this.creationParams.name,
            size: this.creationParams.size,
            distance: this.creationParams.distance,
            color: this.creationParams.color,
            speed: this.creationParams.speed,
            description: "A custom planet created by the user.",
            details: { mass: "Unknown", temp: "Unknown", gravity: "Unknown" }
        };

        // Actually make the 3D object
        const newPlanet = new Planet(newData, this.scene);

        // Add it to our main list so it gets updated in the loop
        this.planets.push(newPlanet);

        // Add a GUI folder for this new planet so we can control it too
        this.addPlanetFolder(newPlanet);
    }

    addPlanetFolder(planet) {
        // Create a folder with the planet's name
        const folder = this.gui.addFolder(planet.data.name);

        // --- UPDATING VALUES LIVE ---
        // If I change the size slider...
        folder.add(planet.data, 'size', 0.1, 10).name('Size').onChange(val => {
            // I have to delete the old geometry (shape) and make a new one with the new size
            planet.planetMesh.geometry.dispose();
            planet.planetMesh.geometry = new THREE.SphereGeometry(val, 32, 32);
        });

        // If I change the distance slider, move the planet
        folder.add(planet.data, 'distance', 0, 200).name('Distance').onChange(val => {
            planet.planetMesh.position.x = val;
        });

        // Color handling requires a helper object
        const colorParam = { color: planet.data.color };
        folder.addColor(colorParam, 'color').name('Color').onChange(val => {
            planet.planetMesh.material.color.set(val);
        });

        folder.add(planet.data, 'speed', 0, 0.1).name('Orbit Speed');

        // --- DELETE BUTTON ---
        const deleteParams = {
            delete: () => {
                // Double check: Never delete the Sun
                if (planet.data.name === "Sun") {
                    alert("The Sun must remain! Use the sliders to change its properties instead.");
                    return;
                }

                // Remove from 3D scene
                planet.dispose();

                // Remove from array
                const index = this.planets.indexOf(planet);
                if (index > -1) {
                    this.planets.splice(index, 1);
                }

                // Remove the GUI folder itself
                folder.destroy();
            }
        };

        // Logic: If it's not the sun, show the delete button. If it is, show a warning.
        if (planet.data.name !== "Sun") {
            folder.add(deleteParams, 'delete').name('❌ DELETE PLANET');
        } else {
            folder.add({ warning: 'Cannot Delete Sun' }, 'warning').name('⚠️ Central Star').disable();
        }

        // Keep existing planet folders closed so the menu isn't huge
        folder.close();
    }
}