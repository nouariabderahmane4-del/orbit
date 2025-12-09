import * as THREE from 'three';

export class InputManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = document.getElementById('tooltip');

        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.updateTooltipPosition(event);
    }

    updateTooltipPosition(event) {
        this.tooltip.style.left = event.clientX + 15 + 'px';
        this.tooltip.style.top = event.clientY + 15 + 'px';
    }

    checkIntersections(planets) {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const planetMeshes = planets.map(p => p.planetMesh);

        const intersects = this.raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;

            const planetData = planets.find(p => p.planetMesh === hitObject).data;

            this.showTooltip(planetData.name);
        } else {
            this.hideTooltip();
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