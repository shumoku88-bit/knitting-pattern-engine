/**
 * Pattern Text Generator
 * 計算結果(data)を受け取り、HTMLを生成する
 * Version 1.1.0 - Short Rows対応
 */

const MASTER_ABBREVIATIONS = {
    "CO": "Cast On",
    "BO": "Bind Off",
    "RS": "Right Side",
    "WS": "Wrong Side",
    "st": "Stitch",
    "sts": "Stitches",
    "K": "Knit",
    "P": "Purl",
    "pm": "Place Marker",
    "sm": "Slip Marker",
    "BOR": "Beginning of Round",
    "M1R": "Make 1 Right (Increase)",
    "M1L": "Make 1 Left (Increase)",
    "k2tog": "Knit 2 together (Decrease)",
    "ssk": "Slip slip knit (Decrease)",
    "yo": "Yarn Over",
    "DS": "Double Stitch (German Short Rows)"
};

class PatternTextGenerator {
    constructor(data, gaugeInfo) {
        this.data = data;
        this.gauge = gaugeInfo;
    }

    generatePattern() {
        const d = this.data;
        
        // Short Rows セクションの生成
        const shortRowsHtml = this._generateShortRowsSection(d.shortRows);

        // Neck Shaping (Part 1) の生成
        const instructionsHtml = `
            ${shortRowsHtml}

            <h3>Part 1: Neck Shaping (Working Flat)</h3>
            <p>With larger needle <strong>CO</strong> <strong>${d.startCO}</strong> sts. <strong>Do not join.</strong></p>
            <p><strong>Set up row (WS):</strong> P${d.frontStart} (Right Front), pm, P${d.sleeveSts} (Sleeve), pm, P${d.backSts} (Back), pm, P${d.sleeveSts} (Sleeve), pm, P${d.frontStart} (Left Front).</p>

            <div class="instruction-box">
                ${this._generateYoke(d.startCO, d.frontStart, d.stopIncreaseAt, d.centerCastOn)}
            </div>
        `;

        const abbrHtml = this._generateAbbreviationList(instructionsHtml + (d.shortRows ? d.shortRows.metadata.description : ""));
        const schematicSvg = this._generateSchematic(d.bustCm, d.backSts);

        return `
<div class="pattern-paper">
    <header>
        <h1>CUSTOM RAGLAN DRAFT</h1>
        <div class="meta">
            <span><strong>Target Chest:</strong> ${d.bustCm} cm</span><br>
            <span><strong>Key Number (K):</strong> ${d.eps.keyNumber} sts</span>
            <span style="font-size:0.8em; color:#666;">(Neck: ${d.options.neckType} / Fit: ${d.options.fitType})</span>
        </div>

        <div style="margin-top:10px; padding-top:10px; border-top:1px solid #ccc;">
            <strong>GAUGE:</strong> ${this.gauge.stitchesPerTenCm} sts x ${this.gauge.rowsPerTenCm} rows = 10 cm
        </div>
        
        <div style="background:#eee; padding:15px; margin-top:15px; font-size:14px; border-left:5px solid #333; font-family:monospace;">
            <strong>ARCHITECT’S NOTES:</strong><br>
            - Back Width: ${d.backSts} sts<br>
            - Short Rows: ${d.shortRows && d.shortRows.enabled ? 'YES' : 'NO'}<br>
            - Final Front Goal: ${d.targetFront} sts
        </div>
    </header>

    <section>
        <h2>SCHEMATIC</h2>
        <div style="text-align: center; margin: 20px 0;">
            ${schematicSvg}
        </div>
    </section>

    <section>
        <h2>INSTRUCTIONS</h2>
        ${instructionsHtml}
    </section>

    ${abbrHtml}
</div>`.trim();
    }

    _generateShortRowsSection(sr) {
        if (!sr || !sr.enabled) return '';

        const rowsHtml = sr.schedule.map(row => 
            `<p class="row-inst"><strong>Short Row ${row.row}:</strong> ${row.instruction}</p>`
        ).join('');

        return `
        <div style="background: #fff3e0; padding: 15px; margin-bottom: 20px; border: 1px solid #ffcc80;">
            <h3>Step 0: Back Neck Raise (Short Rows)</h3>
            <p><strong>Goal:</strong> ${sr.metadata.description}</p>
            <p><strong>Method:</strong> ${sr.metadata.methodName}</p>
            <p><em>Technique: ${sr.metadata.technique}</em></p>
            
            <div class="instruction-box">
                ${rowsHtml}
                <p style="margin-top:10px; font-weight:bold;">Next Row: Work across all stitches to resolve double stitches (or wraps), then proceed to Neck Shaping.</p>
            </div>
        </div>`;
    }

    _generateYoke(currentTotalSts, currentFrontSts, stopIncreaseAt, castOnSts) {
        let html = "";
        let row = 1;
        let sts = currentTotalSts;
        let front = currentFrontSts;
        
        while (front < stopIncreaseAt) {
            let instructions = "";
            let incSts = 0;
            let label = "";

            if (row === 1) {
                instructions = "K1, *M1R, K1, sm, K1, M1L... (Raglan Inc only)";
                incSts = 8;
                label = `Row ${row} (RS)`;
            } 
            else if (row % 2 !== 0) {
                instructions = "<strong>Neck Inc</strong>, *Raglan Inc... end with <strong>Neck Inc</strong>.";
                incSts = 10; 
                front += 2;
                label = `Row ${row} (RS)`;
            } 
            else {
                instructions = "Purl all stitches.";
                incSts = 0;
                label = `Row ${row} (WS)`;
            }

            sts += incSts;
            html += `<p class="row-inst"><strong>${label}:</strong> ${instructions} <span class="sts-count">[Total: ${sts} sts]</span></p>`;
            row++;
        }

        const finalTotal = sts + castOnSts;
        html += `
        <div style="margin: 20px 0; padding: 15px; background: #eef; border: 2px solid #007AFF;">
            <h3>Step: JOIN IN THE ROUND</h3>
            <p><strong>Next Row (RS):</strong> Knit to end, then using Cable Cast On method, 
            <strong>Cast On ${castOnSts} sts</strong> (Center Front).</p>
            <p>Place marker for BOR and join to work in the round.</p>
            <p><strong>Total Stitches:</strong> <span style="font-size:1.2em; font-weight:bold;">${finalTotal} sts</span></p>
        </div>`;

        return html;
    }

    _generateAbbreviationList(fullText) {
        let found = [];
        for (const [key, desc] of Object.entries(MASTER_ABBREVIATIONS)) {
            const regex = new RegExp(`\\b${key}\\b`, 'i');
            if (regex.test(fullText)) {
                found.push({ key, desc });
            }
        }
        if (found.length === 0) return "";
        let listHtml = found.map(item => 
            `<div class="abbr-item"><span class="abbr-key">${item.key}</span>: ${item.desc}</div>`
        ).join("");
        return `<section class="abbreviations"><h3>Abbreviations Used</h3><div class="abbr-list">${listHtml}</div></section>`;
    }

    _generateSchematic(chestCm, neckSts) {
        const scale = 2.5; 
        const w = chestCm * scale; 
        const neckW = (neckSts / this.gauge.stitchesPerTenCm * 10) * scale;
        const yokeH = (chestCm / 4) * scale; 
        const bodyH = (chestCm / 1.5) * scale; 

        const centerX = 150;
        const topY = 20;
        const neckLeft = centerX - (neckW / 2);
        const neckRight = centerX + (neckW / 2);
        const bodyLeft = centerX - (w / 2);
        const bodyRight = centerX + (w / 2);
        const armpitY = topY + yokeH;
        const bottomY = armpitY + bodyH;

        return `
        <svg width="300" height="${bottomY + 40}" viewBox="0 0 300 ${bottomY + 40}" style="background:#fff; border:1px solid #ddd;">
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#007AFF" />
                </marker>
            </defs>
            <path d="M ${neckLeft},${topY} L ${neckRight},${topY} L ${bodyRight},${armpitY} L ${bodyRight},${bottomY} L ${bodyLeft},${bottomY} L ${bodyLeft},${armpitY} Z" fill="#f9f9f9" stroke="#333" stroke-width="2" />
            <text x="${centerX}" y="${armpitY + 15}" font-size="12" fill="#007AFF" text-anchor="middle">Chest: ${chestCm} cm</text>
        </svg>`;
    }
}

module.exports = PatternTextGenerator;
