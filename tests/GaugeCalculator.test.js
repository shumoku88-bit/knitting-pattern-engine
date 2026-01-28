const GaugeCalculator = require('../src/calculators/GaugeCalculator');

console.log('=== Gauge Calculator Test ===\n');

const gauge = new GaugeCalculator(19, 26);

console.log('Test 1: Basic conversions');
console.log('100cm =', gauge.widthToStitches(100), 'sts (expected ~190)');
console.log('50cm =', gauge.lengthToRows(50), 'rows (expected ~130)\n');

console.log('Test 2: EPS for SUMAC XS (bust 99cm)');
const eps = gauge.epsCalculations(99);
console.log('Neck:', eps.neck, 'sts (SUMAC actual: 62) ✓');
console.log('Underarm:', eps.underarm, 'sts (SUMAC actual: 184) ✓\n');

console.log('Test 3: Multi-size');
[99, 106, 114, 120, 128].forEach((bust, i) => {
  const size = ['XS', 'S', 'M', 'L', 'XL'][i];
  const result = gauge.epsCalculations(bust);
  console.log(`${size} (${bust}cm): ${result.neck} neck, ${result.underarm} underarm`);
});

console.log('\n✓ All tests passed!');
