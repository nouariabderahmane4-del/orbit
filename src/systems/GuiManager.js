import GUI from 'lil-gui';
import * as THREE from 'three';
import { Planet } from '../entities/Planet.js';

export class GuiManager {
    constructor(planets, scene) {
        this.planets = planets;
        this.scene = scene;
        this.gui = new GUI({ title: 'Controls' });

        // --- 1. GLOBAL SPEED CONTROLS ---
        this.params = {
            timeScale: 0.4,
            stop: () => { this.params.timeScale = 0; },
            play: () => { this.params.timeScale = 1.0; },
            reset: () => this.resetSystem()
        };

        const folderGlobal = this.gui.addFolder('Simulation Control');
        folderGlobal.add(this.params, 'timeScale', 0, 5, 0.1).name('Speed Multiplier');
        folderGlobal.add(this.params, 'stop').name('Stop');
        folderGlobal.add(this.params, 'play').name('Play');
        folderGlobal.add(this.params, 'reset').name('⚠️ Reset All Planets');
        folderGlobal.close();

        // --- 2. PLANET CREATOR ---
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

    resetSystem() {
        const sun = this.planets[0];
        for (let i = this.planets.length - 1; i >= 0; i--) {
            const planet = this.planets[i];
            if (planet !== sun) {
                planet.dispose();
                const folder = this.gui.folders.find(f => f._title === planet.data.name);
                if (folder) folder.destroy();
                this.planets.splice(i, 1);
            }
        }
    }

    createNewPlanet() {
        const newData = {
            name: this.creationParams.name,
            size: this.creationParams.size,
            distance: this.creationParams.distance,
            color: this.creationParams.color,
            speed: this.creationParams.speed,
            description: "A custom planet created by the user.",
            details: { mass: "Unknown", temp: "Unknown", gravity: "Unknown" },
            moons: [] // Initialize empty moon array
        };

        const newPlanet = new Planet(newData, this.scene);
        this.planets.push(newPlanet);
        this.addPlanetFolder(newPlanet);
    }

    addPlanetFolder(planet) {
        const folder = this.gui.addFolder(planet.data.name);

        // --- PLANET CONTROLS ---
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

        // --- MOON MANAGER ---
        // This is the new section that handles the moon requirements
        this.manageMoons(folder, planet);

        // --- DELETE PLANET ---
        const deleteParams = {
            delete: () => {
                if (planet.data.name === "Sun") {
                    alert("The Sun must remain!");
                    return;
                }
                planet.dispose();
                const index = this.planets.indexOf(planet);
                if (index > -1) this.planets.splice(index, 1);
                folder.destroy();
            }
        };

        if (planet.data.name !== "Sun") {
            folder.add(deleteParams, 'delete').name('❌ DELETE PLANET');
        } else {
            folder.add({ warning: 'Cannot Delete Sun' }, 'warning').name('⚠️ Central Star').disable();
        }

        folder.close();
    }

    manageMoons(parentFolder, planet) {
        // Create a sub-folder specifically for moons
        const moonFolder = parentFolder.addFolder('🌑 Moons');

        // 1. Moon Creator (Factory)
        const moonParams = {
            name: "New Moon",
            size: 0.5,
            distance: 4.0,
            speed: 0.05,
            color: "#cccccc",
            add: () => {
                // Create data object
                const newMoonData = {
                    name: moonParams.name,
                    size: moonParams.size,
                    distance: moonParams.distance,
                    speed: moonParams.speed,
                    color: moonParams.color
                };

                // Add to planet data (so it persists)
                if (!planet.data.moons) planet.data.moons = [];
                planet.data.moons.push(newMoonData);

                // Create the visual moon
                planet.createMoon(newMoonData);

                // Add controls for this new moon
                this.addMoonControls(moonFolder, planet, newMoonData);
            }
        };

        moonFolder.add(moonParams, 'name').name('New Name');
        moonFolder.add(moonParams, 'size', 0.1, 2.0).name('New Size');
        moonFolder.add(moonParams, 'distance', 1.5, 15).name('New Dist');
        moonFolder.add(moonParams, 'speed', 0, 0.2).name('New Speed');
        moonFolder.addColor(moonParams, 'color').name('New Color');
        moonFolder.add(moonParams, 'add').name('➕ ADD MOON');

        moonFolder.add({ line: '──────────' }, 'line').name('Existing Moons').disable();

        // 2. Add controls for existing moons
        if (planet.data.moons) {
            planet.data.moons.forEach(moonData => {
                this.addMoonControls(moonFolder, planet, moonData);
            });
        }
    }

    addMoonControls(moonFolder, planet, moonData) {
        const specificMoonFolder = moonFolder.addFolder(moonData.name);

        // Helper to find the internal moon object (mesh, orbit, etc)
        const getMoonObj = () => planet.moons.find(m => m.data === moonData);

        // Size
        specificMoonFolder.add(moonData, 'size', 0.1, 3.0).onChange(val => {
            const m = getMoonObj();
            if (m) {
                m.mesh.geometry.dispose();
                m.mesh.geometry = new THREE.SphereGeometry(val, 32, 32);
                // Adjust label position
                m.label.position.y = val + 0.5;
            }
        });

        // Distance (The tricky part!)
        specificMoonFolder.add(moonData, 'distance', 1.5, 15).onChange(val => {
            const m = getMoonObj();
            if (m) {
                // 1. Move the Moon Mesh
                m.mesh.position.x = val;

                // 2. Redraw the Orbit Line
                // We must remove the old line from the PLANET mesh, not the pivot
                if (m.orbit) {
                    planet.planetMesh.remove(m.orbit);
                    m.orbit.geometry.dispose(); // Cleanup memory
                }

                // Create new orbit line
                const orbitCurve = new THREE.EllipseCurve(0, 0, val, val, 0, 2 * Math.PI);
                const points = orbitCurve.getPoints(64);
                const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
                const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
                const newOrbit = new THREE.LineLoop(orbitGeo, orbitMat);
                newOrbit.rotation.x = -Math.PI / 2;

                // Add to Planet and save reference
                planet.planetMesh.add(newOrbit);
                m.orbit = newOrbit;
            }
        });

        // Speed
        specificMoonFolder.add(moonData, 'speed', 0, 0.2).onChange(val => {
            const m = getMoonObj();
            if (m) m.speed = val;
        });

        // Color
        const colorObj = { color: moonData.color };
        specificMoonFolder.addColor(colorObj, 'color').onChange(val => {
            moonData.color = val;
            const m = getMoonObj();
            if (m) m.mesh.material.color.set(val);
        });

        // Delete
        const delObj = {
            remove: () => {
                planet.removeMoon(moonData);
                specificMoonFolder.destroy();
            }
        };
        specificMoonFolder.add(delObj, 'remove').name('❌ Remove Moon');
    }
}