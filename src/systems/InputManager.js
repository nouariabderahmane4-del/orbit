import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class InputManager {
    constructor(camera, scene, renderer, uiManager) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.uiManager = uiManager;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 1. Setup Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;

        // 2. State
        this.focusedPlanet = null;
        this.hoveredPlanet = null;
        this.lastHoveredPlanet = null;
        this.isTransitioning = false;
        this.tooltip = document.getElementById('tooltip');

        this.currentPlanets = [];

        // Drag Tracking
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTime = 0;

        // 3. Listeners
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

        const isClick = distMoved < 5 && timeElapsed < 300;

        if (isClick) {
            this.handleActualClick();
        }
    }

    handleActualClick() {
        this.camera.updateMatrixWorld();
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const planetMeshes = this.currentPlanets.map(p => p.planetMesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            const targetPlanet = this.findPlanetFromMesh(hitObject, this.currentPlanets);

            if (targetPlanet) {
                this.focusOnPlanet(targetPlanet);
            }
        }
    }

    resetFocus() {
        if (!this.focusedPlanet) return;
        this.uiManager.hidePlanetInfo();

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
        // First check: Is this literally the planet mesh?
        let found = planets.find(p => p.planetMesh === hitObject);
        if (found) return found;

        // Second check: Is it a child (moon, cloud, atmosphere)? Walk up the tree.
        let current = hitObject.parent;
        while (current) {
            found = planets.find(p => p.planetMesh === current);
            if (found) return found;
            current = current.parent;
        }
        return null;
    }

    update(planets) {
        this.currentPlanets = planets;

        // --- HOVER LOGIC ---
        this.camera.updateMatrixWorld();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const planetMeshes = planets.map(p => p.planetMesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes, true);

        this.hoveredPlanet = null;

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            this.hoveredPlanet = this.findPlanetFromMesh(hitObject, planets);

            if (this.hoveredPlanet) {
                // DEFAULT: Show Planet Info
                let name = this.hoveredPlanet.data.name;
                let size = this.hoveredPlanet.data.size;
                let dist = this.hoveredPlanet.data.distance;

                // --- CHECK FOR MOON HOVER (UPDATED) ---
                if (this.hoveredPlanet.moons) {
                    // Check if we hit the Visual Mesh OR the Hitbox Mesh
                    const hitMoon = this.hoveredPlanet.moons.find(m => m.mesh === hitObject || m.hitMesh === hitObject);

                    if (hitMoon) {
                        name = `Moon: ${hitMoon.data.name}`;
                        size = hitMoon.data.size;
                        dist = hitMoon.data.distance;
                    }
                }

                // Render Tooltip
                const tooltipHTML = `
                    <div style="text-align: left; line-height: 1.4;">
                        <strong style="color: #00aaff; font-size: 14px;">${name}</strong><br>
                        <span style="color: #ccc; font-size: 12px;">Size:</span> ${size.toFixed(2)}<br>
                        <span style="color: #ccc; font-size: 12px;">Distance:</span> ${dist}
                    </div>
                `;
                this.showTooltip(tooltipHTML);
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.hideTooltip();
            document.body.style.cursor = 'default';
        }

        // --- LABEL TOGGLING ---
        if (this.hoveredPlanet !== this.lastHoveredPlanet) {
            if (this.lastHoveredPlanet) this.lastHoveredPlanet.hideMoonLabels();
            if (this.hoveredPlanet) this.hoveredPlanet.showMoonLabels();
            this.lastHoveredPlanet = this.hoveredPlanet;
        }

        // --- CAMERA ANIMATION ---
        this.controls.update();

        if (this.focusedPlanet) {
            const planetPos = new THREE.Vector3();
            this.focusedPlanet.planetMesh.getWorldPosition(planetPos);

            if (this.isTransitioning) {
                const offset = this.focusedPlanet.data.size * 4 + 5;
                const idealPos = new THREE.Vector3(0, offset * 0.5, offset).add(planetPos);

                this.camera.position.lerp(idealPos, 0.1);
                this.controls.target.lerp(planetPos, 0.1);

                if (this.camera.position.distanceTo(idealPos) < 4.0) {
                    this.isTransitioning = false;
                    this.uiManager.showPlanetInfo(this.focusedPlanet.data);
                }
            } else {
                this.controls.target.copy(planetPos);
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

    showTooltip(htmlContent) {
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = htmlContent;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
}