import * as THREE from 'three';

export class Spaceship {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Physics State
        this.position = new THREE.Vector3(0, 50, 100);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Default Stats
        this.maxSpeed = 2.0;
        this.acceleration = 0.05;
        this.turnSpeed = 0.04;
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

        // 2. Build new mesh & Set Stats
        let shipGeo;

        if (typeIndex === 0) {
            // --- TYPE 0: RETRO ROCKET (Fast, Linear) ---
            this.maxSpeed = 4.0;
            this.acceleration = 0.1;
            this.turnSpeed = 0.03; // Turns slow, flies fast
            this.friction = 0.98;
            shipGeo = this.buildRocket();
        } else if (typeIndex === 2) {
            // --- TYPE 2: ALIEN UFO (Agile, Drifty) ---
            this.maxSpeed = 2.5;
            this.acceleration = 0.06;
            this.turnSpeed = 0.08; // Super sharp turning
            this.friction = 0.92;  // Slides around
            shipGeo = this.buildUFO();
        } else {
            // --- TYPE 1: CYBER SPEEDER (Balanced) ---
            this.maxSpeed = 3.0;
            this.acceleration = 0.07;
            this.turnSpeed = 0.05;
            this.friction = 0.95;
            shipGeo = this.buildSpeeder();
        }

        this.mesh.add(shipGeo);

        // Force ship to look at the Sun immediately
        this.mesh.lookAt(0, 0, 0);
    }

    // --- SHIP BUILDERS ---

    buildRocket() {
        // Classic 1950s Sci-Fi Rocket
        const group = new THREE.Group();

        // 1. Main Body (Silver Cylinder)
        const bodyGeo = new THREE.CylinderGeometry(1, 1.5, 6, 16);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc, roughness: 0.2, metalness: 0.8
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // 2. Nose Cone (Red)
        const noseGeo = new THREE.ConeGeometry(1, 2, 16);
        noseGeo.rotateX(Math.PI / 2);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.z = 4;
        group.add(nose);

        // 3. Engine Flare (Orange)
        const engineGeo = new THREE.CylinderGeometry(1, 0.5, 1, 16);
        engineGeo.rotateX(Math.PI / 2);
        const engine = new THREE.Mesh(engineGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        engine.position.z = -3.5;
        group.add(engine);

        // 4. Fins (3 fins)
        const finGeo = new THREE.BoxGeometry(4, 0.2, 3);
        const finMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

        const fin1 = new THREE.Mesh(finGeo, finMat);
        fin1.position.set(0, 0, -2);
        group.add(fin1);

        const fin2 = fin1.clone();
        fin2.rotation.z = Math.PI / 3; // 60 degrees
        group.add(fin2);

        const fin3 = fin1.clone();
        fin3.rotation.z = -Math.PI / 3;
        group.add(fin3);

        // Pilot Window
        const pilot = this.createPilot(0xffcc00); // Yellow helmet
        pilot.scale.set(0.8, 0.8, 0.8);
        pilot.position.set(0, 0.8, 1.5); // Sticking out the top slightly
        group.add(pilot);

        return group;
    }

    buildUFO() {
        // Alien Saucer
        const group = new THREE.Group();

        // 1. Saucer Disk (Green Metallic)
        const diskGeo = new THREE.SphereGeometry(3, 32, 16);
        diskGeo.scale(1, 0.3, 1); // Flatten it
        const diskMat = new THREE.MeshStandardMaterial({
            color: 0x00ff44, roughness: 0.1, metalness: 0.9
        });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        group.add(disk);

        // 2. Glass Dome
        const domeGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff, transparent: true, opacity: 0.6, roughness: 0
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.rotation.x = -Math.PI / 2; // Face up
        dome.position.y = 0.2;
        group.add(dome);

        // 3. Glowing Ring (Lights)
        const ringGeo = new THREE.TorusGeometry(3, 0.1, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Pilot (Alien Grey)
        const pilot = this.createPilot(0x888888);
        pilot.position.set(0, 0.5, 0);
        group.add(pilot);

        return group;
    }

    buildSpeeder() {
        // Cyber-Glider (Sharp, Tron-like)
        const group = new THREE.Group();

        // 1. Main Dart (Tetrahedron stretched)
        const dartGeo = new THREE.ConeGeometry(1, 6, 3); // Triangle cone
        dartGeo.rotateX(Math.PI / 2);
        dartGeo.rotateZ(Math.PI); // Flat side down
        const dartMat = new THREE.MeshStandardMaterial({
            color: 0x111111, roughness: 0.1, metalness: 1.0
        });
        const dart = new THREE.Mesh(dartGeo, dartMat);
        group.add(dart);

        // 2. Glowing Edges (Neon Blue)
        const trimGeo = new THREE.BoxGeometry(3, 0.1, 4);
        const trimMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.z = -1;
        group.add(trim);

        // 3. Rear Thrusters
        const thrustGeo = new THREE.BoxGeometry(0.5, 0.5, 1);
        const thrustMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

        const t1 = new THREE.Mesh(thrustGeo, thrustMat);
        t1.position.set(1.5, 0, -2);
        group.add(t1);

        const t2 = t1.clone();
        t2.position.set(-1.5, 0, -2);
        group.add(t2);

        // Pilot (Cyber Blue)
        const pilot = this.createPilot(0x00ffff);
        pilot.position.set(0, 0.5, -1);
        group.add(pilot);

        return group;
    }

    createPilot(color) {
        const pilotGroup = new THREE.Group();

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 8, 8),
            new THREE.MeshStandardMaterial({ color: color })
        );
        pilotGroup.add(head);

        // Body (Small box for torso)
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.5, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        body.position.y = -0.4;
        pilotGroup.add(body);

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
        // Rotation
        if (this.keys.yawLeft) this.mesh.rotation.y += this.turnSpeed;
        if (this.keys.yawRight) this.mesh.rotation.y -= this.turnSpeed;
        if (this.keys.pitchUp) this.mesh.rotation.x -= this.turnSpeed;
        if (this.keys.pitchDown) this.mesh.rotation.x += this.turnSpeed;

        // Thrust
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

        // Camera Chase
        // Adjusted for better view of these specific models
        const relativeCameraOffset = new THREE.Vector3(0, 8, -25);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.mesh.position);
    }
}