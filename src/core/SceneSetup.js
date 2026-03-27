import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        // Get the HTML div where we will draw the 3D scene
        this.container = document.getElementById(containerId);

        // The Scene is like the stage where we put all our actors (objects)
        this.scene = new THREE.Scene();

        // --- GALAXY SPHERE (The Background) ---
        // Loading the galaxy image
        const loader = new THREE.TextureLoader();
        loader.load('./public/textures/galaxy.jpg', (texture) => {
            // Making sure colors look correct
            texture.colorSpace = THREE.SRGBColorSpace;
            // Wrapping options to make the texture repeat seamlessly
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.repeat.set(8, 1);

            // A giant sphere that surrounds everything
            const geometry = new THREE.SphereGeometry(4000, 64, 64);
            // "BackSide" means we see the texture on the INSIDE of the sphere
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.6
            });

            const skySphere = new THREE.Mesh(geometry, material);
            this.scene.add(skySphere);
        });

        // Set a dark background color just in case the sphere doesn't load
        this.scene.background = new THREE.Color(0x000005);

        // Add our lights
        this.addLights();

        // Setup the camera (FOV, Aspect Ratio, Near Clip, Far Clip)
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        // Start position
        this.camera.position.set(50, 50, 100);
        this.camera.lookAt(0, 0, 0);

        // The Renderer is what actually draws the scene to the <canvas>
        this.renderer = new THREE.WebGLRenderer({
            antialias: true, // Makes edges smooth
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Put the canvas into the HTML
        this.container.appendChild(this.renderer.domElement);

        // If the user resizes the window, we need to fix the camera shape
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix(); // Important! Recalculate camera math
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    addLights() {
        // --- HEMISPHERE LIGHT ---
        // This gives a nice general light.
        // First color is sky (white), second is ground (grey).
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        this.scene.add(hemiLight);

        // --- THE SUN LIGHT ---
        // A point light located at the center (0,0,0) where the Sun mesh is.
        // It radiates light outwards.
        const sunLight = new THREE.PointLight(0xffffff, 50, 0);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    render() {
        // This takes a picture of the scene from the camera's perspective
        this.renderer.render(this.scene, this.camera);
    }
}