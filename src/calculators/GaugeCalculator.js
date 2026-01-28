class GaugeCalculator {
  constructor(stitchesPerTenCm, rowsPerTenCm) {
    this.stitchesPerTenCm = stitchesPerTenCm;
    this.rowsPerTenCm = rowsPerTenCm;
    this.stitchesPerCm = stitchesPerTenCm / 10;
    this.rowsPerCm = rowsPerTenCm / 10;
  }

  widthToStitches(widthCm) {
    return Math.round(widthCm * this.stitchesPerCm);
  }

  lengthToRows(lengthCm) {
    return Math.round(lengthCm * this.rowsPerCm);
  }

  calculateKeyNumber(bustCircumferenceCm) {
    return this.widthToStitches(bustCircumferenceCm);
  }

  epsCalculations(bustCircumferenceCm) {
    const keyNumber = this.calculateKeyNumber(bustCircumferenceCm);
    return {
      keyNumber: keyNumber,
      neck: Math.round(keyNumber * 0.33),
      underarm: Math.round(keyNumber * 1.0),
      cuff: Math.round(keyNumber * 0.12),
      hem: Math.round(keyNumber * 1.05),
    };
  }

  getGaugeInfo() {
    return {
      stitchesPerTenCm: this.stitchesPerTenCm,
      rowsPerTenCm: this.rowsPerTenCm,
      stitchesPerCm: this.stitchesPerCm,
      rowsPerCm: this.rowsPerCm,
    };
  }
}

module.exports = GaugeCalculator;
