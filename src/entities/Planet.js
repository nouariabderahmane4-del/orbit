import * as THREE from 'three';

export class Planet {
    /**
     * @param {Object} data - Configuration data (name, color, size, position)
     * @param {THREE.Scene} scene - The scene to add this planet to
     */
    constructor(data, scene) {
        this.scene = scene;
        this.data = data;

        this.mesh = new THREE.Group();

        // 1. Load the Texture
        const textureLoader = new THREE.TextureLoader();
        // If a texture path is provided, load it. Otherwise null.
        const texture = data.texture ? textureLoader.load(data.texture) : null;

        // 2. Create Material
        // If it's the Sun, we want it to glow (BasicMaterial). 
        // If it's a Planet, we want it to have shadows (StandardMaterial).
        let material;
        if (data.name === "Sun") {
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: data.color // Fallback if texture fails
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: data.color
            });
        }

        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        this.planetMesh = new THREE.Mesh(geometry, material);

        this.planetMesh.position.x = data.distance;
        this.mesh.add(this.planetMesh);
        this.scene.add(this.mesh);
    }

    // We will use this later for animation
    update() {
        // We rotate the INVISIBLE CONTAINER (the pivot point)
        // The planet mesh itself is just sitting inside this container
        this.mesh.rotation.y += this.data.speed;

        // Optional: Rotate the planet ball itself so it looks like it has a day/night cycle
        this.planetMesh.rotation.y += 0.005;
    }
}