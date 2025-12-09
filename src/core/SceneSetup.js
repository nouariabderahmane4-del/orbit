import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // 1. Create the Scene
        this.scene = new THREE.Scene();

        // --- NEW: GALAXY BACKGROUND LOADER ---
        // We use a TextureLoader to load a 360-degree star map.
        // Make sure you save a high-res image as 'galaxy.jpg' in your public/textures folder.
        const loader = new THREE.TextureLoader();

        loader.load(
            './public/textures/galaxy.jpg',
            (texture) => {
                // Success Callback: Image loaded
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;

                this.scene.background = texture;
                // 'environment' allows shiny planets (oceans) to reflect the stars!
                this.scene.environment = texture;
            },
            undefined, // Progress callback (unused)
            (err) => {
                // Error Callback: If image is missing, use a safe color
                console.warn("Galaxy texture not found. Using fallback color.");
                this.scene.background = new THREE.Color(0x000005); // Deep space blue/black
            }
        );
        // -------------------------------------

        this.addLights();

        // 2. Camera Setup (The Eye)
        this.camera = new THREE.PerspectiveCamera(
            35, // Field of View
            window.innerWidth / window.innerHeight, // Aspect Ratio
            0.1, // Near clipping plane
            10000 // Far clipping plane (increased to see distant stars)
        );
        this.camera.position.set(0, 40, 90);
        this.camera.lookAt(0, 0, 0);

        // 3. Renderer Setup (The Painter)
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance" // Hints the computer to use the dedicated GPU
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Essential for proper color accuracy with textures
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        // 4. Handle Window Resizing
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    addLights() {
        // A. Ambient Light (The "Fill" Light)
        // Simulates light scattering. 0.8 ensures shadows aren't pitch black.
        // Color is slightly blueish (0x4040a0) to mimic deep space starlight, 
        // or keep it white (0xffffff) for neutral lighting. Let's use slight blue.
        const ambientLight = new THREE.AmbientLight(0x333333, 1.5);
        this.scene.add(ambientLight);

        // B. The Sun (The "Key" Light)
        // Intensity: 50. Distance: 0 (Infinite).
        // This is a PointLight sitting at (0,0,0).
        const sunLight = new THREE.PointLight(0xffffff, 50, 0);
        sunLight.position.set(0, 0, 0);

        // Optional: specific shadow properties could go here later

        this.scene.add(sunLight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}