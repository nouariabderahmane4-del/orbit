import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 1. Create the "Rig" (An invisible container for the camera)
        this.cameraRig = new THREE.Object3D();
        this.scene.add(this.cameraRig);

        // 2. Setup Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;

        // Limits
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
        if (!this.focusedPlanet) return; // Already reset

        // 1. Detach Camera from Rig (Put it back in the World)
        // .attach() automatically calculates the new world position/rotation
        this.scene.attach(this.camera);

        // 2. Set the controls target to where the planet IS (World Space)
        const planetWorldPos = new THREE.Vector3();
        this.focusedPlanet.planetMesh.getWorldPosition(planetWorldPos);
        this.controls.target.copy(planetWorldPos);

        this.focusedPlanet = null;
        this.isTransitioning = true;

        // Target "God View"
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

        // --- 2. Camera Logic ---
        this.controls.update();

        if (this.focusedPlanet) {
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            // A. Move the Rig to the Planet
            this.cameraRig.position.copy(planetPos);

            if (this.isTransitioning) {
                // FLYING MODE
                // While flying, the camera is still in World Space
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                this.camera.position.lerp(idealPos, 0.05);
                this.controls.target.lerp(planetPos, 0.1);

                // Arrival Check
                if (this.camera.position.distanceTo(idealPos) < 1.0) {
                    this.isTransitioning = false;

                    // --- THE FIX: PARENTING ---
                    // 1. Move the Rig exactly to the planet (Double check)
                    this.cameraRig.position.copy(planetPos);

                    // 2. Put the Camera INSIDE the Rig
                    // .attach() keeps the camera visually in the same place, 
                    // but changes its parent to the Rig.
                    this.cameraRig.attach(this.camera);

                    // 3. Set OrbitControls to orbit the center of the Rig (0,0,0)
                    // Since the Rig is at the planet, we are now orbiting the planet.
                    this.controls.target.set(0, 0, 0);

                    // 4. Clear internal inertia so it doesn't jump
                    this.controls.saveState();
                }
            }
            // B. LOCKED MODE
            // We do NOTHING here!
            // Since the Camera is a child of the Rig, and we move the Rig 
            // at the start of the function, the camera moves automatically.
            // OrbitControls handles the rotation around the Rig center.

        } else {
            // C. SYSTEM MODE
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