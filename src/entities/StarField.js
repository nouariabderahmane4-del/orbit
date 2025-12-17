import * as THREE from 'three';

export class StarField {
    constructor(scene, count = 10000) {
        this.scene = scene;

        // We use BufferGeometry because creating 10,000 separate Mesh objects would lag the computer.
        // BufferGeometry lets us render them all in one draw call.
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3); // x, y, z for each star
        const colors = new Float32Array(count * 3); // r, g, b for each star

        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // 1. Random Position (Spread them wide over 2000 units)
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // 2. Random Color Logic
            // I want stars to be either blue-ish or red-ish/yellow, not green.
            const vx = Math.random();

            if (vx > 0.5) {
                // Hotter stars (Blue/White)
                color.setHex(0xaaaaaa); // Base white
                // Mix in some blue
                color.lerp(new THREE.Color(0x0000ff), Math.random() * 0.5);
            } else {
                // Cooler stars (Yellow/Red)
                color.setHex(0xffaa00);
                // Mix in some red
                color.lerp(new THREE.Color(0xff0000), Math.random() * 0.5);
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        // Set the attributes so the GPU can read them
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Use PointsMaterial specifically for particles
        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true, // Important: Tell Three.js to use the colors array we just made
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true // Makes stars smaller if they are far away
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }
}