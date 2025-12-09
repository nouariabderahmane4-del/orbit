import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer; // Needed for OrbitControls DOM element

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 1. Setup OrbitControls
        // This handles all the "Drag to Rotate 360" logic automatically.
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Smooths the rotation (momentum)
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false; // Disable right-click panning to keep focus strict
        this.controls.minDistance = 1.5; // Don't clip inside planets
        this.controls.maxDistance = 500; // Don't fly too far away

        // 2. State Management
        this.focusedPlanet = null;
        this.isTransitioning = false; // Are we currently flying to a target?

        // 3. UI
        this.tooltip = document.getElementById('tooltip');

        // 4. Listeners
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', () => this.onMouseClick());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.resetFocus();
            }
        });
    }

    onMouseMove(event) {
        // Calculate mouse position for Raycasting
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.updateTooltipPosition(event);
    }

    onMouseClick() {
        // Only trigger click if we are hovering something
        if (this.hoveredPlanet) {
            this.focusOnPlanet(this.hoveredPlanet);
        } else {
            // If we click empty space, reset to system view
            this.resetFocus();
        }
    }

    resetFocus() {
        this.focusedPlanet = null;
        this.isTransitioning = true;
        // We will fly back to a nice "System View" position
        this.targetCameraPos = new THREE.Vector3(0, 60, 140);
        this.targetLookAt = new THREE.Vector3(0, 0, 0);
    }

    focusOnPlanet(planet) {
        if (this.focusedPlanet === planet) return; // Already focused

        this.focusedPlanet = planet;
        this.isTransitioning = true;

        // Calculate where we want to end up (The "Flight" destination)
        // We calculate this dynamically in the update loop because the planet moves!
    }

    updateTooltipPosition(event) {
        this.tooltip.style.left = event.clientX + 15 + 'px';
        this.tooltip.style.top = event.clientY + 15 + 'px';
    }

    // Called every frame
    update(planets) {
        // --- 1. Raycasting (Hover Effects) ---
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Map planets to their meshes for collision detection
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

        // --- 2. Camera & Control Logic ---

        // Required for damping to work
        this.controls.update();

        if (this.focusedPlanet) {
            // --- FOCUSED MODE (Orbiting a Planet) ---

            // A. Get Planet's current world position
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            // B. Lock Controls Target to the Planet
            // This allows you to rotate 360 around it, even while it moves!
            // We smoothly interpolate the target so it doesn't snap jitterily
            this.controls.target.lerp(planetPos, 0.1);

            // C. The "Flight" (Transition)
            // If we just clicked, we help the camera fly close to the planet.
            if (this.isTransitioning) {
                // Calculate ideal offset (up and back)
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                // Fly there
                this.camera.position.lerp(idealPos, 0.05);

                // Stop transitioning when we are close enough
                if (this.camera.position.distanceTo(idealPos) < 1) {
                    this.isTransitioning = false;
                }
            }

        } else {
            // --- SYSTEM MODE (Orbiting the Sun/Center) ---

            // A. Target becomes (0,0,0) - The Sun
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);

            // B. Fly back to "God View" if we just reset
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