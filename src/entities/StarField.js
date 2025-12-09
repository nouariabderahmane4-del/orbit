import * as THREE from 'three';

export class StarField {
    constructor(scene, count = 10000) { // Increased to 10,000 for density
        this.scene = scene;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3); // New array for colors

        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // 1. Position (Spread them wide)
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // 2. Color Logic (Science-based randomization)
            // We mix Blue (0.5 to 1.0) and Red (0.0 to 1.0) to get purple/blue/white hues
            // This avoids "green" stars which are rare in space visualization.
            const vx = Math.random();

            if (vx > 0.5) {
                // Hotter stars (Blue/White)
                color.setHex(0xaaaaaa); // Base white
                color.lerp(new THREE.Color(0x0000ff), Math.random() * 0.5);
            } else {
                // Cooler stars (Yellow/Red)
                color.setHex(0xffaa00);
                color.lerp(new THREE.Color(0xff0000), Math.random() * 0.5);
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // Send colors to GPU

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true, // <--- CRITICAL: Tells GPU to use our custom colors
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }
}