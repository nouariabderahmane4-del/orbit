import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 1. Create the Rig
        this.cameraRig = new THREE.Object3D();
        this.scene.add(this.cameraRig);

        // 2. Setup Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;

        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;

        this.focusedPlanet = null;
        this.isTransitioning = false;

        this.tooltip = document.getElementById('tooltip');

        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', () => this.onMouseClick());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.resetFocus();
        });
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.updateTooltipPosition(event);
    }

    onMouseClick() {
        if (this.hoveredPlanet) {
            this.focusOnPlanet(this.hoveredPlanet);
        } else {
            this.resetFocus();
        }
    }

    resetFocus() {
        if (!this.focusedPlanet) return;

        this.scene.attach(this.camera);

        const planetWorldPos = new THREE.Vector3();
        this.focusedPlanet.planetMesh.getWorldPosition(planetWorldPos);
        this.controls.target.copy(planetWorldPos);

        this.focusedPlanet = null;
        this.isTransitioning = true;

        this.targetCameraPos = new THREE.Vector3(0, 60, 140);
    }

    focusOnPlanet(planet) {
        if (this.focusedPlanet === planet) return;
        this.focusedPlanet = planet;
        this.isTransitioning = true;
    }

    updateTooltipPosition(event) {
        this.tooltip.style.left = event.clientX + 15 + 'px';
        this.tooltip.style.top = event.clientY + 15 + 'px';
    }

    // --- NEW HELPER FUNCTION ---
    // If we hit a Cloud or Ring, walk up the tree to find the "Owner" planet
    findPlanetFromMesh(hitObject, planets) {
        // Check if the object itself is a planet mesh
        let found = planets.find(p => p.planetMesh === hitObject);
        if (found) return found;

        // If not, check its parent (and parent's parent)
        // We traverse up until we hit the Scene or find a match
        let current = hitObject.parent;
        while (current) {
            found = planets.find(p => p.planetMesh === current);
            if (found) return found;
            current = current.parent; // Keep going up
        }
        return null;
    }

    update(planets) {
        // --- 1. Hover Logic ---
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const planetMeshes = planets.map(p => p.planetMesh);

        // IMPORTANT: recursive = true
        // This means "Check the planet AND its children (clouds/rings)"
        const intersects = this.raycaster.intersectObjects(planetMeshes, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;

            // USE THE NEW HELPER FUNCTION
            this.hoveredPlanet = this.findPlanetFromMesh(hitObject, planets);

            // Safety check: only show if we actually found a planet
            if (this.hoveredPlanet) {
                this.showTooltip(this.hoveredPlanet.data.name);
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.hoveredPlanet = null;
            this.hideTooltip();
            document.body.style.cursor = 'default';
        }

        // --- 2. Camera Logic ---
        this.controls.update();

        if (this.focusedPlanet) {
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            this.cameraRig.position.copy(planetPos);

            if (this.isTransitioning) {
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                this.camera.position.lerp(idealPos, 0.05);
                this.controls.target.lerp(planetPos, 0.1);

                if (this.camera.position.distanceTo(idealPos) < 1.0) {
                    this.isTransitioning = false;
                    this.cameraRig.position.copy(planetPos);
                    this.cameraRig.attach(this.camera);
                    this.controls.target.set(0, 0, 0);
                    this.controls.saveState();
                }
            }
        } else {
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);

            if (this.isTransitioning) {
                this.camera.position.lerp(this.targetCameraPos, 0.05);
                if (this.camera.position.distanceTo(this.targetCameraPos) < 1) {
                    this.isTransitioning = false;
                }
            }
        }
    }

    showTooltip(text) {
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = text;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
}