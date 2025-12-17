import * as THREE from 'three';

export class Spaceship {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // --- PHYSICS STATE ---
        // "Where am I and how fast am I going?"
        this.position = new THREE.Vector3(0, 50, 100);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // --- DEFAULT STATS ---
        // These will be overwritten as soon as we pick a ship type below
        this.maxSpeed = 1.0;
        this.acceleration = 0.02; // How fast we speed up
        this.turnSpeed = 0.04;
        this.friction = 0.95; // Air resistance (slows us down when we let go of W)

        // --- VISUALS ---
        this.currentType = 1;
        this.mesh = new THREE.Group(); // The container for our ship parts
        this.scene.add(this.mesh);

        // Build the default ship immediately so the scene isn't empty
        this.setShipType(1);

        // --- INPUT STATE ---
        // We keep track of which keys are currently held down
        this.keys = { thrust: false, brake: false, yawLeft: false, yawRight: false, pitchUp: false, pitchDown: false };

        // Listen for key presses
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setShipType(typeIndex) {
        this.currentType = typeIndex;

        // 1. CLEAR OLD MESH
        // We loop through children and remove them one by one until the group is empty
        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        // 2. BUILD NEW MESH & SET STATS
        let shipGeo;

        if (typeIndex === 0) {
            // --- RETRO ROCKET ---
            // Fast top speed, but slippery handling
            this.maxSpeed = 2.0;
            this.acceleration = 0.05;
            this.turnSpeed = 0.04;
            this.friction = 0.98; // Low friction = lots of drifting
            shipGeo = this.buildRocket();
        } else if (typeIndex === 2) {
            // --- ALIEN UFO ---
            // Slower, but turns incredibly fast
            this.maxSpeed = 1.5;
            this.acceleration = 0.03;
            this.turnSpeed = 0.07;
            this.friction = 0.94; // High friction = stops quickly
            shipGeo = this.buildUFO();
        } else {
            // --- CYBER SPEEDER (Default) ---
            // Balanced stats
            this.maxSpeed = 1.8;
            this.acceleration = 0.04;
            this.turnSpeed = 0.05;
            this.friction = 0.96;
            shipGeo = this.buildSpeeder();
        }

        // Add the new shape to our main group
        this.mesh.add(shipGeo);

        // Force ship to look at the Sun (0,0,0) immediately on spawn
        this.mesh.lookAt(0, 0, 0);
    }

    // --- SHIP BUILDERS (SCALED TO 50%) ---
    // These functions use Three.js geometry (Cylinders, Boxes) to "draw" the ships code-side.

    buildRocket() {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CylinderGeometry(1, 1.5, 6, 16);
        bodyGeo.rotateX(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 }));
        group.add(body);

        // Nose
        const noseGeo = new THREE.ConeGeometry(1, 2, 16);
        noseGeo.rotateX(Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        nose.position.z = 4;
        group.add(nose);

        // Engine
        const engineGeo = new THREE.CylinderGeometry(1, 0.5, 1, 16);
        engineGeo.rotateX(Math.PI / 2);
        const engine = new THREE.Mesh(engineGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        engine.position.z = -3.5;
        group.add(engine);

        // Fins
        const finGeo = new THREE.BoxGeometry(4, 0.2, 3);
        const finMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const fin1 = new THREE.Mesh(finGeo, finMat);
        fin1.position.set(0, 0, -2);
        group.add(fin1);
        const fin2 = fin1.clone(); fin2.rotation.z = Math.PI / 3; group.add(fin2);
        const fin3 = fin1.clone(); fin3.rotation.z = -Math.PI / 3; group.add(fin3);

        // Bubble
        const bubbleGeo = new THREE.SphereGeometry(1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bubbleMat = new THREE.MeshStandardMaterial({
            color: 0xaaccff, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.9, side: THREE.DoubleSide
        });
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        bubble.rotation.x = -Math.PI / 2;
        bubble.position.set(0, 0.5, 1.5);
        group.add(bubble);

        // Pilot
        const pilot = this.createPilot(0xffcc00);
        pilot.position.set(0, 0.5, 1.5);
        pilot.scale.set(1.3, 1.3, 1.3);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        // --- SCALE DOWN ---
        group.scale.set(0.5, 0.5, 0.5); // 50% Size
        return group;
    }

    buildUFO() {
        const group = new THREE.Group();

        // Disk
        const diskGeo = new THREE.SphereGeometry(3, 32, 16);
        diskGeo.scale(1, 0.3, 1);
        const disk = new THREE.Mesh(diskGeo, new THREE.MeshStandardMaterial({ color: 0x00ff44, metalness: 0.9 }));
        group.add(disk);

        // Dome
        const domeGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0, side: THREE.DoubleSide
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.rotation.x = -Math.PI / 2;
        dome.position.y = 0.2;
        group.add(dome);

        // Lights
        const ringGeo = new THREE.TorusGeometry(3, 0.1, 8, 32);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff00ff }));
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Pilot
        const pilot = this.createPilot(0x888888);
        pilot.position.set(0, 0.5, 0);
        pilot.scale.set(1.5, 1.5, 1.5);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        // --- SCALE DOWN ---
        group.scale.set(0.5, 0.5, 0.5); // 50% Size
        return group;
    }

    buildSpeeder() {
        const group = new THREE.Group();

        // Dart Body
        const dartGeo = new THREE.ConeGeometry(1, 6, 3);
        dartGeo.rotateX(Math.PI / 2);
        dartGeo.rotateZ(Math.PI);
        const dart = new THREE.Mesh(dartGeo, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1.0 }));
        group.add(dart);

        // Neon Trim
        const trim = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        trim.position.z = -1;
        group.add(trim);

        // Thrusters
        const tGeo = new THREE.BoxGeometry(0.5, 0.5, 1);
        const tMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const t1 = new THREE.Mesh(tGeo, tMat); t1.position.set(1.5, 0, -2); group.add(t1);
        const t2 = t1.clone(); t2.position.set(-1.5, 0, -2); group.add(t2);

        // Windshield
        const windGeo = new THREE.BoxGeometry(1.2, 0.6, 0.1);
        const windMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide
        });
        const windshield = new THREE.Mesh(windGeo, windMat);
        windshield.position.set(0, 1.0, 0.5);
        windshield.rotation.x = -Math.PI / 4;
        group.add(windshield);

        // Pilot
        const pilot = this.createPilot(0x00ffff);
        pilot.position.set(0, 0.6, -0.5);
        pilot.scale.set(1.2, 1.2, 1.2);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        // --- SCALE DOWN ---
        group.scale.set(0.5, 0.5, 0.5); // 50% Size
        return group;
    }

    createPilot(helmetColor) {
        const pilotGroup = new THREE.Group();

        // Helmet
        const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.5;
        pilotGroup.add(head);

        // Goggles
        const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });

        const leftEye = new THREE.Mesh(lensGeo, lensMat);
        leftEye.rotation.x = Math.PI / 2;
        leftEye.position.set(-0.15, 0.55, 0.32);
        pilotGroup.add(leftEye);

        const rightEye = new THREE.Mesh(lensGeo, lensMat);
        rightEye.rotation.x = Math.PI / 2;
        rightEye.position.set(0.15, 0.55, 0.32);
        pilotGroup.add(rightEye);

        const strapGeo = new THREE.TorusGeometry(0.34, 0.04, 8, 32);
        const strapMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const strap = new THREE.Mesh(strapGeo, strapMat);
        strap.rotation.x = Math.PI / 2;
        strap.position.y = 0.55;
        pilotGroup.add(strap);

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = -0.1;
        pilotGroup.add(body);

        // Backpack
        const bagGeo = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(0, -0.1, -0.25);
        pilotGroup.add(bag);

        // Controls
        const stickGeo = new THREE.BoxGeometry(0.6, 0.1, 0.3);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.set(0, 0.1, 0.4);
        pilotGroup.add(stick);

        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2);
        const handleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftH = new THREE.Mesh(handleGeo, handleMat); leftH.position.set(-0.25, 0.2, 0.4); pilotGroup.add(leftH);
        const rightH = new THREE.Mesh(handleGeo, handleMat); rightH.position.set(0.25, 0.2, 0.4); pilotGroup.add(rightH);

        return pilotGroup;
    }

    onKeyDown(event) {
        // Prevent default scrolling for Space/Arrows so the page doesn't bounce around
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyW': this.keys.thrust = true; break; // Go
            case 'KeyS': this.keys.brake = true; break;  // Stop
            case 'ArrowLeft': this.keys.yawLeft = true; break;
            case 'ArrowRight': this.keys.yawRight = true; break;
            case 'ArrowUp': this.keys.pitchUp = true; break;
            case 'ArrowDown': this.keys.pitchDown = true; break;
        }
    }

    onKeyUp(event) {
        // Stop the action when the key is released
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
        // 1. ROTATION LOGIC
        // Adjust the rotation of the 3D mesh based on keys pressed
        if (this.keys.yawLeft) this.mesh.rotation.y += this.turnSpeed;
        if (this.keys.yawRight) this.mesh.rotation.y -= this.turnSpeed;
        if (this.keys.pitchUp) this.mesh.rotation.x -= this.turnSpeed;
        if (this.keys.pitchDown) this.mesh.rotation.x += this.turnSpeed;

        // 2. CALCULATE FORWARD
        // We need to know which way "Forward" is relative to the ship's current rotation
        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);

        // 3. ACCELERATION
        if (this.keys.thrust) {
            this.velocity.add(forwardDir.multiplyScalar(this.acceleration));
        }
        if (this.keys.brake) {
            this.velocity.sub(forwardDir.multiplyScalar(this.acceleration * 0.5));
        }

        // 4. CAP SPEED
        // Ensure we don't accelerate to infinity
        this.velocity.clampLength(0, this.maxSpeed);

        // 5. APPLY PHYSICS
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);

        // 6. FRICTION
        // Constantly multiply velocity by 0.95 so the ship slows down if you stop pressing W
        this.velocity.multiplyScalar(this.friction);

        // --- CAMERA FOLLOW LOGIC ---
        // Calculate where the camera should be:
        // (0, 2.5, -7) means "Up 2.5 units" and "Behind 7 units" relative to the ship
        const relativeCameraOffset = new THREE.Vector3(0, 2.5, -7);

        // Convert that relative offset to world coordinates
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);

        // Smoothly move (Lerp) the camera to that spot
        this.camera.position.lerp(cameraOffset, 0.1);

        // Force the camera to look at the ship's center
        this.camera.lookAt(this.mesh.position);
    }
}