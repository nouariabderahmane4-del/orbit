import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // 1. Create the Scene (The World)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('black');

        // This call is correct, but the function definition was in the wrong place
        this.addLights();

        // 2. Create the Camera 
        this.camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 100);

        // 3. Create the Renderer 
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Append the canvas
        this.container.appendChild(this.renderer.domElement);

        // Resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    } // <--- CONSTRUCTOR ENDS HERE (Pay attention to this brace)

    // NEW METHOD STARTS HERE (Outside the constructor)
    addLights() {
        // 1. Ambient Light
        const ambientLight = new THREE.AmbientLight(0x333333, 1);
        this.scene.add(ambientLight);

        // 2. Point Light: The Sun!
        const sunLight = new THREE.PointLight(0xffffff, 2, 300);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}