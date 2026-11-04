/**
 * Advanced Car Controller & Ultra-Detailed Procedural Vehicles
 * Accurately replicates the 1920s Ford Model T Touring car from the photo, plus modern sports cars.
 */
class Car {
    constructor(scene, terrain, world) {
        this.scene = scene;
        this.terrain = terrain;
        this.world = world;

        this.carType = 'vintage';
        this.paintColor = 0x0a0a0c; // Deep glossy lacquer black from photo

        // Physics State
        this.position = new THREE.Vector3(0, 5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.heading = 0;
        this.speed = 0;
        this.steerAngle = 0;
        this.maxSteerAngle = 0.58;

        // Dynamics parameters
        this.mass = 1200;
        this.acceleration = 20.0;
        this.brakeForce = 40.0;
        this.reverseForce = 12.0;
        this.topSpeed = 135;
        this.boostMultiplier = 1.0;
        this.isBoosting = false;
        this.handbrake = false;

        // Airborne & Suspension & Slope Alignment
        this.isGrounded = true;
        this.verticalVelocity = 0;
        this.wheelGroundOffset = 0.11; // Exact tire contact offset for Model T
        this.terrainPitch = 0;         // Hill slope pitch
        this.terrainRoll = 0;          // Hill slope roll
        this.suspensionPitch = 0;      // Accel/brake squat
        this.suspensionRoll = 0;       // Cornering body roll
        this.airTime = 0;
        this.driftScore = 0;
        this.totalStuntScore = 0;

        // RPM & Gearing
        this.rpm = 800;
        this.currentGear = 1;

        // Graphical meshes
        this.root = new THREE.Group();
        this.root.rotation.order = 'YXZ';
        this.bodyMeshGroup = new THREE.Group();
        this.root.add(this.bodyMeshGroup);
        this.scene.add(this.root);

        this.wheels = [];
        this.frontWheelHubs = [];
        this.headlights = [];
        this.brakeLights = [];
        this.exhaustPipes = [];

        // Particles & Skidmarks
        this.particlePool = [];
        this.skidmarkPool = [];
        this.initParticles();
        this.initSkidmarks();

        // Build default vehicle
        this.buildVehicle(this.carType);
        this.resetPosition();
    }

    resetPosition(x = 0, z = 0) {
        const groundY = this.terrain.getHeight(x, z);
        this.wheelGroundOffset = (this.carType === 'vintage') ? 0.11 : 0.0;
        this.position.set(x, groundY + this.wheelGroundOffset, z);
        this.velocity.set(0, 0, 0);
        this.speed = 0;
        this.verticalVelocity = 0;
        this.heading = 0;
        this.steerAngle = 0;
        this.terrainPitch = 0;
        this.terrainRoll = 0;
        this.suspensionPitch = 0;
        this.suspensionRoll = 0;
        this.root.position.copy(this.position);
        this.root.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
    }

    setCarType(type, colorHex) {
        this.carType = type;
        if (colorHex) {
            this.paintColor = colorHex;
        } else if (type === 'supercar') {
            this.paintColor = 0xd91616; // Iconic Guards Red from Porsche photos
        }
        this.buildVehicle(this.carType);
    }

    setPaintColor(colorHex) {
        this.paintColor = colorHex;
        if (this.mainPaintMaterial) {
            this.mainPaintMaterial.color.setHex(colorHex);
        }
    }

    buildVehicle(type) {
        while (this.bodyMeshGroup.children.length > 0) {
            this.bodyMeshGroup.remove(this.bodyMeshGroup.children[0]);
        }
        this.wheels = [];
        this.frontWheelHubs = [];
        this.headlights = [];
        this.brakeLights = [];
        this.exhaustPipes = [];

        // Ultra-Reflective Materials with Environment Mapping
        const skyTex = window.textureGenerator ? window.textureGenerator.createSkyTexture() : null;

        // Balanced Gloss Black Lacquer (Rich deep black without washing out into white)
        this.mainPaintMaterial = new THREE.MeshPhysicalMaterial({
            color: this.paintColor,
            roughness: 0.12,
            metalness: 0.04,
            clearcoat: 0.55,
            clearcoatRoughness: 0.12,
            reflectivity: 0.5,
            envMap: skyTex,
            envMapIntensity: 0.65
        });

        // Balanced Polished Chrome & Metal (Radiator, Cap, Headlight Rims, Mirror, Handles)
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.04,
            metalness: 0.98,
            envMap: skyTex,
            envMapIntensity: 2.4
        });

        const blackTrim = new THREE.MeshStandardMaterial({
            color: 0x121214,
            roughness: 0.35,
            metalness: 0.4,
            envMap: skyTex,
            envMapIntensity: 0.6
        });

        // Balanced Crystal Glass Windshield with Subtle Sunlight Glints
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            map: window.textureGenerator ? window.textureGenerator.createWindshieldGlassTexture() : null,
            transparent: true,
            opacity: 0.48,
            roughness: 0.04,
            metalness: 0.02,
            reflectivity: 0.65,
            clearcoat: 0.65,
            clearcoatRoughness: 0.06,
            transmission: 0.25,
            ior: 1.5,
            envMap: skyTex,
            envMapIntensity: 2.5,
            side: THREE.DoubleSide
        });

        if (type === 'vintage') {
            this.wheelGroundOffset = 0.11;
            this.taillightPositions = [];
            this.buildModelTPhotoreal(this.mainPaintMaterial, chromeMat, blackTrim, glassMat);
            this.acceleration = 19.0;
            this.topSpeed = 125;
        } else if (type === 'muscle') {
            this.wheelGroundOffset = 0.0;
            this.buildMuscleCar(this.mainPaintMaterial, chromeMat, blackTrim, glassMat);
            this.acceleration = 28.0;
            this.topSpeed = 190;
        } else if (type === 'offroad') {
            this.wheelGroundOffset = 0.0;
            this.buildOffroadTruck(this.mainPaintMaterial, chromeMat, blackTrim, glassMat);
            this.acceleration = 22.0;
            this.topSpeed = 140;
        } else if (type === 'supercar') {
            this.wheelGroundOffset = 0.0;
            this.buildPorsche911(this.mainPaintMaterial, chromeMat, blackTrim, glassMat);
            this.acceleration = 38.0;
            this.topSpeed = 310;
        }

        // Add Realistic Headlights
        for (const hp of this.headlightPositions || [{ x: -0.65, y: 0.8, z: 1.85 }, { x: 0.65, y: 0.8, z: 1.85 }]) {
            const spot = new THREE.SpotLight(0xfffaea, 3.2, 110, Math.PI / 5.5, 0.35, 1.2);
            spot.position.set(hp.x, hp.y, hp.z);
            spot.target.position.set(hp.x * 0.7, hp.y - 0.2, hp.z + 30);
            this.bodyMeshGroup.add(spot);
            this.bodyMeshGroup.add(spot.target);
            this.headlights.push(spot);
        }

        // Add Taillights
        for (const bp of this.taillightPositions || [{ x: -0.6, y: 0.65, z: -1.6 }]) {
            const brakeMat = new THREE.MeshStandardMaterial({
                color: 0xb31414,
                emissive: 0x770000,
                emissiveIntensity: 0.5
            });
            const brakeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), brakeMat);
            brakeMesh.rotation.x = Math.PI / 2;
            brakeMesh.position.set(bp.x, bp.y, bp.z);
            this.bodyMeshGroup.add(brakeMesh);
            this.brakeLights.push(brakeMat);
        }

        // 4 Wheel Ground Contact Ambient Occlusion Shadow Decals (grounds car to road/terrain)
        const shadowTex = window.textureGenerator ? window.textureGenerator.createWheelShadowTexture(256) : null;
        if (shadowTex) {
            const shadowMat = new THREE.MeshBasicMaterial({
                map: shadowTex,
                transparent: true,
                opacity: 0.65,
                depthWrite: false
            });
            const shadowGeo = new THREE.PlaneGeometry(1.15, 1.15);
            shadowGeo.rotateX(-Math.PI / 2);

            const shadowOffsets = this.wheelShadowPositions || [
                { x: -0.9, z: 1.4 }, { x: 0.9, z: 1.4 },
                { x: -0.9, z: -1.35 }, { x: 0.9, z: -1.35 }
            ];

            for (const sp of shadowOffsets) {
                const decal = new THREE.Mesh(shadowGeo, shadowMat);
                decal.position.set(sp.x, 0.03, sp.z);
                this.bodyMeshGroup.add(decal);
            }
        }
    }

    // Exact 1:1 photoreal replica of the Ford Model T Touring car from the 3 reference views (Front, Back, Side)
    buildModelTPhotoreal(paintMat, chromeMat, blackTrim, glassMat) {
        const tg = window.textureGenerator;
        const skyTex = tg ? tg.createSkyTexture() : null;
        const body = new THREE.Group();

        // 1. Main 4-Door Touring Body Tub (Front, Back & Side profiles)
        const tubGeo = new THREE.BoxGeometry(1.45, 0.72, 2.3);
        const tub = new THREE.Mesh(tubGeo, paintMat);
        tub.position.set(0, 0.76, -0.32);
        tub.castShadow = true;
        tub.receiveShadow = true;
        body.add(tub);

        // Curving rear cowl tub (Image 2 & 3 rear profile)
        const rearCowlGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.45, 16, 1, false, 0, Math.PI);
        rearCowlGeo.rotateZ(Math.PI / 2);
        rearCowlGeo.rotateY(Math.PI / 2);
        const rearCowl = new THREE.Mesh(rearCowlGeo, paintMat);
        rearCowl.position.set(0, 0.76, -1.45);
        body.add(rearCowl);

        // 4 Exterior Door Handles (from Side View Image 3!)
        for (const s of [-1, 1]) {
            for (const z of [0.05, -0.65]) {
                const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.1), chromeMat);
                handle.position.set(s * 0.74, 0.96, z);
                body.add(handle);
            }
        }

        // 2. High Hood with Stamped Cooling Louvers (Side View Image 3)
        const hoodGeo = new THREE.BoxGeometry(1.04, 0.66, 1.35);
        const hood = new THREE.Mesh(hoodGeo, paintMat);
        hood.position.set(0, 0.82, 1.25);
        hood.castShadow = true;
        body.add(hood);

        // Stamped Louver grooves on side of hood (6 louvers per side, Image 3)
        const louverMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.8 });
        for (let l = 0; l < 6; l++) {
            const louverL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.03), louverMat);
            louverL.position.set(-0.53, 0.82, 0.95 + l * 0.09);
            body.add(louverL);

            const louverR = louverL.clone();
            louverR.position.x = 0.53;
            body.add(louverR);
        }

        // Center hood hinge seam rod
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.38), chromeMat);
        hinge.rotation.x = Math.PI / 2;
        hinge.position.set(0, 1.16, 1.25);
        body.add(hinge);

        // 3. Tall Radiator Shell with Scripted Ford Emblem (Front View Image 1)
        const radShellGeo = new THREE.BoxGeometry(0.96, 0.78, 0.18);
        const radShell = new THREE.Mesh(radShellGeo, blackTrim);
        radShell.position.set(0, 0.84, 1.95);
        body.add(radShell);

        // Grille face mesh with cursive Ford script
        const grilleGeo = new THREE.PlaneGeometry(0.82, 0.66);
        const grilleMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createFordGrilleTexture() : null,
            roughness: 0.6,
            metalness: 0.3
        });
        const grille = new THREE.Mesh(grilleGeo, grilleMat);
        grille.position.set(0, 0.84, 2.05);
        body.add(grille);

        // 4. Chrome Winged Motometer / Radiator Cap (Front & Side Views)
        const neckGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.14, 12);
        const neck = new THREE.Mesh(neckGeo, chromeMat);
        neck.position.set(0, 1.28, 1.95);
        body.add(neck);

        const gaugeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
        gaugeGeo.rotateX(Math.PI / 2);
        const gauge = new THREE.Mesh(gaugeGeo, chromeMat);
        gauge.position.set(0, 1.38, 1.95);
        body.add(gauge);

        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), chromeMat);
        wingL.position.set(-0.14, 1.38, 1.95);
        wingL.rotation.z = 0.3;
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), chromeMat);
        wingR.position.set(0.14, 1.38, 1.95);
        wingR.rotation.z = -0.3;
        body.add(wingL);
        body.add(wingR);

        // 5. Hand Crank Handle & Front Transverse Leaf Spring (Front View Image 1)
        const crankShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), chromeMat);
        crankShaft.rotation.x = Math.PI / 2;
        crankShaft.position.set(0.02, 0.34, 2.05);
        body.add(crankShaft);

        const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.16, 0.025), chromeMat);
        crankArm.position.set(0.02, 0.26, 2.16);
        body.add(crankArm);

        const crankHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14), blackTrim);
        crankHandle.rotation.x = Math.PI / 2;
        crankHandle.position.set(0.02, 0.19, 2.22);
        body.add(crankHandle);

        // Transverse front leaf spring (Image 1 arch beneath radiator)
        const springMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, roughness: 0.6, metalness: 0.7 });
        const frontSpring = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.08), springMat);
        frontSpring.position.set(0, 0.36, 1.72);
        body.add(frontSpring);

        const frontAxleIBeam = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.05, 0.05), springMat);
        frontAxleIBeam.position.set(0, 0.3, 1.58);
        body.add(frontAxleIBeam);

        // Front wishbone V-struts
        for (const s of [-1, 1]) {
            const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75), springMat);
            strut.position.set(s * 0.42, 0.38, 1.25);
            strut.rotation.x = 0.4;
            strut.rotation.z = -s * 0.35;
            body.add(strut);
        }

        // 6. Front Display Plate ("HYMAN LTD." from Image 1!)
        const plateGeo = new THREE.PlaneGeometry(0.48, 0.24);
        const hymanPlateMat = new THREE.MeshBasicMaterial({
            map: tg ? tg.createHymanPlateTexture() : null
        });
        const frontPlate = new THREE.Mesh(plateGeo, hymanPlateMat);
        frontPlate.position.set(0.0, 0.32, 2.08);
        body.add(frontPlate);

        // 7. Large Antique Bucket Headlights with Chrome Rim & Arched Bracket (Image 1)
        const lampCanGeo = new THREE.CylinderGeometry(0.19, 0.23, 0.24, 20);
        lampCanGeo.rotateX(Math.PI / 2);

        const lensMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createHeadlightGlassTexture() : null,
            roughness: 0.1,
            metalness: 0.85,
            transparent: true,
            opacity: 0.7
        });

        // Tubular crossbar linking headlights (Image 1)
        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35), blackTrim);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.set(0, 0.72, 1.84);
        body.add(crossbar);

        for (const side of [-1, 1]) {
            const lampGroup = new THREE.Group();
            lampGroup.position.set(side * 0.65, 0.78, 1.88);

            const bucket = new THREE.Mesh(lampCanGeo, blackTrim);
            bucket.castShadow = true;
            lampGroup.add(bucket);

            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 24), chromeMat);
            rim.position.z = 0.12;
            lampGroup.add(rim);

            const lens = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), lensMat);
            lens.position.z = 0.13;
            lampGroup.add(lens);

            const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32), blackTrim);
            bracket.position.set(-side * 0.1, -0.16, -0.05);
            bracket.rotation.z = side * 0.5;
            lampGroup.add(bracket);

            body.add(lampGroup);
        }

        this.headlightPositions = [
            { x: -0.65, y: 0.78, z: 1.95 },
            { x: 0.65, y: 0.78, z: 1.95 }
        ];

        // 8. Side Cowl Lantern / Pillar Lamp (Image 3)
        const cowlGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.18, 12);
        const cowl = new THREE.Mesh(cowlGeo, blackTrim);
        cowl.position.set(-0.76, 1.15, 0.52);
        body.add(cowl);

        // 9. Upright Split Glass Windshield tilted back ~10 deg (Side View Image 3)
        const wsGroup = new THREE.Group();
        wsGroup.position.set(0, 1.15, 0.54);
        wsGroup.rotation.x = -0.16; // Authentic backwards rake

        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x18181a,
            metalness: 0.7,
            roughness: 0.25,
            envMap: skyTex,
            envMapIntensity: 1.2
        });
        const wsFrameGeo = new THREE.BoxGeometry(1.42, 0.78, 0.05);
        const wsFrame = new THREE.Mesh(wsFrameGeo, frameMat);
        wsFrame.position.set(0, 0.36, 0);
        wsGroup.add(wsFrame);

        const upperGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.34), glassMat);
        upperGlass.position.set(0, 0.52, 0.03);
        wsGroup.add(upperGlass);

        const lowerGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.34), glassMat);
        lowerGlass.position.set(0, 0.18, 0.03);
        wsGroup.add(lowerGlass);

        // Driver round rearview mirror mounted on right strut (Images 1 & 3)
        const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22), chromeMat);
        mirrorArm.rotation.z = Math.PI / 2;
        mirrorArm.position.set(0.8, 0.42, 0.02);
        wsGroup.add(mirrorArm);

        const mirrorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), chromeMat);
        mirrorGlass.position.set(0.91, 0.42, 0);
        mirrorGlass.rotation.y = Math.PI;
        wsGroup.add(mirrorGlass);

        body.add(wsGroup);

        // 10. High Folding Canvas Touring Canopy with Oval Rear Window (Image 2 & 3!)
        const fabricMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createFabricTexture() : null,
            roughness: 0.95,
            metalness: 0.05
        });

        // Main roof canopy
        const canopyTop = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.12, 2.05), fabricMat);
        canopyTop.position.set(0, 1.86, -0.45);
        canopyTop.castShadow = true;
        body.add(canopyTop);

        // Rear curved canvas curtain with the HORIZONTAL OVAL WINDOW from Image 2!
        const rearCurtainMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createRearCanopyTexture() : null,
            roughness: 0.9,
            metalness: 0.08
        });
        const rearFabric = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 0.78), rearCurtainMat);
        rearFabric.position.set(0, 1.46, -1.45);
        rearFabric.rotation.y = Math.PI;
        rearFabric.castShadow = true;
        body.add(rearFabric);

        // Shiny reflective glass pane in the rear oval window with chrome bezel (Image 2!)
        const rearGlassGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.01, 24);
        rearGlassGeo.scale(1.4, 1.0, 0.7);
        rearGlassGeo.rotateX(Math.PI / 2);
        const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
        rearGlass.position.set(0, 1.48, -1.455);
        body.add(rearGlass);

        const rearBezel = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 12, 32), chromeMat);
        rearBezel.scale.set(1.4, 0.7, 1.0);
        rearBezel.position.set(0, 1.48, -1.456);
        body.add(rearBezel);

        // Side rear canvas quarter panels
        for (const s of [-1, 1]) {
            const sideCurtain = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.85), fabricMat);
            sideCurtain.position.set(s * 0.71, 1.48, -1.02);
            body.add(sideCurtain);
        }

        // Metal folding canopy irons / scissor struts (Image 3!)
        for (const s of [-1, 1]) {
            const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.88), blackTrim);
            strut1.position.set(s * 0.73, 1.48, -0.95);
            strut1.rotation.x = -0.45;
            body.add(strut1);

            const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.78), blackTrim);
            strut2.position.set(s * 0.73, 1.52, -0.2);
            strut2.rotation.x = 0.2;
            body.add(strut2);
        }

        // 11. Right-Hand Drive Cockpit & Pleated Leather Seats (Image 3)
        const leatherMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createLeatherTexture() : null,
            roughness: 0.6,
            metalness: 0.1
        });

        // High-back front bench seat
        const frontSeat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.35, 0.55), leatherMat);
        frontSeat.position.set(0, 0.82, -0.05);
        body.add(frontSeat);

        const frontBackrest = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.52, 0.15), leatherMat);
        frontBackrest.position.set(0, 1.18, -0.3);
        body.add(frontBackrest);

        // High-back rear passenger bench seat
        const rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.35, 0.55), leatherMat);
        rearSeat.position.set(0, 0.82, -1.05);
        body.add(rearSeat);

        const rearBackrest = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 0.15), leatherMat);
        rearBackrest.position.set(0, 1.24, -1.35);
        body.add(rearBackrest);

        // Steering column & wheel (Right-Hand Drive from Image 1!)
        const steerColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72), blackTrim);
        steerColumn.rotation.x = -Math.PI / 4.5;
        steerColumn.position.set(0.38, 1.05, 0.28);
        body.add(steerColumn);

        const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 12, 24), blackTrim);
        steerWheel.position.set(0.38, 1.3, 0.12);
        steerWheel.rotation.x = Math.PI / 4;
        body.add(steerWheel);

        for (let s = 0; s < 4; s++) {
            const spk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.02), blackTrim);
            spk.rotation.z = (s * Math.PI) / 2;
            spk.rotation.x = Math.PI / 4;
            spk.position.set(0.38, 1.3, 0.12);
            body.add(spk);
        }

        // 12. Sweeping Curved Fenders & Running Boards with DUAL ALUMINUM STEP PLATES (Image 3!)
        const fenderMat = new THREE.MeshPhysicalMaterial({
            color: 0x08080a,
            roughness: 0.14,
            metalness: 0.04,
            clearcoat: 0.5,
            clearcoatRoughness: 0.12,
            envMap: skyTex,
            envMapIntensity: 0.65
        });

        const stepMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createRunningBoardTexture() : null,
            roughness: 0.3,
            metalness: 0.7,
            envMap: skyTex,
            envMapIntensity: 1.5
        });

        for (const s of [-1, 1]) {
            // Front sweeping curved fender arch
            const fenderFront = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.4), fenderMat);
            fenderFront.position.set(s * 0.82, 0.72, 1.45);
            fenderFront.rotation.x = 0.18;
            body.add(fenderFront);

            // Front curved flare lip
            const flare = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.6), fenderMat);
            flare.position.set(s * 0.82, 0.58, 2.12);
            flare.rotation.x = 0.55;
            body.add(flare);

            // Running board step with dual polished step plates (Side View Image 3!)
            const runBoard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 1.55), stepMat);
            runBoard.position.set(s * 0.84, 0.34, -0.05);
            body.add(runBoard);

            // Rear curved fender arch with mud flap lip
            const fenderRear = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.3), fenderMat);
            fenderRear.position.set(s * 0.82, 0.7, -1.25);
            fenderRear.rotation.x = -0.15;
            body.add(fenderRear);
        }

        // 13. Rear Mounted Full-Size Spare Tire & Rear License Bracket (Rear View Image 2!)
        const spareGroup = new THREE.Group();
        spareGroup.position.set(0, 0.66, -1.72);

        // Steel Y-bracket carrier
        const bracketL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55), springMat);
        bracketL.position.set(-0.2, 0.1, 0.1);
        bracketL.rotation.z = -0.4;
        spareGroup.add(bracketL);

        const bracketR = bracketL.clone();
        bracketR.position.x = 0.2;
        bracketR.rotation.z = 0.4;
        spareGroup.add(bracketR);

        // Spare wheel (rubber tire + silver steel demountable rim)
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x222426, roughness: 0.85 });
        const steelRimMat = new THREE.MeshStandardMaterial({
            color: 0xe2e7ee,
            roughness: 0.12,
            metalness: 0.92,
            envMap: skyTex,
            envMapIntensity: 2.2
        });
        const spareTire = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.11, 16, 32), tireMat);
        spareTire.castShadow = true;
        spareGroup.add(spareTire);

        const spareRim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 28, 1, true), steelRimMat);
        spareRim.rotation.x = Math.PI / 2;
        spareGroup.add(spareRim);

        // Rear Display Plate ("HYMAN LTD." from Image 2!)
        const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), hymanPlateMat);
        rearPlate.position.set(0, 0, 0.05);
        spareGroup.add(rearPlate);

        // Single Round Red Vintage Taillight on Left Bracket (Image 2!)
        const tailLampGroup = new THREE.Group();
        tailLampGroup.position.set(-0.38, 0.05, 0.08);

        const tailBracket = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22), blackTrim);
        tailBracket.rotation.z = Math.PI / 2;
        tailLampGroup.add(tailBracket);

        const tailHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.1, 16), blackTrim);
        tailHousing.rotation.x = Math.PI / 2;
        tailLampGroup.add(tailHousing);

        const tailLensMat = new THREE.MeshStandardMaterial({
            color: 0xb31414,
            emissive: 0x880000,
            emissiveIntensity: 0.6
        });
        const tailLens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), tailLensMat);
        tailLens.position.z = -0.06;
        tailLens.rotation.y = Math.PI;
        tailLampGroup.add(tailLens);
        spareGroup.add(tailLampGroup);
        this.brakeLights.push(tailLensMat);

        body.add(spareGroup);

        // 14. Artillery Wooden Wheels (12 gloss black spokes, silver outer rim, chrome hubcap!)
        const wheelOffsets = [
            { x: -0.84, y: 0.46, z: 1.42, isFront: true },
            { x: 0.84, y: 0.46, z: 1.42, isFront: true },
            { x: -0.84, y: 0.46, z: -1.22, isFront: false },
            { x: 0.84, y: 0.46, z: -1.22, isFront: false }
        ];

        this.wheelShadowPositions = [
            { x: -0.84, z: 1.42 },
            { x: 0.84, z: 1.42 },
            { x: -0.84, z: -1.22 },
            { x: 0.84, z: -1.22 }
        ];
        this.attachAuthenticArtilleryWheels(body, wheelOffsets, chromeMat);
        this.bodyMeshGroup.add(body);
    }

    attachAuthenticArtilleryWheels(parent, offsets, chromeMat) {
        const skyTex = window.textureGenerator ? window.textureGenerator.createSkyTexture() : null;
        const tireMat = new THREE.MeshStandardMaterial({
            color: 0x222426,
            roughness: 0.85,
            metalness: 0.1
        });

        const steelRimMat = new THREE.MeshStandardMaterial({
            color: 0xe2e7ee,
            roughness: 0.12,
            metalness: 0.92,
            envMap: skyTex,
            envMapIntensity: 2.2
        });

        const spokeMat = new THREE.MeshStandardMaterial({
            color: 0x111113,
            roughness: 0.35,
            metalness: 0.2
        });

        const tireGeo = new THREE.TorusGeometry(0.46, 0.11, 16, 32);
        const rimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 28, 1, true);
        rimGeo.rotateZ(Math.PI / 2);

        for (const off of offsets) {
            const hubGroup = new THREE.Group();
            hubGroup.position.set(off.x, off.y, off.z);

            const wheelMesh = new THREE.Group();

            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.rotation.y = Math.PI / 2;
            tire.castShadow = true;
            wheelMesh.add(tire);

            const steelRim = new THREE.Mesh(rimGeo, steelRimMat);
            wheelMesh.add(steelRim);

            const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 16), spokeMat);
            centerHub.rotation.z = Math.PI / 2;
            wheelMesh.add(centerHub);

            const dustCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 6), chromeMat);
            dustCap.rotation.z = Math.PI / 2;
            wheelMesh.add(dustCap);

            for (let s = 0; s < 12; s++) {
                const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.038, 0.34, 8), spokeMat);
                spoke.rotation.z = (s * Math.PI) / 6;
                wheelMesh.add(spoke);
            }

            for (let b = 0; b < 6; b++) {
                const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 6), chromeMat);
                bolt.rotation.z = Math.PI / 2;
                const angle = (b * Math.PI * 2) / 6;
                bolt.position.set(0, Math.sin(angle) * 0.36, Math.cos(angle) * 0.36);
                wheelMesh.add(bolt);
            }

            hubGroup.add(wheelMesh);
            parent.add(hubGroup);

            this.wheels.push(wheelMesh);
            if (off.isFront) {
                this.frontWheelHubs.push(hubGroup);
            }
        }
    }

    buildMuscleCar(paintMat, chromeMat, blackTrim, glassMat) {
        const body = new THREE.Group();
        const main = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 4.2), paintMat);
        main.position.set(0, 0.55, 0);
        main.castShadow = true;
        body.add(main);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.0), glassMat);
        cabin.position.set(0, 0.95, -0.3);
        body.add(cabin);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.08, 1.95), paintMat);
        roof.position.set(0, 1.2, -0.3);
        body.add(roof);

        const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.85), blackTrim);
        scoop.position.set(0, 0.88, 1.1);
        body.add(scoop);

        for (const ex of [-0.5, 0.5]) {
            const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
            pipeGeo.rotateX(Math.PI / 2);
            const pipe = new THREE.Mesh(pipeGeo, chromeMat);
            pipe.position.set(ex, 0.35, -2.15);
            body.add(pipe);
            this.exhaustPipes.push(new THREE.Vector3(ex, 0.35, -2.2));
        }

        this.headlightPositions = [
            { x: -0.7, y: 0.55, z: 2.12 },
            { x: 0.7, y: 0.55, z: 2.12 }
        ];
        this.taillightPositions = [
            { x: -0.7, y: 0.6, z: -2.12 },
            { x: 0.7, y: 0.6, z: -2.12 }
        ];

        const wheelOffsets = [
            { x: -0.95, y: 0.38, z: 1.35, isFront: true },
            { x: 0.95, y: 0.38, z: 1.35, isFront: true },
            { x: -0.98, y: 0.42, z: -1.35, isFront: false },
            { x: 0.98, y: 0.42, z: -1.35, isFront: false }
        ];
        this.attachModernWheels(body, wheelOffsets, 0.38, 0.22);
        this.bodyMeshGroup.add(body);
    }

    buildOffroadTruck(paintMat, chromeMat, blackTrim, glassMat) {
        const body = new THREE.Group();
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.0), paintMat);
        cabin.position.set(0, 1.2, 0.2);
        body.add(cabin);

        const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.8), paintMat);
        bed.position.set(0, 0.95, -1.6);
        body.add(bed);

        const cage = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 8, 12), blackTrim);
        cage.position.set(0, 1.6, -0.7);
        body.add(cage);

        for (let i = -3; i <= 3; i += 2) {
            const pod = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.1), chromeMat);
            pod.position.set(i * 0.22, 1.75, 0.6);
            body.add(pod);
        }

        this.headlightPositions = [
            { x: -0.65, y: 1.0, z: 1.6 },
            { x: 0.65, y: 1.0, z: 1.6 }
        ];
        this.taillightPositions = [
            { x: -0.75, y: 0.9, z: -2.5 },
            { x: 0.75, y: 0.9, z: -2.5 }
        ];

        const wheelOffsets = [
            { x: -1.05, y: 0.55, z: 1.3, isFront: true },
            { x: 1.05, y: 0.55, z: 1.3, isFront: true },
            { x: -1.05, y: 0.55, z: -1.4, isFront: false },
            { x: 1.05, y: 0.55, z: -1.4, isFront: false }
        ];
        this.attachModernWheels(body, wheelOffsets, 0.55, 0.35);
        this.bodyMeshGroup.add(body);
    }

    // Helper to generate compound-curved lofted polygonal automotive body panels
    createLoftedGeometry(slices, mirrorX = false) {
        const geo = new THREE.BufferGeometry();
        const numSlices = slices.length;
        if (numSlices < 2) return geo;
        const ptsPerSlice = slices[0].length;
        const positions = [];
        const indices = [];

        for (let i = 0; i < numSlices; i++) {
            const slice = slices[i];
            for (let j = 0; j < ptsPerSlice; j++) {
                const pt = slice[j];
                const px = mirrorX ? -pt[0] : pt[0];
                const py = pt[1];
                const pz = pt[2];
                positions.push(px, py, pz);
            }
        }

        for (let i = 0; i < numSlices - 1; i++) {
            const rowA = i * ptsPerSlice;
            const rowB = (i + 1) * ptsPerSlice;
            for (let j = 0; j < ptsPerSlice - 1; j++) {
                const a = rowA + j;
                const b = rowA + j + 1;
                const c = rowB + j;
                const d = rowB + j + 1;

                if (mirrorX) {
                    indices.push(a, d, c);
                    indices.push(a, b, d);
                } else {
                    indices.push(a, c, d);
                    indices.push(a, d, b);
                }
            }
        }

        const IndexAttr = positions.length / 3 > 65535 ? THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute;
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(new IndexAttr(indices, 1));
        geo.computeVertexNormals();
        return geo;
    }

    // Exact 1:1 replica of the Porsche 911 Carrera S from the 3 reference views (Front, Rear, Side)
    buildPorsche911(paintMat, chromeMat, blackTrim, glassMat) {
        const tg = window.textureGenerator;
        const skyTex = tg ? tg.createSkyTexture() : null;
        const body = new THREE.Group();

        const darkTrimMat = new THREE.MeshStandardMaterial({
            color: 0x141416,
            roughness: 0.45,
            metalness: 0.25
        });

        // 1. Aerodynamic Porsche 911 Lower Chassis / Underbody Tub
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.36, 4.15), paintMat);
        chassis.position.set(0, 0.36, 0);
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        body.add(chassis);

        // Dark satin lower rocker sill extensions (Side View Photo 2)
        const rockerL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 2.5), darkTrimMat);
        rockerL.position.set(-0.94, 0.22, 0);
        body.add(rockerL);
        const rockerR = rockerL.clone();
        rockerR.position.x = 0.94;
        body.add(rockerR);

        // 2. Sloping Front Hood / Frunk with Dynamic Creases (Front View Photo 0 & 2)
        // Center recessed frunk lid
        const hoodGeo = new THREE.BoxGeometry(1.10, 0.12, 1.48);
        const hood = new THREE.Mesh(hoodGeo, paintMat);
        hood.position.set(0, 0.54, 1.25);
        hood.rotation.x = 0.14; // Forward aerodynamic rake
        hood.castShadow = true;
        body.add(hood);

        // Subtle hood dual styling creases
        for (const s of [-0.34, 0.34]) {
            const crease = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 1.3), paintMat);
            crease.position.set(s, 0.61, 1.25);
            crease.rotation.x = 0.14;
            body.add(crease);
        }

        // Gold Porsche Crest Emblem on Front Hood Tip (Photo 0!)
        const badgeMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createPorscheBadgeTexture() : null,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true
        });
        const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.11), badgeMat);
        badge.position.set(0, 0.53, 1.95);
        badge.rotation.x = -Math.PI / 4.5;
        body.add(badge);

        // Front Hood "Smile" Air Extractor Slot (Photo 0!)
        const smileVent = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.05), darkTrimMat);
        smileVent.position.set(0, 0.51, 1.98);
        body.add(smileVent);

        // 3. Iconic Sculpted Front Fender Blisters & 4-Point LED Headlights (Photo 0 & 2!)
        // Organic lofted compound-curved front fenders replacing raw cylinder primitives
        const frontFenderSlices = [
            // z = 0.45: cowl / A-pillar transition
            [[0.56, 0.73, 0.45], [0.73, 0.77, 0.45], [0.84, 0.72, 0.45], [0.91, 0.60, 0.45], [0.92, 0.38, 0.45]],
            // z = 0.95: rear of front wheel arch
            [[0.55, 0.70, 0.95], [0.74, 0.77, 0.95], [0.87, 0.73, 0.95], [0.95, 0.62, 0.95], [0.94, 0.40, 0.95]],
            // z = 1.38: apex over front wheel center (wheel at z=1.38, y=0.35, r=0.35)
            [[0.54, 0.67, 1.38], [0.75, 0.79, 1.38], [0.91, 0.75, 1.38], [0.98, 0.64, 1.38], [0.96, 0.46, 1.38]],
            // z = 1.70: front curve ahead of wheel
            [[0.50, 0.63, 1.70], [0.74, 0.74, 1.70], [0.88, 0.69, 1.70], [0.95, 0.58, 1.70], [0.92, 0.38, 1.70]],
            // z = 1.90: headlight pod transition
            [[0.44, 0.58, 1.90], [0.74, 0.67, 1.90], [0.85, 0.61, 1.90], [0.91, 0.50, 1.90], [0.88, 0.34, 1.90]],
            // z = 2.06: bumper nose corner
            [[0.38, 0.50, 2.06], [0.68, 0.54, 2.06], [0.78, 0.48, 2.06], [0.84, 0.40, 2.06], [0.80, 0.28, 2.06]]
        ];

        for (const mirror of [false, true]) {
            const fenderGeo = this.createLoftedGeometry(frontFenderSlices, mirror);
            const fenderMesh = new THREE.Mesh(fenderGeo, paintMat);
            fenderMesh.castShadow = true;
            fenderMesh.receiveShadow = true;
            body.add(fenderMesh);
        }

        const headlightMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createPorscheHeadlightTexture() : null,
            roughness: 0.08,
            metalness: 0.8,
            emissive: 0x446688,
            emissiveIntensity: 0.35
        });

        for (const s of [-1, 1]) {
            // Tilted round/oval headlight lens with 4-Point DRL signature (Photo 0!)
            const headLens = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), headlightMat);
            headLens.position.set(s * 0.74, 0.67, 1.90);
            headLens.rotation.x = -0.38;
            headLens.rotation.y = s * 0.08;
            body.add(headLens);

            // Headlight outer dark chrome bezel
            const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.018, 12, 24), chromeMat);
            bezel.position.copy(headLens.position);
            bezel.rotation.copy(headLens.rotation);
            body.add(bezel);

            // Headlight sculpted bucket backing
            const bucketMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.3, metalness: 0.8 });
            const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.12, 20), bucketMat);
            bucket.position.set(s * 0.74, 0.64, 1.84);
            bucket.rotation.x = -0.38 + Math.PI / 2;
            bucket.rotation.y = s * 0.08;
            body.add(bucket);
        }

        // 4. Front Bumper Fascia & Triple Air Intakes with Front Splitter (Photo 0!)
        const noseBumper = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.32, 0.35), paintMat);
        noseBumper.position.set(0, 0.36, 1.98);
        body.add(noseBumper);

        const meshMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createPorscheHoneycombTexture() : null,
            roughness: 0.8,
            metalness: 0.2
        });

        // Center wide trapezoidal radiator intake
        const centerIntake = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.2, 0.06), meshMat);
        centerIntake.position.set(0, 0.26, 2.14);
        body.add(centerIntake);

        // Left & right rectangular brake cooling ducts + horizontal LED DRL turn signals
        const drlMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xe0f2fe,
            emissiveIntensity: 0.9
        });

        for (const s of [-1, 1]) {
            const sideIntake = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.06), meshMat);
            sideIntake.position.set(s * 0.68, 0.28, 2.12);
            body.add(sideIntake);

            // Horizontal slim LED light strip (Photo 0!)
            const drlStrip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.02), drlMat);
            drlStrip.position.set(s * 0.68, 0.36, 2.15);
            body.add(drlStrip);
        }

        // Lower Aerodynamic Front Splitter / Chin Spoiler (Photo 0!)
        const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.04, 0.45), darkTrimMat);
        splitter.position.set(0, 0.14, 2.06);
        body.add(splitter);

        // 5. Classic 911 "Flyline" Arched Roof & Greenhouse (Side View Photo 2!)
        const wsMat = glassMat;

        // Arched Aerodynamic Roof Panel (continuous compound curvature matching 911 flyline)
        const roofSlices = [
            // z = -0.95: rear window header
            [[-0.58, 1.13, -0.95], [-0.30, 1.16, -0.95], [0.00, 1.17, -0.95], [0.30, 1.16, -0.95], [0.58, 1.13, -0.95]],
            // z = -0.40: roof mid-rear
            [[-0.64, 1.18, -0.40], [-0.32, 1.22, -0.40], [0.00, 1.23, -0.40], [0.32, 1.22, -0.40], [0.64, 1.18, -0.40]],
            // z = 0.00: roof center peak
            [[-0.66, 1.19, 0.00], [-0.33, 1.23, 0.00], [0.00, 1.24, 0.00], [0.33, 1.23, 0.00], [0.66, 1.19, 0.00]],
            // z = 0.35: front windshield header
            [[-0.64, 1.14, 0.35], [-0.32, 1.18, 0.35], [0.00, 1.19, 0.35], [0.32, 1.18, 0.35], [0.64, 1.14, 0.35]]
        ];
        const roofGeo = this.createLoftedGeometry(roofSlices, false);
        const roof = new THREE.Mesh(roofGeo, paintMat);
        roof.castShadow = true;
        roof.receiveShadow = true;
        body.add(roof);

        // Windshield raked smoothly up from cowl to roof header
        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.88), wsMat);
        windshield.position.set(0, 0.94, 0.58);
        windshield.rotation.x = -0.62;
        body.add(windshield);

        // Flowing rear fastback window (Backlite - Photo 1 & 2!)
        const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 1.32), wsMat);
        rearGlass.position.set(0, 0.96, -1.28);
        rearGlass.rotation.x = 0.70; // Graceful continuous slope into decklid
        body.add(rearGlass);

        // Teardrop Side Windows & Aerodynamic Roof Cant Rails (Photo 2)
        for (const s of [-1, 1]) {
            const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 1.65), wsMat);
            sideWindow.position.set(s * 0.74, 0.96, -0.30);
            body.add(sideWindow);

            const windowTrim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.40, 1.70), darkTrimMat);
            windowTrim.position.set(s * 0.73, 0.96, -0.30);
            body.add(windowTrim);

            // A-pillar to C-pillar arched body color cant rail
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.75), paintMat);
            rail.position.set(s * 0.72, 1.15, -0.30);
            body.add(rail);
        }

        // Interior: Sports Steering Wheel & 2 High-Back Bucket Seats (Photo 0 & 2)
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.6 });
        for (const s of [-0.36, 0.36]) {
            const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.55), seatMat);
            seatBottom.position.set(s, 0.46, -0.15);
            body.add(seatBottom);

            const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.12), seatMat);
            seatBack.position.set(s, 0.74, -0.42);
            seatBack.rotation.x = -0.2;
            body.add(seatBack);

            const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.1), seatMat);
            headrest.position.set(s, 1.05, -0.49);
            headrest.rotation.x = -0.2;
            body.add(headrest);
        }

        // Dashboard & 3-Spoke Sport Steering Wheel (Left-Hand Drive, Photo 0)
        const dash = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.25, 0.5), darkTrimMat);
        dash.position.set(0, 0.72, 0.4);
        body.add(dash);

        const steerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22), darkTrimMat);
        steerCol.rotation.x = Math.PI / 4;
        steerCol.position.set(-0.36, 0.76, 0.22);
        body.add(steerCol);

        const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 12, 24), darkTrimMat);
        steerWheel.position.set(-0.36, 0.84, 0.14);
        steerWheel.rotation.x = Math.PI / 4;
        body.add(steerWheel);

        // 6. SportDesign Aerodynamic Stalk Mirrors (Photo 0 & 2!)
        for (const s of [-1, 1]) {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14), darkTrimMat);
            stalk.position.set(s * 0.88, 0.76, 0.48);
            stalk.rotation.z = -s * 0.5;
            body.add(stalk);

            const mirrorCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.12), paintMat);
            mirrorCap.position.set(s * 0.98, 0.82, 0.48);
            body.add(mirrorCap);

            const mirrorGlassFace = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.08), chromeMat);
            mirrorGlassFace.position.set(s * 0.98, 0.82, 0.42);
            mirrorGlassFace.rotation.y = Math.PI;
            body.add(mirrorGlassFace);
        }

        // 7. Muscular Widebody Rear Haunches & Decklid Louvers (Photo 1 & 2!)
        // Organic lofted widebody rear haunches replacing raw cylinder primitives
        const rearHaunchSlices = [
            // z = -2.16: rear bumper corner / taillight wraparound
            [[0.55, 0.74, -2.16], [0.75, 0.71, -2.16], [0.90, 0.65, -2.16], [0.94, 0.48, -2.16], [0.90, 0.26, -2.16]],
            // z = -1.85: rear arch taper / bumper transition
            [[0.60, 0.78, -1.85], [0.80, 0.77, -1.85], [0.96, 0.71, -1.85], [0.99, 0.55, -1.85], [0.96, 0.32, -1.85]],
            // z = -1.38: apex over wide rear wheel (wheel at z=-1.38, y=0.37, r=0.37, width=0.35)
            [[0.62, 0.82, -1.38], [0.82, 0.82, -1.38], [0.99, 0.77, -1.38], [1.04, 0.61, -1.38], [1.01, 0.45, -1.38]],
            // z = -0.85: quarter panel swell
            [[0.68, 0.86, -0.85], [0.83, 0.80, -0.85], [0.94, 0.70, -0.85], [0.98, 0.52, -0.85], [0.94, 0.28, -0.85]],
            // z = -0.35: door shutline waistline
            [[0.74, 0.88, -0.35], [0.82, 0.78, -0.35], [0.88, 0.65, -0.35], [0.90, 0.48, -0.35], [0.89, 0.28, -0.35]]
        ];

        for (const mirror of [false, true]) {
            const haunchGeo = this.createLoftedGeometry(rearHaunchSlices, mirror);
            const haunchMesh = new THREE.Mesh(haunchGeo, paintMat);
            haunchMesh.castShadow = true;
            haunchMesh.receiveShadow = true;
            body.add(haunchMesh);
        }

        // Rear engine lid with cooling grille slats
        const decklid = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.12, 0.95), paintMat);
        decklid.position.set(0, 0.72, -1.55);
        decklid.rotation.x = -0.12;
        body.add(decklid);

        // Vertical engine louver vanes (992 signature)
        for (let l = -0.44; l <= 0.44; l += 0.08) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.04, 0.78), darkTrimMat);
            slat.position.set(l, 0.76, -1.55);
            slat.rotation.x = -0.12;
            body.add(slat);
        }

        // Integrated Aerodynamic Ducktail / Spoiler Lip (Photo 1!)
        const ducktail = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.08, 0.28), paintMat);
        ducktail.position.set(0, 0.78, -1.95);
        ducktail.rotation.x = -0.1;
        ducktail.castShadow = true;
        body.add(ducktail);

        // 8. Full-Width 3D LED Lightbar with "PORSCHE" & "911 Carrera S" (Rear View Photo 1!)
        const lightbarGeo = new THREE.PlaneGeometry(1.92, 0.22);
        const lightbarMat = new THREE.MeshStandardMaterial({
            map: tg ? tg.createPorscheLightbarTexture() : null,
            roughness: 0.1,
            metalness: 0.7,
            emissive: 0xff1e1e,
            emissiveMap: tg ? tg.createPorscheLightbarTexture() : null,
            emissiveIntensity: 0.4
        });
        const lightbar = new THREE.Mesh(lightbarGeo, lightbarMat);
        lightbar.position.set(0, 0.66, -2.18);
        lightbar.rotation.y = Math.PI;
        body.add(lightbar);
        this.brakeLights.push(lightbarMat);

        // Rear California License Plate ("16403" Photo 1!)
        const caPlateMat = new THREE.MeshBasicMaterial({
            map: tg ? tg.createCaliforniaPlateTexture() : null
        });
        const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), caPlateMat);
        rearPlate.position.set(0, 0.45, -2.19);
        rearPlate.rotation.y = Math.PI;
        body.add(rearPlate);

        // 9. Rear Bumper Diffuser & Dual Massive Oval Sport Exhaust Tips (Photo 1!)
        const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.28, 0.45), darkTrimMat);
        diffuser.position.set(0, 0.22, -2.06);
        body.add(diffuser);

        // Diffuser vertical aerodynamic strakes
        for (const dx of [-0.22, 0.22]) {
            const strake = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.38), darkTrimMat);
            strake.position.set(dx, 0.18, -2.08);
            body.add(strake);
        }

        // Dual Large Oval Sport Exhaust Tips (Left & Right - Photo 1!)
        const exhaustChrome = new THREE.MeshStandardMaterial({
            color: 0x3a3d42,
            roughness: 0.2,
            metalness: 0.95,
            envMap: skyTex,
            envMapIntensity: 2.5
        });
        const exhaustHole = new THREE.MeshBasicMaterial({ color: 0x050505 });

        this.exhaustPipes = [];
        for (const s of [-1, 1]) {
            const pipeX = s * 0.48;
            const pipeY = 0.25;
            const pipeZ = -2.18;

            const ovalPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 20), exhaustChrome);
            ovalPipe.scale.set(1.4, 1.0, 0.9);
            ovalPipe.rotation.x = Math.PI / 2;
            ovalPipe.position.set(pipeX, pipeY, pipeZ);
            body.add(ovalPipe);

            const innerHole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), exhaustHole);
            innerHole.scale.set(1.35, 0.85, 1.0);
            innerHole.rotation.y = Math.PI;
            innerHole.position.set(pipeX, pipeY, pipeZ - 0.08);
            body.add(innerHole);

            this.exhaustPipes.push({ x: pipeX, y: pipeY, z: pipeZ - 0.1 });
        }

        // Headlight positions for active high-beam SpotLights
        this.headlightPositions = [
            { x: -0.74, y: 0.65, z: 1.95 },
            { x: 0.74, y: 0.65, z: 1.95 }
        ];
        this.taillightPositions = []; // Handled by continuous lightbar!

        // 10. Staggered Gold / Satin Aurum Multi-Spoke Alloy Wheels & Carbon Brakes (Side View Photo 2!)
        const wheelOffsets = [
            { x: -0.96, y: 0.35, z: 1.38, isFront: true, radius: 0.35, width: 0.28 },
            { x: 0.96, y: 0.35, z: 1.38, isFront: true, radius: 0.35, width: 0.28 },
            { x: -1.02, y: 0.37, z: -1.38, isFront: false, radius: 0.37, width: 0.35 },
            { x: 1.02, y: 0.37, z: -1.38, isFront: false, radius: 0.37, width: 0.35 }
        ];

        this.wheelShadowPositions = [
            { x: -0.96, z: 1.38 },
            { x: 0.96, z: 1.38 },
            { x: -1.02, z: -1.38 },
            { x: 1.02, z: -1.38 }
        ];
        this.attachPorscheWheels(body, wheelOffsets, skyTex);
        this.bodyMeshGroup.add(body);
    }

    attachPorscheWheels(parent, offsets, skyTex) {
        // Satin Aurum / Gold Lightweight Wheel Material (Photo 2!)
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xc8a462,
            metalness: 0.85,
            roughness: 0.22,
            envMap: skyTex,
            envMapIntensity: 2.2
        });

        // High performance Michelin low-profile tire
        const tireMat = new THREE.MeshStandardMaterial({
            color: 0x18181a,
            roughness: 0.88,
            metalness: 0.08
        });

        // Cross-drilled carbon brake rotor & Guards Red caliper
        const rotorMat = new THREE.MeshStandardMaterial({
            color: 0x5a5e66,
            roughness: 0.35,
            metalness: 0.85
        });

        const caliperMat = new THREE.MeshStandardMaterial({
            color: 0xd61818,
            roughness: 0.25,
            metalness: 0.2
        });

        for (const off of offsets) {
            const hubGroup = new THREE.Group();
            hubGroup.position.set(off.x, off.y, off.z);

            const wheelMesh = new THREE.Group();

            // Low Profile Tire
            const tireGeo = new THREE.CylinderGeometry(off.radius, off.radius, off.width, 28);
            tireGeo.rotateZ(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.castShadow = true;
            wheelMesh.add(tire);

            // Outer Gold Rim Lip
            const rimGeo = new THREE.CylinderGeometry(off.radius * 0.88, off.radius * 0.88, off.width + 0.01, 24, 1, true);
            rimGeo.rotateZ(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeo, goldMat);
            wheelMesh.add(rim);

            // Center Gold Hub with mini crest
            const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, off.width + 0.02, 16), goldMat);
            centerHub.rotation.z = Math.PI / 2;
            wheelMesh.add(centerHub);

            // 10 Elegant Y-Spoke Dual Radial Rays (Photo 2!)
            const spokeLen = off.radius * 0.78;
            for (let s = 0; s < 10; s++) {
                const angle = (s * Math.PI) / 5;
                const spokeGroup = new THREE.Group();
                spokeGroup.rotation.x = angle;

                const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(off.width * 0.3, 0.024, spokeLen), goldMat);
                spoke1.position.set(0, 0, spokeLen * 0.5);
                spokeGroup.add(spoke1);

                wheelMesh.add(spokeGroup);
            }

            // Fixed Brake Disc & Red Caliper (stays upright while wheel spins!)
            const rotor = new THREE.Mesh(new THREE.CylinderGeometry(off.radius * 0.68, off.radius * 0.68, 0.03, 20), rotorMat);
            rotor.rotation.z = Math.PI / 2;
            rotor.position.x = off.x > 0 ? -0.04 : 0.04;
            hubGroup.add(rotor);

            const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, off.radius * 0.38, 0.12), caliperMat);
            caliper.position.set(off.x > 0 ? -0.04 : 0.04, off.radius * 0.38, 0);
            hubGroup.add(caliper);

            hubGroup.add(wheelMesh);
            parent.add(hubGroup);

            this.wheels.push(wheelMesh);
            if (off.isFront) {
                this.frontWheelHubs.push(hubGroup);
            }
        }
    }

    attachModernWheels(parent, offsets, radius, width) {
        const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
        tireGeo.rotateZ(Math.PI / 2);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });

        for (const off of offsets) {
            const hubGroup = new THREE.Group();
            hubGroup.position.set(off.x, off.y, off.z);
            const wheelMesh = new THREE.Group();

            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.castShadow = true;
            wheelMesh.add(tire);

            const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 16), rimMat);
            rim.rotation.z = Math.PI / 2;
            wheelMesh.add(rim);

            hubGroup.add(wheelMesh);
            parent.add(hubGroup);

            this.wheels.push(wheelMesh);
            if (off.isFront) {
                this.frontWheelHubs.push(hubGroup);
            }
        }
    }

    initParticles() {
        const pGeo = new THREE.DodecahedronGeometry(0.3, 1);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });

        for (let i = 0; i < 40; i++) {
            const mesh = new THREE.Mesh(pGeo, pMat.clone());
            mesh.visible = false;
            this.scene.add(mesh);
            this.particlePool.push({
                mesh: mesh,
                active: false,
                life: 0,
                maxLife: 1.0,
                vx: 0,
                vy: 0,
                vz: 0
            });
        }
    }

    spawnSmoke(x, y, z, isNitro = false) {
        const p = this.particlePool.find(item => !item.active);
        if (!p) return;

        p.active = true;
        p.life = 0;
        p.maxLife = isNitro ? 0.35 : 0.75;
        p.mesh.position.set(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.3);
        p.mesh.scale.setScalar(isNitro ? 0.4 : 0.5);
        p.mesh.visible = true;

        if (isNitro) {
            p.mesh.material.color.setHex(0x00d2ff);
            p.mesh.material.opacity = 0.9;
        } else {
            p.mesh.material.color.setHex(0xdddddd);
            p.mesh.material.opacity = 0.45;
        }

        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = 0.5 + Math.random() * 0.8;
        p.vz = (Math.random() - 0.5) * 0.8;
    }

    initSkidmarks() {
        const sGeo = new THREE.PlaneGeometry(0.35, 1.0);
        sGeo.rotateX(-Math.PI / 2);
        const sMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.55 });

        for (let i = 0; i < 60; i++) {
            const mark = new THREE.Mesh(sGeo, sMat);
            mark.visible = false;
            this.scene.add(mark);
            this.skidmarkPool.push({ mesh: mark, active: false, life: 0 });
        }
    }

    spawnSkidmark(x, y, z, heading) {
        const mark = this.skidmarkPool.find(item => !item.active);
        if (!mark) return;
        mark.active = true;
        mark.life = 6.0;
        mark.mesh.position.set(x, y + 0.03, z);
        mark.mesh.rotation.y = heading;
        mark.mesh.visible = true;
    }

    getSampledGround(x, z) {
        const gy = this.terrain.getHeight(x, z);
        const ramp = this.world.checkRampElevation(x, z);
        return ramp ? (gy + ramp.extraHeight) : gy;
    }

    update(delta, input) {
        const throttle = input.forward ? 1 : 0;
        const brake = input.backward ? 1 : 0;
        this.handbrake = input.handbrake || false;
        this.isBoosting = input.boost || false;

        const steerSpeed = 3.2 * delta;
        const speedRatio = Math.min(1.0, Math.abs(this.speed) / this.topSpeed);
        const currentMaxSteer = this.maxSteerAngle * (1.0 - speedRatio * 0.55);

        let targetSteer = 0;
        if (input.left) targetSteer += currentMaxSteer;
        if (input.right) targetSteer -= currentMaxSteer;

        this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer, steerSpeed * 4);

        for (const hub of this.frontWheelHubs) {
            hub.rotation.y = this.steerAngle;
        }

        // Steer heading
        let slipRatio = 0;
        if (this.isGrounded) {
            let turnRate = (this.speed / 50.0) * this.steerAngle * 1.8;

            if (this.handbrake) {
                turnRate *= 1.8;
                slipRatio = Math.min(1.0, Math.abs(this.speed) / 40);

                if (Math.abs(this.speed) > 30) {
                    this.driftScore += Math.round(Math.abs(this.speed) * delta * 10);
                    if (window.onDrift) window.onDrift(this.driftScore);
                }
            } else {
                if (this.driftScore > 0) {
                    this.totalStuntScore += this.driftScore;
                    if (window.onStunt) window.onStunt(`Drift Complete! +${this.driftScore} pts`);
                    this.driftScore = 0;
                }
            }

            this.heading += turnRate * delta;
        }

        // 2. Compute Terrain Normal & Slanted Basis Vector Framework
        const headingDir = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading)).normalize();
        const terrainNormal = this.terrain.getNormal(this.position.x, this.position.z);

        // Project forward direction onto the slanted terrain tangent plane
        const carForward = headingDir.clone().sub(terrainNormal.clone().multiplyScalar(headingDir.dot(terrainNormal))).normalize();
        const carRight = new THREE.Vector3().crossVectors(terrainNormal, carForward).normalize();
        const carUp = new THREE.Vector3().crossVectors(carForward, carRight).normalize();

        // 3. Slope Gravity & Engine Dynamics
        const surfaceType = this.terrain.getSurfaceType(this.position.x, this.position.z);
        const surfaceFriction = surfaceType === 'road' ? 1.0 : (surfaceType === 'road_shoulder' ? 0.8 : 0.65);
        const boostPower = this.isBoosting ? 1.85 : 1.0;

        if (this.isGrounded) {
            // Authentic slope gravity: uphill pulls backward, downhill accelerates
            const slopeGravity = carForward.y * 22.0;
            this.speed -= slopeGravity * delta * 3.6;

            if (throttle) {
                if (this.speed < -2) {
                    this.speed += this.brakeForce * delta;
                } else {
                    this.speed += this.acceleration * boostPower * surfaceFriction * delta;
                }
            } else if (brake) {
                if (this.speed > 2) {
                    this.speed -= this.brakeForce * delta;
                } else {
                    this.speed -= this.reverseForce * delta;
                }
            } else {
                const drag = (surfaceType === 'road' ? 6.0 : 12.0) * delta;
                if (this.speed > 0) this.speed = Math.max(0, this.speed - drag);
                else if (this.speed < 0) this.speed = Math.min(0, this.speed + drag);
            }

            if (this.handbrake && this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.brakeForce * 1.5 * delta);
            }
        }

        const maxForwardSpeed = this.topSpeed * (this.isBoosting ? 1.35 : 1.0);
        this.speed = Math.max(-40, Math.min(maxForwardSpeed, this.speed));

        // 4. Move Car along the Slanted Terrain Tangent Plane
        const moveSpeedMS = (this.speed / 3.6) * delta;
        this.position.x += carForward.x * moveSpeedMS;
        this.position.z += carForward.z * moveSpeedMS;

        // Keep inside world boundaries
        const boundary = this.terrain.halfSize - 30;
        this.position.x = Math.max(-boundary, Math.min(boundary, this.position.x));
        this.position.z = Math.max(-boundary, Math.min(boundary, this.position.z));

        // Obstacle Collision Check
        const hit = this.world.checkCollision(this.position.x, this.position.z, 1.6);
        if (hit) {
            this.position.x += hit.nx * hit.overlap;
            this.position.z += hit.nz * hit.overlap;
            if (Math.abs(this.speed) > 15) {
                window.soundEngine.playCrash(Math.min(1.0, Math.abs(this.speed) / 80));
            }
            this.speed *= -0.3;
        }

        // 5. Sample 4 Wheels at Current Position for Ground Clamping
        const frontDist = 1.35;
        const rearDist = 1.25;
        const sideDist = 0.82;

        const flX = this.position.x + carForward.x * frontDist - carRight.x * sideDist;
        const flZ = this.position.z + carForward.z * frontDist - carRight.z * sideDist;
        const frX = this.position.x + carForward.x * frontDist + carRight.x * sideDist;
        const frZ = this.position.z + carForward.z * frontDist + carRight.z * sideDist;
        const rlX = this.position.x - carForward.x * rearDist - carRight.x * sideDist;
        const rlZ = this.position.z - carForward.z * rearDist - carRight.z * sideDist;
        const rrX = this.position.x - carForward.x * rearDist + carRight.x * sideDist;
        const rrZ = this.position.z - carForward.z * rearDist + carRight.z * sideDist;

        const flY = this.getSampledGround(flX, flZ);
        const frY = this.getSampledGround(frX, frZ);
        const rlY = this.getSampledGround(rlX, rlZ);
        const rrY = this.getSampledGround(rrX, rrZ);

        const groundY = (flY + frY + rlY + rrY) / 4.0;
        const targetY = groundY + this.wheelGroundOffset;

        // 6. Ground Clamping & Normal Gravity
        if (this.position.y <= targetY + 0.25) {
            if (!this.isGrounded) {
                if (this.verticalVelocity < -8) {
                    window.soundEngine.playCrash(Math.min(1.0, -this.verticalVelocity / 20));
                    this.suspensionPitch = -0.12;
                }
                if (this.airTime > 0.5) {
                    const airScore = Math.round(this.airTime * 250);
                    this.totalStuntScore += airScore;
                    if (window.onStunt) window.onStunt(`Big Air Jump! +${airScore} pts`);
                }
                this.airTime = 0;
            }
            this.isGrounded = true;
            this.verticalVelocity = 0;
            this.position.y = targetY;
        } else {
            this.isGrounded = false;
            this.airTime += delta;
            this.verticalVelocity -= 26.0 * delta;
            this.position.y += this.verticalVelocity * delta;
            if (this.position.y < targetY) {
                this.position.y = targetY;
                this.isGrounded = true;
                this.verticalVelocity = 0;
            }
        }

        // 7. Slant Car on Hill using Matrix Basis & Quaternion SLERP
        const basisMat = new THREE.Matrix4();
        if (this.isGrounded) {
            basisMat.makeBasis(carRight, carUp, carForward);
            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(basisMat);
            this.root.quaternion.slerp(targetQuat, 25 * delta);
        } else {
            const flatUp = new THREE.Vector3(0, 1, 0);
            const flatRight = new THREE.Vector3().crossVectors(flatUp, headingDir).normalize();
            basisMat.makeBasis(flatRight, flatUp, headingDir);
            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(basisMat);
            this.root.quaternion.slerp(targetQuat, 5 * delta);
        }

        this.root.position.copy(this.position);

        // 8. Suspension Pitch & Roll Tilt
        const targetPitch = (throttle ? -0.05 : 0) + (brake ? 0.07 : 0);
        const targetRoll = -this.steerAngle * (this.speed / 80.0) * 0.12;
        this.suspensionPitch = THREE.MathUtils.lerp(this.suspensionPitch, targetPitch, 10 * delta);
        this.suspensionRoll = THREE.MathUtils.lerp(this.suspensionRoll, targetRoll, 10 * delta);
        this.bodyMeshGroup.rotation.x = this.suspensionPitch;
        this.bodyMeshGroup.rotation.z = this.suspensionRoll;

        const wheelRollSpeed = moveSpeedMS * 2.5;
        for (const w of this.wheels) {
            w.rotation.x += wheelRollSpeed;
        }

        const isBraking = brake || this.handbrake;
        for (const mat of this.brakeLights) {
            mat.emissiveIntensity = isBraking ? 1.8 : 0.3;
        }

        if (this.isGrounded) {
            if ((this.handbrake && Math.abs(this.speed) > 15) || (throttle && Math.abs(this.speed) < 10)) {
                this.spawnSmoke(this.position.x - carForward.x * 1.2, this.position.y, this.position.z - carForward.z * 1.2);
                this.spawnSkidmark(this.position.x, groundY, this.position.z, this.heading);
            }

            if (this.isBoosting && throttle) {
                this.spawnSmoke(this.position.x - carForward.x * 1.8, this.position.y + 0.3, this.position.z - carForward.z * 1.8, true);
            }
        }

        this.updateParticles(delta);

        this.updateRPM(throttle);
        window.soundEngine.updateEngine(this.rpm / 7000, throttle, this.carType);
        window.soundEngine.updateTireSqueal(slipRatio);
        window.soundEngine.setNitro(this.isBoosting && throttle);
    }

    updateRPM(throttle) {
        const absSpeed = Math.abs(this.speed);
        if (absSpeed < 30) this.currentGear = 1;
        else if (absSpeed < 65) this.currentGear = 2;
        else if (absSpeed < 105) this.currentGear = 3;
        else if (absSpeed < 145) this.currentGear = 4;
        else this.currentGear = 5;

        const gearSpeed = [0, 30, 65, 105, 145, 220];
        const minS = gearSpeed[this.currentGear - 1];
        const maxS = gearSpeed[this.currentGear];
        const gearProgress = Math.min(1.0, Math.max(0, (absSpeed - minS) / (maxS - minS)));

        const targetRPM = 1200 + gearProgress * 5400 + (throttle ? 400 : 0);
        this.rpm = THREE.MathUtils.lerp(this.rpm, targetRPM, 0.1);
    }

    updateParticles(delta) {
        for (const p of this.particlePool) {
            if (p.active) {
                p.life += delta;
                p.mesh.position.x += p.vx * delta;
                p.mesh.position.y += p.vy * delta;
                p.mesh.position.z += p.vz * delta;
                p.mesh.scale.multiplyScalar(1.0 + delta * 2.0);

                const progress = p.life / p.maxLife;
                p.mesh.material.opacity = (1.0 - progress) * 0.6;

                if (p.life >= p.maxLife) {
                    p.active = false;
                    p.mesh.visible = false;
                }
            }
        }

        for (const s of this.skidmarkPool) {
            if (s.active) {
                s.life -= delta;
                if (s.life <= 0) {
                    s.active = false;
                    s.mesh.visible = false;
                }
            }
        }
    }
}

window.Car = Car;
