import * as THREE from 'three';

export class Planet {
    constructor(data, scene) {
        this.scene = scene;
        this.data = data;

        this.mesh = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const texture = data.texture ? textureLoader.load(data.texture) : null;

        let material;
        if (data.name === "Sun") {
            // The Sun emits light, so we use BasicMaterial (unaffected by lighting)
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: data.color
            });
        } else {
            // Planets reflect light, so we use StandardMaterial
            // SENIOR ENGINEER FIX: 
            // If we have a texture, we set the base color to WHITE (0xffffff).
            // If we kept the original color (e.g., Blue for Earth), it would multiply 
            // with the texture and make it dark and muddy.
            const materialColor = texture ? 0xffffff : data.color;

            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: materialColor,
                roughness: 1.0, // Makes them look matte (rocky/gaseous) rather than plastic
                metalness: 0.0
            });
        }

        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        this.planetMesh = new THREE.Mesh(geometry, material);

        this.planetMesh.position.x = data.distance;
        this.mesh.add(this.planetMesh);
        this.scene.add(this.mesh);

        // Orbit Line visualization
        const orbitShape = new THREE.EllipseCurve(
            0, 0,
            data.distance, data.distance,
            0, 2 * Math.PI
        );

        const orbitPoints = orbitShape.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x555555,
            transparent: true,
            opacity: 0.3
        });

        const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
        orbitLine.rotation.x = -Math.PI / 2;

        this.scene.add(orbitLine);
    }

    update(timeScale = 1) {
        // Orbit rotation (around the sun)
        this.mesh.rotation.y += this.data.speed * timeScale;

        // Self rotation (around its own axis)
        this.planetMesh.rotation.y += 0.005 * timeScale;
    }
}