import { extractTextFromImage } from '../services/ocrService.js';
import { normalizeTests } from '../services/normalizationService.js';
import { generatePatientFriendlySummary } from '../services/summaryService.js';
import { validateInput, detectHallucination } from '../utils/validation.js';
import { correctTypos } from '../utils/typoCorrection.js';

async function processTextReport(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text input is required and must be a string'
      });
    }

    const validation = validateInput(text);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'unprocessed',
        reason: validation.reason
      });
    }

    const rawTests = extractTestsFromText(text);
    console.log('Raw tests from text extraction:', rawTests);

    const rawTestStrings = rawTests.map(test => typeof test === 'string' ? test : test.raw);
    const normalizedResult = await normalizeTests(rawTestStrings);

    console.log('Normalized result:', {
      testsCount: normalizedResult.tests ? normalizedResult.tests.length : 0,
      tests: normalizedResult.tests,
      confidence: normalizedResult.normalization_confidence
    });

    const correctedText = correctTypos(text);
    const hallucinationCheck = detectHallucination(correctedText, normalizedResult.tests);
    if (!hallucinationCheck.isValid) {
      return res.status(400).json({
        error: 'Input contains suspicious content',
        details: hallucinationCheck.issues
      });
    }

    console.log('About to generate summary with tests:', normalizedResult.tests);
    const summary = await generatePatientFriendlySummary(normalizedResult.tests);
    console.log('Generated summary:', summary);

    res.json(summary);
  } catch (error) {
    console.error('Error processing text report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process medical report'
    });
  }
}

async function processImageReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Image file is required'
      });
    }

    const ocrResult = await extractTextFromImage(req.file.buffer);

    if (ocrResult.confidence < 0.5) {
      return res.status(400).json({
        status: 'unprocessed',
        reason: 'OCR confidence too low, image quality insufficient'
      });
    }

    const validation = validateInput(ocrResult.text);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'unprocessed',
        reason: validation.reason
      });
    }

    const normalizedResult = await normalizeTests(ocrResult.tests_raw);
    const hallucinationCheck = detectHallucination(ocrResult.text, normalizedResult.tests);
    if (!hallucinationCheck.isValid) {
      return res.status(400).json({
        status: 'unprocessed',
        reason: 'hallucinated tests not present in input'
      });
    }

    const summary = await generatePatientFriendlySummary(normalizedResult.tests);

    res.json({
      tests: normalizedResult.tests,
      summary: summary.summary,
      explanations: summary.explanations,
      status: 'ok',
      ocr_confidence: ocrResult.confidence,
      normalization_confidence: normalizedResult.normalization_confidence
    });
  } catch (error) {
    console.error('Error processing image report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process medical report image'
    });
  }
}

function extractTestsFromText(text) {
  console.log('\n=== TEXT EXTRACTION DEBUG ===');
  console.log('Original text input:', text);

  const correctedText = correctTypos(text);
  console.log('Typo-corrected text:', correctedText);

  const testPatterns = [
    /([a-zA-Z][a-zA-Z\s-]{2,40}):\s*([\d.,<>]+)\s*([a-zA-Z\/μµ%0-9^"]*)\s*\(?(Low|High|Normal)?\)?/gi,
    /([a-zA-Z][a-zA-Z\s-]{2,40})\s+([\d.,<>]+)\s+([\d.,<>-]+)\s*([a-zA-Z\/μµ%0-9^"]+)/gi,
    /([a-zA-Z][a-zA-Z\s-]{2,40})\s+([\d.,<>]+)\s+([a-zA-Z\/μµ%0-9^"]{2,15})/gi,
    /\b([a-zA-Z][a-zA-Z\s-]{2,30})\s+([\d.,<>]+)\b/gi
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

      const lowerTestName = testName.toLowerCase().trim();
      const commonMedicalTerms = [
        'hemoglobin', 'hgb', 'wbc', 'rbc', 'platelet', 'plt', 'glucose',
        'cholesterol', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil',
        'mcv', 'mch', 'mchc', 'rdw', 'esr', 'hematocrit', 'hct', 'creatinine',
        'sodium', 'potassium', 'urea', 'ureum', 'bun', 'alt', 'ast', 'alp',
        'ggt', 'bilirubin', 'protein', 'albumin', 'tsh', 'hba1c', 'thrombocytes',
        'c-reactive protein', 'crp', 'white blood cell', 'red blood cell',
        'lactate dehydrogenase', 'aminotransferase', 'phosphatase', 'transferase',
        'filtration rate', 'glomerular'
      ];

      const isValidTestName = lowerTestName.length >= 3 && lowerTestName.length <= 50 &&
        /^[a-zA-Z\s-]+$/.test(testName) &&
        !lowerTestName.startsWith('l ') &&
        !lowerTestName.includes('  ') &&
        commonMedicalTerms.some(term => lowerTestName.includes(term));

      const cleanValue = value.replace(/[<>,]/g, '');
      const numericValue = parseFloat(cleanValue);

      if (isValidTestName && !isNaN(numericValue) && numericValue >= 0) {
        const normalizedTestName = lowerTestName.replace(/\s+/g, ' ');
        const testKey = `${normalizedTestName}_${cleanValue}`;

        if (!foundTests.has(testKey)) {
          foundTests.add(testKey);
          extractedTests.push({
            raw: match[0].trim(),
            testName: testName.trim(),
            value: cleanValue,
            unit: unit.trim(),
            status: status.trim()
          });
          console.log(`  → ADDED: ${match[0].trim()}`);
        } else {
          console.log(`  → DUPLICATE: ${match[0].trim()}`);
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

export {
  processTextReport,
  processImageReport
};
