const medicalTermPatterns = [
  {
    name: 'hemoglobin',
    requiredLetters: ['h', 'e', 'm', 'o', 'g', 'l', 'o', 'b', 'i', 'n'],
    optionalLetters: ['a', 'r'],
    minLength: 6,
    maxLength: 15,
    keyPatterns: ['hemog', 'glob', 'globin', 'lobin', 'hgb', 'hb'],
    excludePatterns: ['crit', 'hct', 'matocrit'],
    correction: 'hemoglobin'
  },
  {
    name: 'wbc',
    requiredLetters: ['w', 'b', 'c'],
    optionalLetters: ['h', 'i', 't', 'e', 'l', 'o', 'd', 'k', 'y'],
    minLength: 2,
    maxLength: 20,
    keyPatterns: ['wbc', 'wb', 'white', 'blood', 'cell', 'leuko', 'leuco', 'leukocyte'],
    correction: 'wbc'
  },
  {
    name: 'rbc',
    requiredLetters: ['r', 'b', 'c'],
    optionalLetters: ['e', 'd', 'l', 'o', 'h', 'y', 't'],
    minLength: 2,
    maxLength: 20,
    keyPatterns: ['rbc', 'rb', 'red', 'blood', 'cell', 'eryth'],
    correction: 'rbc'
  },
  {
    name: 'platelets',
    requiredLetters: ['p', 'l', 'a', 't', 'e'],
    optionalLetters: ['r', 'h', 'o', 'm', 'b', 'c', 'y', 's', 'i'],
    minLength: 3,
    maxLength: 20,
    keyPatterns: ['plt', 'plate', 'let', 'thrombo', 'cyte', 'trombo', 'tromosite', 'trombosite'],
    correction: 'platelets'
  },
  {
    name: 'glucose',
    requiredLetters: ['g', 'l', 'u', 'c', 'o', 's'],
    optionalLetters: ['e', 'r', 'a', 'd', 'b'],
    minLength: 2,
    maxLength: 15,
    keyPatterns: ['gl', 'glu', 'gluc', 'uc', 'cos', 'ose', 'sugar', 'bg'],
    correction: 'glucose'
  },
  {
    name: 'cholesterol',
    requiredLetters: ['c', 'h', 'l', 's', 't', 'r'],
    optionalLetters: ['a', 'e', 'i', 'o', 'u'],
    minLength: 4,
    maxLength: 15,
    keyPatterns: ['chol', 'col', 'hol', 'est', 'ter', 'rol'],
    correction: 'cholesterol'
  },
  {
    name: 'creatinine',
    requiredLetters: ['c', 'r', 'e', 'a', 't', 'i', 'n'],
    optionalLetters: ['u', 'o'],
    minLength: 2,
    maxLength: 12,
    keyPatterns: ['creat', 'reat', 'eat', 'tin', 'nin', 'ine', 'cr'],
    correction: 'creatinine'
  },
  {
    name: 'hematocrit',
    requiredLetters: ['h', 'e', 'm', 'a', 't', 'o', 'c', 'r', 'i', 't'],
    optionalLetters: ['u'],
    minLength: 6,
    maxLength: 12,
    keyPatterns: ['hemat', 'matocr', 'crit', 'crt', 'hct'],
    excludePatterns: ['glob', 'globin', 'lobin'],
    correction: 'hematocrit'
  },
  {
    name: 'mcv',
    requiredLetters: ['m', 'c', 'v'],
    optionalLetters: ['e', 'a', 'n', 'o', 'l', 'u', 'r', 'p', 's', 'c'],
    minLength: 3,
    maxLength: 25,
    keyPatterns: ['mcv', 'mean', 'corpuscular', 'volume'],
    correction: 'mcv'
  },
  {
    name: 'mch',
    requiredLetters: ['m', 'c', 'h'],
    optionalLetters: ['e', 'a', 'n', 'o', 'l', 'u', 'r', 'p', 's', 'g', 'b', 'i'],
    minLength: 3,
    maxLength: 30,
    keyPatterns: ['mch', 'mean', 'corpuscular', 'hemoglobin'],
    excludePatterns: ['concentration'],
    correction: 'mch'
  },
  {
    name: 'mchc',
    requiredLetters: ['m', 'c', 'h', 'c'],
    optionalLetters: ['e', 'a', 'n', 'o', 'l', 'u', 'r', 'p', 's', 'g', 'b', 'i', 't'],
    minLength: 4,
    maxLength: 35,
    keyPatterns: ['mchc', 'mean', 'corpuscular', 'hemoglobin', 'concentration'],
    correction: 'mchc'
  },
  {
    name: 'esr',
    requiredLetters: ['e', 's', 'r'],
    optionalLetters: ['d', 'i', 'm', 'n', 't', 'a', 'o', 'h', 'y', 'c'],
    minLength: 3,
    maxLength: 25,
    keyPatterns: ['esr', 'sed', 'sediment', 'rate', 'erythro'],
    correction: 'esr'
  }
];

const simpleCorrections = {
  'hgh': 'high',
  'hig': 'high',
  'hiigh': 'high',
  'hihg': 'high',
  'loww': 'low',
  'loow': 'low',
  'lov': 'low',
  'norrnal': 'normal',
  'norma': 'normal',
  'nrmal': 'normal',
  'hgb': 'hemoglobin',
  'hb': 'hemoglobin',
  'plt': 'platelets',
  'bg': 'glucose',
  'chol': 'cholesterol',
  'creat': 'creatinine',
  'cr': 'creatinine',
  'bili': 'bilirubin',
  'alb': 'albumin',
  'na': 'sodium',
  'k': 'potassium',
  'cl': 'chloride',
  'sgpt': 'alt',
  'sgot': 'ast',
  'leukocyte': 'wbc',
  'leukocytes': 'wbc',
  'trombosite': 'platelet',
  'tromosité': 'platelet',
  'erythrocyte': 'rbc',
  'erythrocytes': 'rbc',
  'hematocrite': 'hematocrit',
  'g/dl': 'g/dL',
  '/ul': '/uL',
  '/µl': '/uL',
  'mg/dl': 'mg/dL',
  'mmol/l': 'mmol/L',
  '10^3': '10³',
  '10^12': '10¹²',
  '10^9': '10⁹'
};

function matchesPattern(word, pattern) {
  return isTypoCandidate(word, pattern);
}

export function correctTypos(text) {
  console.log('Correcting typos in text:', text.substring(0, 100) + '...');
  
  let correctedText = text;

  for (const [error, correction] of Object.entries(simpleCorrections)) {
    const regex = new RegExp(`\\b${error}\\b`, 'gi');
    const matches = correctedText.match(regex);
    if (matches) {
      correctedText = correctedText.replace(regex, correction);
      console.log(`Corrected "${error}" to "${correction}"`);
    }
  }

  const words = correctedText.split(/\s+/);
  const correctedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    
    if (cleanWord.length < 3) return word;

    const legitimateTerms = [
      'glomerular', 'filtration', 'rate', 'estimated', 'patient', 'complained',
      'temperature', 'celsius', 'beside', 'headache', 'myalgia', 'value', 'reference',
      'dehydrogenase', 'aminotransferase', 'phosphatase', 'transferase', 'thrombocytes'
    ];

    if (legitimateTerms.some(term => cleanWord.toLowerCase() === term.toLowerCase())) {
      return word;
    }

    for (const pattern of medicalTermPatterns) {
      if (isTypoCandidate(cleanWord, pattern)) {
        console.log(`Corrected "${cleanWord}" to "${pattern.correction}"`);
        return word.replace(cleanWord, pattern.correction);
      }
    }

    return word;
  });

  correctedText = correctedWords.join(' ');
  correctedText = correctedText.replace(/\s+/g, ' ').trim();

  console.log('Typo correction completed');
  return correctedText;
}

function isTypoCandidate(word, pattern) {
  const lowerWord = word.toLowerCase();

  if (lowerWord.length < pattern.minLength || lowerWord.length > pattern.maxLength) {
    return false;
  }

  if (pattern.excludePatterns) {
    for (const excludePattern of pattern.excludePatterns) {
      if (lowerWord.includes(excludePattern)) {
        return false;
      }
    }
  }

  if (lowerWord.length <= 4) {
    return pattern.keyPatterns.some(keyPattern => 
      lowerWord === keyPattern || lowerWord.includes(keyPattern)
    );
  } else {
    const matchingPatterns = pattern.keyPatterns.filter(keyPattern => 
      lowerWord.includes(keyPattern)
    ).length;

    if (matchingPatterns < 2) {
      return false;
    }

    const wordLetters = lowerWord.split('');
    const requiredPresent = pattern.requiredLetters.filter(letter => 
      wordLetters.includes(letter)
    ).length;

    const requiredThreshold = Math.ceil(pattern.requiredLetters.length * 0.8);
    return requiredPresent >= requiredThreshold;
  }
}

export default { correctTypos };
