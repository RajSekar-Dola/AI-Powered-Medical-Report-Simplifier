function validateInput(text) {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      reason: 'Invalid input: text must be a non-empty string'
    };
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < 5) {
    return {
      isValid: false,
      reason: 'Input too short: insufficient medical data'
    };
  }
  
  const hasTestPattern = 
    /([A-Za-z\s]+)\s+([\d.,]+)\s*([A-Za-z\/µμ]*)/i.test(trimmedText) ||
    /\b(hemoglobin|glucose|cholesterol|wbc|rbc|platelet|hgb|hct)\b/i.test(trimmedText) ||
    /\d+\s*(mg\/dl|g\/dl|mmol\/l|\/ul|\/µl)/i.test(trimmedText) ||
    /\b(normal|high|low|elevated|decreased)\b/i.test(trimmedText);
    
  if (!hasTestPattern) {
    return {
      isValid: false,
      reason: 'No valid medical test patterns found'
    };
  }
  
  const suspiciousPatterns = [
    /<script[^>]*>/i,
    /javascript\s*:/i,
    /<iframe[^>]*>/i,
    /on\w+\s*=/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        reason: 'Input contains suspicious content'
      };
    }
  }
  
  return {
    isValid: true,
    reason: null
  };
}

function detectHallucination(originalText, normalizedTests) {
  console.log('\n=== HALLUCINATION DETECTION DEBUG ===');
  console.log('Original text sample:', originalText.substring(0, 200) + '...');
  
  if (!normalizedTests || normalizedTests.length === 0) {
    console.log('✅ No tests to validate');
    return { isValid: true, reason: null };
  }
  
  if (originalText.length < 50) {
    console.log('⚠️  Original text is very short - being more lenient with validation');
  }
  
  const originalLower = originalText.toLowerCase();
  const issues = [];
  
  for (const test of normalizedTests) {
    console.log(`\nChecking test: ${test.name} = ${test.value}`);
    
    if (isNaN(test.value) || test.value < 0 || test.value === null || test.value === undefined) {
      console.log(`⚠️  Test has questionable value: ${test.value} - but continuing validation`);
    }
    
    const testNameVariations = generateTestNameVariations(test.name);
    console.log('Test name variations:', testNameVariations);
    
    const nameFound = testNameVariations.some(variation => {
      const found = originalLower.includes(variation.toLowerCase());
      console.log(`  "${variation}" found: ${found}`);
      return found;
    });
    
    if (!nameFound) {
      console.log(`⚠️  Test name "${test.name}" not found in original text - but continuing validation`);
    }
    
    const valueStr = test.value.toString();
    const valueVariations = generateValueVariations(valueStr);
    
    console.log('Value variations to check:', valueVariations);
    
    const valueFound = valueVariations.some(variation => {
      const found = originalLower.includes(variation.toLowerCase());
      console.log(`  "${variation}" found: ${found}`);
      return found;
    });
    
    if (!nameFound && !valueFound) {
      console.log(`❌ Test "${test.name}" = ${test.value} not found in original text`);
      issues.push(`Test "${test.name}" with value "${test.value}" not found in original input`);
      continue;
    }
    
    if (nameFound || valueFound) {
      console.log(`✅ Test "${test.name}" = ${test.value} validated (name found: ${nameFound}, value found: ${valueFound})`);
    }
    
    console.log(`✅ Test "${test.name}" = ${test.value} validated successfully`);
  }
  
  const totalTests = normalizedTests.length;
  const failedTests = issues.length;
  const successRate = (totalTests - failedTests) / totalTests;
  
  if (failedTests > 0 && successRate < 0.5) {
    console.log(`❌ Hallucination detected: ${issues.length}/${totalTests} tests failed validation`);
    return {
      isValid: false,
      reason: 'Too many tests not found in original input',
      issues: issues
    };
  }
  
  if (failedTests > 0) {
    console.log(`⚠️  Some tests couldn't be verified (${failedTests}/${totalTests}) but allowing due to sufficient success rate`);
  }
  
  console.log('✅ Hallucination detection passed');
  return {
    isValid: true,
    reason: null
  };
}

function generateValueVariations(valueStr) {
  const variations = [valueStr];
  
  variations.push(valueStr.replace('.', ','));
  variations.push(valueStr.replace(',', '.'));
  
  variations.push(valueStr.replace(/(\d)(\d{3})/, '$1,$2'));
  variations.push(valueStr.replace(/(\d)(\d{3})/, '$1.$2'));
  
  const ocrMap = {
    '0': ['o', 'O', '°'],
    '1': ['l', 'I', '|'],
    '2': ['z', 'Z'],
    '3': ['8'],
    '4': ['A'],
    '5': ['s', 'S'],
    '6': ['b', 'G'],
    '7': ['T'],
    '8': ['B', '3'],
    '9': ['g', 'q']
  };
  
  for (let i = 0; i < valueStr.length; i++) {
    const char = valueStr[i];
    if (ocrMap[char]) {
      ocrMap[char].forEach(replacement => {
        const variation = valueStr.substring(0, i) + replacement + valueStr.substring(i + 1);
        variations.push(variation);
      });
    }
  }
  
  if (valueStr.includes('-')) {
    variations.push(valueStr.replace('-', ' '));
    variations.push(valueStr.replace('-', '.'));
    variations.push(valueStr.replace('-', ','));
  }
  
  const numOnly = valueStr.replace(/[a-zA-Z%/]+/g, '');
  if (numOnly !== valueStr) {
    variations.push(numOnly);
  }
  
  variations.push(valueStr.trim());
  variations.push(valueStr.replace(/^0+/, ''));
  variations.push('0' + valueStr);
  
  return [...new Set(variations)];
}

function generateTestNameVariations(testName) {
  const variations = [testName];
  
  const nameMap = {
    'Hemoglobin': ['hemoglobin', 'hemglobin', 'haemoglobin', 'hgb', 'hb', 'hemoglobin level', 'hemo'],
    'WBC': ['wbc', 'white blood cell', 'white blood cells', 'leukocyte', 'white cell count', 'leucocyte'],
    'White Blood Cell Count': ['wbc', 'white blood cell', 'white blood cells', 'leukocyte', 'white blood cell count', 'white cell count'],
    'RBC': ['rbc', 'red blood cell', 'red blood cells', 'erythrocyte', 'red cell count'],
    'Red Blood Cell Count': ['rbc', 'red blood cell', 'red blood cells', 'erythrocyte', 'red blood cell count', 'red cell count'],
    'Platelets': ['platelet', 'platelets', 'thrombocyte', 'plt', 'platelet count', 'thrombocytes'],
    'Glucose': ['glucose', 'blood glucose', 'blood sugar', 'sugar', 'glu', 'bg'],
    'Cholesterol': ['cholesterol', 'total cholesterol', 'chol', 'cholest'],
    'Creatinine': ['creatinine', 'creat', 'cr'],
    'BUN': ['bun', 'blood urea nitrogen', 'urea'],
    'MCH': ['mch', 'mean corpuscular hemoglobin', 'mean corpuscular haemoglobin', 'mean corp hgb'],
    'MCV': ['mcv', 'mean corpuscular volume', 'mean corp vol'],
    'MCHC': ['mchc', 'mean corpuscular hemoglobin concentration', 'mean corp hgb conc'],
    'ESR': ['esr', 'erythrocyte sedimentation rate', 'sed rate', 'sedimentation rate', 'sed'],
    'Hematocrit': ['hematocrit', 'haematocrit', 'hct', 'packed cell volume', 'pcv', 'crit']
  };
  
  if (nameMap[testName]) {
    variations.push(...nameMap[testName]);
  }
  
  variations.push(testName.toLowerCase());
  
  if (testName.length > 4) {
    variations.push(testName.substring(0, 4).toLowerCase());
    variations.push(testName.substring(0, 3).toLowerCase());
  }
  
  return [...new Set(variations)];
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function validateFileUpload(file) {
  if (!file) {
    return {
      isValid: false,
      reason: 'No file provided'
    };
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return {
      isValid: false,
      reason: 'File size exceeds 5MB limit'
    };
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      reason: 'Invalid file type. Only images are allowed.'
    };
  }
  
  return {
    isValid: true,
    reason: null
  };
}

export {
  validateInput,
  detectHallucination,
  sanitizeInput,
  validateFileUpload
};
