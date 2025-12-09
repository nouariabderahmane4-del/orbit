import * as THREE from 'three';

export class SceneSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // 1. Create the Scene (The World)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('black'); // Space color

        // 2. Create the Camera (The Eye)
        // PerspectiveCamera(Field of View, Aspect Ratio, Near Clip, Far Clip)
        this.camera = new THREE.PerspectiveCamera(
            35, // FOV: How wide the lens is
            window.innerWidth / window.innerHeight, // Aspect Ratio
            0.1, // Near: Objects closer than this are invisible
            1000 // Far: Objects further than this are invisible
        );
        this.camera.position.set(0, 0, 100); // Move camera back so we can see center (0,0,0)

        // 3. Create the Renderer (The Painter)
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio); // Sharpness on retina screens

        // Append the canvas to our HTML
        this.container.appendChild(this.renderer.domElement);

        // Auto-resize handling (Important!)
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // A helper to just "render one frame"
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}