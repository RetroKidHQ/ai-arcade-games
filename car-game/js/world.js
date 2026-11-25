/**
 * Open World Environment Builder with Photorealistic Australian Eucalyptus & Gum Trees
 * Multi-branching trunks with peeling gum bark, lush leaf clusters with alpha mask, and road props.
 */
class WorldManager {
    constructor(scene, terrain) {
        this.scene = scene;
        this.terrain = terrain;
        this.colliders = [];
        this.ramps = [];
        this.wallRides = [];
        this.stuntLoops = [];
        this.animatedProps = [];
        this.streetLights = [];
        this.destructibles = [];
    }

    buildAll() {
        this.buildCity();
        this.buildApartments();
        this.buildFarmland();
        this.buildLighthouse();
        this.buildRealisticBushland();
        this.buildBuildingTrees();
        this.buildRoadProps();
        this.buildStuntPark();
        this.buildSpatialGrid();
    }

    // High-performance 2D spatial grid for instantaneous collision checks
    buildSpatialGrid() {
        this.spatialGrid = new Map();
        this.gridCellSize = 64; // 64-meter cells
        const cs = this.gridCellSize;

        for (let i = 0; i < this.colliders.length; i++) {
            const col = this.colliders[i];
            let minCX, maxCX, minCZ, maxCZ;
            if (col.type === 'cylinder') {
                minCX = Math.floor((col.x - col.radius) / cs);
                maxCX = Math.floor((col.x + col.radius) / cs);
                minCZ = Math.floor((col.z - col.radius) / cs);
                maxCZ = Math.floor((col.z + col.radius) / cs);
            } else if (col.type === 'box') {
                minCX = Math.floor(col.minX / cs);
                maxCX = Math.floor(col.maxX / cs);
                minCZ = Math.floor(col.minZ / cs);
                maxCZ = Math.floor(col.maxZ / cs);
            }
            for (let cx = minCX; cx <= maxCX; cx++) {
                for (let cz = minCZ; cz <= maxCZ; cz++) {
                    const key = `${cx},${cz}`;
                    let cell = this.spatialGrid.get(key);
                    if (!cell) {
                        cell = [];
                        this.spatialGrid.set(key, cell);
                    }
                    cell.push(col);
                }
            }
        }
    }

    // 1. Downtown City Zone - Varied Architectural Skyscrapers Modeled on Reference Photos 0-4
    buildCity() {
        const cityX = -120;
        const cityZ = -120;
        const tg = window.textureGenerator;

        // Architectural PBR Textures for the 5 Styles
        // Style 0: Limestone Art Deco Tower (Photo 0)
        const decoTex = tg && tg.createLimestoneArtDecoTexture ? tg.createLimestoneArtDecoTexture(512, 512) : null;
        if (decoTex) { decoTex.wrapS = THREE.RepeatWrapping; decoTex.wrapT = THREE.RepeatWrapping; decoTex.repeat.set(2, 6); }

        // Style 1: Chicago Romanesque Red Brick (Photo 1)
        const brickTex = tg && tg.createRedBrickRomanesqueTexture ? tg.createRedBrickRomanesqueTexture(512, 512) : null;
        if (brickTex) { brickTex.wrapS = THREE.RepeatWrapping; brickTex.wrapT = THREE.RepeatWrapping; brickTex.repeat.set(2, 4); }

        // Rusticated Stone Podium (Photos 1 & 3)
        const rusticatedTex = tg && tg.createRusticatedStoneTexture ? tg.createRusticatedStoneTexture(512, 512) : null;
        if (rusticatedTex) { rusticatedTex.wrapS = THREE.RepeatWrapping; rusticatedTex.wrapT = THREE.RepeatWrapping; rusticatedTex.repeat.set(2, 1); }

        // Style 2: Modern Curvilinear Glass (Photo 2)
        const modernTex = tg && tg.createCurvilinearGlassTexture ? tg.createCurvilinearGlassTexture(512, 512) : null;
        if (modernTex) { modernTex.wrapS = THREE.RepeatWrapping; modernTex.wrapT = THREE.RepeatWrapping; modernTex.repeat.set(2, 4); }

        // Style 3: Beaux-Arts Classical Facade (Photo 3)
        const beauxTex = tg && tg.createBeauxArtsFacadeTexture ? tg.createBeauxArtsFacadeTexture(512, 512) : null;
        if (beauxTex) { beauxTex.wrapS = THREE.RepeatWrapping; beauxTex.wrapT = THREE.RepeatWrapping; beauxTex.repeat.set(2, 4); }

        // Style 4: Neo-Gothic Architectural Terra Cotta (Photo 4)
        const gothicTex = tg && tg.createNeoGothicFacadeTexture ? tg.createNeoGothicFacadeTexture(512, 512) : null;
        if (gothicTex) { gothicTex.wrapS = THREE.RepeatWrapping; gothicTex.wrapT = THREE.RepeatWrapping; gothicTex.repeat.set(2, 6); }

        // Street-Level Retail Storefronts
        const storeTex = tg ? tg.createStorefrontTexture(512, 256) : null;
        if (storeTex) { storeTex.wrapS = THREE.RepeatWrapping; storeTex.wrapT = THREE.RepeatWrapping; storeTex.repeat.set(2, 1); }

        // Specialized Architectural Materials
        const decoMat = new THREE.MeshStandardMaterial({ map: decoTex, roughness: 0.65, metalness: 0.2 });
        const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.8, metalness: 0.15 });
        const rusticatedMat = new THREE.MeshStandardMaterial({ map: rusticatedTex, roughness: 0.9, metalness: 0.1 });
        const modernGlassMat = new THREE.MeshStandardMaterial({ map: modernTex, roughness: 0.2, metalness: 0.8 });
        const beauxMat = new THREE.MeshStandardMaterial({ map: beauxTex, roughness: 0.65, metalness: 0.25 });
        const gothicMat = new THREE.MeshStandardMaterial({ map: gothicTex, roughness: 0.6, metalness: 0.2 });
        const storeMat = new THREE.MeshStandardMaterial({ map: storeTex, roughness: 0.4, metalness: 0.3 });

        // Accent Materials
        const copperRoofMat = new THREE.MeshStandardMaterial({ color: 0x487c65, roughness: 0.5, metalness: 0.4 }); // Weathered green copper
        const copperDarkMat = new THREE.MeshStandardMaterial({ color: 0x365444, roughness: 0.55, metalness: 0.35 });
        const whiteRibbonMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.3, metalness: 0.1 }); // Smooth white balcony trim
        const balconyGlassMat = new THREE.MeshStandardMaterial({ color: 0x567a99, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.7 });
        const goldFinialMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 }); // Gilded spire & finial
        const limestoneTrimMat = new THREE.MeshStandardMaterial({ color: 0xd3c7ae, roughness: 0.7, metalness: 0.1 });
        const darkCorniceMat = new THREE.MeshStandardMaterial({ color: 0x58241a, roughness: 0.75, metalness: 0.15 });
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0x2e3036, roughness: 0.9, metalness: 0.1 });
        const roofMetalMat = new THREE.MeshStandardMaterial({ color: 0x484d54, roughness: 0.5, metalness: 0.8 });

        const gridRows = 4;
        const gridCols = 4;
        const blockSize = 72; // Close and compact downtown skyscraper grid (72m block spacing)

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (r === 1 && c === 1) continue; // Open central park / plaza

                const bx = -282 + c * blockSize;
                const bz = -282 + r * blockSize;
                const by = this.terrain.getHeight(bx, bz);

                // Assign style archetype (0, 1, 2, 3, 4) evenly across the downtown grid
                const style = (r * 2 + c * 3) % 5;

                const buildingGroup = new THREE.Group();
                buildingGroup.position.set(bx, by, bz);

                let width, depth, totalHeight;

                if (style === 0) {
                    // =========================================================================
                    // STYLE 0: Slender Limestone Art Deco Tower with Colonnade Crown (Photo 0)
                    // =========================================================================
                    width = 34 + Math.random() * 6;
                    depth = 34 + Math.random() * 6;
                    totalHeight = 120 + Math.random() * 55; // 120m - 175m ultra-slender

                    // Sidewalk plinth
                    const curb = new THREE.Mesh(new THREE.BoxGeometry(width + 4.0, 0.4, depth + 4.0), concreteMat);
                    curb.position.y = 0.2;
                    curb.receiveShadow = true;
                    buildingGroup.add(curb);

                    // Podium (podH = 12m)
                    const podH = 12.0;
                    const pod = new THREE.Mesh(new THREE.BoxGeometry(width, podH, depth), storeMat);
                    pod.position.y = podH * 0.5;
                    pod.castShadow = true;
                    buildingGroup.add(pod);

                    // Main Shaft: Slender limestone shaft rising to 72% height
                    const shaftH = totalHeight * 0.64;
                    const shaftW = width * 0.92;
                    const shaftD = depth * 0.92;
                    const shaft = new THREE.Mesh(new THREE.BoxGeometry(shaftW, shaftH, shaftD), decoMat);
                    shaft.position.y = podH + shaftH * 0.5;
                    shaft.castShadow = true;
                    buildingGroup.add(shaft);

                    // Setback 1 (Upper Mid Tower)
                    const sb1Y = podH + shaftH;
                    const sb1W = shaftW * 0.86;
                    const sb1D = shaftD * 0.86;
                    const sb1H = totalHeight * 0.12;
                    const sb1 = new THREE.Mesh(new THREE.BoxGeometry(sb1W, sb1H, sb1D), decoMat);
                    sb1.position.y = sb1Y + sb1H * 0.5;
                    sb1.castShadow = true;
                    buildingGroup.add(sb1);

                    // Setback 1 cornice ledge
                    const led1 = new THREE.Mesh(new THREE.BoxGeometry(shaftW + 0.6, 0.8, shaftD + 0.6), limestoneTrimMat);
                    led1.position.y = sb1Y + 0.4;
                    buildingGroup.add(led1);

                    // Setback 2 (Sub-Crown)
                    const sb2Y = sb1Y + sb1H;
                    const sb2W = sb1W * 0.86;
                    const sb2D = sb1D * 0.86;
                    const sb2H = totalHeight * 0.08;
                    const sb2 = new THREE.Mesh(new THREE.BoxGeometry(sb2W, sb2H, sb2D), decoMat);
                    sb2.position.y = sb2Y + sb2H * 0.5;
                    sb2.castShadow = true;
                    buildingGroup.add(sb2);

                    // Crown: Iconic Open Vertical Colonnade / Loggia (from Photo 0!)
                    const crownY = sb2Y + sb2H;
                    const crownH = totalHeight - crownY;
                    const crownW = sb2W * 0.88;
                    const crownD = sb2D * 0.88;

                    // Recessed interior penthouse core
                    const coreW = crownW * 0.56;
                    const coreD = crownD * 0.56;
                    const core = new THREE.Mesh(new THREE.BoxGeometry(coreW, crownH, coreD), decoMat);
                    core.position.y = crownY + crownH * 0.5;
                    core.castShadow = true;
                    buildingGroup.add(core);

                    // 4 massive corner stone pillars
                    const pilW = crownW * 0.18;
                    const pilH = crownH;
                    const pilGeom = new THREE.BoxGeometry(pilW, pilH, pilW);
                    const cornerOffX = (crownW - pilW) * 0.5;
                    const cornerOffZ = (crownD - pilW) * 0.5;
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                        const pil = new THREE.Mesh(pilGeom, limestoneTrimMat);
                        pil.position.set(ox * cornerOffX, crownY + pilH * 0.5, oz * cornerOffZ);
                        pil.castShadow = true;
                        buildingGroup.add(pil);
                    });

                    // Intermediate open colonnade columns along the 4 loggia faces
                    const colW = crownW * 0.08;
                    const colGeom = new THREE.BoxGeometry(colW, pilH, colW);
                    [
                        [-crownW * 0.22, cornerOffZ], [crownW * 0.22, cornerOffZ],
                        [-crownW * 0.22, -cornerOffZ], [crownW * 0.22, -cornerOffZ],
                        [cornerOffX, -crownD * 0.22], [cornerOffX, crownD * 0.22],
                        [-cornerOffX, -crownD * 0.22], [-cornerOffX, crownD * 0.22]
                    ].forEach(([cx, cz]) => {
                        const col = new THREE.Mesh(colGeom, limestoneTrimMat);
                        col.position.set(cx, crownY + pilH * 0.5, cz);
                        col.castShadow = true;
                        buildingGroup.add(col);
                    });

                    // Colonnade Entablature & Parapet Roof Cap
                    const cap = new THREE.Mesh(new THREE.BoxGeometry(crownW + 1.2, 1.8, crownD + 1.2), limestoneTrimMat);
                    cap.position.y = crownY + crownH + 0.9;
                    cap.castShadow = true;
                    buildingGroup.add(cap);

                    // Copper accent rooftop lantern
                    const copperLantern = new THREE.Mesh(new THREE.BoxGeometry(coreW * 0.7, 3.2, coreD * 0.7), copperRoofMat);
                    copperLantern.position.y = crownY + crownH + 2.5;
                    buildingGroup.add(copperLantern);

                } else if (style === 1) {
                    // =========================================================================
                    // STYLE 1: Chicago Romanesque Red Brick & Terracotta High-Rise (Photo 1)
                    // =========================================================================
                    width = 44 + Math.random() * 8;
                    depth = 44 + Math.random() * 8;
                    totalHeight = 72 + Math.random() * 42; // 72m - 114m solid Chicago block

                    // Sidewalk plinth
                    const curb = new THREE.Mesh(new THREE.BoxGeometry(width + 4.0, 0.4, depth + 4.0), concreteMat);
                    curb.position.y = 0.2;
                    curb.receiveShadow = true;
                    buildingGroup.add(curb);

                    // Tier 1: Heavy Rusticated Granite Podium (podH = 15m)
                    const podH = 15.0;
                    const pod = new THREE.Mesh(new THREE.BoxGeometry(width, podH, depth), rusticatedMat);
                    pod.position.y = podH * 0.5;
                    pod.castShadow = true;
                    buildingGroup.add(pod);

                    // Large street-level glass display windows set into rusticated stone
                    const displayW = width * 0.92;
                    const displayH = 6.0;
                    const displayF = new THREE.Mesh(new THREE.BoxGeometry(displayW, displayH, 0.4), storeMat);
                    displayF.position.set(0, displayH * 0.5 + 2.0, depth * 0.5 + 0.1);
                    buildingGroup.add(displayF);

                    // Projecting carved stone beltcourse above podium
                    const belt = new THREE.Mesh(new THREE.BoxGeometry(width + 1.4, 1.2, depth + 1.4), limestoneTrimMat);
                    belt.position.y = podH + 0.6;
                    buildingGroup.add(belt);

                    // Tier 2: Main Terracotta Red Brick Tower Shaft
                    const towerH = totalHeight - podH - 4.0;
                    const towerW = width * 0.96;
                    const towerD = depth * 0.96;
                    const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), brickMat);
                    tower.position.y = podH + towerH * 0.5;
                    tower.castShadow = true;
                    buildingGroup.add(tower);

                    // Tier 3: Massive Overhanging Romanesque / Italianate Dentil Cornice!
                    const corniceY = podH + towerH;
                    const corniceSlab = new THREE.Mesh(new THREE.BoxGeometry(towerW + 3.2, 1.8, towerD + 3.2), darkCorniceMat);
                    corniceSlab.position.y = corniceY + 0.9;
                    corniceSlab.castShadow = true;
                    buildingGroup.add(corniceSlab);

                    // Array of decorative dentil modillion brackets underneath cornice
                    const bracketGeom = new THREE.BoxGeometry(1.2, 1.4, 1.4);
                    const numBrackets = 10;
                    const stepB = towerW / numBrackets;
                    for (let i = 0; i <= numBrackets; i++) {
                        const bxPos = -towerW * 0.5 + i * stepB;
                        const bFront = new THREE.Mesh(bracketGeom, darkCorniceMat);
                        bFront.position.set(bxPos, corniceY - 0.5, towerD * 0.5 + 0.6);
                        buildingGroup.add(bFront);
                        const bBack = new THREE.Mesh(bracketGeom, darkCorniceMat);
                        bBack.position.set(bxPos, corniceY - 0.5, -towerD * 0.5 - 0.6);
                        buildingGroup.add(bBack);
                    }

                    // Rooftop parapet & mechanical water cooling tank
                    const parapet = new THREE.Mesh(new THREE.BoxGeometry(towerW + 0.4, 1.5, towerD + 0.4), darkCorniceMat);
                    parapet.position.y = corniceY + 2.5;
                    buildingGroup.add(parapet);

                    const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 4.5, 14), roofMetalMat);
                    waterTank.position.set(towerW * 0.2, corniceY + 4.2, -towerD * 0.2);
                    waterTank.castShadow = true;
                    buildingGroup.add(waterTank);

                } else if (style === 2) {
                    // =========================================================================
                    // STYLE 2: Curvilinear Modern Balcony Tower & Tinted Glass (Photo 2)
                    // =========================================================================
                    width = 40 + Math.random() * 8;
                    depth = 40 + Math.random() * 8;
                    totalHeight = 85 + Math.random() * 60; // 85m - 145m luxury modern tower

                    // Sidewalk plinth
                    const curb = new THREE.Mesh(new THREE.BoxGeometry(width + 4.0, 0.4, depth + 4.0), concreteMat);
                    curb.position.y = 0.2;
                    curb.receiveShadow = true;
                    buildingGroup.add(curb);

                    // Tier 1: High-Ceiling Open Glazed Ground Lobby with Round Pilotis (podH = 9m)
                    const podH = 9.0;
                    const lobbyW = width * 0.82;
                    const lobbyD = depth * 0.82;
                    const lobby = new THREE.Mesh(new THREE.BoxGeometry(lobbyW, podH, lobbyD), modernGlassMat);
                    lobby.position.y = podH * 0.5;
                    buildingGroup.add(lobby);

                    // Perimeter round concrete pilotis / columns (as seen supporting the overhang in Photo 2)
                    const colRadius = 0.85;
                    const colGeom = new THREE.CylinderGeometry(colRadius, colRadius, podH, 16);
                    const colOffX = width * 0.45;
                    const colOffZ = depth * 0.45;
                    [
                        [-colOffX, -colOffZ], [0, -colOffZ], [colOffX, -colOffZ],
                        [-colOffX, colOffZ], [0, colOffZ], [colOffX, colOffZ],
                        [-colOffX, 0], [colOffX, 0]
                    ].forEach(([px, pz]) => {
                        const col = new THREE.Mesh(colGeom, whiteRibbonMat);
                        col.position.set(px, podH * 0.5, pz);
                        col.castShadow = true;
                        buildingGroup.add(col);
                    });

                    // Tier 2: Dark Tinted Glass Curtain Wall Core
                    const towerH = totalHeight - podH - 7.0;
                    const coreW = width * 0.88;
                    const coreD = depth * 0.88;
                    const core = new THREE.Mesh(new THREE.BoxGeometry(coreW, towerH, coreD), modernGlassMat);
                    core.position.y = podH + towerH * 0.5;
                    core.castShadow = true;
                    buildingGroup.add(core);

                    // Staggered Aerodynamic Wrap-Around Balcony Ribbons (Iconic look from Photo 2!)
                    const floorSpacing = 4.8;
                    const numFloors = Math.floor(towerH / floorSpacing);
                    for (let i = 0; i < numFloors; i++) {
                        const slabY = podH + (i + 1) * floorSpacing;

                        // Alternating organic cantilever offsets create the fluid curvilinear profile
                        const isEven = (i % 2 === 0);
                        const bScaleX = isEven ? 1.04 : 0.99;
                        const bScaleZ = isEven ? 0.99 : 1.04;
                        const slabW = width * bScaleX;
                        const slabD = depth * bScaleZ;

                        // Cantilevered white horizontal slab
                        const slab = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.55, slabD), whiteRibbonMat);
                        slab.position.y = slabY;
                        buildingGroup.add(slab);

                        // Tinted glass perimeter balustrade / railing
                        const railing = new THREE.Mesh(new THREE.BoxGeometry(slabW + 0.1, 1.15, slabD + 0.1), balconyGlassMat);
                        railing.position.y = slabY + 0.7;
                        buildingGroup.add(railing);
                    }

                    // Tier 3: Modern Penthouse & Cantilevered Aerodynamic Roof Canopy
                    const roofY = podH + towerH;
                    const pentW = coreW * 0.72;
                    const pentD = coreD * 0.72;
                    const pentH = 6.0;
                    const penthouse = new THREE.Mesh(new THREE.BoxGeometry(pentW, pentH, pentD), modernGlassMat);
                    penthouse.position.y = roofY + pentH * 0.5;
                    buildingGroup.add(penthouse);

                    // Overhanging thin aerodynamic white roof canopy
                    const canopy = new THREE.Mesh(new THREE.BoxGeometry(coreW * 0.95, 0.7, coreD * 0.95), whiteRibbonMat);
                    canopy.position.y = roofY + pentH + 0.35;
                    canopy.castShadow = true;
                    buildingGroup.add(canopy);

                } else if (style === 3) {
                    // =========================================================================
                    // STYLE 3: Beaux-Arts Classical Tower with Mansard Dome & Cupola Spire (Photo 3)
                    // =========================================================================
                    width = 38 + Math.random() * 8;
                    depth = 38 + Math.random() * 8;
                    totalHeight = 110 + Math.random() * 55; // 110m - 165m monumental classical tower

                    // Sidewalk plinth
                    const curb = new THREE.Mesh(new THREE.BoxGeometry(width + 4.0, 0.4, depth + 4.0), concreteMat);
                    curb.position.y = 0.2;
                    curb.receiveShadow = true;
                    buildingGroup.add(curb);

                    // Tier 1: Classical Rusticated Limestone Podium (podH = 14m)
                    const podH = 14.0;
                    const pod = new THREE.Mesh(new THREE.BoxGeometry(width, podH, depth), rusticatedMat);
                    pod.position.y = podH * 0.5;
                    pod.castShadow = true;
                    buildingGroup.add(pod);

                    // Projecting classical base cornice
                    const baseCornice = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 1.0, depth + 1.2), limestoneTrimMat);
                    baseCornice.position.y = podH + 0.5;
                    buildingGroup.add(baseCornice);

                    // Tier 2: Main Beaux-Arts Classical Shaft (to ~78% height)
                    const shaftH = totalHeight * 0.62;
                    const shaftW = width * 0.92;
                    const shaftD = depth * 0.92;
                    const shaft = new THREE.Mesh(new THREE.BoxGeometry(shaftW, shaftH, shaftD), beauxMat);
                    shaft.position.y = podH + shaftH * 0.5;
                    shaft.castShadow = true;
                    buildingGroup.add(shaft);

                    // Intermediate beltcourse cornice at mid-shaft
                    const midCornice = new THREE.Mesh(new THREE.BoxGeometry(shaftW + 0.8, 0.8, shaftD + 0.8), limestoneTrimMat);
                    midCornice.position.y = podH + shaftH * 0.5;
                    buildingGroup.add(midCornice);

                    // Tier 3: Upper Attic Story with Classical Balustrade
                    const atticY = podH + shaftH;
                    const atticW = shaftW * 0.88;
                    const atticD = shaftD * 0.88;
                    const atticH = 10.0;

                    // Projecting heavy attic cornice
                    const atticCornice = new THREE.Mesh(new THREE.BoxGeometry(shaftW + 1.8, 1.4, shaftD + 1.8), limestoneTrimMat);
                    atticCornice.position.y = atticY + 0.7;
                    atticCornice.castShadow = true;
                    buildingGroup.add(atticCornice);

                    // Attic block
                    const attic = new THREE.Mesh(new THREE.BoxGeometry(atticW, atticH, atticD), beauxMat);
                    attic.position.y = atticY + 1.4 + atticH * 0.5;
                    attic.castShadow = true;
                    buildingGroup.add(attic);

                    // 4 Corner miniature cupola turrets on attic roof
                    const turretH = 6.0;
                    const turretR = 1.6;
                    const turretGeom = new THREE.CylinderGeometry(turretR, turretR, turretH, 12);
                    const turretDomeGeom = new THREE.SphereGeometry(turretR * 1.1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
                    const tOffX = atticW * 0.44;
                    const tOffZ = atticD * 0.44;
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                        const t = new THREE.Mesh(turretGeom, limestoneTrimMat);
                        t.position.set(ox * tOffX, atticY + 1.4 + atticH + turretH * 0.5, oz * tOffZ);
                        buildingGroup.add(t);
                        const td = new THREE.Mesh(turretDomeGeom, copperDarkMat);
                        td.position.set(ox * tOffX, atticY + 1.4 + atticH + turretH, oz * tOffZ);
                        buildingGroup.add(td);
                    });

                    // Tier 4: Grand Ribbed Mansard Dome & Cupola Spire (Iconic Crown from Photo 3!)
                    const domeY = atticY + 1.4 + atticH;
                    const domeRadius = atticW * 0.42;
                    const domeH = 14.0;

                    // Mansard dome base cylinder (octagonal/ribbed profile)
                    const dome = new THREE.Mesh(new THREE.CylinderGeometry(domeRadius * 0.65, domeRadius, domeH, 16), copperDarkMat);
                    dome.position.y = domeY + domeH * 0.5;
                    dome.castShadow = true;
                    buildingGroup.add(dome);

                    // Classical Lantern Cupola on top of dome
                    const lanternY = domeY + domeH;
                    const lanternR = domeRadius * 0.38;
                    const lanternH = 6.0;
                    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(lanternR, lanternR, lanternH, 12), limestoneTrimMat);
                    lantern.position.y = lanternY + lanternH * 0.5;
                    lantern.castShadow = true;
                    buildingGroup.add(lantern);

                    // Crowning Needle Spire & Golden Apex Finial
                    const spireH = 12.0;
                    const spire = new THREE.Mesh(new THREE.ConeGeometry(lanternR * 0.7, spireH, 8), copperRoofMat);
                    spire.position.y = lanternY + lanternH + spireH * 0.5;
                    buildingGroup.add(spire);

                    const goldBall = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), goldFinialMat);
                    goldBall.position.y = lanternY + lanternH + spireH + 0.6;
                    buildingGroup.add(goldBall);

                } else {
                    // =========================================================================
                    // STYLE 4: Neo-Gothic Cathedral Skyscraper with Pinnacle Spire (Photo 4)
                    // =========================================================================
                    width = 44 + Math.random() * 8;
                    depth = 44 + Math.random() * 8;
                    totalHeight = 130 + Math.random() * 55; // 130m - 185m soaring Gothic cathedral

                    // Sidewalk plinth
                    const curb = new THREE.Mesh(new THREE.BoxGeometry(width + 4.0, 0.4, depth + 4.0), concreteMat);
                    curb.position.y = 0.2;
                    curb.receiveShadow = true;
                    buildingGroup.add(curb);

                    // Tier 1 & 2: Wide Base & Symmetrical Shoulder Pavilions (from ground to ~52% height)
                    const baseH = totalHeight * 0.50;
                    const baseBlock = new THREE.Mesh(new THREE.BoxGeometry(width, baseH, depth), gothicMat);
                    baseBlock.position.y = baseH * 0.5;
                    baseBlock.castShadow = true;
                    buildingGroup.add(baseBlock);

                    // Continuous vertical Gothic buttress piers on corners
                    const pierW = 1.6;
                    const pierGeom = new THREE.BoxGeometry(pierW, baseH, pierW);
                    const pOffX = (width - pierW) * 0.5;
                    const pOffZ = (depth - pierW) * 0.5;
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                        const pier = new THREE.Mesh(pierGeom, limestoneTrimMat);
                        pier.position.set(ox * pOffX, baseH * 0.5, oz * pOffZ);
                        buildingGroup.add(pier);
                    });

                    // Stepped Side Shoulder Pavilions with Patinated Green Copper Mansard Roofs
                    const shoulderW = (width - width * 0.62) * 0.5;
                    const shoulderRoofH = 6.0;
                    const sRoofGeom = new THREE.BoxGeometry(shoulderW, shoulderRoofH, depth);
                    const sRoofL = new THREE.Mesh(sRoofGeom, copperRoofMat);
                    sRoofL.position.set(-width * 0.5 + shoulderW * 0.5, baseH + shoulderRoofH * 0.5, 0);
                    buildingGroup.add(sRoofL);

                    const sRoofR = new THREE.Mesh(sRoofGeom, copperRoofMat);
                    sRoofR.position.set(width * 0.5 - shoulderW * 0.5, baseH + shoulderRoofH * 0.5, 0);
                    buildingGroup.add(sRoofR);

                    // Tier 3: Slender Soaring Central Tower Shaft
                    const towerY = baseH;
                    const towerH = totalHeight * 0.32;
                    const towerW = width * 0.62;
                    const towerD = depth * 0.62;
                    const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), gothicMat);
                    tower.position.y = towerY + towerH * 0.5;
                    tower.castShadow = true;
                    buildingGroup.add(tower);

                    // Vertical buttresses on central tower
                    const tPierGeom = new THREE.BoxGeometry(1.2, towerH, 1.2);
                    const tpOffX = (towerW - 1.2) * 0.5;
                    const tpOffZ = (towerD - 1.2) * 0.5;
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                        const tp = new THREE.Mesh(tPierGeom, limestoneTrimMat);
                        tp.position.set(ox * tpOffX, towerY + towerH * 0.5, oz * tpOffZ);
                        buildingGroup.add(tp);
                    });

                    // Tier 4: Spectacular Gothic Cathedral Crown & Copper Pinnacle Spire (from Photo 4!)
                    const crownY = towerY + towerH;
                    const crownW = towerW * 0.88;
                    const crownD = towerD * 0.88;
                    const crownBaseH = 5.0;

                    // Gothic parapet transition gallery
                    const gallery = new THREE.Mesh(new THREE.BoxGeometry(crownW, crownBaseH, crownD), gothicMat);
                    gallery.position.y = crownY + crownBaseH * 0.5;
                    gallery.castShadow = true;
                    buildingGroup.add(gallery);

                    // 4 Corner Tourelle / Spire Pinnacles
                    const spireR = 1.4;
                    const cornerSpireH = 9.0;
                    const csGeom = new THREE.ConeGeometry(spireR, cornerSpireH, 8);
                    const csOffX = crownW * 0.45;
                    const csOffZ = crownD * 0.45;
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                        const cs = new THREE.Mesh(csGeom, copperRoofMat);
                        cs.position.set(ox * csOffX, crownY + crownBaseH + cornerSpireH * 0.5, oz * csOffZ);
                        buildingGroup.add(cs);
                    });

                    // Monumental Central Copper-Green Gothic Pyramidal Pinnacle Spire!
                    const pinnacleH = totalHeight - (crownY + crownBaseH);
                    const pinnacleR = crownW * 0.42;
                    const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(pinnacleR, pinnacleH, 8), copperRoofMat);
                    pinnacle.position.y = crownY + crownBaseH + pinnacleH * 0.5;
                    pinnacle.castShadow = true;
                    buildingGroup.add(pinnacle);

                    // Gilded Apex Finial Cross / Needle
                    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.6, 5.0, 6), goldFinialMat);
                    finial.position.y = crownY + crownBaseH + pinnacleH + 2.5;
                    buildingGroup.add(finial);
                }

                this.scene.add(buildingGroup);

                this.colliders.push({
                    type: 'box',
                    minX: bx - width / 2,
                    maxX: bx + width / 2,
                    minZ: bz - depth / 2,
                    maxZ: bz + depth / 2,
                    y: by,
                    height: totalHeight
                });
            }
        }
    }

    // 1b. Historic Brick Apartment & Loft District (Shorter, Wider Buildings Modeled on Reference Photos)
    buildApartments() {
        const tg = window.textureGenerator;

        // Specialized Apartment Textures matching user photos
        const loftTex = tg && tg.createIndustrialLoftTexture ? tg.createIndustrialLoftTexture(512, 512) : null;
        if (loftTex) { loftTex.wrapS = THREE.RepeatWrapping; loftTex.wrapT = THREE.RepeatWrapping; loftTex.repeat.set(2, 1); }

        const fireEscapeTex = tg && tg.createFireEscapeApartmentTexture ? tg.createFireEscapeApartmentTexture(512, 512) : null;
        if (fireEscapeTex) { fireEscapeTex.wrapS = THREE.RepeatWrapping; fireEscapeTex.wrapT = THREE.RepeatWrapping; fireEscapeTex.repeat.set(2, 1); }

        const brownstoneTex = tg && tg.createBrownstoneApartmentTexture ? tg.createBrownstoneApartmentTexture(512, 512) : null;
        if (brownstoneTex) { brownstoneTex.wrapS = THREE.RepeatWrapping; brownstoneTex.wrapT = THREE.RepeatWrapping; brownstoneTex.repeat.set(2, 1); }

        const rusticatedTex = tg && tg.createRusticatedStoneTexture ? tg.createRusticatedStoneTexture(512, 512) : null;
        if (rusticatedTex) { rusticatedTex.wrapS = THREE.RepeatWrapping; rusticatedTex.wrapT = THREE.RepeatWrapping; rusticatedTex.repeat.set(2, 1); }

        // Materials
        const loftMat = new THREE.MeshStandardMaterial({ map: loftTex, roughness: 0.82, metalness: 0.15 });
        const fireEscapeMat = new THREE.MeshStandardMaterial({ map: fireEscapeTex, roughness: 0.78, metalness: 0.15 });
        const brownstoneMat = new THREE.MeshStandardMaterial({ map: brownstoneTex, roughness: 0.75, metalness: 0.2 });
        const rusticatedMat = new THREE.MeshStandardMaterial({ map: rusticatedTex, roughness: 0.88, metalness: 0.1 });
        const ironBlackMat = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.45, metalness: 0.85 });
        const brickTrimMat = new THREE.MeshStandardMaterial({ color: 0x5a2418, roughness: 0.85, metalness: 0.1 });
        const sandstoneTrimMat = new THREE.MeshStandardMaterial({ color: 0x9b9080, roughness: 0.7, metalness: 0.1 });
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0x2e3036, roughness: 0.9, metalness: 0.1 });
        const roofGravelMat = new THREE.MeshStandardMaterial({ color: 0x3d3f44, roughness: 0.9, metalness: 0.1 });

        // Compact Apartment site placements directly bordering the downtown skyscraper blocks
        const apartmentSites = [
            // South Historic Apartment & Loft District (Directly South of Street 5 at z=-30, framed by Street 6 at z=36)
            { x: -282, z: 3, rot: 0, style: 0, width: 56, depth: 26, height: 20 }, // Style A: Warehouse Loft with Tower (Photo 0)
            { x: -210, z: 3, rot: 0, style: 1, width: 52, depth: 24, height: 22 }, // Style B: Red Brick with Fire Escape (Photo 1)
            { x: -138, z: 3, rot: 0, style: 2, width: 48, depth: 24, height: 18 }, // Style C: Ornate Brownstone with Balconies (Photo 2)
            { x: -66,  z: 3, rot: 0, style: 0, width: 56, depth: 26, height: 20 }, // Style A: Warehouse Loft with Tower (Photo 0)

            // West Avenue A residential frontage (Directly West across Avenue A from downtown skyscrapers)
            { x: -354, z: -210, rot: Math.PI / 2, style: 1, width: 52, depth: 24, height: 22 }, // Style B (Photo 1)
            { x: -354, z: -138, rot: Math.PI / 2, style: 2, width: 48, depth: 24, height: 18 }, // Style C (Photo 2)

            // Central Park Plaza frontage (inside the central park square)
            { x: -210, z: -210, rot: 0, style: 1, width: 52, depth: 24, height: 22 }  // Style B (Photo 1)
        ];

        for (const site of apartmentSites) {
            const by = this.terrain.getHeight(site.x, site.z);
            const group = new THREE.Group();
            group.position.set(site.x, by, site.z);
            group.rotation.y = site.rot;

            const w = site.width;
            const d = site.depth;
            const h = site.height;

            // Concrete Sidewalk Base Plinth
            const curb = new THREE.Mesh(new THREE.BoxGeometry(w + 4.0, 0.4, d + 4.0), concreteMat);
            curb.position.y = 0.2;
            curb.receiveShadow = true;
            group.add(curb);

            if (site.style === 0) {
                // =====================================================================
                // STYLE A: Industrial Warehouse / Factory Loft with Corner Tower (Photo 0)
                // =====================================================================
                // Main wide 4-story loft building
                const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), loftMat);
                mainBody.position.y = h * 0.5;
                mainBody.castShadow = true;
                mainBody.receiveShadow = true;
                group.add(mainBody);

                // Brick corbel table parapet along the roof perimeter
                const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 1.4, d + 0.8), brickTrimMat);
                parapet.position.y = h + 0.7;
                group.add(parapet);

                // Flat gravel roof
                const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.2, d - 0.4), roofGravelMat);
                roof.position.y = h + 0.1;
                group.add(roof);

                // Iconic Raised Corner Tower (Photo 0!)
                const towerW = 10.0;
                const towerD = 10.0;
                const towerH = h + 8.0; // Rises 8 meters above the roof
                const towerX = (w - towerW) * 0.5;
                const towerZ = (d - towerD) * 0.5;

                const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), loftMat);
                tower.position.set(towerX, towerH * 0.5, towerZ);
                tower.castShadow = true;
                group.add(tower);

                // Crenellated / battlement parapet on tower
                const towerCap = new THREE.Mesh(new THREE.BoxGeometry(towerW + 0.8, 1.2, towerD + 0.8), brickTrimMat);
                towerCap.position.set(towerX, towerH + 0.6, towerZ);
                group.add(towerCap);

                // 4 Corner crenellation merlons
                const merlonGeom = new THREE.BoxGeometry(2.2, 1.6, 2.2);
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oz]) => {
                    const m = new THREE.Mesh(merlonGeom, brickTrimMat);
                    m.position.set(towerX + ox * (towerW * 0.5 - 1.1), towerH + 1.8, towerZ + oz * (towerD * 0.5 - 1.1));
                    group.add(m);
                });

                // Industrial roof skylights
                const skylightGeom = new THREE.BoxGeometry(8, 1.5, 4);
                const sky1 = new THREE.Mesh(skylightGeom, ironBlackMat);
                sky1.position.set(-w * 0.25, h + 0.75, 0);
                group.add(sky1);
                const sky2 = new THREE.Mesh(skylightGeom, ironBlackMat);
                sky2.position.set(0, h + 0.75, -d * 0.2);
                group.add(sky2);

            } else if (site.style === 1) {
                // =====================================================================
                // STYLE B: Classic Red Brick Apartment with Black Fire Escape (Photo 1)
                // =====================================================================
                // Main wide 5-story brick apartment building
                const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fireEscapeMat);
                mainBody.position.y = h * 0.5;
                mainBody.castShadow = true;
                mainBody.receiveShadow = true;
                group.add(mainBody);

                // Brick dentil cornice & parapet
                const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 1.4, d + 0.8), brickTrimMat);
                parapet.position.y = h + 0.7;
                group.add(parapet);

                // Roof gravel bed
                const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.2, d - 0.4), roofGravelMat);
                roof.position.y = h + 0.1;
                group.add(roof);

                // Authentic Black Metal Exterior Fire Escape (Photo 1!)
                // 4 stacked floor levels with iron platform trays, railings, and zigzag ladders
                const feLevels = 4;
                const feFloorH = (h - 4) / feLevels;
                const fePlatW = 6.5;
                const fePlatD = 2.4;
                const feZ = d * 0.5 + fePlatD * 0.5;

                for (let level = 0; level < feLevels; level++) {
                    const platY = 4.0 + (level + 1) * feFloorH;

                    // Metal grated platform
                    const plat = new THREE.Mesh(new THREE.BoxGeometry(fePlatW, 0.2, fePlatD), ironBlackMat);
                    plat.position.set(0, platY, feZ);
                    group.add(plat);

                    // Perimeter safety handrails
                    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(fePlatW, 1.0, 0.08), ironBlackMat);
                    frontRail.position.set(0, platY + 0.5, feZ + fePlatD * 0.5);
                    group.add(frontRail);

                    const sideRailL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, fePlatD), ironBlackMat);
                    sideRailL.position.set(-fePlatW * 0.5, platY + 0.5, feZ);
                    group.add(sideRailL);

                    const sideRailR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, fePlatD), ironBlackMat);
                    sideRailR.position.set(fePlatW * 0.5, platY + 0.5, feZ);
                    group.add(sideRailR);

                    // Zigzag diagonal ladder connecting down to next floor
                    const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.6, feFloorH * 1.15, 0.1), ironBlackMat);
                    const angle = (level % 2 === 0 ? 0.35 : -0.35);
                    ladder.rotation.z = angle;
                    ladder.position.set((level % 2 === 0 ? -1.2 : 1.2), platY - feFloorH * 0.5, feZ + 0.4);
                    group.add(ladder);
                }

                // Vertical dark iron drainage downspouts flanking the windows
                const pipeGeom = new THREE.CylinderGeometry(0.12, 0.12, h, 8);
                [-w * 0.35, -w * 0.18, w * 0.18, w * 0.35].forEach((px) => {
                    const pipe = new THREE.Mesh(pipeGeom, ironBlackMat);
                    pipe.position.set(px, h * 0.5, d * 0.5 + 0.15);
                    group.add(pipe);
                });

            } else {
                // =====================================================================
                // STYLE C: Ornate Brownstone Luxury Apartments with Balconies (Photo 2)
                // =====================================================================
                // Ground Floor: Rusticated stone foundation arcade (5m height)
                const groundH = 5.0;
                const groundBase = new THREE.Mesh(new THREE.BoxGeometry(w, groundH, d), rusticatedMat);
                groundBase.position.y = groundH * 0.5;
                groundBase.castShadow = true;
                group.add(groundBase);

                // Upper Stories: Warm honey-orange brick (13m height)
                const upperH = h - groundH;
                const upperBody = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, upperH, d * 0.98), brownstoneMat);
                upperBody.position.y = groundH + upperH * 0.5;
                upperBody.castShadow = true;
                group.add(upperBody);

                // Classical stone stringcourse dividing base from upper brick
                const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.8, d + 0.6), sandstoneTrimMat);
                belt.position.y = groundH + 0.4;
                group.add(belt);

                // Wrought-Iron Balcony Railings across the front facade (Photo 2!)
                const balconyLevels = [groundH + 4.0, groundH + 8.2, groundH + 12.4];
                const balcZ = d * 0.5 + 0.9;
                for (const bY of balconyLevels) {
                    // Center grand balcony tray
                    const trayC = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.25, 1.8), ironBlackMat);
                    trayC.position.set(0, bY, balcZ);
                    group.add(trayC);

                    const railC = new THREE.Mesh(new THREE.BoxGeometry(11.0, 1.0, 0.08), ironBlackMat);
                    railC.position.set(0, bY + 0.5, balcZ + 0.9);
                    group.add(railC);

                    // Left & right wing balconies
                    [-w * 0.28, w * 0.28].forEach((bx) => {
                        const tray = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 1.4), ironBlackMat);
                        tray.position.set(bx, bY, balcZ - 0.2);
                        group.add(tray);

                        const rail = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.9, 0.08), ironBlackMat);
                        rail.position.set(bx, bY + 0.45, balcZ + 0.5);
                        group.add(rail);
                    });
                }

                // Parapet roof cornice
                const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 1.2, d + 0.8), brickTrimMat);
                parapet.position.y = h + 0.6;
                group.add(parapet);

                // Iconic Arched Center Roof Pediment Crown (Photo 2!)
                const pedimentW = 14.0;
                const pedimentD = 2.0;
                const pedArch = new THREE.Mesh(new THREE.CylinderGeometry(pedimentW * 0.5, pedimentW * 0.5, pedimentD, 16, 1, false, 0, Math.PI), sandstoneTrimMat);
                pedArch.rotation.z = Math.PI * 0.5;
                pedArch.rotation.x = Math.PI * 0.5;
                pedArch.position.set(0, h + 1.2, d * 0.5 - 0.5);
                group.add(pedArch);
            }

            this.scene.add(group);

            // Register exact 3D bounding collision box
            const collW = (site.rot === 0) ? w : d;
            const collD = (site.rot === 0) ? d : w;
            this.colliders.push({
                type: 'box',
                minX: site.x - collW / 2,
                maxX: site.x + collW / 2,
                minZ: site.z - collD / 2,
                maxZ: site.z + collD / 2,
                y: by,
                height: h + 8.0
            });
        }
    }

    // Stunt Obstacles (2x Bigger, Spread 6x Across the Map, 72m Tall 18m Wide Mega Loop)
    buildStuntPark() {
        const tg = window.textureGenerator;
        const hazardTex = tg ? tg.createHazardStripeTexture(512, 128) : null;
        if (hazardTex) {
            hazardTex.repeat.set(8, 1);
        }
        const trackTex = tg ? tg.createStuntTrackTexture(512, 512) : null;
        if (trackTex) {
            trackTex.repeat.set(2, 24);
        }
        const wallTex = tg ? tg.createWallRideTexture(512, 512) : null;
        if (wallTex) {
            wallTex.repeat.set(8, 2);
        }

        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x2c3038,
            metalness: 0.85,
            roughness: 0.25
        });
        const steelTrussMat = new THREE.MeshStandardMaterial({
            color: 0xef7a15, // Stunt vibrant orange
            metalness: 0.7,
            roughness: 0.35
        });
        const hazardMat = new THREE.MeshStandardMaterial({
            map: hazardTex,
            roughness: 0.5,
            metalness: 0.2
        });
        const trackMat = new THREE.MeshStandardMaterial({
            map: trackTex,
            roughness: 0.35,
            metalness: 0.25,
            side: THREE.DoubleSide
        });
        const wallRideMat = new THREE.MeshStandardMaterial({
            map: wallTex,
            roughness: 0.4,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        const concreteBarrierMat = new THREE.MeshStandardMaterial({
            color: 0xb5b8bf,
            roughness: 0.9,
            metalness: 0.1
        });
        const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
        const neonOrangeMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const cautionYellowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

        // =========================================================================
        // 1. 360° MEGA STUNT LOOP (3x BIGGER: 72m TALL, 2x WIDER: 18m WIDE)
        // Located in South-East Off-Road Plains at (420, 480)
        // =========================================================================
        const loopX = 420;
        const loopZ = 480;
        const loopYBase = 16.0;
        const loopR = 36.0;  // 72 meters tall!
        const loopW = 18.0;  // 18 meters wide (2x wider)!
        const loopOffset = 22.0; // Lateral corkscrew offset between entrance and exit

        this.stuntLoops.push({
            x: loopX,
            z: loopZ,
            yBase: loopYBase,
            radius: loopR,
            width: loopW,
            rotation: 0,
            xOffset: loopOffset
        });

        // 72-Meter 360° Ribbon Track Mesh
        const loopSegs = 96;
        const loopWidthSegs = 8;
        const loopGeo = new THREE.BufferGeometry();
        const loopPos = [];
        const loopUvs = [];
        const loopIndices = [];

        for (let i = 0; i <= loopSegs; i++) {
            const theta = (i / loopSegs) * Math.PI * 2;
            const y = loopYBase + loopR * (1.0 - Math.cos(theta));
            const z = loopZ + loopR * Math.sin(theta);
            const xCenter = loopX + loopOffset * (i / loopSegs);

            for (let j = 0; j <= loopWidthSegs; j++) {
                const u = j / loopWidthSegs;
                const x = xCenter + (u - 0.5) * loopW;
                loopPos.push(x, y, z);
                loopUvs.push(u, (i / loopSegs) * 24);
            }
        }

        const stride = loopWidthSegs + 1;
        for (let i = 0; i < loopSegs; i++) {
            for (let j = 0; j < loopWidthSegs; j++) {
                const a = i * stride + j;
                const b = (i + 1) * stride + j;
                const c = (i + 1) * stride + (j + 1);
                const d = i * stride + (j + 1);
                loopIndices.push(a, b, d);
                loopIndices.push(b, c, d);
            }
        }

        loopGeo.setAttribute('position', new THREE.Float32BufferAttribute(loopPos, 3));
        loopGeo.setAttribute('uv', new THREE.Float32BufferAttribute(loopUvs, 2));
        loopGeo.setIndex(loopIndices);
        loopGeo.computeVertexNormals();

        const loopMesh = new THREE.Mesh(loopGeo, trackMat);
        loopMesh.castShadow = true;
        loopMesh.receiveShadow = true;
        this.scene.add(loopMesh);

        // Entrance Runway (110m long, 20m wide - perfectly flush with loop entrance)
        const enterRunwayL = 110.0;
        const enterRunwayGeo = new THREE.PlaneGeometry(loopW + 2.0, enterRunwayL);
        enterRunwayGeo.rotateX(-Math.PI / 2);
        const enterRunway = new THREE.Mesh(enterRunwayGeo, trackMat);
        enterRunway.position.set(loopX, loopYBase + 0.08, loopZ - enterRunwayL * 0.5);
        this.scene.add(enterRunway);

        // Runway Boost Strip Pads (Glowing Neon Orange acceleration strips)
        for (let b = 0; b < 4; b++) {
            const bz = loopZ - 90 + b * 22;
            const pad = new THREE.Mesh(new THREE.BoxGeometry(loopW * 0.7, 0.15, 6.0), neonOrangeMat);
            pad.position.set(loopX, loopYBase + 0.12, bz);
            this.scene.add(pad);
            // Flanking chevrons
            const chL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 5.0), neonCyanMat);
            chL.position.set(loopX - loopW * 0.42, loopYBase + 0.15, bz);
            this.scene.add(chL);
            const chR = chL.clone();
            chR.position.x = loopX + loopW * 0.42;
            this.scene.add(chR);
        }

        // Exit Runway (110m long, 20m wide - perfectly flush with loop exit)
        const exitRunwayL = 110.0;
        const exitRunwayGeo = new THREE.PlaneGeometry(loopW + 2.0, exitRunwayL);
        exitRunwayGeo.rotateX(-Math.PI / 2);
        const exitRunway = new THREE.Mesh(exitRunwayGeo, trackMat);
        exitRunway.position.set(loopX + loopOffset, loopYBase + 0.08, loopZ + exitRunwayL * 0.5);
        this.scene.add(exitRunway);

        // Giant 72-Meter Structural Support Arches
        for (let a = 0; a < 8; a++) {
            const archTheta = (a / 7) * Math.PI * 1.65 + 0.15;
            const ay = loopYBase + loopR * (1.0 - Math.cos(archTheta));
            const az = loopZ + loopR * Math.sin(archTheta);
            const ax = loopX + loopOffset * (archTheta / (Math.PI * 2));

            const archFrame = new THREE.Mesh(new THREE.TorusGeometry(loopR + 1.2, 0.7, 8, 32, Math.PI), steelTrussMat);
            archFrame.position.set(ax, loopYBase + loopR, az);
            archFrame.rotation.y = Math.PI / 2;
            this.scene.add(archFrame);

            // Ground support pillars
            const pilH = Math.max(1.0, ay - loopYBase);
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, pilH, 8), metalMat);
            pillar.position.set(ax + loopW * 0.5 + 2.0, loopYBase + pilH * 0.5, az);
            this.scene.add(pillar);

            const pillar2 = pillar.clone();
            pillar2.position.set(ax - loopW * 0.5 - 2.0, loopYBase + pilH * 0.5, az);
            this.scene.add(pillar2);
        }

        // Loop Entrance Overhead Gantry at start of runway
        const gantry = new THREE.Group();
        const gantryPost1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, 1.6), steelTrussMat);
        gantryPost1.position.set(-loopW * 0.5 - 2.0, 8, 0);
        const gantryPost2 = gantryPost1.clone();
        gantryPost2.position.set(loopW * 0.5 + 2.0, 8, 0);
        const gantryCross = new THREE.Mesh(new THREE.BoxGeometry(loopW + 6.0, 2.8, 1.6), steelTrussMat);
        gantryCross.position.set(0, 15, 0);
        const gantrySign = new THREE.Mesh(new THREE.BoxGeometry(loopW - 2.0, 2.0, 0.4), neonCyanMat);
        gantrySign.position.set(0, 15, 0.9);
        gantry.add(gantryPost1, gantryPost2, gantryCross, gantrySign);
        gantry.position.set(loopX, loopYBase, loopZ - enterRunwayL);
        this.scene.add(gantry);

        // =========================================================================
        // 2. CURVED BANKED WALL RIDE (2x BIGGER: 24m HIGH, 32m WIDE BANKING)
        // Located 412 meters away at (220, 120)
        // =========================================================================
        const wallCx = 220;
        const wallCz = 120;
        const wallYBase = 10.0;
        const wallRIn = 36.0;   // 2x bigger (was 18)
        const wallROut = 68.0;  // 2x bigger (was 34)
        const wallH = 24.0;     // 2x bigger (was 12)
        const wallStartA = -Math.PI * 0.35;
        const wallEndA = Math.PI * 0.45;
        const wallArc = wallEndA - wallStartA;

        this.wallRides.push({
            cx: wallCx,
            cz: wallCz,
            yBase: wallYBase,
            rIn: wallRIn,
            rOut: wallROut,
            height: wallH,
            startAngle: wallStartA,
            endAngle: wallEndA
        });

        // 24m High Banked Wall Surface Geometry
        const wallRadialSegs = 18;
        const wallArcSegs = 48;
        const wallGeo = new THREE.BufferGeometry();
        const wallPos = [];
        const wallUvs = [];
        const wallIndices = [];

        for (let i = 0; i <= wallArcSegs; i++) {
            const angle = wallStartA + (i / wallArcSegs) * wallArc;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            for (let j = 0; j <= wallRadialSegs; j++) {
                const u = j / wallRadialSegs;
                const r = wallRIn + u * (wallROut - wallRIn);
                const y = wallYBase + wallH * Math.pow(u, 1.8);
                const x = wallCx + r * cosA;
                const z = wallCz + r * sinA;

                wallPos.push(x, y, z);
                wallUvs.push((i / wallArcSegs) * 16, u * 2);
            }
        }

        const wallStride = wallRadialSegs + 1;
        for (let i = 0; i < wallArcSegs; i++) {
            for (let j = 0; j < wallRadialSegs; j++) {
                const a = i * wallStride + j;
                const b = (i + 1) * wallStride + j;
                const c = (i + 1) * wallStride + (j + 1);
                const d = i * wallStride + (j + 1);
                wallIndices.push(a, b, d);
                wallIndices.push(b, c, d);
            }
        }

        wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallPos, 3));
        wallGeo.setAttribute('uv', new THREE.Float32BufferAttribute(wallUvs, 2));
        wallGeo.setIndex(wallIndices);
        wallGeo.computeVertexNormals();

        const wallMesh = new THREE.Mesh(wallGeo, wallRideMat);
        wallMesh.receiveShadow = true;
        this.scene.add(wallMesh);

        // Top Rim Safety Guardrail & Outer Barrier along r = wallROut
        for (let i = 0; i <= 28; i++) {
            const angle = wallStartA + (i / 28) * wallArc;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const bx = wallCx + wallROut * cosA;
            const bz = wallCz + wallROut * sinA;
            const by = wallYBase + wallH;

            // Outer rim collider
            this.colliders.push({
                type: 'cylinder',
                x: bx,
                z: bz,
                radius: 3.5
            });

            // Guardrail post (2x bigger)
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4.5), metalMat);
            post.position.set(bx, by + 2.25, bz);
            this.scene.add(post);

            // Steel buttress bracing behind the curved wall
            const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, wallH * 1.3), steelTrussMat);
            buttress.position.set(wallCx + (wallROut + 5.0) * cosA, wallYBase + wallH * 0.5, wallCz + (wallROut + 5.0) * sinA);
            buttress.rotation.y = angle;
            buttress.rotation.x = 0.55;
            this.scene.add(buttress);
        }

        // =========================================================================
        // 3. STUNT MEGA DROP PLATFORM (2x BIGGER: 21m HIGH, 80m LONG, 44m WIDE)
        // Located 376m from Wall Ride & 607m from Loop at (510, -120)
        // =========================================================================
        const dropX = 510;
        const dropZ = -120;
        const dropYBase = 19.5;
        const dropL = 80.0;  // 2x bigger (was 40)
        const dropW = 44.0;  // 2x bigger (was 22)
        const dropH = 21.0;  // 2x bigger (was 10.5m)
        const dropRampLen = 44.0;

        this.ramps.push({
            type: 'drop',
            x: dropX,
            z: dropZ,
            yBase: dropYBase,
            rotation: 0,
            length: dropL,
            width: dropW,
            height: dropH,
            rampLen: dropRampLen,
            isDrop: true
        });

        // 44m Long Drive-up Approach Ramp Mesh
        const dropApproach = new THREE.Mesh(new THREE.BoxGeometry(dropW, 1.4, dropRampLen), trackMat);
        dropApproach.position.set(dropX, dropYBase + dropH * 0.5, dropZ - 18.0);
        dropApproach.rotation.x = Math.atan2(dropH, dropRampLen);
        this.scene.add(dropApproach);

        // 36m Long x 44m Wide High Platform Deck Mesh
        const dropDeck = new THREE.Mesh(new THREE.BoxGeometry(dropW, 2.0, dropL - dropRampLen), trackMat);
        dropDeck.position.set(dropX, dropYBase + dropH - 1.0, dropZ + 22.0);
        this.scene.add(dropDeck);

        // Sheer 21-Meter Vertical Drop Cliff Face
        const dropFace = new THREE.Mesh(new THREE.BoxGeometry(dropW, dropH, 2.0), hazardMat);
        dropFace.position.set(dropX, dropYBase + dropH * 0.5, dropZ + 40.0);
        this.scene.add(dropFace);

        // Heavy Support Pillars (21m tall)
        const dropPillars = [
            { x: dropX - dropW * 0.45, z: dropZ + 8 },
            { x: dropX + dropW * 0.45, z: dropZ + 8 },
            { x: dropX - dropW * 0.45, z: dropZ + 36 },
            { x: dropX + dropW * 0.45, z: dropZ + 36 }
        ];
        for (const dp of dropPillars) {
            const pil = new THREE.Mesh(new THREE.BoxGeometry(2.5, dropH, 2.5), metalMat);
            pil.position.set(dp.x, dropYBase + dropH * 0.5, dp.z);
            this.scene.add(pil);
            this.colliders.push({ type: 'cylinder', x: dp.x, z: dp.z, radius: 2.0 });
        }

        // Flashing Warning Beacons at Drop Lip
        const beaconL = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 6.0), metalMat);
        beaconL.position.set(dropX - dropW * 0.48, dropYBase + dropH + 3.0, dropZ + 39.0);
        const beaconLightL = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), neonOrangeMat);
        beaconLightL.position.set(0, 3.5, 0);
        beaconL.add(beaconLightL);
        const beaconR = beaconL.clone();
        beaconR.position.set(dropX + dropW * 0.48, dropYBase + dropH + 3.0, dropZ + 39.0);
        this.scene.add(beaconL, beaconR);

        // =========================================================================
        // 4. MEGA KICKER LAUNCH RAMP (2x BIGGER: 15m HIGH, 56m LONG, 32m WIDE)
        // Located 386m from Drop Platform at (180, -320)
        // =========================================================================
        const kickerX = 180;
        const kickerZ = -320;
        const kickerYBase = 13.5;
        const kickerL = 56.0; // 2x bigger (was 28)
        const kickerW = 32.0; // 2x bigger (was 16)
        const kickerH = 15.0; // 2x bigger (was 7.5)

        this.ramps.push({
            type: 'kicker',
            x: kickerX,
            z: kickerZ,
            yBase: kickerYBase,
            rotation: 0, // facing +Z launch
            length: kickerL,
            width: kickerW,
            height: kickerH,
            isJump: true,
            launchPitch: 0.44
        });

        // 15m High Kicker Ramp 3D Mesh
        const kickerGeo = new THREE.BufferGeometry();
        const kPos = [];
        const kUvs = [];
        const kIndices = [];
        const kSegs = 28;

        for (let i = 0; i <= kSegs; i++) {
            const t = i / kSegs;
            const localZ = (t - 0.5) * kickerL;
            const y = kickerYBase + kickerH * Math.pow(t, 1.4);

            for (let j = 0; j <= 6; j++) {
                const u = j / 6;
                const localX = (u - 0.5) * kickerW;
                kPos.push(kickerX + localX, y, kickerZ + localZ);
                kUvs.push(u, t * 12);
            }
        }
        for (let i = 0; i < kSegs; i++) {
            for (let j = 0; j < 6; j++) {
                const a = i * 7 + j;
                const b = (i + 1) * 7 + j;
                const c = (i + 1) * 7 + (j + 1);
                const d = i * 7 + (j + 1);
                kIndices.push(a, b, d);
                kIndices.push(b, c, d);
            }
        }
        kickerGeo.setAttribute('position', new THREE.Float32BufferAttribute(kPos, 3));
        kickerGeo.setAttribute('uv', new THREE.Float32BufferAttribute(kUvs, 2));
        kickerGeo.setIndex(kIndices);
        kickerGeo.computeVertexNormals();

        const kickerMesh = new THREE.Mesh(kickerGeo, trackMat);
        kickerMesh.castShadow = true;
        kickerMesh.receiveShadow = true;
        this.scene.add(kickerMesh);

        // Kicker Side Rails & Undercarriage Walls (2x bigger)
        const kickerSide1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, kickerH, kickerL), hazardMat);
        kickerSide1.position.set(kickerX - kickerW * 0.5 - 0.6, kickerYBase + kickerH * 0.5, kickerZ);
        const kickerSide2 = kickerSide1.clone();
        kickerSide2.position.set(kickerX + kickerW * 0.5 + 0.6, kickerYBase + kickerH * 0.5, kickerZ);
        this.scene.add(kickerSide1, kickerSide2);

        // =========================================================================
        // 5. GAP JUMP WITH DOWNSLOPE LANDING (2x BIGGER: 32m LAUNCH, 48m GAP, 36m LANDING)
        // Located 323m from Mega Kicker at (-120, -430)
        // =========================================================================
        const gapX = -120;
        const gapYBase = 21.0;
        const gapLaunchZ = -465;
        const gapLandZ = -395;
        const gapW = 24.0;
        const gapH = 9.6;

        // Gap Launch Ramp
        this.ramps.push({
            type: 'ramp',
            x: gapX,
            z: gapLaunchZ,
            yBase: gapYBase,
            rotation: 0,
            length: 32.0,
            width: gapW,
            height: gapH,
            isJump: true,
            launchPitch: 0.32
        });
        const gapLaunchMesh = new THREE.Mesh(new THREE.BoxGeometry(gapW, gapH, 32.0), trackMat);
        gapLaunchMesh.position.set(gapX, gapYBase + gapH * 0.5, gapLaunchZ);
        gapLaunchMesh.rotation.x = 0.3;
        this.scene.add(gapLaunchMesh);

        // Gap Landing Downslope Ramp
        this.ramps.push({
            type: 'ramp',
            x: gapX,
            z: gapLandZ,
            yBase: gapYBase,
            rotation: Math.PI,
            length: 36.0,
            width: gapW + 4.0,
            height: gapH,
            isJump: false
        });
        const gapLandMesh = new THREE.Mesh(new THREE.BoxGeometry(gapW + 4.0, gapH, 36.0), trackMat);
        gapLandMesh.position.set(gapX, gapYBase + gapH * 0.5, gapLandZ);
        gapLandMesh.rotation.x = -0.28;
        this.scene.add(gapLandMesh);

        // =========================================================================
        // 6. CONCRETE SLALOM BARRIER WALLS (2x BIGGER: 18m WIDE BARRIERS)
        // Located in South-West Farmland Plains at (-240, 430)
        // =========================================================================
        const barrierGroundY = this.terrain.getHeight(-240, 430);
        const barrierCoords = [
            { x: -250, z: 380, w: 18.0, rot: 0.15 },
            { x: -220, z: 405, w: 18.0, rot: -0.2 },
            { x: -255, z: 430, w: 18.0, rot: 0.1 },
            { x: -215, z: 455, w: 18.0, rot: -0.15 },
            { x: -250, z: 480, w: 18.0, rot: 0.2 },
            { x: -220, z: 505, w: 18.0, rot: -0.1 }
        ];

        for (const bc of barrierCoords) {
            const barrierGroup = new THREE.Group();
            const bBase = new THREE.Mesh(new THREE.BoxGeometry(bc.w, 2.8, 2.4), concreteBarrierMat);
            bBase.position.y = 1.4;
            const bStripe = new THREE.Mesh(new THREE.BoxGeometry(bc.w, 0.8, 2.44), hazardMat);
            bStripe.position.y = 1.4;
            barrierGroup.add(bBase, bStripe);

            barrierGroup.position.set(bc.x, barrierGroundY, bc.z);
            barrierGroup.rotation.y = bc.rot;
            this.scene.add(barrierGroup);

            // Register 2x bigger spatial box collider
            const halfW = (bc.w * 0.5) + 0.6;
            this.colliders.push({
                type: 'box',
                minX: bc.x - halfW,
                maxX: bc.x + halfW,
                minZ: bc.z - 2.4,
                maxZ: bc.z + 2.4
            });
        }

        // =========================================================================
        // 7. SMASHABLE STUNT CRATE & BARREL WALLS (2x BIGGER CRATES & BARRELS)
        // Placed in run-ups to Mega Kicker, Mega Drop, and Mega Loop
        // =========================================================================
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x9c7a4b, roughness: 0.8 });
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0xd91616, roughness: 0.3, metalness: 0.6 });

        const wallClusters = [
            { x: 180, z: -380, gy: 13.5 }, // Kicker approach
            { x: 510, z: -180, gy: 19.5 }, // Drop approach
            { x: 420, z: 390, gy: 16.0 }   // Loop approach
        ];

        for (const cluster of wallClusters) {
            // Stack of 4 giant 2.8m crates
            for (let cx = -1; cx <= 1; cx += 2) {
                for (let cy = 0; cy <= 1; cy++) {
                    const crate = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 2.8), crateMat);
                    const posX = cluster.x + cx * 1.8;
                    const posY = cluster.gy + 1.4 + cy * 2.8;
                    const posZ = cluster.z;
                    crate.position.set(posX, posY, posZ);
                    this.scene.add(crate);

                    this.destructibles.push({
                        mesh: crate,
                        x: posX,
                        y: posY,
                        z: posZ,
                        vx: 0,
                        vz: 0,
                        radius: 2.2
                    });
                }
            }
            // 2 giant oil barrels (2.6m tall)
            for (let bx = -4.2; bx <= 4.2; bx += 8.4) {
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.6, 12), barrelMat);
                const bPosX = cluster.x + bx;
                const bPosY = cluster.gy + 1.3;
                const bPosZ = cluster.z;
                barrel.position.set(bPosX, bPosY, bPosZ);
                this.scene.add(barrel);

                this.destructibles.push({
                    mesh: barrel,
                    x: bPosX,
                    y: bPosY,
                    z: bPosZ,
                    vx: 0,
                    vz: 0,
                    radius: 1.8
                });
            }
        }

        // =========================================================================
        // 8. MEGA BILLBOARD WALL (2x BIGGER: 72m LONG, 12m HIGH)
        // Located at (480, 440)
        // =========================================================================
        const billX = 480;
        const billZ = 440;
        const billY = 16.0;
        const billL = 72.0; // 2x bigger (was 36)
        const billH = 12.0; // 2x bigger (was 6)

        const billMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, billH, billL), metalMat);
        billMesh.position.set(billX, billY + billH * 0.5, billZ);
        this.scene.add(billMesh);

        const billSign = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.0, billL - 8.0), neonCyanMat);
        billSign.position.set(billX - 1.3, billY + billH * 0.5, billZ);
        this.scene.add(billSign);

        const billStripe = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.6, billL), hazardMat);
        billStripe.position.set(billX, billY + 1.0, billZ);
        this.scene.add(billStripe);

        this.colliders.push({
            type: 'box',
            minX: billX - 2.4,
            maxX: billX + 2.4,
            minZ: billZ - (billL * 0.5) - 1.0,
            maxZ: billZ + (billL * 0.5) + 1.0
        });

        // Arena Floodlight Poles at each major stunt zone
        const floodLights = [
            { x: 420, z: 420, gy: 16.0 }, // Loop
            { x: 220, z: 170, gy: 10.0 }, // Wall Ride
            { x: 510, z: -80, gy: 19.5 }, // Mega Drop
            { x: 180, z: -270, gy: 13.5 } // Mega Kicker
        ];
        for (const fl of floodLights) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 24.0), metalMat);
            pole.position.set(fl.x, fl.gy + 12.0, fl.z);
            this.scene.add(pole);

            const lamp = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.6, 2.0), cautionYellowMat);
            lamp.position.set(fl.x, fl.gy + 24.0, fl.z);
            this.scene.add(lamp);

            const pLight = new THREE.PointLight(0xffeedd, 3.2, 140, 1.8);
            pLight.position.set(fl.x, fl.gy + 23.5, fl.z);
            this.scene.add(pLight);
            this.streetLights.push(pLight);

            this.colliders.push({ type: 'cylinder', x: fl.x, z: fl.z, radius: 1.2 });
        }
    }

    createSpeedTrap(x, y, z) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        post.position.set(x - 6, y + 3, z);
        this.scene.add(post);

        const camBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xffdd00 }));
        camBox.position.set(x - 6, y + 5.5, z);
        this.scene.add(camBox);

        const flashLight = new THREE.PointLight(0xffffff, 0, 30);
        flashLight.position.set(x - 6, y + 6, z);
        this.scene.add(flashLight);

        this.speedTrap = { x, z, radius: 12, flashLight, flashTimer: 0 };
    }

    // 3. Farmland
    buildFarmland() {
        const farmX = -320;
        const farmZ = 240;

        const turbineCoords = [
            { x: farmX - 90, z: farmZ - 60 },
            { x: farmX, z: farmZ - 100 },
            { x: farmX + 90, z: farmZ - 80 }
        ];

        for (const pos of turbineCoords) {
            const ty = this.terrain.getHeight(pos.x, pos.z);
            const tower = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 2.5, 48, 16),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 })
            );
            tower.position.set(pos.x, ty + 24, pos.z);
            tower.castShadow = true;
            this.scene.add(tower);

            const hub = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
            hub.position.set(pos.x, ty + 48, pos.z);
            this.scene.add(hub);

            const bladesGroup = new THREE.Group();
            for (let b = 0; b < 3; b++) {
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 22, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
                blade.position.y = 11;
                const pivot = new THREE.Group();
                pivot.rotation.z = (b * Math.PI * 2) / 3;
                pivot.add(blade);
                bladesGroup.add(pivot);
            }
            hub.add(bladesGroup);

            this.animatedProps.push({ type: 'windmill', mesh: bladesGroup, speed: 0.015 + Math.random() * 0.01 });
            this.colliders.push({ type: 'cylinder', x: pos.x, z: pos.z, radius: 2.5 });
        }

        // Rustic Red Country Barn
        const barnY = this.terrain.getHeight(farmX + 40, farmZ + 40);
        const barn = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 14), new THREE.MeshStandardMaterial({ color: 0x962d2d, roughness: 0.8 }));
        barn.position.set(farmX + 40, barnY + 6, farmZ + 40);
        barn.castShadow = true;
        barn.receiveShadow = true;
        this.scene.add(barn);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 6, 4), new THREE.MeshStandardMaterial({ color: 0x3d3d3d }));
        roof.rotation.y = Math.PI / 4;
        roof.position.set(farmX + 40, barnY + 15, farmZ + 40);
        this.scene.add(roof);

        this.colliders.push({
            type: 'box',
            minX: farmX + 40 - 10,
            maxX: farmX + 40 + 10,
            minZ: farmZ + 40 - 7,
            maxZ: farmZ + 40 + 7
        });

        // Hay bales
        for (let i = 0; i < 18; i++) {
            const hx = farmX + (Math.random() - 0.5) * 80;
            const hz = farmZ + (Math.random() - 0.5) * 80;
            const hy = this.terrain.getHeight(hx, hz);

            const hayGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 12);
            hayGeo.rotateZ(Math.PI / 2);
            const hay = new THREE.Mesh(hayGeo, new THREE.MeshStandardMaterial({ color: 0xd4a037, roughness: 0.95 }));
            hay.position.set(hx, hy + 1.4, hz);
            hay.rotation.y = Math.random() * Math.PI;
            hay.castShadow = true;
            this.scene.add(hay);

            this.destructibles.push({ mesh: hay, x: hx, y: hy + 1.4, z: hz, vx: 0, vz: 0, radius: 1.5 });
        }
    }

    // 4. Coastal Lighthouse
    buildLighthouse() {
        const lx = -460;
        const lz = 380;
        const ly = this.terrain.getHeight(lx, lz);

        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 5.5, 30, 16),
            new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.6 })
        );
        tower.position.set(lx, ly + 15, lz);
        tower.castShadow = true;
        this.scene.add(tower);

        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 5, 16), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
        stripe.position.set(lx, ly + 15, lz);
        this.scene.add(stripe);

        const beaconGroup = new THREE.Group();
        beaconGroup.position.set(lx, ly + 32, lz);

        const beaconLight = new THREE.SpotLight(0xfff0aa, 3, 220, Math.PI / 8, 0.4);
        beaconLight.position.set(0, 0, 0);
        beaconLight.target.position.set(50, 0, 0);
        beaconGroup.add(beaconLight);
        beaconGroup.add(beaconLight.target);
        this.scene.add(beaconGroup);

        this.animatedProps.push({ type: 'lighthouse', mesh: beaconGroup, speed: 0.02 });
        this.colliders.push({ type: 'cylinder', x: lx, z: lz, radius: 5.5 });
    }

    // 5. Realistic Australian Eucalyptus / Gum Trees from the photo!
    buildRealisticBushland() {
        const tg = window.textureGenerator;
        const barkTex = tg ? tg.createBarkTexture(512) : null;
        const leafTex = tg ? tg.createLeafClusterTexture(512) : null;

        // Photorealistic mottled gum bark material
        const trunkMat = new THREE.MeshStandardMaterial({
            map: barkTex,
            roughness: 0.85,
            metalness: 0.05
        });

        // Photorealistic leaf cluster material with alpha mask
        const leafMat = new THREE.MeshStandardMaterial({
            map: leafTex,
            transparent: true,
            alphaTest: 0.15,
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        // Pre-create 3 distinct realistic eucalyptus tree model archetypes
        const treeTemplates = [
            this.createEucalyptusTreeModel(trunkMat, leafMat, 1.0),
            this.createEucalyptusTreeModel(trunkMat, leafMat, 1.3),
            this.createBushyTreeModel(trunkMat, leafMat, 0.9)
        ];

        const treeCount = 280;
        for (let i = 0; i < treeCount; i++) {
            const tx = (Math.random() - 0.5) * (this.terrain.worldSize - 80);
            const tz = (Math.random() - 0.5) * (this.terrain.worldSize - 80);
            const ty = this.terrain.getHeight(tx, tz);

            if (ty < this.terrain.waterHeight + 1.5) continue;
            // Clear of 18m 2-lane roadway and sidewalks
            if (this.terrain.getDistanceToRoad(tx, tz).distance < this.terrain.roadWidth * 0.5 + 5.0) continue;
            if (Math.hypot(tx + 174, tz + 140) < 250) continue; // Keep compact skyscraper core and apartment district clear
            // Clear of stunt obstacle zones (spread across map)
            if (Math.hypot(tx - 420, tz - 480) < 110) continue; // Mega Loop
            if (Math.hypot(tx - 220, tz - 120) < 100) continue; // Wall Ride
            if (Math.hypot(tx - 510, tz - (-120)) < 80) continue; // Mega Drop
            if (Math.hypot(tx - 180, tz - (-320)) < 70) continue; // Mega Kicker
            if (Math.hypot(tx - (-120), tz - (-430)) < 75) continue; // Gap Jump
            if (Math.hypot(tx - (-240), tz - 430) < 80) continue; // Slalom Barriers

            const template = treeTemplates[Math.floor(Math.random() * treeTemplates.length)];
            const treeMesh = template.clone();

            const scale = 0.85 + Math.random() * 0.45;
            treeMesh.scale.set(scale, scale, scale);
            treeMesh.position.set(tx, ty, tz);
            treeMesh.rotation.y = Math.random() * Math.PI * 2;
            treeMesh.castShadow = true;
            this.scene.add(treeMesh);

            this.colliders.push({
                type: 'cylinder',
                x: tx,
                z: tz,
                radius: 1.2 * scale
            });
        }

        // Add 3D Roadside Grass Tufts along the gravel road edges
        this.buildRoadsideGrassTufts(leafMat);

        // Scatter realistic boulders
        const rockGeo = new THREE.DodecahedronGeometry(2.2, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x6d7075, roughness: 0.95 });
        const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, 120);
        rockMesh.castShadow = true;
        const dummy = new THREE.Object3D();

        let rockCount = 0;
        for (let r = 0; r < 120; r++) {
            const rx = (Math.random() - 0.5) * (this.terrain.worldSize - 100);
            const rz = (Math.random() - 0.5) * (this.terrain.worldSize - 100);
            const ry = this.terrain.getHeight(rx, rz);
            if (this.terrain.getDistanceToRoad(rx, rz).distance < this.terrain.roadWidth * 0.5 + 4.5) continue;
            if (Math.hypot(rx + 174, rz + 120) < 340) continue;

            const rScale = 0.8 + Math.random() * 1.5;
            dummy.position.set(rx, ry + rScale * 0.8, rz);
            dummy.scale.set(rScale, rScale * (0.6 + Math.random() * 0.4), rScale);
            dummy.rotation.set(Math.random(), Math.random(), Math.random());
            dummy.updateMatrix();
            rockMesh.setMatrixAt(rockCount++, dummy.matrix);

            this.colliders.push({ type: 'cylinder', x: rx, z: rz, radius: 1.6 * rScale });
        }
        rockMesh.count = rockCount;
        rockMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(rockMesh);
    }

    // Realistic Australian Eucalyptus Tree: slender pale trunk dividing into graceful organic branches
    createEucalyptusTreeModel(trunkMat, leafMat, scale = 1.0) {
        const tree = new THREE.Group();

        // Main trunk (anchors 2m deep into ground so it never floats on slopes)
        const trunkGeo = new THREE.CylinderGeometry(0.38 * scale, 0.68 * scale, 17 * scale, 10);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 6.5 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        // 4 Multi-branching limbs reaching upwards
        const branchAngles = [0, 1.6, 3.14, 4.7];
        for (const angle of branchAngles) {
            const branchGeo = new THREE.CylinderGeometry(0.18 * scale, 0.3 * scale, 7.5 * scale, 8);
            const branch = new THREE.Mesh(branchGeo, trunkMat);
            branch.position.set(
                Math.cos(angle) * 1.5 * scale,
                (12 + Math.random() * 2) * scale,
                Math.sin(angle) * 1.5 * scale
            );
            branch.rotation.z = Math.cos(angle) * 0.4;
            branch.rotation.x = Math.sin(angle) * 0.4;
            branch.castShadow = true;
            tree.add(branch);

            // Foliage canopy clusters attached to branch tips
            for (let f = 0; f < 3; f++) {
                const canopyCluster = this.createLeafCrossCluster(leafMat, (5.5 + Math.random() * 3.5) * scale);
                canopyCluster.position.set(
                    Math.cos(angle) * (2.8 + f * 1.2) * scale + (Math.random() - 0.5) * 1.5,
                    (14 + f * 2.5) * scale,
                    Math.sin(angle) * (2.8 + f * 1.2) * scale + (Math.random() - 0.5) * 1.5
                );
                canopyCluster.rotation.y = Math.random() * Math.PI;
                tree.add(canopyCluster);
            }
        }

        return tree;
    }

    // Leafy Shrub / Fruit Tree (matching the bushy tree on the right in the photo)
    createBushyTreeModel(trunkMat, leafMat, scale = 1.0) {
        const tree = new THREE.Group();

        // Anchors into hillside
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35 * scale, 0.6 * scale, 8 * scale, 8),
            trunkMat
        );
        trunk.position.y = 2.5 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        // Dense low canopy
        for (let i = 0; i < 6; i++) {
            const cluster = this.createLeafCrossCluster(leafMat, 5.0 * scale);
            const a = (i * Math.PI * 2) / 6;
            cluster.position.set(
                Math.cos(a) * 2.2 * scale,
                (4.5 + (i % 2) * 1.8) * scale,
                Math.sin(a) * 2.2 * scale
            );
            cluster.rotation.y = a;
            tree.add(cluster);
        }

        return tree;
    }

    // Double-sided cross-quad leaf cluster with realistic depth (shadows cast by solid trunks/branches)
    createLeafCrossCluster(leafMat, size = 6.0) {
        const group = new THREE.Group();
        const planeGeo = new THREE.PlaneGeometry(size, size);

        const p1 = new THREE.Mesh(planeGeo, leafMat);
        group.add(p1);

        const p2 = p1.clone();
        p2.rotation.y = Math.PI / 3;
        group.add(p2);

        const p3 = p1.clone();
        p3.rotation.y = (Math.PI * 2) / 3;
        group.add(p3);

        return group;
    }

    // 3D Roadside Grass Tufts with GPU-Instancing & Vertex Shader Wind Animation
    buildRoadsideGrassTufts(leafMat) {
        const tg = window.textureGenerator;
        const grassBladeTex = tg ? tg.createGrassBladeTexture(256, 512) : null;

        // Cross-quad 3D grass cluster geometry (2 intersecting vertical planes for 360-degree volume)
        const plane1 = new THREE.PlaneGeometry(1.6, 1.4);
        plane1.translate(0, 0.7, 0);

        const tuftMat = new THREE.MeshStandardMaterial({
            map: grassBladeTex,
            transparent: true,
            alphaTest: 0.25,
            roughness: 0.82,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

        const maxTufts = 2000;
        const tuftMesh = new THREE.InstancedMesh(plane1, tuftMat, maxTufts);
        const dummy = new THREE.Object3D();

        let count = 0;
        for (const road of this.terrain.roads) {
            for (let i = 0; i < road.length - 1 && count < maxTufts; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];

                for (let step = 0; step < 22 && count < maxTufts; step++) {
                    const t = step / 22;
                    const rx = p1.x + t * (p2.x - p1.x);
                    const rz = p1.z + t * (p2.z - p1.z);

                    // Place clusters along road shoulder and outer meadows (exclude downtown sidewalks)
                    if (Math.hypot(rx + 174, rz + 120) < 340) continue;

                    for (const side of [-1, 1]) {
                        if (count >= maxTufts) break;
                        const distOffset = side * (this.terrain.roadWidth * 0.5 + 2.0 + Math.random() * 8.0);
                        const gx = rx + distOffset;
                        const gz = rz + (Math.random() - 0.5) * 6;
                        const gy = this.terrain.getHeight(gx, gz);

                        if (gy < this.terrain.waterHeight + 1.0) continue;

                        dummy.position.set(gx, gy, gz);
                        dummy.rotation.y = Math.random() * Math.PI;
                        const s = 0.85 + Math.random() * 0.6;
                        dummy.scale.set(s, s * (0.8 + Math.random() * 0.4), s);
                        dummy.updateMatrix();
                        tuftMesh.setMatrixAt(count++, dummy.matrix);
                    }
                }
            }
        }
        tuftMesh.count = count;
        tuftMesh.instanceMatrix.needsUpdate = true;
        tuftMesh.receiveShadow = true;
        this.scene.add(tuftMesh);
    }

    // Neat Urban Street / Plaza Tree Model with Circular Planter Grate
    createUrbanPlazaTreeModel(trunkMat, leafMat, scale = 1.0) {
        const tree = new THREE.Group();

        // Slender, straight street tree trunk
        const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.42 * scale, 8.5 * scale, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 3.8 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        // Circular stone planter / tree grate curb at sidewalk level
        const planterGeo = new THREE.CylinderGeometry(1.6 * scale, 1.8 * scale, 0.35, 12);
        const planterMat = new THREE.MeshStandardMaterial({ color: 0x3d3f44, roughness: 0.88, metalness: 0.15 });
        const planter = new THREE.Mesh(planterGeo, planterMat);
        planter.position.y = 0.18;
        planter.receiveShadow = true;
        tree.add(planter);

        // Lush manicured street canopy
        const canopyClusters = [
            { x: 0, y: 7.8 * scale, z: 0, s: 6.5 * scale },
            { x: 1.6 * scale, y: 6.8 * scale, z: 0.8 * scale, s: 5.2 * scale },
            { x: -1.6 * scale, y: 6.8 * scale, z: -0.8 * scale, s: 5.2 * scale },
            { x: 0.8 * scale, y: 6.6 * scale, z: -1.6 * scale, s: 5.0 * scale },
            { x: -0.8 * scale, y: 6.6 * scale, z: 1.6 * scale, s: 5.0 * scale }
        ];

        for (const c of canopyClusters) {
            const cluster = this.createLeafCrossCluster(leafMat, c.s);
            cluster.position.set(c.x, c.y, c.z);
            cluster.rotation.y = Math.random() * Math.PI;
            tree.add(cluster);
        }

        return tree;
    }

    // 5b. Landscaping: Trees Around the Area of Every Building
    buildBuildingTrees() {
        const tg = window.textureGenerator;
        const barkTex = tg ? tg.createBarkTexture(512) : null;
        const leafTex = tg ? tg.createLeafClusterTexture(512) : null;

        const trunkMat = new THREE.MeshStandardMaterial({
            map: barkTex,
            roughness: 0.85,
            metalness: 0.05
        });

        const leafMat = new THREE.MeshStandardMaterial({
            map: leafTex,
            transparent: true,
            alphaTest: 0.15,
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        const urbanTreeTemplate = this.createUrbanPlazaTreeModel(trunkMat, leafMat, 1.0);
        const bushyTreeTemplate = this.createBushyTreeModel(trunkMat, leafMat, 1.05);
        const eucalyptusTemplate = this.createEucalyptusTreeModel(trunkMat, leafMat, 0.95);

        const treeCoords = [];

        // 1. Trees around all 15 Downtown Skyscrapers
        const gridRows = 4;
        const gridCols = 4;
        const blockSize = 72;

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (r === 1 && c === 1) continue; // Central park plaza handled below

                const bx = -282 + c * blockSize;
                const bz = -282 + r * blockSize;

                // 6 trees framing each skyscraper's sidewalk plaza (staying safely on sidewalk clear of 18m roadbed)
                const dCorner = 23;
                const dMid = 24;
                treeCoords.push(
                    { x: bx - dCorner, z: bz - dCorner, type: 'urban' },
                    { x: bx + dCorner, z: bz - dCorner, type: 'urban' },
                    { x: bx - dCorner, z: bz + dCorner, type: 'urban' },
                    { x: bx + dCorner, z: bz + dCorner, type: 'urban' },
                    { x: bx, z: bz - dMid, type: 'urban' },
                    { x: bx, z: bz + dMid, type: 'urban' }
                );
            }
        }

        // 2. Trees around all 7 Historic Apartment Buildings
        const apartmentSites = [
            { x: -282, z: 3,    w: 56, d: 26 },
            { x: -210, z: 3,    w: 52, d: 24 },
            { x: -138, z: 3,    w: 48, d: 24 },
            { x: -66,  z: 3,    w: 56, d: 26 },
            { x: -354, z: -210, w: 24, d: 52 },
            { x: -354, z: -138, w: 24, d: 48 },
            { x: -210, z: -210, w: 52, d: 24 }
        ];

        for (const apt of apartmentSites) {
            const isRotated = (apt.d > apt.w);
            if (!isRotated) {
                // Front and rear street trees
                treeCoords.push(
                    { x: apt.x - apt.w * 0.38, z: apt.z + apt.d * 0.5 + 4.5, type: 'urban' },
                    { x: apt.x,               z: apt.z + apt.d * 0.5 + 4.5, type: 'urban' },
                    { x: apt.x + apt.w * 0.38, z: apt.z + apt.d * 0.5 + 4.5, type: 'urban' },
                    { x: apt.x - apt.w * 0.38, z: apt.z - apt.d * 0.5 - 4.5, type: 'urban' },
                    { x: apt.x + apt.w * 0.38, z: apt.z - apt.d * 0.5 - 4.5, type: 'urban' }
                );
            } else {
                // Rotated side frontage
                treeCoords.push(
                    { x: apt.x + apt.w * 0.5 + 4.5, z: apt.z - apt.d * 0.38, type: 'urban' },
                    { x: apt.x + apt.w * 0.5 + 4.5, z: apt.z,               type: 'urban' },
                    { x: apt.x + apt.w * 0.5 + 4.5, z: apt.z + apt.d * 0.38, type: 'urban' },
                    { x: apt.x - apt.w * 0.5 - 4.5, z: apt.z - apt.d * 0.38, type: 'urban' },
                    { x: apt.x - apt.w * 0.5 - 4.5, z: apt.z + apt.d * 0.38, type: 'urban' }
                );
            }
        }

        // Central Park Grove (around plaza and park apartment)
        treeCoords.push(
            { x: -234, z: -228, type: 'bushy' },
            { x: -186, z: -228, type: 'bushy' },
            { x: -234, z: -192, type: 'bushy' },
            { x: -186, z: -192, type: 'bushy' }
        );

        // 3. Trees around Farmland Country Barn (-280, 280)
        const barnX = -280;
        const barnZ = 280;
        treeCoords.push(
            { x: barnX - 18, z: barnZ - 14, type: 'bushy' },
            { x: barnX + 18, z: barnZ - 14, type: 'bushy' },
            { x: barnX - 18, z: barnZ + 14, type: 'eucalyptus' },
            { x: barnX + 18, z: barnZ + 14, type: 'eucalyptus' },
            { x: barnX - 25, z: barnZ,      type: 'eucalyptus' },
            { x: barnX + 25, z: barnZ,      type: 'bushy' },
            { x: barnX,      z: barnZ + 22, type: 'bushy' }
        );

        // 4. Trees around Cape Point Lighthouse (-460, 380)
        const lhX = -460;
        const lhZ = 380;
        treeCoords.push(
            { x: lhX - 16, z: lhZ - 14, type: 'eucalyptus' },
            { x: lhX + 16, z: lhZ - 14, type: 'eucalyptus' },
            { x: lhX - 16, z: lhZ + 16, type: 'bushy' },
            { x: lhX + 16, z: lhZ + 16, type: 'bushy' },
            { x: lhX - 24, z: lhZ,      type: 'eucalyptus' },
            { x: lhX + 24, z: lhZ,      type: 'bushy' }
        );

        // Instantiate and place all perimeter building trees
        for (let i = 0; i < treeCoords.length; i++) {
            const pt = treeCoords[i];
            const ty = this.terrain.getHeight(pt.x, pt.z);

            let mesh;
            if (pt.type === 'urban') {
                mesh = urbanTreeTemplate.clone();
            } else if (pt.type === 'bushy') {
                mesh = bushyTreeTemplate.clone();
            } else {
                mesh = eucalyptusTemplate.clone();
            }

            const scale = 0.88 + Math.random() * 0.28;
            mesh.scale.set(scale, scale, scale);
            mesh.position.set(pt.x, ty, pt.z);
            mesh.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(mesh);

            this.colliders.push({
                type: 'cylinder',
                x: pt.x,
                z: pt.z,
                radius: 0.9 * scale
            });
        }
    }

    // 6. Street Lamps along 2-Lane Avenues and Highways
    buildRoadProps() {
        const halfW = this.terrain.roadWidth * 0.5; // 9.0m
        const sidewalkOff = halfW + 2.5; // 11.5m from road center (stands on sidewalk curb)

        const lampPositions = [
            // Downtown Central Avenue C (x = -174)
            { x: -174 + sidewalkOff, z: -280 }, { x: -174 - sidewalkOff, z: -210 },
            { x: -174 + sidewalkOff, z: -140 }, { x: -174 - sidewalkOff, z: -70 },
            { x: -174 + sidewalkOff, z: 0 },    { x: -174 - sidewalkOff, z: 150 },
            { x: -174 + sidewalkOff, z: 250 },  { x: -174 - sidewalkOff, z: 350 },

            // Downtown Avenue B (x = -246)
            { x: -246 + sidewalkOff, z: -210 }, { x: -246 - sidewalkOff, z: -70 },
            { x: -246 + sidewalkOff, z: 0 },

            // Downtown Avenue D (x = -102)
            { x: -102 + sidewalkOff, z: -210 }, { x: -102 - sidewalkOff, z: -70 },
            { x: -102 + sidewalkOff, z: 0 },

            // Downtown Avenue A (x = -318) & Avenue E (x = -30)
            { x: -318 - sidewalkOff, z: -140 }, { x: -30 + sidewalkOff, z: -140 },

            // Regional Highways & Farmland
            { x: -280 + sidewalkOff, z: 220 }, { x: -400 + sidewalkOff, z: 350 },
            { x: 120 + sidewalkOff, z: -120 }, { x: 250 + sidewalkOff, z: 20 },
            { x: 380 + sidewalkOff, z: 80 }
        ];

        for (const lp of lampPositions) {
            const ly = this.terrain.getHeight(lp.x, lp.z);
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 9), new THREE.MeshStandardMaterial({ color: 0x2d3036, metalness: 0.8, roughness: 0.3 }));
            pole.position.set(lp.x, ly + 4.5, lp.z);
            this.scene.add(pole);

            // Arm extension reaching toward the road
            const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0x2d3036 }));
            arm.position.set(lp.x - 1.2, ly + 8.8, lp.z);
            this.scene.add(arm);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff4d0 }));
            bulb.position.set(lp.x - 2.4, ly + 8.6, lp.z);
            this.scene.add(bulb);

            const light = new THREE.PointLight(0xffeedd, 1.8, 45, 1.5);
            light.position.set(lp.x - 2.4, ly + 8.4, lp.z);
            this.scene.add(light);
            this.streetLights.push(light);

            this.colliders.push({ type: 'cylinder', x: lp.x, z: lp.z, radius: 0.5 });
        }
    }



    // High-performance spatial-partitioned collision check (tests 3-8 local colliders instead of 450)
    checkCollision(carX, carZ, carRadius = 1.6) {
        if (this.spatialGrid) {
            const cs = this.gridCellSize;
            const cx = Math.floor(carX / cs);
            const cz = Math.floor(carZ / cs);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const cell = this.spatialGrid.get(`${cx + dx},${cz + dz}`);
                    if (!cell) continue;

                    for (let i = 0; i < cell.length; i++) {
                        const col = cell[i];
                        if (col.type === 'cylinder') {
                            const cdx = carX - col.x;
                            const cdz = carZ - col.z;
                            const distSq = cdx * cdx + cdz * cdz;
                            const minDist = carRadius + col.radius;
                            if (distSq < minDist * minDist && distSq > 0.0001) {
                                const dist = Math.sqrt(distSq);
                                const overlap = minDist - dist;
                                return { hit: true, nx: cdx / dist, nz: cdz / dist, overlap };
                            }
                        } else if (col.type === 'box') {
                            if (
                                carX + carRadius > col.minX &&
                                carX - carRadius < col.maxX &&
                                carZ + carRadius > col.minZ &&
                                carZ - carRadius < col.maxZ
                            ) {
                                const midX = (col.minX + col.maxX) * 0.5;
                                const midZ = (col.minZ + col.maxZ) * 0.5;
                                const bdx = carX - midX;
                                const bdz = carZ - midZ;
                                const halfW = (col.maxX - col.minX) * 0.5 + carRadius;
                                const halfD = (col.maxZ - col.minZ) * 0.5 + carRadius;
                                const ox = halfW - Math.abs(bdx);
                                const oz = halfD - Math.abs(bdz);

                                if (ox < oz) {
                                    return { hit: true, nx: Math.sign(bdx), nz: 0, overlap: ox };
                                } else {
                                    return { hit: true, nx: 0, nz: Math.sign(bdz), overlap: oz };
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Fallback linear scan
            for (let i = 0; i < this.colliders.length; i++) {
                const col = this.colliders[i];
                if (col.type === 'cylinder') {
                    const dx = carX - col.x;
                    const dz = carZ - col.z;
                    const distSq = dx * dx + dz * dz;
                    const minDist = carRadius + col.radius;
                    if (distSq < minDist * minDist && distSq > 0.0001) {
                        const dist = Math.sqrt(distSq);
                        return { hit: true, nx: dx / dist, nz: dz / dist, overlap: minDist - dist };
                    }
                }
            }
        }

        for (let i = 0; i < this.destructibles.length; i++) {
            const item = this.destructibles[i];
            const dx = item.x - carX;
            const dz = item.z - carZ;
            const distSq = dx * dx + dz * dz;
            const minDist = carRadius + item.radius;
            if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq) || 1;
                const pushForce = 0.4;
                item.vx += (dx / dist) * pushForce;
                item.vz += (dz / dist) * pushForce;
            }
        }

        return null;
    }

    checkRampElevation(carX, carZ) {
        for (let i = 0; i < this.ramps.length; i++) {
            const ramp = this.ramps[i];
            const dx = carX - ramp.x;
            const dz = carZ - ramp.z;
            const cos = Math.cos(-ramp.rotation);
            const sin = Math.sin(-ramp.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            const halfL = ramp.length * 0.5;
            const halfW = ramp.width * 0.5;

            if (Math.abs(localX) <= halfW && localZ >= -halfL && localZ <= halfL) {
                const rot = ramp.rotation;
                const sinRot = Math.sin(rot);
                const cosRot = Math.cos(rot);

                if (ramp.type === 'drop') {
                    // Approach ramp up to flat deck, then sheer drop cliff at +halfL
                    const rampLen = ramp.rampLen || (ramp.length * 0.55);
                    let extraHeight = ramp.height;
                    let norm = new THREE.Vector3(0, 1, 0);
                    const atDropEdge = (localZ > halfL - 2.0);

                    if (localZ < -halfL + rampLen) {
                        const t = (localZ + halfL) / rampLen;
                        extraHeight = t * ramp.height;
                        const slopeAngle = Math.atan2(ramp.height, rampLen);
                        norm = new THREE.Vector3(-sinRot * Math.sin(slopeAngle), Math.cos(slopeAngle), -cosRot * Math.sin(slopeAngle)).normalize();
                    }
                    return {
                        onRamp: true,
                        extraHeight,
                        normal: norm,
                        isDrop: true,
                        atDropEdge,
                        dropHeight: ramp.height
                    };
                } else if (ramp.type === 'kicker') {
                    // Curved launch kicker
                    const t = Math.max(0, Math.min(1.0, (localZ + halfL) / ramp.length));
                    const extraHeight = ramp.height * Math.pow(t, 1.4);
                    const slopeAngle = Math.atan2(ramp.height * 1.4 * Math.pow(Math.max(0.001, t), 0.4), ramp.length);
                    const norm = new THREE.Vector3(-sinRot * Math.sin(slopeAngle), Math.cos(slopeAngle), -cosRot * Math.sin(slopeAngle)).normalize();
                    return {
                        onRamp: true,
                        extraHeight,
                        normal: norm,
                        isJump: true,
                        launchPitch: slopeAngle,
                        atLip: (t > 0.88)
                    };
                } else {
                    // Standard linear ramp
                    const t = (localZ + halfL) / ramp.length;
                    const slopeAngle = Math.atan2(ramp.height, ramp.length);
                    const norm = new THREE.Vector3(-sinRot * Math.sin(slopeAngle), Math.cos(slopeAngle), -cosRot * Math.sin(slopeAngle)).normalize();
                    return {
                        onRamp: true,
                        extraHeight: t * ramp.height,
                        normal: norm,
                        isJump: ramp.isJump || false,
                        launchPitch: slopeAngle,
                        atLip: (t > 0.9)
                    };
                }
            }
        }
        return null;
    }

    checkWallRide(carX, carZ) {
        if (!this.wallRides || this.wallRides.length === 0) return null;
        for (let i = 0; i < this.wallRides.length; i++) {
            const wr = this.wallRides[i];
            const dx = carX - wr.cx;
            const dz = carZ - wr.cz;
            const dist = Math.hypot(dx, dz);
            if (dist < wr.rIn - 0.5 || dist > wr.rOut + 1.2) continue;

            let angle = Math.atan2(dz, dx);
            let diff = angle - wr.startAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const arcLength = wr.endAngle - wr.startAngle;
            if (diff < -0.05 || diff > arcLength + 0.05) continue;

            const u = Math.max(0, Math.min(1.0, (dist - wr.rIn) / (wr.rOut - wr.rIn)));
            const extraHeight = wr.height * Math.pow(u, 1.8);

            // Banked normal vector tilted inward toward center: (-radX * slope, 1, -radZ * slope)
            const slope = (wr.height * 1.8 * Math.pow(Math.max(0.01, u), 0.8)) / (wr.rOut - wr.rIn);
            const radX = dx / (dist || 1);
            const radZ = dz / (dist || 1);
            const norm = new THREE.Vector3(-radX * slope, 1.0, -radZ * slope).normalize();

            return {
                onWall: true,
                extraHeight,
                normal: norm,
                radialU: u,
                angle
            };
        }
        return null;
    }

    checkStuntRunway(carX, carZ) {
        if (!this.stuntLoops || this.stuntLoops.length === 0) return null;
        const loop = this.stuntLoops[0];
        const halfW = loop.width * 0.5 + 4.0;
        // Entrance runway approaching loop (Z from loop.z - 110 to loop.z)
        if (Math.abs(carX - loop.x) <= halfW && carZ >= loop.z - 112 && carZ <= loop.z + 5) {
            return {
                height: loop.yBase + 0.08,
                isRunway: true,
                isBoost: (carZ >= loop.z - 95 && carZ <= loop.z - 15)
            };
        }
        // Exit runway leading away from loop (Z from loop.z to loop.z + 110)
        const exitX = loop.x + loop.xOffset;
        if (Math.abs(carX - exitX) <= halfW && carZ >= loop.z - 5 && carZ <= loop.z + 112) {
            return {
                height: loop.yBase + 0.08,
                isRunway: true,
                isBoost: false
            };
        }
        return null;
    }

    checkSolidLoopRoad(carX, carY, carZ, carSpeed = 0) {
        if (!this.stuntLoops || this.stuntLoops.length === 0) return null;

        for (let i = 0; i < this.stuntLoops.length; i++) {
            const loop = this.stuntLoops[i];
            const R = loop.radius;
            const Yc = loop.yBase + R;
            const Zc = loop.z;
            const Xc = loop.x;
            const W = loop.width;

            // In Y-Z plane relative to loop cylinder axis
            const dy = carY - Yc;
            const dz = carZ - Zc;
            const r = Math.hypot(dy, dz);

            // Angle around loop: theta = 0 at entrance (dy = -R, dz = 0), pi/2 at 90 deg climb (dy = 0, dz = R), pi at apex (dy = R, dz = 0), 2*pi at exit
            let theta = Math.atan2(dz, -dy);
            if (theta < 0) theta += Math.PI * 2;

            // Track centerline X at angle theta
            const xCenter = Xc + loop.xOffset * (theta / (Math.PI * 2));
            const lateralDist = carX - xCenter;

            // Check if car is laterally within track width
            const halfW = W * 0.5;
            if (Math.abs(lateralDist) > halfW + 4.0) continue;

            // Distance from cylindrical track road surface (radius R)
            const distFromSurface = r - R;

            if (Math.abs(distFromSurface) < 8.0) {
                // Inward normal vector from the solid road track toward loop center
                const normal = new THREE.Vector3(0, Math.cos(theta), -Math.sin(theta)).normalize();

                // Forward tangent vector along track
                const tangent = new THREE.Vector3(0, Math.sin(theta), Math.cos(theta)).normalize();

                // Solid road surface position
                const targetY = Yc - R * Math.cos(theta);
                const targetZ = Zc + R * Math.sin(theta);
                const targetX = xCenter;

                return {
                    onLoop: true,
                    loop,
                    theta,
                    normal,
                    tangent,
                    targetY,
                    targetZ,
                    targetX,
                    distFromSurface,
                    radius: R,
                    lateralDist,
                    halfW
                };
            }
        }
        return null;
    }

    checkLoop(carX, carY, carZ, speed, heading) {
        if (!this.stuntLoops || this.stuntLoops.length === 0) return null;
        for (let i = 0; i < this.stuntLoops.length; i++) {
            const loop = this.stuntLoops[i];
            const dx = carX - loop.x;
            const dz = carZ - loop.z;
            const cos = Math.cos(-loop.rotation);
            const sin = Math.sin(-loop.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;

            // Entrance check: approaching local -loop.radius in local +Z direction
            if (Math.abs(localX) <= loop.width * 0.5 + 2.5 &&
                localZ >= -loop.radius - 35.0 && localZ <= -loop.radius + 3.0) {
                if (speed > 25) {
                    return loop;
                }
            }
        }
        return null;
    }

    update(delta, carPos, carSpeed) {
        for (const prop of this.animatedProps) {
            if (prop.type === 'windmill' && prop.mesh) {
                prop.mesh.rotation.z += prop.speed;
            } else if (prop.type === 'lighthouse' && prop.mesh) {
                prop.mesh.rotation.y += prop.speed;
            }
        }

        // Dynamic Point Light Culling: only keep the 4 closest active streetlights to the car
        if (carPos && this.streetLights && this.streetLights.length > 4) {
            let sorted = [];
            for (let i = 0; i < this.streetLights.length; i++) {
                const sl = this.streetLights[i];
                if (sl.intensity > 0) {
                    const dx = sl.position.x - carPos.x;
                    const dz = sl.position.z - carPos.z;
                    sorted.push({ light: sl, distSq: dx * dx + dz * dz });
                } else {
                    sl.visible = false;
                }
            }
            if (sorted.length > 0) {
                sorted.sort((a, b) => a.distSq - b.distSq);
                for (let i = 0; i < sorted.length; i++) {
                    sorted[i].light.visible = (i < 4 && sorted[i].distSq < 160 * 160);
                }
            }
        }

        for (const item of this.destructibles) {
            if (Math.abs(item.vx) > 0.01 || Math.abs(item.vz) > 0.01) {
                item.x += item.vx;
                item.z += item.vz;
                item.vx *= 0.9;
                item.vz *= 0.9;
                item.y = this.terrain.getHeight(item.x, item.z) + 1.4;
                item.mesh.position.set(item.x, item.y, item.z);
                item.mesh.rotation.x += item.vz * 0.2;
                item.mesh.rotation.z -= item.vx * 0.2;
            }
        }

        if (this.speedTrap && carPos) {
            const dist = Math.hypot(carPos.x - this.speedTrap.x, carPos.z - this.speedTrap.z);
            if (dist < this.speedTrap.radius && carSpeed > 60) {
                this.speedTrap.flashLight.intensity = 8.0;
                this.speedTrap.flashTimer = 0.2;
                if (window.onSpeedTrap) window.onSpeedTrap(Math.round(carSpeed));
            }
            if (this.speedTrap.flashTimer > 0) {
                this.speedTrap.flashTimer -= delta;
                if (this.speedTrap.flashTimer <= 0) this.speedTrap.flashLight.intensity = 0;
            }
        }
    }
}

window.WorldManager = WorldManager;
