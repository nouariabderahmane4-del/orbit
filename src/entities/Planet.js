import * as THREE from 'three';

// --- SHADERS (Unchanged) ---
const atmosphereVertexShader = `
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const atmosphereFragmentShader = `
    varying vec3 vNormal;
    uniform vec3 glowColor;
    uniform float opacity;
    uniform float intensity;

    void main() {
        float intensityCalc = pow(intensity - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
        gl_FragColor = vec4(glowColor, 1.0) * intensityCalc * opacity;
    }
`;

export class Planet {
    constructor(data, scene) {
        this.scene = scene;
        this.data = data;
        this.moons = [];

        // 1. Root Container
        this.mesh = new THREE.Group();

        // 2. Texture Loading
        const textureLoader = new THREE.TextureLoader();
        const texture = data.texture ? textureLoader.load(data.texture) : null;
        if (texture) texture.colorSpace = THREE.SRGBColorSpace;

        // 3. Create Base Planet
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
                emissiveIntensity: 0.1
            });
        }

        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        this.planetMesh = new THREE.Mesh(geometry, material);
        this.planetMesh.position.x = data.distance;
        this.mesh.add(this.planetMesh);

        // --- CLOUDS ---
        if (data.clouds) {
            const cloudTexture = textureLoader.load(data.clouds);
            cloudTexture.colorSpace = THREE.SRGBColorSpace;
            const cloudGeometry = new THREE.SphereGeometry(data.size * 1.02, 64, 64);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            this.cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
            this.planetMesh.add(this.cloudMesh);
        }

        // --- ATMOSPHERE ---
        if (data.atmosphere) {
            const atmosGeometry = new THREE.SphereGeometry(data.size * 1.2, 64, 64);
            const atmosMaterial = new THREE.ShaderMaterial({
                vertexShader: atmosphereVertexShader,
                fragmentShader: atmosphereFragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true,
                uniforms: {
                    glowColor: { value: new THREE.Color(data.atmosphere.color) },
                    opacity: { value: data.atmosphere.opacity },
                    intensity: { value: 0.7 }
                }
            });
            this.atmosphereMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
            this.planetMesh.add(this.atmosphereMesh);
        }

        // --- RINGS ---
        if (data.name === "Saturn") {
            const innerRadius = data.size * 1.4;
            const outerRadius = data.size * 2.4;
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xcdc2b0,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6,
                roughness: 1,
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.receiveShadow = true;
            ringMesh.castShadow = true;
            this.planetMesh.add(ringMesh);
            this.planetMesh.rotation.z = 27 * (Math.PI / 180);
        }

        // --- MOONS ---
        if (data.moons) {
            data.moons.forEach(moonData => {
                this.createMoon(moonData);
            });
        }

        this.scene.add(this.mesh);

        // FIX: Track orbit line so we can delete it later
        this.orbitLine = this.createOrbitLine(data.distance);
    }

    createMoon(moonData) {
        const moonPivot = new THREE.Object3D();
        this.planetMesh.add(moonPivot);

        const geometry = new THREE.SphereGeometry(moonData.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: moonData.color,
            roughness: 0.9
        });
        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.position.x = moonData.distance;
        moonPivot.add(moonMesh);

        this.moons.push({
            mesh: moonMesh,
            pivot: moonPivot,
            speed: moonData.speed
        });

        // Mini orbit line for moon
        const orbitCurve = new THREE.EllipseCurve(0, 0, moonData.distance, moonData.distance, 0, 2 * Math.PI);
        const points = orbitCurve.getPoints(64);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitLine.rotation.x = -Math.PI / 2;
        this.planetMesh.add(orbitLine);
    }

    createOrbitLine(radius) {
        const orbitShape = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI);
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
        return orbitLine; // Return reference
    }

    // --- NEW: CLEANUP METHOD ---
    dispose() {
        // Remove main mesh group
        this.scene.remove(this.mesh);

        // Remove orbit line
        if (this.orbitLine) {
            this.scene.remove(this.orbitLine);
        }

        // (Optional: You could traverse and dispose geometries/materials here for memory safety, 
        // but for a simple app, removing from scene is sufficient)
    }

    update(timeScale = 1) {
        this.mesh.rotation.y += this.data.speed * timeScale;
        this.planetMesh.rotation.y += 0.005 * timeScale;

        if (this.cloudMesh) {
            this.cloudMesh.rotation.y += 0.002 * timeScale;
        }

        this.moons.forEach(moon => {
            moon.pivot.rotation.y += moon.speed * timeScale;
        });
    }
}