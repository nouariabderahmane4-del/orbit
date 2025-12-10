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
            // --- TYPE 0: RETRO ROCKET ---
            this.maxSpeed = 4.0;
            this.acceleration = 0.1;
            this.turnSpeed = 0.03;
            this.friction = 0.98;
            shipGeo = this.buildRocket();
        } else if (typeIndex === 2) {
            // --- TYPE 2: ALIEN UFO ---
            this.maxSpeed = 2.5;
            this.acceleration = 0.06;
            this.turnSpeed = 0.08;
            this.friction = 0.92;
            shipGeo = this.buildUFO();
        } else {
            // --- TYPE 1: CYBER SPEEDER ---
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

        // PILOT: High Visibility
        const pilot = this.createPilot(0xffcc00); // Yellow Helmet
        pilot.position.set(0, 0.8, 1.0);
        pilot.scale.set(1.2, 1.2, 1.2);
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

        // Dome
        const domeGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            roughness: 0
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

        // PILOT: Alien
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

        // PILOT: Cyber Rider
        const pilot = this.createPilot(0x00ffff); // Cyan Helmet
        pilot.position.set(0, 0.6, -0.5);
        pilot.scale.set(1.1, 1.1, 1.1);
        pilot.rotation.y = Math.PI;
        group.add(pilot);

        return group;
    }

    // --- NEW REALISTIC PILOT ---
    createPilot(helmetColor) {
        const pilotGroup = new THREE.Group();

        // 1. Helmet (Round Sphere)
        const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.5;
        pilotGroup.add(head);

        // 2. Visor (Glassy Curve)
        // A slightly larger sphere, cut to only show the front face
        const visorGeo = new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, 0.7);
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.9 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.rotation.x = -Math.PI / 2; // Rotate so the "cap" faces forward
        visor.position.set(0, 0.52, 0); // Align with head
        pilotGroup.add(visor);

        // 3. Body (Humanoid Cylinder)
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = -0.1;
        pilotGroup.add(body);

        // 4. Backpack (Life Support) - Adds detail
        const bagGeo = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(0, -0.1, -0.25);
        pilotGroup.add(bag);

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

        const relativeCameraOffset = new THREE.Vector3(0, 8, -25);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.mesh.position);
    }
}