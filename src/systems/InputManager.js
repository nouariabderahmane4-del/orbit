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

        // Limits to prevent clipping
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;

        // 2. State Flags
        this.focusedPlanet = null;
        this.isTransitioning = false; // "Are we currently flying?"

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
            // Only reset if we click empty space AND we are not dragging
            // (OrbitControls handles dragging, so we check if the mouse moved)
            this.resetFocus();
        }
    }

    resetFocus() {
        this.focusedPlanet = null;
        this.isTransitioning = true;
        // Target "God View" position
        this.targetCameraPos = new THREE.Vector3(0, 60, 140);
    }

    focusOnPlanet(planet) {
        if (this.focusedPlanet === planet) return;

        this.focusedPlanet = planet;
        this.isTransitioning = true; // Start the flight!
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
        this.controls.update();

        if (this.focusedPlanet) {
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            // A. ALWAYS lock the target to the planet
            // This ensures we spin around IT, not empty space.
            this.controls.target.lerp(planetPos, 0.1);

            // B. FLIGHT MODE (Only happens when you first click)
            if (this.isTransitioning) {
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                this.camera.position.lerp(idealPos, 0.05);

                // STOP Condition: If we are close enough, turn off the engine.
                // This gives control back to YOU.
                if (this.camera.position.distanceTo(idealPos) < 1.5) {
                    this.isTransitioning = false;
                }
            }
            // C. MANUAL MODE (isTransitioning is false)
            // We do NOTHING here. We let OrbitControls handle the position.
            // You can now zoom in/out freely!

        } else {
            // System View Logic
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