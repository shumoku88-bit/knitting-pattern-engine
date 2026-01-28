class PatternTextGenerator {
    constructor(eps, gaugeInfo) {
        this.eps = eps;
        this.gauge = gaugeInfo;
    }

    // 偶数強制の調整役
    _adjustStitchCount(count, isFlatKnitting = false) {
        let c = Math.round(count);
        return isFlatKnitting ? c : (c % 2 === 0 ? c : c + 1);
    }

    generatePattern(sizeName = "Custom") {
        const chestCm = Math.round(this.eps.keyNumber / (this.gauge.stitchesPerTenCm/10));
        
        // --- 1. 基本セットアップ ---
        const rawNeckTotal = this.eps.keyNumber * 0.33;
        const sleeveSts = this._adjustStitchCount(rawNeckTotal * 0.225, false);
        const frontStsStart = 2; 
        const rawBack = rawNeckTotal - (sleeveSts * 2) - (frontStsStart * 2);
        const backSts = this._adjustStitchCount(rawBack, false);
        const startCO = backSts + (sleeveSts * 2) + (frontStsStart * 2);

        // --- 2. Uネック（丸首）のための計算 ---
        const targetFrontTotal = backSts; // 最終的に背中と同じ幅にする
        const gapRatio = 0.4; 
        const rawGap = targetFrontTotal * gapRatio;
        const centerCastOnSts = this._adjustStitchCount(rawGap, false); // 偶数にする
        const stopIncreasingAt = targetFrontTotal - centerCastOnSts;

        return `
<div class="pattern-paper">
    <header>
        <h1>CUSTOM RAGLAN DRAFT</h1>
        <div class="meta">
            <span><strong>Target Chest:</strong> ${chestCm} cm</span><br>
            <span><strong>Key Number (K):</strong> ${this.eps.keyNumber} sts</span>
        </div>
        
        <div style="background:#eee; padding:15px; margin-top:15px; font-size:14px; border-left:5px solid #333; font-family:monospace;">
            <strong>ARCHITECT’S NOTES (Neck Geometry):</strong><br>
            - Back Width: ${backSts} sts<br>
            - Final Front Goal: ${targetFrontTotal} sts<br>
            - <strong>Center Cast On: ${centerCastOnSts} sts</strong> (Gap to bridge)<br>
            - Sloped Increases: Grow from ${frontStsStart} to ${stopIncreasingAt} sts
        </div>
    </header>

    <section>
        <h2>INSTRUCTIONS</h2>
        <h3>Part 1: Neck Shaping (Working Flat)</h3>
        <p>With larger needle CO <strong>${startCO}</strong> sts. <strong>Do not join.</strong></p>
        <p><strong>Set up row (WS):</strong> P${frontStsStart}, pm, P${sleeveSts}, pm, P${backSts}, pm, P${sleeveSts}, pm, P${frontStsStart}.</p>

        <div class="instruction-box">
            ${this._generateYoke(startCO, frontStsStart, stopIncreasingAt, centerCastOnSts)}
        </div>
    </section>
</div>`.trim();
    }

    _generateYoke(currentTotalSts, currentFrontSts, stopIncreaseAt, castOnSts) {
        let html = "";
        let row = 1;
        let sts = currentTotalSts;
        let front = currentFrontSts;
        
        // --- Loop: 増し目パート ---
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
            html += `<p class="row-inst"><strong>${label}:</strong> ${instructions} <span class="sts-count">[Total: ${sts} sts / Front: ${front} sts]</span></p>`;
            row++;
        }

        // --- The Join (結合パート) ---
        const finalTotal = sts + castOnSts;
        
        html += `
        <div style="margin: 20px 0; padding: 15px; background: #eef; border: 2px solid #007AFF;">
            <h3>Step: JOIN IN THE ROUND</h3>
            <p><strong>Next Row (RS):</strong> Knit to end, then using Cable Cast On method, 
            <strong>Cast On ${castOnSts} sts</strong> (Center Front).</p>
            <p>Place marker for Beginning of Round (BOR) and join to work in the round.</p>
            <p><strong>Total Stitches:</strong> <span style="font-size:1.2em; font-weight:bold;">${finalTotal} sts</span></p>
        </div>
        <p><em>(Continue working in the round for Yoke...)</em></p>`;

        return html;
    }
}

module.exports = PatternTextGenerator;
