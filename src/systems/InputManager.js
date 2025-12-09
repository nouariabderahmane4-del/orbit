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

        // 3. State
        this.focusedPlanet = null;
        this.isTransitioning = false;
        this.tooltip = document.getElementById('tooltip');

        // --- NEW: DRAG TRACKING VARIABLES ---
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTime = 0;

        // 4. Listeners
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // REPLACED 'click' with mousedown/mouseup logic
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

    // --- NEW: START TRACKING CLICK ---
    onMouseDown(event) {
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.dragStartTime = Date.now();
    }

    // --- NEW: END TRACKING CLICK ---
    onMouseUp(event) {
        // 1. Calculate how far the mouse moved
        const distMoved = Math.sqrt(
            Math.pow(event.clientX - this.dragStartX, 2) +
            Math.pow(event.clientY - this.dragStartY, 2)
        );

        // 2. Calculate how long the button was held
        const timeElapsed = Date.now() - this.dragStartTime;

        // 3. DECIDE: Was this a Click or a Drag?
        // If moved less than 5 pixels AND held for less than 300ms, it's a CLICK.
        // Otherwise, it's a DRAG (Rotation), so we ignore it.
        const isClick = distMoved < 5 && timeElapsed < 300;

        if (isClick) {
            this.handleActualClick();
        }
    }

    handleActualClick() {
        if (this.hoveredPlanet) {
            this.focusOnPlanet(this.hoveredPlanet);
        } else {
            // Only reset if we truly CLICKED empty space (not dragged)
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

    findPlanetFromMesh(hitObject, planets) {
        let found = planets.find(p => p.planetMesh === hitObject);
        if (found) return found;

        let current = hitObject.parent;
        while (current) {
            found = planets.find(p => p.planetMesh === current);
            if (found) return found;
            current = current.parent;
        }
        return null;
    }

    update(planets) {
        // Hover Logic
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

        // Camera Logic
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