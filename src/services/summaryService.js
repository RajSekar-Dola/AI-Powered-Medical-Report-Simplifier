import { MEDICAL_TESTS_DATABASE } from '../data/medicalTestsDatabase.js';

export const generatePatientFriendlySummary = async (normalizedTests) => {
  const lowTests = normalizedTests.filter(test => test.status === 'low');
  const highTests = normalizedTests.filter(test => test.status === 'high');
  const normalTests = normalizedTests.filter(test => test.status === 'normal');
  const explanations = [];
  const seenTestNames = new Set();
  
  normalizedTests.forEach(test => {
    if (seenTestNames.has(test.name)) {
      console.log(`Skipping duplicate explanation for: ${test.name}`);
      return;
    }
    seenTestNames.add(test.name);
    
    const testKey = Object.keys(MEDICAL_TESTS_DATABASE).find(key => 
      MEDICAL_TESTS_DATABASE[key].name === test.name
    );
    
    if (testKey) {
      const testInfo = MEDICAL_TESTS_DATABASE[testKey];
      if (test.status === 'low' && testInfo.explanation_low) {
        explanations.push(`${test.name}: ${testInfo.explanation_low}`);
      } else if (test.status === 'high' && testInfo.explanation_high) {
        explanations.push(`${test.name}: ${testInfo.explanation_high}`);
      } else if (test.status === 'normal') {
        const explanation = testInfo.explanation_normal || 'This test result is within the normal healthy range';
        explanations.push(`${test.name}: ${explanation}`);
      }
    }
  });

  let summaryParts = [];
  
  if (lowTests.length > 0) {
    const lowDescriptions = lowTests.map(test => test.name.toLowerCase());
    if (lowDescriptions.length === 1) {
      summaryParts.push(`Low ${lowDescriptions[0]}`);
    } else if (lowDescriptions.length === 2) {
      summaryParts.push(`Low ${lowDescriptions.join(' and ')}`);
    } else {
      const last = lowDescriptions.pop();
      summaryParts.push(`Low ${lowDescriptions.join(', ')} and ${last}`);
    }
  }
  
  if (highTests.length > 0) {
    const highDescriptions = highTests.map(test => test.name.toLowerCase());
    if (highDescriptions.length === 1) {
      summaryParts.push(`High ${highDescriptions[0]}`);
    } else if (highDescriptions.length === 2) {
      summaryParts.push(`High ${highDescriptions.join(' and ')}`);
    } else {
      const last = highDescriptions.pop();
      summaryParts.push(`High ${highDescriptions.join(', ')} and ${last}`);
    }
  }
  
  if (normalTests.length > 0) {
    const normalDescriptions = normalTests.map(test => test.name.toLowerCase());
    if (normalDescriptions.length === 1) {
      summaryParts.push(`Normal ${normalDescriptions[0]}`);
    } else if (normalDescriptions.length === 2) {
      summaryParts.push(`Normal ${normalDescriptions.join(' and ')}`);
    } else if (normalDescriptions.length <= 3) {
      const last = normalDescriptions.pop();
      summaryParts.push(`Normal ${normalDescriptions.join(', ')} and ${last}`);
    } else {
      summaryParts.push(`${normalDescriptions.length} other tests within normal ranges`);
    }
  }

  let summary;
  if (summaryParts.length === 0) {
    summary = 'No test results to analyze';
  } else if (summaryParts.length === 1) {
    summary = summaryParts[0];
  } else if (summaryParts.length === 2) {
    summary = summaryParts.join('. ');
  } else {
    const last = summaryParts.pop();
    summary = summaryParts.join('. ') + '. ' + last;
  }

  return {
    summary: summary.charAt(0).toUpperCase() + summary.slice(1) + '.',
    explanations: explanations.slice(0, 10), 
    debug: {
      totalTests: normalizedTests.length,
      lowCount: lowTests.length,
      highCount: highTests.length,
      normalCount: normalTests.length
    }
  };
};

function generateTestExplanation(test) {
  const explanationMap = {
    'Hemoglobin': {
      'low': 'Low hemoglobin may relate to anemia, which can cause fatigue and weakness.',
      'high': 'High hemoglobin may indicate dehydration or certain blood disorders.'
    },
    'WBC': {
      'low': 'Low white blood cell count may indicate a weakened immune system.',
      'high': 'High WBC can occur with infections, inflammation, or stress.'
    },
    'RBC': {
      'low': 'Low red blood cell count may indicate anemia or blood loss.',
      'high': 'High red blood cell count may indicate dehydration or certain conditions.'
    },
    'Platelet': {
      'low': 'Low platelet count may affect blood clotting ability.',
      'high': 'High platelet count may increase risk of blood clots.'
    },
    'Glucose': {
      'low': 'Low blood glucose may indicate hypoglycemia, which can cause dizziness.',
      'high': 'High blood glucose may indicate diabetes or prediabetes.'
    },
    'Cholesterol': {
      'high': 'High cholesterol may increase risk of heart disease.',
      'low': 'Very low cholesterol is uncommon but may need evaluation.'
    },
    'Creatinine': {
      'low': 'Low creatinine may indicate reduced muscle mass.',
      'high': 'High creatinine may indicate kidney function concerns.'
    },
    'BUN': {
      'low': 'Low BUN may indicate liver problems or malnutrition.',
      'high': 'High BUN may indicate kidney function concerns or dehydration.'
    }
  };
  
  const testExplanations = explanationMap[test.name];
  if (!testExplanations) {
    if (test.status === 'low') {
      return `Low ${test.name} levels may require medical evaluation.`;
    } else if (test.status === 'high') {
      return `High ${test.name} levels may require medical evaluation.`;
    }
    return null;
  }
  
  return testExplanations[test.status] || null;
}

function addMedicalDisclaimers(summary) {
  const disclaimers = [
    'This is not a medical diagnosis.',
    'Please consult your healthcare provider for proper interpretation.',
    'Test results should be evaluated in context of your overall health.'
  ];
  
  return {
    ...summary,
    disclaimers: disclaimers
  };
}

export default { generatePatientFriendlySummary };
