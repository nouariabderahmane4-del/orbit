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
        this.currentType = 1; // 0=Interceptor, 1=Explorer, 2=Hauler
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
            // --- TYPE 0: INTERCEPTOR (Fast, Red) ---
            this.maxSpeed = 3.5;
            this.acceleration = 0.08;
            this.turnSpeed = 0.06;
            this.friction = 0.92;
            shipGeo = this.buildInterceptor();
        } else if (typeIndex === 2) {
            // --- TYPE 2: HAULER (Slow, Yellow) ---
            this.maxSpeed = 1.2;
            this.acceleration = 0.02;
            this.turnSpeed = 0.02;
            this.friction = 0.98;
            shipGeo = this.buildHauler();
        } else {
            // --- TYPE 1: EXPLORER (Balanced, Blue) ---
            this.maxSpeed = 2.0;
            this.acceleration = 0.05;
            this.turnSpeed = 0.04;
            this.friction = 0.95;
            shipGeo = this.buildExplorer();
        }

        this.mesh.add(shipGeo);

        // --- FIX: Force ship to look at the Sun (0,0,0) immediately ---
        this.mesh.lookAt(0, 0, 0);
    }

    // --- SHIP BUILDERS ---

    buildInterceptor() {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 10, 4),
            new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.2, metalness: 0.8 })
        );
        body.rotation.x = Math.PI / 2;
        body.rotation.y = Math.PI / 4;
        group.add(body);

        // Wings
        const wingGeo = new THREE.BoxGeometry(8, 0.2, 3);
        const wings = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0xaa0000 }));
        wings.position.z = 2;
        group.add(wings);

        // Pilot
        const pilot = this.createPilot(0xff0000);
        pilot.position.set(0, 0.5, -1);
        group.add(pilot);

        return group;
    }

    buildExplorer() {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.4 })
        );
        body.rotation.x = Math.PI / 2;
        group.add(body);

        // Wings
        const wing = new THREE.Mesh(
            new THREE.BoxGeometry(7, 0.3, 2),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        group.add(wing);

        // Cockpit
        const cockpit = new THREE.Mesh(
            new THREE.SphereGeometry(1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0 })
        );
        cockpit.rotation.x = -Math.PI / 2;
        cockpit.position.z = -1;
        group.add(cockpit);

        // Pilot
        const pilot = this.createPilot(0xffffff);
        pilot.position.set(0, 0.5, -1);
        group.add(pilot);

        return group;
    }

    buildHauler() {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 6),
            new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.8 })
        );
        group.add(body);

        // Cargo
        const cargo = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        cargo.position.set(0, 0, 2);
        group.add(cargo);

        // Pilot
        const pilot = this.createPilot(0x555555);
        pilot.position.set(0, 0.8, -2);
        group.add(pilot);

        return group;
    }

    createPilot(color) {
        const pilotGroup = new THREE.Group();

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 8, 8),
            new THREE.MeshStandardMaterial({ color: color })
        );
        pilotGroup.add(head);

        // Shoulders
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        body.position.y = -0.5;
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
        const relativeCameraOffset = new THREE.Vector3(0, 8, -25);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mesh.matrixWorld);
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.mesh.position);
    }
}