import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 1. Setup Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;

        // Limits
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;

        // 2. State Flags
        this.focusedPlanet = null;
        this.isTransitioning = false;

        // --- NEW: Previous Position Tracker ---
        // We need this to calculate the planet's movement speed per frame
        this.previousPlanetPos = new THREE.Vector3();

        this.tooltip = document.getElementById('tooltip');

        // 3. Listeners
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
        this.focusedPlanet = null;
        this.isTransitioning = true;
        this.targetCameraPos = new THREE.Vector3(0, 60, 140);
    }

    focusOnPlanet(planet) {
        if (this.focusedPlanet === planet) return;

        this.focusedPlanet = planet;
        this.isTransitioning = true;

        // Initialize the tracker with the planet's CURRENT position
        this.focusedPlanet.planetMesh.getWorldPosition(this.previousPlanetPos);
    }

    updateTooltipPosition(event) {
        this.tooltip.style.left = event.clientX + 15 + 'px';
        this.tooltip.style.top = event.clientY + 15 + 'px';
    }

    update(planets) {
        // --- 1. Hover Logic ---
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const planetMeshes = planets.map(p => p.planetMesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            this.hoveredPlanet = planets.find(p => p.planetMesh === hitObject);
            this.showTooltip(this.hoveredPlanet.data.name);
            document.body.style.cursor = 'pointer';
        } else {
            this.hoveredPlanet = null;
            this.hideTooltip();
            document.body.style.cursor = 'default';
        }

        // --- 2. Camera Control Logic ---

        if (this.focusedPlanet) {
            const currentPlanetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(currentPlanetPos);

            // A. TRANSITION (Flying there)
            if (this.isTransitioning) {
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(currentPlanetPos);

                this.camera.position.lerp(idealPos, 0.05);
                this.controls.target.lerp(currentPlanetPos, 0.1);

                if (this.camera.position.distanceTo(idealPos) < 1.5) {
                    this.isTransitioning = false;
                    // Sync positions perfectly when landing
                    this.previousPlanetPos.copy(currentPlanetPos);
                }

            } else {
                // B. LOCKED MODE (Manual Control)
                // --- THE FIX IS HERE ---

                // 1. Calculate how much the planet moved since last frame
                const delta = new THREE.Vector3().subVectors(currentPlanetPos, this.previousPlanetPos);

                // 2. Add that EXACT movement to the camera
                this.camera.position.add(delta);

                // 3. Add that EXACT movement to the control target (pivot point)
                this.controls.target.add(delta);

                // 4. Update tracker for the next frame
                this.previousPlanetPos.copy(currentPlanetPos);
            }

        } else {
            // System View
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            if (this.isTransitioning) {
                this.camera.position.lerp(this.targetCameraPos, 0.05);
                if (this.camera.position.distanceTo(this.targetCameraPos) < 1) {
                    this.isTransitioning = false;
                }
            }
        }

        // Must be called AFTER manual updates
        this.controls.update();
    }

    showTooltip(text) {
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = text;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
}