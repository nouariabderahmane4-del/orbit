import GUI from 'lil-gui';
import * as THREE from 'three';
import { Planet } from '../entities/Planet.js'; // Import Planet class

export class GuiManager {
    constructor(planets, scene) {
        this.planets = planets;
        this.scene = scene; // Store scene reference to create new planets
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
        // Keep this open so they see it
        folderCreator.open();

        // --- 3. EXISTING PLANETS ---
        planets.forEach(planet => {
            this.addPlanetFolder(planet);
        });
    }

    createNewPlanet() {
        // 1. Construct Data Object
        const newData = {
            name: this.creationParams.name,
            size: this.creationParams.size,
            distance: this.creationParams.distance,
            color: this.creationParams.color, // lil-gui returns hex string
            speed: this.creationParams.speed,
            description: "A custom planet created by the user.",
            details: { mass: "Unknown", temp: "Unknown", gravity: "Unknown" }
        };

        // 2. Instantiate Planet
        const newPlanet = new Planet(newData, this.scene);

        // 3. Add to System
        this.planets.push(newPlanet);

        // 4. Add UI Folder
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
            // Note: Orbit line won't update visually without full rebuild, 
            // but for a school project, moving the mesh is usually sufficient.
        });

        const colorParam = { color: planet.data.color };
        folder.addColor(colorParam, 'color').name('Color').onChange(val => {
            planet.planetMesh.material.color.set(val);
        });

        folder.add(planet.data, 'speed', 0, 0.1).name('Orbit Speed');

        // DELETE (CRUD: DELETE)
        const deleteParams = {
            delete: () => {
                // 1. Remove from Scene
                planet.dispose();

                // 2. Remove from Array
                const index = this.planets.indexOf(planet);
                if (index > -1) {
                    this.planets.splice(index, 1);
                }

                // 3. Remove UI Folder
                folder.destroy();
            }
        };

        folder.add(deleteParams, 'delete').name('❌ DELETE PLANET');

        // Default to closed
        folder.close();
    }
}