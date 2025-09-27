import { MEDICAL_TESTS_DATABASE } from '../data/medicalTestsDatabase.js'

function preprocessOCRData(rawTests) {
  const extractedMatches = [];
  
  for (const rawTest of rawTests) {
    const match = parseTestStringWithInfo(rawTest);
    if (match) {
      extractedMatches.push(match);
    }
  }
  
  return extractedMatches;
}

function parseTestStringWithInfo(testString) {
  const patterns = [
    /^([A-Za-z\s-]+?)\s*:\s*([\d.,<>]+)\s*([A-Za-z\/µμ0-9<>]+(?:\/[A-Za-z]+)?)/i,
    /^([A-Za-z\s-]+?)\s+([\d.,<>]+)\s+(?:[\d.,<>-]+\s+)?([A-Za-z\/µμ0-9<>]+(?:\/[A-Za-z]+)?)/i,
    /^([A-Za-z\s-]+?)\s+([\d.,<>]+)\s*([A-Za-z\/µμ0-9<>]+(?:\/[A-Za-z]+)?)/i
  ];
  
  let match = null;
  for (const pattern of patterns) {
    match = testString.match(pattern);
    if (match) break;
  }
  
  if (!match) return null;
  
  const testName = match[1].trim();
  const rawValue = match[2].replace(/[<>,]/g, '').replace(',', '.');
  const value = parseFloat(rawValue);
  const unit = match[3].trim();
  
  if (isNaN(value) || value < 0) {
    console.log(`Skipping test "${testName}" with invalid value "${match[2]}" (parsed: ${value})`);
    return null;
  }
  
  const testInfo = findTestInfo(testName, unit);
  
  if (!testInfo) {
    console.log(`No test info found for "${testName}" with unit "${unit}"`);
    return null;
  }
  
  return {
    value: value,
    unit: unit,
    status: null,
    testInfo: testInfo
  };
}

function calculateValueReasonableness(value, refLow, refHigh) {
  if (value >= refLow && value <= refHigh) {
    return 1.0;
  }
  
  const rangeSize = refHigh - refLow;
  let distance;
  
  if (value < refLow) {
    distance = refLow - value;
  } else {
    distance = value - refHigh;
  }
  
  const maxReasonableDistance = rangeSize * 2;
  const extremeDistance = rangeSize * 5;
  
  if (distance <= maxReasonableDistance) {
    return 0.9 - (distance / maxReasonableDistance) * 0.4;
  } else if (distance <= extremeDistance) {
    const ratio = (distance - maxReasonableDistance) / (extremeDistance - maxReasonableDistance);
    return 0.5 - (ratio * 0.49);
  } else {
    return 0.01;
  }
}

function findTestInfo(testName, unit) {
  const normalizedTestName = testName.toLowerCase().trim();
  
  const directMatches = {
    'hemoglobin': 'hemoglobin',
    'haemoglobin': 'hemoglobin',
    'hgb': 'hemoglobin',
    'c-reactive protein': 'wbc',
    'red blood cell count': 'rbc',
    'rbc': 'rbc',
    'white blood cell count': 'wbc',
    'wbc': 'wbc',
    'thrombocytes': 'platelets',
    'platelets': 'platelets',
    'glucose': 'glucose',
    'hematocrit': 'hematocrit',
    'hct': 'hematocrit'
  };
  
  const dbKey = directMatches[normalizedTestName];
  if (dbKey && MEDICAL_TESTS_DATABASE[dbKey]) {
    return MEDICAL_TESTS_DATABASE[dbKey];
  }
  
  for (const [key, testInfo] of Object.entries(MEDICAL_TESTS_DATABASE)) {
    if (normalizedTestName.includes(key) || testInfo.name.toLowerCase().includes(normalizedTestName)) {
      return testInfo;
    }
  }
  
  return null;
}

export const normalizeTests = (rawTestsOrMatches) => {
  let extractedMatches;
  if (typeof rawTestsOrMatches[0] === 'string') {
    extractedMatches = preprocessOCRData(rawTestsOrMatches);
  } else {
    extractedMatches = rawTestsOrMatches;
  }
  
  const tests = [];
  const testsByName = new Map();
  let totalConfidence = 0;

  extractedMatches.forEach((match, index) => {
    
    const testInfo = match.testInfo;
    if (!testInfo) {
      return;
    }

    if (isNaN(match.value) || match.value < 0) {
      console.log(`Skipping test with invalid value: ${match.value}`);
      return;
    }

    let status = match.status;
    
    if (!status || !['high', 'low', 'normal', 'elevated', 'decreased'].includes(status)) {
      const { low, high } = testInfo.ref_range;
      if (match.value < low) status = 'low';
      else if (match.value > high) status = 'high';
      else status = 'normal';
      
    } else if (status === 'elevated') {
      status = 'high';
    } else if (status === 'decreased') {
      status = 'low';
    }

    const unitMatch = match.unit.toLowerCase() === testInfo.unit.toLowerCase();
    const confidence = unitMatch ? 0.9 : 0.7;
    const { low, high } = testInfo.ref_range;
    const reasonableness = calculateValueReasonableness(match.value, low, high);
    const totalScore = confidence * 0.7 + reasonableness * 0.3;
    
    const normalizedTest = {
      name: testInfo.name,
      value: match.value,
      unit: testInfo.unit,
      status,
      ref_range: testInfo.ref_range,
      _score: totalScore
    };
    
    const testName = testInfo.name;
    if (testsByName.has(testName)) {
      const existingTest = testsByName.get(testName);
      if (normalizedTest._score > existingTest._score) {
        console.log(`Replacing duplicate test "${testName}": ${existingTest.value} -> ${normalizedTest.value} (better score: ${existingTest._score.toFixed(2)} -> ${normalizedTest._score.toFixed(2)})`);
        testsByName.set(testName, normalizedTest);
      } else {
        console.log(`Keeping existing test "${testName}": ${existingTest.value} (better score: ${existingTest._score.toFixed(2)} vs ${normalizedTest._score.toFixed(2)})`);
      }
    } else {
      testsByName.set(testName, normalizedTest);
    }
    
    totalConfidence += confidence;
  });
  
  testsByName.forEach(test => {
    delete test._score;
    tests.push(test);
  });
  
  return {
    tests,
    normalization_confidence: tests.length > 0 ? totalConfidence / tests.length : 0
  };
};

async function normalizeIndividualTest(rawTest) {
  try {
    const parsed = parseTestString(rawTest);
    if (!parsed) return null;
    
    const normalizedName = normalizeTestName(parsed.name);
    if (!normalizedName) return null;
    
    const refRange = getReferenceRange(normalizedName, parsed.unit);
    const status = determineStatus(parsed.value, refRange, parsed.status);
    const normalizedUnit = normalizeUnit(parsed.unit);
    
    const normalizedTest = {
      name: normalizedName,
      value: parsed.value,
      unit: normalizedUnit,
      status: status.toLowerCase(),
      ref_range: refRange
    };
    
    const confidence = calculateNormalizationConfidence(parsed, normalizedTest);
    
    return {
      test: normalizedTest,
      confidence: confidence
    };
    
  } catch (error) {
    console.error('Error normalizing test:', rawTest, error);
    return null;
  }
}

function parseTestString(testString) {
  const pattern = /^([A-Za-z\s]+?)\s+([\d.,]+)\s*([A-Za-z\/µμ]+)\s*(?:\(?(Low|High|Normal|Hgh|Lw|L|H|N)\)?)?/i;
  const match = testString.trim().match(pattern);
  
  if (!match) return null;
  
  return {
    name: match[1].trim(),
    value: parseFloat(match[2].replace(/,/g, '')),
    unit: match[3].trim(),
    status: match[4] ? match[4].trim() : null
  };
}

function normalizeTestName(name) {
  const nameMap = {
    'hemoglobin': 'Hemoglobin',
    'hemglobin': 'Hemoglobin',
    'haemoglobin': 'Hemoglobin',
    'hgb': 'Hemoglobin',
    'hb': 'Hemoglobin',
    'wbc': 'WBC',
    'white blood cell': 'WBC',
    'white blood cells': 'WBC',
    'leukocyte': 'WBC',
    'rbc': 'RBC',
    'red blood cell': 'RBC',
    'red blood cells': 'RBC',
    'erythrocyte': 'RBC',
    'platelet': 'Platelet',
    'platelets': 'Platelet',
    'thrombocyte': 'Platelet',
    'glucose': 'Glucose',
    'blood glucose': 'Glucose',
    'blood sugar': 'Glucose',
    'cholesterol': 'Cholesterol',
    'total cholesterol': 'Cholesterol',
    'creatinine': 'Creatinine',
    'bun': 'BUN',
    'blood urea nitrogen': 'BUN'
  };
  
  const normalized = nameMap[name.toLowerCase().trim()];
  return normalized || name.trim();
}

function getReferenceRange(testName, unit) {
  const ranges = {
    'Hemoglobin': {
      'g/dL': { low: 12.0, high: 15.0 },
      'g/L': { low: 120, high: 150 }
    },
    'WBC': {
      '/uL': { low: 4000, high: 11000 },
      '/µL': { low: 4000, high: 11000 },
      '×10³/µL': { low: 4.0, high: 11.0 }
    },
    'RBC': {
      '/uL': { low: 4200000, high: 5400000 },
      '×10⁶/µL': { low: 4.2, high: 5.4 }
    },
    'Platelet': {
      '/uL': { low: 150000, high: 450000 },
      '×10³/µL': { low: 150, high: 450 }
    },
    'Glucose': {
      'mg/dL': { low: 70, high: 100 },
      'mmol/L': { low: 3.9, high: 5.6 }
    },
    'Cholesterol': {
      'mg/dL': { low: 0, high: 200 },
      'mmol/L': { low: 0, high: 5.2 }
    },
    'Creatinine': {
      'mg/dL': { low: 0.6, high: 1.2 },
      'µmol/L': { low: 53, high: 106 }
    }
  };
  
  const testRanges = ranges[testName];
  if (!testRanges) {
    return { low: 0, high: 0 };
  }
  
  const normalizedUnit = normalizeUnit(unit);
  return testRanges[normalizedUnit] || testRanges[Object.keys(testRanges)[0]];
}

function determineStatus(value, refRange, providedStatus) {
  if (providedStatus) {
    const statusMap = {
      'low': 'low',
      'lw': 'low',
      'l': 'low',
      'high': 'high',
      'hgh': 'high',
      'h': 'high',
      'normal': 'normal',
      'n': 'normal'
    };
    
    const normalizedStatus = statusMap[providedStatus.toLowerCase()];
    if (normalizedStatus) return normalizedStatus;
  }
  
  if (refRange.low === 0 && refRange.high === 0) {
    return 'normal';
  }
  
  if (value < refRange.low) return 'low';
  if (value > refRange.high) return 'high';
  return 'normal';
}

function normalizeUnit(unit) {
  const unitMap = {
    '/ul': '/uL',
    '/µl': '/uL',
    '/μl': '/uL',
    'g/dl': 'g/dL',
    'mg/dl': 'mg/dL',
    'mmol/l': 'mmol/L',
    'µmol/l': 'µmol/L',
    'μmol/l': 'µmol/L'
  };
  
  return unitMap[unit.toLowerCase()] || unit;
}

function calculateNormalizationConfidence(parsed, normalized) {
  let confidence = 0.7;
  
  if (parsed.name && !isNaN(parsed.value) && parsed.unit) {
    confidence += 0.1;
  }
  
  if (normalized.name !== parsed.name) {
    confidence += 0.1;
  }
  
  if (parsed.status) {
    confidence += 0.05;
  }
  
  if (normalized.ref_range.low > 0 || normalized.ref_range.high > 0) {
    confidence += 0.05;
  }
  
  return Math.min(1.0, confidence);
}

export default { normalizeTests };
