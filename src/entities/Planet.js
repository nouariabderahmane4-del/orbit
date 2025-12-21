import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

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
        this.moons = []; // Stores { mesh, pivot, speed, data, label, orbit }
        this.moonLabels = [];

        // 1. Group Container
        this.mesh = new THREE.Group();

        // 2. Load Texture
        const textureLoader = new THREE.TextureLoader();
        const texture = data.texture ? textureLoader.load(data.texture) : null;
        if (texture) texture.colorSpace = THREE.SRGBColorSpace;

        // 3. Create Material
        let material;
        if (data.name === "Sun") {
            material = new THREE.MeshBasicMaterial({ map: texture, color: data.color });
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
            this.planetMesh.add(ringMesh);
            this.planetMesh.rotation.z = 27 * (Math.PI / 180);
        }

        // --- MOONS ---
        // Initialize existing moons from data
        if (data.moons) {
            data.moons.forEach(moonData => {
                this.createMoon(moonData);
            });
        }

        this.scene.add(this.mesh);
        this.orbitLine = this.createOrbitLine(data.distance);
    }

    createMoon(moonData) {
        // 1. Pivot (The center point the moon spins around)
        const moonPivot = new THREE.Object3D();
        this.planetMesh.add(moonPivot);

        // 2. Mesh (The actual visual moon)
        const geometry = new THREE.SphereGeometry(moonData.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: moonData.color,
            roughness: 0.9
        });
        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.position.x = moonData.distance;
        moonPivot.add(moonMesh);

        // --- NEW: INVISIBLE HITBOX ---
        // We make a sphere 2.5x bigger than the visual moon
        const hitGeo = new THREE.SphereGeometry(moonData.size * 2.5, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({
            visible: false, // Not drawn...
            color: 0xff0000,
            transparent: true, // ...but Raycaster still sees it if we use opacity 0? 
            // actually, Three.js raycaster ignores visible:false. 
            // We must use transparent:true, opacity:0 to let the ray hit it!
            opacity: 0,
            depthWrite: false
        });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.position.x = moonData.distance; // Same position as the moon
        moonPivot.add(hitMesh); // Move with the moon

        // 3. Label
        const moonDiv = document.createElement('div');
        moonDiv.className = 'moon-label';
        moonDiv.textContent = moonData.name;
        const moonLabel = new CSS2DObject(moonDiv);
        moonLabel.position.set(0, moonData.size + 0.5, 0);
        moonMesh.add(moonLabel);
        moonLabel.visible = false;
        this.moonLabels.push(moonLabel);

        // 4. Orbit Line
        const orbitCurve = new THREE.EllipseCurve(0, 0, moonData.distance, moonData.distance, 0, 2 * Math.PI);
        const points = orbitCurve.getPoints(64);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitLine.rotation.x = -Math.PI / 2;
        this.planetMesh.add(orbitLine);

        // 5. Save everything (Include HitMesh!)
        this.moons.push({
            mesh: moonMesh,
            hitMesh: hitMesh, // <--- SAVE THIS
            pivot: moonPivot,
            speed: moonData.speed,
            data: moonData,
            label: moonLabel,
            orbit: orbitLine
        });
    }

    removeMoon(moonData) {
        const index = this.moons.findIndex(m => m.data === moonData);
        if (index === -1) return;

        const moonObj = this.moons[index];

        // 1. Remove 3D Objects
        this.planetMesh.remove(moonObj.pivot);
        this.planetMesh.remove(moonObj.orbit);

        // NEW: Dispose of Hitbox memory
        moonObj.hitMesh.geometry.dispose();
        moonObj.hitMesh.material.dispose();

        // 2. Clean up Labels
        const labelIndex = this.moonLabels.indexOf(moonObj.label);
        if (labelIndex > -1) this.moonLabels.splice(labelIndex, 1);

        // 3. Clean up Data
        const dataIndex = this.data.moons.indexOf(moonData);
        if (dataIndex > -1) this.data.moons.splice(dataIndex, 1);

        // 4. Remove from list
        this.moons.splice(index, 1);
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
        return orbitLine;
    }

    showMoonLabels() {
        this.moonLabels.forEach(label => label.visible = true);
    }

    hideMoonLabels() {
        this.moonLabels.forEach(label => label.visible = false);
    }

    dispose() {
        this.scene.remove(this.mesh);
        if (this.orbitLine) {
            this.scene.remove(this.orbitLine);
        }
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