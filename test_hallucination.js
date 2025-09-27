import { detectHallucination } from './src/utils/validation.js';

const normalReport = `
COMPLETE BLOOD COUNT
Hemoglobin: 14.2 g/dL
WBC: 7,500 /μL
RBC: 4.8 million/μL
Platelets: 250,000 /μL
Glucose: 95 mg/dL
`;

const normalTests = [
  { name: 'Hemoglobin', value: 14.2, unit: 'g/dL' },
  { name: 'WBC', value: 7500, unit: '/μL' },
  { name: 'Glucose', value: 95, unit: 'mg/dL' }
];

console.log('Testing normal report...');
const result1 = detectHallucination(normalReport, normalTests);
console.log('Result:', result1);

const ocrReport = `
COMPLETE BL00D C0UNT
Hemoglobin: l4.2 g/dL
WBC: 7,5OO /μL
Glucose: 9S mg/dL
`;

const ocrTests = [
  { name: 'Hemoglobin', value: 14.2, unit: 'g/dL' },
  { name: 'WBC', value: 7500, unit: '/μL' },
  { name: 'Glucose', value: 95, unit: 'mg/dL' }
];

console.log('\nTesting OCR report with typos...');
const result2 = detectHallucination(ocrReport, ocrTests);
console.log('Result:', result2);