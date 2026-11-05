/**
 * HUD GPS Minimap
 * Renders an open world radar with roads, points of interest, and player car orientation.
 */
class Minimap {
    constructor(canvasId, terrain) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.terrain = terrain;
        this.zoom = 1.0; // zoom level
        this.viewRadius = 260; // world meters around car visible in minimap

        this.pois = [
            { name: 'City Downtown', x: -174, z: -174, icon: '🏙️', color: '#3498db' },
            { name: 'Historic Lofts & Apartments', x: -174, z: 3, icon: '🏢', color: '#e67e22' },
            { name: 'Stunt Park', x: 300, z: 300, icon: '⚡', color: '#f39c12' },
            { name: 'Windmill Farm', x: -320, z: 240, icon: '🌾', color: '#2ecc71' },
            { name: 'Lighthouse', x: -460, z: 380, icon: '🏮', color: '#e74c3c' },
            { name: 'Mountain Peak', x: 380, z: -320, icon: '⛰️', color: '#9b59b6' }
        ];
    }

    render(carPos, carHeading) {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const scale = (width / 2) / this.viewRadius;

        ctx.clearRect(0, 0, width, height);

        // Circular clip path for GPS radar look
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
        ctx.clip();

        // 1. Radar background
        ctx.fillStyle = '#187a11'; // dark green grass land
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let g = 0; g < width; g += 30) {
            ctx.beginPath();
            ctx.moveTo(g, 0);
            ctx.lineTo(g, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, g);
            ctx.lineTo(width, g);
            ctx.stroke();
        }

        // Helper to convert world coordinate (wx, wz) to canvas (px, py) centered on car
        const worldToCanvas = (wx, wz) => {
            const dx = wx - carPos.x;
            const dz = wz - carPos.z;
            return {
                x: cx + dx * scale,
                y: cy + dz * scale
            };
        };

        // 2. Draw Roads
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const rWidth = (this.terrain.roadWidth || 18.0) * scale;
        const viewDist = this.viewRadius + 40;

        for (const road of this.terrain.roads) {
            // Fast bounding box culling: skip roads completely outside minimap radar
            let minX = 9999, maxX = -9999, minZ = 9999, maxZ = -9999;
            for (let i = 0; i < road.length; i++) {
                if (road[i].x < minX) minX = road[i].x;
                if (road[i].x > maxX) maxX = road[i].x;
                if (road[i].z < minZ) minZ = road[i].z;
                if (road[i].z > maxZ) maxZ = road[i].z;
            }
            if (carPos.x < minX - viewDist || carPos.x > maxX + viewDist ||
                carPos.z < minZ - viewDist || carPos.z > maxZ + viewDist) {
                continue;
            }

            // Road base (dark asphalt bitumen)
            ctx.beginPath();
            ctx.strokeStyle = '#282a2e';
            ctx.lineWidth = rWidth;
            for (let i = 0; i < road.length; i++) {
                const pt = worldToCanvas(road[i].x, road[i].z);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.stroke();

            // Center double-yellow divider
            ctx.beginPath();
            ctx.strokeStyle = '#f5be18';
            ctx.lineWidth = Math.max(1.2, rWidth * 0.12);
            for (let i = 0; i < road.length; i++) {
                const pt = worldToCanvas(road[i].x, road[i].z);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.stroke();
        }

        // 3. Draw Landmarks / POIs
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const poi of this.pois) {
            const p = worldToCanvas(poi.x, poi.z);
            // Check if within bounds
            const d = Math.hypot(p.x - cx, p.y - cy);
            if (d < cx - 12) {
                // POI dot
                ctx.fillStyle = poi.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();

                // Icon / Label
                ctx.fillText(poi.icon, p.x, p.y - 12);
            }
        }

        // 4. Draw Player Car Arrow (always at center, rotated to car heading)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-carHeading); // Orient arrow with car heading

        // Shadow
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;

        // Player arrowhead
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.moveTo(0, 8);      // Front tip
        ctx.lineTo(-6, -8);    // Back left
        ctx.lineTo(0, -5);     // Inset
        ctx.lineTo(6, -8);     // Back right
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 5. Radar Rings & Compass Edge
        ctx.restore(); // Exit clip

        // Compass bezel border
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
        ctx.stroke();

        // North indicator 'N'
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N', cx, 14);
    }
}

window.Minimap = Minimap;
