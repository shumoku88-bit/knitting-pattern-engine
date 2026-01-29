class GaugeCalculator {
    constructor(stitchesPerTenCm, rowsPerTenCm) {
        this.stitchesPerTenCm = stitchesPerTenCm;
        this.rowsPerTenCm = rowsPerTenCm;
    }

    /**
     * EPS (Elizabeth Zimmermann's Percentage System) Calculations
     * Key Number (K) = Chest circumference * Gauge (sts/cm)
     */
    epsCalculations(chestCm) {
        // 1cmあたりの目数
        const stsPerCm = this.stitchesPerTenCm / 10;
        
        // Key Number (K) の算出
        const keyNumber = Math.round(chestCm * stsPerCm);

        // Kは奇数だと扱いにくいので、偶数に補正する（Sumac/Everywhereのロジック）
        const adjustedK = keyNumber % 2 === 0 ? keyNumber : keyNumber + 1;

        return {
            chestCm: chestCm,
            keyNumber: adjustedK,
            stsPerCm: stsPerCm
        };
    }

    getGaugeInfo() {
        return {
            stitchesPerTenCm: this.stitchesPerTenCm,
            rowsPerTenCm: this.rowsPerTenCm
        };
    }

    // === 新しく追加する変換メソッド群 ===

    /**
     * 目数を幅(cm)に変換
     */
    stitchesToWidth(sts) {
        return sts / (this.stitchesPerTenCm / 10);
    }

    /**
     * 長さ(cm)を段数に変換
     */
    lengthToRows(cm) {
        return Math.round(cm * (this.rowsPerTenCm / 10));
    }

    /**
     * 幅(cm)を目数に変換
     */
    widthToStitches(cm) {
        return Math.round(cm * (this.stitchesPerTenCm / 10));
    }
}

module.exports = GaugeCalculator;
