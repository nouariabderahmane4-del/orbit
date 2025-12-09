import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        this.scene = new THREE.Scene();

        // --- GALAXY SPHERE (Your Skybox) ---
        const loader = new THREE.TextureLoader();
        loader.load('./public/textures/galaxy.jpg', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.repeat.set(8, 1);

            const geometry = new THREE.SphereGeometry(4000, 64, 64);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.6
            });

            const skySphere = new THREE.Mesh(geometry, material);
            this.scene.add(skySphere);
        });

        this.scene.background = new THREE.Color(0x000005);
        // -----------------------------------

        this.addLights();

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(50
            , 50, 100);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    addLights() {
        // --- NEW: HEMISPHERE LIGHT (The "Clarity" Fix) ---
        // Instead of a dim ambient light, we use a Hemisphere Light.
        // Sky Color: 0xffffff (Pure White) - Light from above
        // Ground Color: 0x444444 (Dark Grey) - Light from below
        // Intensity: 2.0 (High brightness)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        this.scene.add(hemiLight);

        // --- THE SUN ---
        const sunLight = new THREE.PointLight(0xffffff, 50, 0);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}