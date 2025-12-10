import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    // CHANGE 1: We added 'uiManager' to the constructor arguments
    constructor(camera, scene, renderer, uiManager) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.uiManager = uiManager; // Store it for later use

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

        // 3. State
        this.focusedPlanet = null;
        this.isTransitioning = false;
        this.tooltip = document.getElementById('tooltip');

        // We need to store the planets list to use it inside the click handler
        this.currentPlanets = [];

        // Drag Tracking
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTime = 0;

        // 4. Listeners
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.resetFocus();
        });
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.updateTooltipPosition(event);
    }

    onMouseDown(event) {
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.dragStartTime = Date.now();
    }

    onMouseUp(event) {
        const distMoved = Math.sqrt(
            Math.pow(event.clientX - this.dragStartX, 2) +
            Math.pow(event.clientY - this.dragStartY, 2)
        );
        const timeElapsed = Date.now() - this.dragStartTime;

        // Strict Click Definition: minimal movement, short time
        const isClick = distMoved < 5 && timeElapsed < 300;

        if (isClick) {
            this.handleActualClick();
        }
    }

    handleActualClick() {
        // 1. Force the camera to be mathematically accurate right now
        this.camera.updateMatrixWorld();

        // 2. Setup Raycaster based on CURRENT mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 3. Get meshes from the stored planets list
        const planetMeshes = this.currentPlanets.map(p => p.planetMesh);

        // 4. Check intersections INSTANTLY
        const intersects = this.raycaster.intersectObjects(planetMeshes, true);

        if (intersects.length > 0) {
            // We hit something! Find out which planet it belongs to.
            const hitObject = intersects[0].object;
            const targetPlanet = this.findPlanetFromMesh(hitObject, this.currentPlanets);

            if (targetPlanet) {
                this.focusOnPlanet(targetPlanet);
            }
        }
        // Note: No 'else' block here. Clicking empty space does nothing.
    }

    resetFocus() {
        if (!this.focusedPlanet) return;

        // CHANGE 2: Hide the UI when we leave a planet
        this.uiManager.hidePlanetInfo();

        // Ensure camera is attached to scene (Safety check)
        this.scene.attach(this.camera);

        const planetWorldPos = new THREE.Vector3();
        this.focusedPlanet.planetMesh.getWorldPosition(planetWorldPos);

        // When we reset, we start looking from where the planet WAS
        this.controls.target.copy(planetWorldPos);

        this.focusedPlanet = null;
        this.isTransitioning = true;

        // Target position: Back to looking at the whole system
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

    findPlanetFromMesh(hitObject, planets) {
        // 1. Direct Hit
        let found = planets.find(p => p.planetMesh === hitObject);
        if (found) return found;

        // 2. Child Hit (Cloud/Atmosphere/Ring) -> Walk up parent tree
        let current = hitObject.parent;
        while (current) {
            found = planets.find(p => p.planetMesh === current);
            if (found) return found;
            current = current.parent;
        }
        return null;
    }

    update(planets) {
        // STORE PLANETS FOR THE CLICK HANDLER
        this.currentPlanets = planets;

        // --- 1. Hover Logic (Visual Only) ---
        this.camera.updateMatrixWorld();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const planetMeshes = planets.map(p => p.planetMesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            this.hoveredPlanet = this.findPlanetFromMesh(hitObject, planets);

            if (this.hoveredPlanet) {
                this.showTooltip(this.hoveredPlanet.data.name);
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.hoveredPlanet = null;
            this.hideTooltip();
            document.body.style.cursor = 'default';
        }

        // --- 2. Camera & Control Logic ---
        this.controls.update();

        if (this.focusedPlanet) {
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            // FIX: We no longer attach the camera to the rig.
            // Instead, we just ensure the controls ALWAYS look at the planet.

            if (this.isTransitioning) {
                // Calculate ideal offset based on planet size
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                // Smoothly move Camera
                this.camera.position.lerp(idealPos, 0.05);

                // Smoothly move Focus Target
                this.controls.target.lerp(planetPos, 0.1);

                // Check if we are close enough to stop "Transitioning"
                if (this.camera.position.distanceTo(idealPos) < 4.0) {
                    this.isTransitioning = false;

                    // CHANGE 3: Transition Complete! Show the Data HUD.
                    // We pass the planet data (name, description, temp) to the UI Manager
                    this.uiManager.showPlanetInfo(this.focusedPlanet.data);
                }
            } else {
                // LOCKED STATE:
                // We are not transitioning, but we must keep the target on the planet
                this.controls.target.copy(planetPos);
            }
        } else {
            // NO PLANET FOCUSED (Overview Mode)
            // Gently bring the target back to the center (Sun)
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