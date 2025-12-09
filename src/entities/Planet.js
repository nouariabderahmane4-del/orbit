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
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: data.color
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
        this.mesh.rotation.y += this.data.speed * timeScale;
        this.planetMesh.rotation.y += 0.005 * timeScale;
    }
}