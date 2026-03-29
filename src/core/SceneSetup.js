import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();

        // --- GALAXY SPHERE ---
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
        this.addLights();

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(50, 50, 100);
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
        // Lowered ambient light from 2.0 to 0.05 so the night side of planets is actually dark
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        this.scene.add(ambientLight);

        // Making the Sun the main light source. 
        // decay = 0 ensures the light reaches the outer planets without fading out
        const sunLight = new THREE.PointLight(0xffffff, 3);
        sunLight.position.set(0, 0, 0);
        sunLight.decay = 0;

        this.scene.add(sunLight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}