import * as THREE from 'three';

export class Planet {
    constructor(data, scene) {
        this.scene = scene;
        this.data = data;

        // 1. The Orbit Group (Handles movement around the Sun)
        this.mesh = new THREE.Group();

        // 2. Texture Loading
        const textureLoader = new THREE.TextureLoader();
        const texture = data.texture ? textureLoader.load(data.texture) : null;
        if (texture) texture.colorSpace = THREE.SRGBColorSpace;

        // 3. Material Setup
        let material;
        if (data.name === "Sun") {
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: data.color
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: texture ? 0xffffff : data.color,
                roughness: 0.8,
                metalness: 0.1,
                emissive: texture ? 0xffffff : data.color,
                emissiveMap: texture || null,
                emissiveIntensity: 0.15
            });
        }

        // 4. Create the Planet Sphere
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        this.planetMesh = new THREE.Mesh(geometry, material);

        // --- NEW: SATURN RINGS LOGIC ---
        if (data.name === "Saturn") {
            // A. Geometry: Inner Radius (Just above surface), Outer Radius (Wide)
            const innerRadius = data.size * 1.4;
            const outerRadius = data.size * 2.4;
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);

            // B. Texture/Material
            // We use a simple color for now, but slightly transparent
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xcdc2b0, // Beige/Sand color
                side: THREE.DoubleSide, // CRITICAL: Visible from top and bottom
                transparent: true,
                opacity: 0.6,
                roughness: 1, // Rings are dusty, not shiny
            });

            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

            // C. Orientation Fix
            // Rings are created standing up (facing Z). Rotate -90 deg to lay flat.
            ringMesh.rotation.x = -Math.PI / 2;

            // D. Shadows (Optional but nice)
            ringMesh.receiveShadow = true;
            ringMesh.castShadow = true;

            // E. Attach to Planet
            this.planetMesh.add(ringMesh);

            // F. THE ICONIC TILT
            // Saturn is tilted ~27 degrees relative to its orbit.
            // We rotate the PLANET MESH, and the child Ring moves with it.
            this.planetMesh.rotation.z = 27 * (Math.PI / 180); // Convert degrees to radians
        }
        // -------------------------------

        // Position the planet relative to the sun
        this.planetMesh.position.x = data.distance;
        this.mesh.add(this.planetMesh);
        this.scene.add(this.mesh);

        // 5. Draw the Orbit Line (Visual Path)
        this.createOrbitLine(data.distance);
    }

    createOrbitLine(radius) {
        const orbitShape = new THREE.EllipseCurve(
            0, 0,
            radius, radius,
            0, 2 * Math.PI
        );
        const points = orbitShape.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.3
        });
        const orbitLine = new THREE.LineLoop(geometry, material);
        orbitLine.rotation.x = -Math.PI / 2;
        this.scene.add(orbitLine);
    }

    update(timeScale = 1) {
        // Orbit around the sun
        this.mesh.rotation.y += this.data.speed * timeScale;

        // Spin on its own axis
        // Note: Because we tilted Saturn, this rotation happens on its local axis!
        this.planetMesh.rotation.y += 0.005 * timeScale;
    }
}