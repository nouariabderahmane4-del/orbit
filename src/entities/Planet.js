import * as THREE from 'three';

export class Planet {
    /**
     * @param {Object} data - Configuration data (name, color, size, position)
     * @param {THREE.Scene} scene - The scene to add this planet to
     */
    constructor(data, scene) {
        this.scene = scene;
        this.data = data;

        // 1. Create the invisible container (The "Pivot" point)
        // We will rotate this container to make the planet orbit!
        this.mesh = new THREE.Group();

        // 2. Create the visible ball (The Planet itself)
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: data.color });
        this.planetMesh = new THREE.Mesh(geometry, material);

        // 3. Position the planet mesh away from the center
        // (This is the distance from the Sun)
        this.planetMesh.position.x = data.distance;

        // 4. Add the ball to the container
        this.mesh.add(this.planetMesh);

        // 5. Add the container to the actual 3D scene
        this.scene.add(this.mesh);
    }

    // We will use this later for animation
    update() {
        // Rotate the container
        // this.mesh.rotation.y += this.data.speed; 
    }
}