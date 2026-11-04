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
        this.buildRoadProps();
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
        const blockSize = 108; // 3 times more far apart (108m spacing)

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (r === 1 && c === 1) continue; // Open central park / plaza

                const bx = cityX + (c - gridCols / 2) * blockSize;
                const bz = cityZ + (r - gridRows / 2) * blockSize;
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

        // Apartment site placements along 2-lane avenues and cross-streets
        const apartmentSites = [
            // South Apartment District (Framed between Street 5 at z=42 and Street 6 at z=150)
            { x: -336, z: 96, rot: 0, style: 0, width: 56, depth: 26, height: 20 }, // Style A: Warehouse Loft with Tower (Photo 0)
            { x: -228, z: 96, rot: 0, style: 1, width: 52, depth: 24, height: 22 }, // Style B: Red Brick with Fire Escape (Photo 1)
            { x: -120, z: 96, rot: 0, style: 2, width: 48, depth: 24, height: 18 }, // Style C: Ornate Brownstone with Balconies (Photo 2)
            { x: -12,  z: 96, rot: 0, style: 0, width: 56, depth: 26, height: 20 }, // Style A: Warehouse Loft with Tower (Photo 0)

            // West Avenue A residential frontage
            { x: -450, z: -282, rot: Math.PI / 2, style: 1, width: 52, depth: 24, height: 22 }, // Style B (Photo 1)
            { x: -450, z: -66,  rot: Math.PI / 2, style: 2, width: 48, depth: 24, height: 18 }, // Style C (Photo 2)

            // Central Park District frontage (facing the park plaza)
            { x: -228, z: -228, rot: 0, style: 1, width: 52, depth: 24, height: 22 }  // Style B (Photo 1)
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

    // Stunt Park & Ramps removed as requested to keep the road completely clear
    buildStuntPark() {
        // No-op
    }

    createRamp() {
        // No-op
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
            if (Math.hypot(tx + 174, tz + 120) < 340) continue; // Keep skyscraper core and apartment district clear
            if (Math.hypot(tx - 300, tz - 300) < 95) continue;  // Stunt park

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
            rockMesh.setMatrixAt(r, dummy.matrix);

            this.colliders.push({ type: 'cylinder', x: rx, z: rz, radius: 1.6 * rScale });
        }
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

        this.grassUniforms = { uWindTime: { value: 0 } };
        tuftMat.onBeforeCompile = (shader) => {
            shader.uniforms.uWindTime = this.grassUniforms.uWindTime;
            shader.vertexShader = `
                uniform float uWindTime;
            ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                float sway = sin(uWindTime * 2.8 + position.x * 0.35 + position.z * 0.35) * (position.y * 0.14);
                transformed.x += sway;
                transformed.z += cos(uWindTime * 2.1 + position.x * 0.25) * (position.y * 0.08);
                `
            );
        };

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
        tuftMesh.instanceMatrix.needsUpdate = true;
        tuftMesh.receiveShadow = true;
        this.scene.add(tuftMesh);
    }

    // 6. Street Lamps along 2-Lane Avenues and Highways
    buildRoadProps() {
        const halfW = this.terrain.roadWidth * 0.5; // 9.0m
        const sidewalkOff = halfW + 2.5; // 11.5m from road center (stands on sidewalk curb)

        const lampPositions = [
            // Downtown Central Avenue C (x = -174)
            { x: -174 + sidewalkOff, z: -350 }, { x: -174 - sidewalkOff, z: -250 },
            { x: -174 + sidewalkOff, z: -150 }, { x: -174 - sidewalkOff, z: -50 },
            { x: -174 + sidewalkOff, z: 50 }, { x: -174 - sidewalkOff, z: 150 },
            { x: -174 + sidewalkOff, z: 250 }, { x: -174 - sidewalkOff, z: 350 },

            // Downtown Avenue B (x = -282)
            { x: -282 + sidewalkOff, z: -250 }, { x: -282 - sidewalkOff, z: -100 },
            { x: -282 + sidewalkOff, z: 50 },

            // Downtown Avenue D (x = -66)
            { x: -66 + sidewalkOff, z: -250 }, { x: -66 - sidewalkOff, z: -100 },
            { x: -66 + sidewalkOff, z: 50 },

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

    update(dt, carPos) {
        // Increment wind time for procedural grass vertex shader sway
        if (this.grassUniforms && this.grassUniforms.uWindTime) {
            this.grassUniforms.uWindTime.value += dt;
        }

        // Rotate animated props (windmill blades, lighthouse beacon)
        for (let i = 0; i < this.animatedProps.length; i++) {
            const prop = this.animatedProps[i];
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
        for (const ramp of this.ramps) {
            const dx = carX - ramp.x;
            const dz = carZ - ramp.z;
            const cos = Math.cos(-ramp.rotation);
            const sin = Math.sin(-ramp.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            const halfL = ramp.length / 2;
            const halfW = ramp.width / 2;

            if (localX >= -halfL && localX <= halfL && localZ >= -halfW && localZ <= halfW) {
                const t = (localX + halfL) / ramp.length;
                return { onRamp: true, extraHeight: t * ramp.height };
            }
        }
        return null;
    }

    update(delta, carPos, carSpeed) {
        for (const prop of this.animatedProps) {
            if (prop.type === 'windmill') {
                prop.mesh.rotation.z += prop.speed;
            } else if (prop.type === 'lighthouse') {
                prop.mesh.rotation.y += prop.speed;
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

        if (this.speedTrap) {
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
