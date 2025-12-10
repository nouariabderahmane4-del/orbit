import * as THREE from 'three';

export class Spaceship {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // --- 1. PHYSICS STATE ---
        this.position = new THREE.Vector3(0, 50, 100); // Start near Earth
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Settings: Adjusted for better control
        this.maxSpeed = 2.0;      // Cap the maximum speed
        this.acceleration = 0.05; // How fast we speed up (W)
        this.turnSpeed = 0.04;    // How fast we turn
        this.friction = 0.95;     // Higher drag = easier to stop (0.95 is "thicker" space)

        // --- 2. BUILD THE VISUAL SHIP ---
        this.mesh = this.createShipMesh();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // --- 3. INPUT STATE ---
        this.keys = {
            thrust: false,
            brake: false,
            yawLeft: false,
            yawRight: false,
            pitchUp: false,
            pitchDown: false
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
            6, 0, -3,  // Far Right (Wider for cool look)
            0, 0, -3   // Back Center
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
        // Prevent browser scrolling when using Arrows or Space
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }

        switch (event.code) {
            case 'KeyW': this.keys.thrust = true; break;
            case 'KeyS': this.keys.brake = true; break;
            case 'ArrowLeft': this.keys.yawLeft = true; break;
            case 'ArrowRight': this.keys.yawRight = true; break;
            case 'ArrowUp': this.keys.pitchUp = true; break;
            case 'ArrowDown': this.keys.pitchDown = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.keys.thrust = false; break;
            case 'KeyS': this.keys.brake = false; break;
            case 'ArrowLeft': this.keys.yawLeft = false; break;
            case 'ArrowRight': this.keys.yawRight = false; break;
            case 'ArrowUp': this.keys.pitchUp = false; break;
            case 'ArrowDown': this.keys.pitchDown = false; break;
        }
    }

    update() {
        // 1. ROTATION (Direct Control)
        // Arrow Left/Right = Yaw (Turn)
        if (this.keys.yawLeft) this.mesh.rotation.y += this.turnSpeed;
        if (this.keys.yawRight) this.mesh.rotation.y -= this.turnSpeed;

        // Arrow Up/Down = Pitch (Nose Up/Down)
        // Note: Usually "Up" means nose up, which is negative X rotation in 3D space
        if (this.keys.pitchUp) this.mesh.rotation.x -= this.turnSpeed;
        if (this.keys.pitchDown) this.mesh.rotation.x += this.turnSpeed;

        // 2. THRUST (Newton's 2nd Law)
        // Get the direction the ship is currently facing
        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);

        if (this.keys.thrust) {
            this.velocity.add(forwardDir.multiplyScalar(this.acceleration));
        }
        if (this.keys.brake) {
            this.velocity.sub(forwardDir.multiplyScalar(this.acceleration * 0.5));
        }

        // Limit Speed (Safety Cap)
        this.velocity.clampLength(0, this.maxSpeed);

        // 3. APPLY VELOCITY
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);

        // 4. FRICTION (Drag)
        this.velocity.multiplyScalar(this.friction);

        // 5. CAMERA CHASE (Third Person View)
        // Calculate where the camera should be (Behind and Up)
        const relativeCameraOffset = new THREE.Vector3(0, 8, -25);

        // Convert to World Coordinates
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);

        // Smoothly fly camera to that spot
        this.camera.position.lerp(cameraOffset, 0.1);

        // Always look at the ship
        this.camera.lookAt(this.mesh.position);
    }
}