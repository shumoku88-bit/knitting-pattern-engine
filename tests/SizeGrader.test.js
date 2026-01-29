/**
 * SizeGrader Test Suite
 */

const GaugeCalculator = require('../src/calculators/GaugeCalculator');
const SizeGrader = require('../src/calculators/SizeGrader');

console.log('╔════════════════════════════════════════════════╗');
console.log('║   Size Grader Test Suite                       ║');
console.log('╚════════════════════════════════════════════════╝\n');

const gauge = new GaugeCalculator(19, 26);
const grader = new SizeGrader(gauge, { neckType: 'crew' });

console.log('📊 Test 1: All Sizes Generation');
console.log('─────────────────────────────');
grader.printSizeChart();
console.log('');

console.log('📊 Test 2: Custom Size');
console.log('─────────────────────────────');
const custom = grader.gradeCustomSize(110);
console.log('Custom (110cm):');
console.log('  Neck:', custom.data.neckTotal, 'sts');
console.log('  Start CO:', custom.data.startCO, 'sts');
console.log('  Center Cast On:', custom.data.centerCastOn, 'sts');
console.log('');

console.log('╔════════════════════════════════════════════════╗');
console.log('║   All Tests Completed                          ║');
console.log('╚════════════════════════════════════════════════╝');
