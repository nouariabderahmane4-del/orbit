import * as THREE from 'three';

export class Spaceship {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Physics State
        this.position = new THREE.Vector3(0, 50, 100);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Default Stats (Will be overwritten by setShipType)
        this.maxSpeed = 1.0;
        this.acceleration = 0.02;
        this.turnSpeed = 0.03;
        this.friction = 0.95;

        // Visuals
        this.currentType = 1;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);

        // Build Initial Ship
        this.setShipType(1);

        // Input
        this.keys = { thrust: false, brake: false, yawLeft: false, yawRight: false, pitchUp: false, pitchDown: false };
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setShipType(typeIndex) {
        this.currentType = typeIndex;

        // 1. Clear old mesh
        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        // 2. Build new mesh & Set Stats (SLOWER SPEEDS NOW)
        let shipGeo;

        if (typeIndex === 0) {
            // --- TYPE 0: RETRO ROCKET ---
            this.maxSpeed = 2.0;       // Was 4.0
            this.acceleration = 0.05;  // Was 0.1
            this.turnSpeed = 0.03;
            this.friction = 0.98;
            shipGeo = this.buildRocket();
        } else if (typeIndex === 2) {
            // --- TYPE 2: ALIEN UFO ---
            this.maxSpeed = 1.5;       // Was 2.5
            this.acceleration = 0.03;  // Was 0.06
            this.turnSpeed = 0.06;
            this.friction = 0.94;
            shipGeo = this.buildUFO();
        } else {
            // --- TYPE 1: CYBER SPEEDER ---
            this.maxSpeed = 1.8;       // Was 3.0
            this.acceleration = 0.04;  // Was 0.07
            this.turnSpeed = 0.04;
            this.friction = 0.96;
            shipGeo = this.buildSpeeder();
        }

        this.mesh.add(shipGeo);

        // Force ship to look at the Sun immediately
        this.mesh.lookAt(0, 0, 0);
    }

    // --- SHIP BUILDERS ---

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

        // --- CABIN & PILOT ---

        // 1. Glass Bubble Cockpit
        const bubbleGeo = new THREE.SphereGeometry(1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bubbleMat = new THREE.MeshStandardMaterial({
            color: 0xaaccff,
            transparent: true,
            opacity: 0.2, // Very clear
            roughness: 0,
            metalness: 0.9,
            side: THREE.DoubleSide
        });
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        bubble.rotation.x = -Math.PI / 2;
        bubble.position.set(0, 0.5, 1.5);
        group.add(bubble);

        // 2. Pilot
        const pilot = this.createPilot(0xffcc00); // Yellow Helmet
        pilot.position.set(0, 0.5, 1.5);
        pilot.scale.set(1.3, 1.3, 1.3);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        return group;
    }

    buildUFO() {
        const group = new THREE.Group();

        // Disk
        const diskGeo = new THREE.SphereGeometry(3, 32, 16);
        diskGeo.scale(1, 0.3, 1);
        const disk = new THREE.Mesh(diskGeo, new THREE.MeshStandardMaterial({ color: 0x00ff44, metalness: 0.9 }));
        group.add(disk);

        // Dome (Clearer Cabin)
        const domeGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15, // Super Clear
            roughness: 0,
            side: THREE.DoubleSide
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
        const pilot = this.createPilot(0x888888); // Grey Alien
        pilot.position.set(0, 0.5, 0);
        pilot.scale.set(1.5, 1.5, 1.5);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

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

        // Windshield (Cabin definition)
        const windGeo = new THREE.BoxGeometry(1.2, 0.6, 0.1);
        const windMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const windshield = new THREE.Mesh(windGeo, windMat);
        windshield.position.set(0, 1.0, 0.5); // In front of pilot
        windshield.rotation.x = -Math.PI / 4; // Angled back
        group.add(windshield);

        // Pilot
        const pilot = this.createPilot(0x00ffff); // Cyan Helmet
        pilot.position.set(0, 0.6, -0.5);
        pilot.scale.set(1.2, 1.2, 1.2);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        return group;
    }

    // --- DETAILED PILOT + CONTROLS ---
    createPilot(helmetColor) {
        const pilotGroup = new THREE.Group();

        // 1. Helmet
        const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.5;
        pilotGroup.add(head);

        // 2. Goggles
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

        // 3. Body
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = -0.1;
        pilotGroup.add(body);

        // 4. Backpack
        const bagGeo = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(0, -0.1, -0.25);
        pilotGroup.add(bag);

        // 5. Control Stick / Dashboard (Makes them look like drivers)
        const stickGeo = new THREE.BoxGeometry(0.6, 0.1, 0.3);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.set(0, 0.1, 0.4); // Right in front of chest
        pilotGroup.add(stick);

        // Joystick handles
        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2);
        const handleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const leftH = new THREE.Mesh(handleGeo, handleMat);
        leftH.position.set(-0.25, 0.2, 0.4);
        pilotGroup.add(leftH);

        const rightH = new THREE.Mesh(handleGeo, handleMat);
        rightH.position.set(0.25, 0.2, 0.4);
        pilotGroup.add(rightH);

        return pilotGroup;
    }

    onKeyDown(event) {
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
        if (this.keys.yawLeft) this.mesh.rotation.y += this.turnSpeed;
        if (this.keys.yawRight) this.mesh.rotation.y -= this.turnSpeed;
        if (this.keys.pitchUp) this.mesh.rotation.x -= this.turnSpeed;
        if (this.keys.pitchDown) this.mesh.rotation.x += this.turnSpeed;

        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);

        if (this.keys.thrust) {
            this.velocity.add(forwardDir.multiplyScalar(this.acceleration));
        }
        if (this.keys.brake) {
            this.velocity.sub(forwardDir.multiplyScalar(this.acceleration * 0.5));
        }

        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);
        this.velocity.multiplyScalar(this.friction);

        // Adjusted Camera: Lower and Closer to see the cockpit
        const relativeCameraOffset = new THREE.Vector3(0, 4, -12);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.mesh.position);
    }
}