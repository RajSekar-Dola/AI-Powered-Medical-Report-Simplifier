import Tesseract from 'tesseract.js';
import { correctTypos } from '../utils/typoCorrection.js';

async function extractTextFromImage(imageBuffer) {
  try {
    const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const extractedText = data.text.trim();
    console.log('OCR completed. Extracted text:', extractedText);

    const testsRaw = extractAndCleanTests(extractedText);
    const confidence = calculateOCRConfidence(data.confidence, extractedText);

    return {
      text: extractedText,
      tests_raw: testsRaw,
      confidence: confidence
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

function extractAndCleanTests(text) {
  console.log('\n=== OCR EXTRACTION DEBUG ===');
  console.log('Original OCR text:', text);

  const correctedText = correctTypos(text);
  console.log('Typo-corrected text:', correctedText);

  const testPatterns = [
    /([a-zA-Z][a-zA-Z\s%#-]{1,30})\s+([\d.,<>]+)\s+[\d.,<>-]+\s*([a-zA-Z\/μµ%0-9^"]+)/gi,
    /([a-zA-Z][a-zA-Z\s%#-]{1,30})\s+([\d.,<>]+)\s*([a-zA-Z\/μµ%0-9^"]+)/gi,
    /([a-zA-Z][a-zA-Z\s%#-]{1,30})\s+([\d.,<>]+)\s+[\d.,<>-]*\s*([a-zA-Z\/μµ%0-9^"]*)\s*(Low|High|Normal)?\s*$/gi,
    /([a-zA-Z\s]{2,20})\s+([\d.,<>]+)(?:\s|$)/gi
  ];

  const extractedTests = [];
  const foundTests = new Set();

  testPatterns.forEach((pattern, patternIndex) => {
    console.log(`\n--- Testing Pattern ${patternIndex + 1} ---`);
    let match;
    let patternMatches = 0;

    while ((match = pattern.exec(correctedText)) !== null) {
      patternMatches++;
      const testName = match[1].trim();
      const value = match[2];
      const unit = match[3] || '';
      const status = match[4] || '';

      console.log(`Match ${patternMatches}:`, {
        full: match[0].trim(),
        testName,
        value,
        unit,
        status
      });

      const lowerTestName = testName.toLowerCase();
      const commonMedicalTerms = [
        'hemoglobin', 'hgb', 'wbc', 'rbc', 'platelet', 'plt', 'glucose', 
        'cholesterol', 'neu', 'lym', 'mon', 'eos', 'bas', 'mcv', 
        'mch', 'mchc', 'rdw', 'esr', 'hematocrit', 'hct', 'gra', 'creatinine',
        'sodium', 'potassium', 'urea', 'ureum', 'ldh', 'ast', 'alt', 'alp',
        'ggt', 'bilirubin', 'protein', 'albumin', 'globulin'
      ];

      const isValidTest = commonMedicalTerms.some(term => 
        lowerTestName.includes(term) || term.includes(lowerTestName)
      ) || /^[a-zA-Z\s%#-]{2,30}$/.test(testName);

      const numericValue = parseFloat(value.replace(/[<>,]/g, ''));

      if (isValidTest && !isNaN(numericValue) && numericValue > 0) {
        const testKey = `${testName}_${value}_${unit}`;
        if (!foundTests.has(testKey)) {
          foundTests.add(testKey);
          extractedTests.push(match[0].trim());
          console.log(`  → ADDED: ${match[0].trim()}`);
        }
      } else {
        console.log(`  → REJECTED: Not a valid medical test or invalid value`);
      }
    }

    if (patternMatches === 0) {
      console.log('  → No matches found for this pattern');
    }
  });

  console.log(`\nFinal extracted tests (${extractedTests.length}):`, extractedTests);
  return extractedTests;
}

function cleanOCRErrors(text) {
  const stringCorrections = {
    'Hemglobin': 'Hemoglobin',
    'Haemoglobin': 'Hemoglobin',
    'Hgb': 'Hemoglobin',
    'WBC': 'WBC',
    'RBC': 'RBC',
    'Hgh': 'High',
    'Lw': 'Low',
    'Nrmal': 'Normal',
    'g/dL': 'g/dL',
    '/uL': '/uL',
    '/µL': '/uL',
    'mg/dL': 'mg/dL',
    'mmol/L': 'mmol/L'
  };

  const regexCorrections = [
    { pattern: /\s+/g, replacement: ' ' },
    { pattern: /(\d)\s+(\.\d)/g, replacement: '$1$2' },
    { pattern: /(\d)\s*,\s*(\d)/g, replacement: '$1$2' }
  ];
  
  let cleaned = text;

  for (const [error, correction] of Object.entries(stringCorrections)) {
    cleaned = cleaned.replace(new RegExp(error, 'gi'), correction);
  }

  for (const { pattern, replacement } of regexCorrections) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  
  return cleaned.trim();
}

function calculateOCRConfidence(tesseractConfidence, extractedText) {
  let confidence = tesseractConfidence / 100;

  const hasNumbers = /\d/.test(extractedText);
  const hasUnits = /(g\/dL|mg\/dL|\/uL|mmol\/L)/i.test(extractedText);
  const hasStatus = /(low|high|normal)/i.test(extractedText);

  if (hasNumbers) confidence += 0.1;
  if (hasUnits) confidence += 0.1;
  if (hasStatus) confidence += 0.05;

  if (extractedText.length < 10) confidence -= 0.2;
  if (extractedText.length > 1000) confidence -= 0.1;

  return Math.max(0, Math.min(1, confidence));
}

export {
  extractTextFromImage
};
