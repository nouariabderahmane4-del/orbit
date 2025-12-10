import * as THREE from 'three';

export class Spaceship {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // --- 1. PHYSICS STATE ---
        this.position = new THREE.Vector3(0, 50, 100); // Start near Earth
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        // Settings
        this.speed = 0.5;         // Engine power
        this.turnSpeed = 0.03;    // Maneuverability
        this.friction = 0.98;     // Space drag (0.99 = icy, 0.90 = thick mud)

        // --- 2. BUILD THE VISUAL SHIP ---
        this.mesh = this.createShipMesh();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // --- 3. INPUT STATE ---
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,    // Space
            down: false   // Shift
        };

        // Bind Input Listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    createShipMesh() {
        const shipGroup = new THREE.Group();

        // A. Main Body (Cone)
        const bodyGeo = new THREE.ConeGeometry(2, 8, 8);
        bodyGeo.rotateX(Math.PI / 2); // Point forward (Z-axis)
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x00aaff,
            roughness: 0.4,
            metalness: 0.8
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        shipGroup.add(body);

        // B. Wings (Triangles)
        const wingGeo = new THREE.BufferGeometry();
        const wingVertices = new Float32Array([
            0, 0, 2,   // Tip
            5, 0, -2,  // Far Right
            0, 0, -2   // Back Center
        ]);
        wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        const leftWing = rightWing.clone();
        leftWing.scale.x = -1; // Mirror it

        shipGroup.add(rightWing);
        shipGroup.add(leftWing);

        // C. Engine Glow
        const engineGeo = new THREE.CylinderGeometry(0.5, 0, 2, 8);
        engineGeo.rotateX(Math.PI / 2);
        const engineMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.z = -4.5;
        shipGroup.add(engine);

        return shipGroup;
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space': this.keys.up = true; break;
            case 'ShiftLeft': this.keys.down = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'Space': this.keys.up = false; break;
            case 'ShiftLeft': this.keys.down = false; break;
        }
    }

    update() {
        // 1. ROTATION (Direct Control)
        if (this.keys.left) this.mesh.rotation.y += this.turnSpeed;
        if (this.keys.right) this.mesh.rotation.y -= this.turnSpeed;
        if (this.keys.up) this.mesh.rotation.x -= this.turnSpeed;
        if (this.keys.down) this.mesh.rotation.x += this.turnSpeed;

        // 2. THRUST (Newton's 2nd Law: F = ma)
        // We need to know which way is "Forward" for the ship
        // .getDirection() gives us the normalized vector the ship is facing
        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);

        if (this.keys.forward) {
            this.velocity.add(forwardDir.multiplyScalar(this.speed));
        }
        if (this.keys.backward) {
            this.velocity.sub(forwardDir.multiplyScalar(this.speed * 0.5));
        }

        // 3. APPLY VELOCITY TO POSITION
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);

        // 4. FRICTION (Damping)
        // In space, you don't stop unless you hit something.
        // But for gameplay, we multiply velocity by 0.98 every frame to simulate "stabilizers".
        this.velocity.multiplyScalar(this.friction);

        // 5. CAMERA CHASE (Third Person View)
        // We want the camera to sit behind and slightly above the ship
        const relativeCameraOffset = new THREE.Vector3(0, 10, -30); // Behind ship

        // Transform that offset to World Coordinates based on ship's rotation
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);

        // Smoothly move the camera to that spot
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.mesh.position);
    }
}