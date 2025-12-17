import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- SHADERS (I copied these, they do the glow effect) ---
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
        this.moonLabels = []; // Keeping track of the text labels separately

        // 1. Group Container
        // Instead of just a mesh, I use a Group. This way I can add the planet, 
        // clouds, and moons to this one object and move them all together.
        this.mesh = new THREE.Group();

        // 2. Load Texture (Image)
        const textureLoader = new THREE.TextureLoader();
        const texture = data.texture ? textureLoader.load(data.texture) : null;
        if (texture) texture.colorSpace = THREE.SRGBColorSpace;

        // 3. Create Material
        let material;
        if (data.name === "Sun") {
            // Sun uses BasicMaterial so it glows/isn't affected by shadows
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: data.color
            });
        } else {
            // Planets use StandardMaterial so they react to light
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: texture ? 0xffffff : data.color,
                roughness: 0.8,
                metalness: 0.1,
                emissive: texture ? 0xffffff : data.color,
                emissiveMap: texture || null, // Makes it glow slightly
                emissiveIntensity: 0.1
            });
        }

        // Create the sphere shape
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        this.planetMesh = new THREE.Mesh(geometry, material);
        this.planetMesh.position.x = data.distance; // Offset from the sun
        this.mesh.add(this.planetMesh);

        // --- ADD CLOUDS IF THEY EXIST ---
        if (data.clouds) {
            const cloudTexture = textureLoader.load(data.clouds);
            cloudTexture.colorSpace = THREE.SRGBColorSpace;
            // Make clouds slightly bigger than the planet
            const cloudGeometry = new THREE.SphereGeometry(data.size * 1.02, 64, 64);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending, // Makes it look glowy
                side: THREE.DoubleSide
            });
            this.cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
            this.planetMesh.add(this.cloudMesh); // Add clouds as a child of the planet
        }

        // --- ADD ATMOSPHERE GLOW ---
        if (data.atmosphere) {
            // Atmosphere is even bigger
            const atmosGeometry = new THREE.SphereGeometry(data.size * 1.2, 64, 64);
            const atmosMaterial = new THREE.ShaderMaterial({
                vertexShader: atmosphereVertexShader,
                fragmentShader: atmosphereFragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide, // Only render the back so it looks like a halo
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

        // --- SATURN RINGS ---
        if (data.name === "Saturn") {
            const innerRadius = data.size * 1.4;
            const outerRadius = data.size * 2.4;
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xcdc2b0,
                side: THREE.DoubleSide, // See rings from top and bottom
                transparent: true,
                opacity: 0.6,
                roughness: 1,
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = -Math.PI / 2; // Lay flat
            this.planetMesh.add(ringMesh);
            this.planetMesh.rotation.z = 27 * (Math.PI / 180); // Tilt Saturn a bit
        }

        // --- MOONS ---
        if (data.moons) {
            // If the data has moons, loop through and create each one
            data.moons.forEach(moonData => {
                this.createMoon(moonData);
            });
        }

        // Add the whole group to the scene
        this.scene.add(this.mesh);

        // Draw the white line showing where the planet orbits
        this.orbitLine = this.createOrbitLine(data.distance);
    }

    createMoon(moonData) {
        // Pivot point for the moon to rotate around the planet
        const moonPivot = new THREE.Object3D();
        this.planetMesh.add(moonPivot);

        const geometry = new THREE.SphereGeometry(moonData.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: moonData.color,
            roughness: 0.9
        });
        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.position.x = moonData.distance; // Distance from the Planet
        moonPivot.add(moonMesh);

        // --- HTML LABEL FOR MOON ---
        const moonDiv = document.createElement('div');
        moonDiv.className = 'moon-label';
        moonDiv.textContent = moonData.name;

        // This object turns HTML into a 3D object
        const moonLabel = new CSS2DObject(moonDiv);
        moonLabel.position.set(0, moonData.size + 0.5, 0); // Put it slightly above the moon
        moonMesh.add(moonLabel);

        // Default to hidden, we only show it on hover
        moonLabel.visible = false;
        this.moonLabels.push(moonLabel);

        // Save moon data for animation later
        this.moons.push({
            mesh: moonMesh,
            pivot: moonPivot,
            speed: moonData.speed
        });

        // Draw a tiny orbit line for the moon
        const orbitCurve = new THREE.EllipseCurve(0, 0, moonData.distance, moonData.distance, 0, 2 * Math.PI);
        const points = orbitCurve.getPoints(64);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitLine.rotation.x = -Math.PI / 2;
        this.planetMesh.add(orbitLine);
    }

    createOrbitLine(radius) {
        // Draws the circle path around the sun
        const orbitShape = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI);
        const points = orbitShape.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.3
        });
        const orbitLine = new THREE.LineLoop(geometry, material);
        orbitLine.rotation.x = -Math.PI / 2; // Flat on the ground
        this.scene.add(orbitLine);
        return orbitLine;
    }

    // --- TOGGLE LABELS ---
    showMoonLabels() {
        this.moonLabels.forEach(label => label.visible = true);
    }

    hideMoonLabels() {
        this.moonLabels.forEach(label => label.visible = false);
    }

    // --- CLEANUP ---
    dispose() {
        // Remove meshes from scene so memory doesn't leak
        this.scene.remove(this.mesh);
        if (this.orbitLine) {
            this.scene.remove(this.orbitLine);
        }
    }

    update(timeScale = 1) {
        // Rotate the orbit group around the sun
        this.mesh.rotation.y += this.data.speed * timeScale;
        // Rotate the planet itself on its axis
        this.planetMesh.rotation.y += 0.005 * timeScale;

        // Rotate clouds slightly faster for effect
        if (this.cloudMesh) {
            this.cloudMesh.rotation.y += 0.002 * timeScale;
        }

        // Update all moons
        this.moons.forEach(moon => {
            moon.pivot.rotation.y += moon.speed * timeScale;
        });
    }
}