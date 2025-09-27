export const MEDICAL_TESTS_DATABASE = {
  hemoglobin: {
    name: 'Hemoglobin',
    unit: 'g/dL',
    synonyms: ['hgb', 'haemoglobin', 'hemglobin'],
    ref_range: { low: 12.0, high: 16.0 },
    explanation_low: 'Low hemoglobin may indicate anemia, which can cause fatigue and weakness. Consider iron-rich foods and consult your doctor.',
    explanation_high: 'High hemoglobin may indicate dehydration or certain blood disorders. Stay hydrated and consult your doctor.',
    explanation_normal: 'Your hemoglobin level is normal, indicating healthy red blood cell count and oxygen-carrying capacity.'
  },
  wbc: {
    name: 'White Blood Cell Count',
    unit: '/µL',
    synonyms: ['white blood cell count', 'white blood cells'],
    ref_range: { low: 4000, high: 11000 },
    explanation_low: 'Low white blood cell count may indicate weakened immune system. Maintain good hygiene and consult your doctor.',
    explanation_high: 'High white blood cell count may indicate infection or immune response. Monitor symptoms and consult your doctor.',
    explanation_normal: 'Your white blood cell count is normal, indicating a healthy immune system.'
  },
  rbc: {
    name: 'Red Blood Cell Count',
    unit: 'million/µL',
    synonyms: ['red blood cell count', 'red blood cells', 'rbc'],
    ref_range: { low: 4.2, high: 5.4 },
    explanation_low: 'Low red blood cell count may indicate anemia. Consider iron-rich foods and consult your doctor.',
    explanation_high: 'High red blood cell count may indicate dehydration or blood disorders. Stay hydrated and consult your doctor.',
    explanation_normal: 'Your red blood cell count is normal, indicating good oxygen transport capacity.'
  },
  platelets: {
    name: 'Platelets',
    unit: '/µL',
    synonyms: ['plt', 'thrombocytes', 'platelet count'],
    ref_range: { low: 150000, high: 450000 },
    explanation_low: 'Low platelet count may affect blood clotting. Avoid activities that may cause bleeding and consult your doctor.',
    explanation_high: 'High platelet count may increase clotting risk. Stay active and consult your doctor.',
    explanation_normal: 'Your platelet count is normal, indicating proper blood clotting function.'
  },
  glucose: {
    name: 'Glucose',
    unit: 'mg/dL',
    synonyms: ['blood glucose', 'blood sugar', 'bg'],
    ref_range: { low: 70, high: 100 },
    explanation_low: 'Low blood glucose may cause dizziness or fatigue. Maintain regular meals and consult your doctor.',
    explanation_high: 'High blood glucose may indicate diabetes risk. Consider dietary changes and consult your doctor.',
    explanation_normal: 'Your glucose level is normal, indicating good blood sugar control.'
  },
  creatinine: {
    name: 'Creatinine',
    unit: 'mg/dL',
    synonyms: ['creat', 'cr'],
    ref_range: { low: 0.6, high: 1.2 },
    explanation_low: 'Low creatinine is usually normal and indicates good kidney function.',
    explanation_high: 'High creatinine may indicate kidney problems. Stay hydrated and consult your doctor.',
    explanation_normal: 'Your creatinine level is normal, indicating good kidney function.'
  },
  cholesterol: {
    name: 'Cholesterol',
    unit: 'mg/dL',
    ref_range: { low: 100, high: 200 },
    explanation_low: 'Very low cholesterol is uncommon but may need monitoring. Consult your doctor.',
    explanation_high: 'High cholesterol may increase heart disease risk. Consider heart-healthy diet and exercise.',
    explanation_normal: 'Your cholesterol level is normal, indicating good cardiovascular health.'
  },
  hematocrit: {
    name: 'Hematocrit',
    unit: '%',
    synonyms: ['hct'],
    ref_range: { low: 36, high: 48 },
    explanation_low: 'Low hematocrit may indicate anemia. Consider iron-rich foods and consult your doctor.',
    explanation_high: 'High hematocrit may indicate dehydration or blood disorders. Stay hydrated and consult your doctor.',
    explanation_normal: 'Your hematocrit level is normal, indicating proper blood volume and red blood cell concentration.'
  },
  mcv: {
    name: 'MCV',
    unit: 'fL',
    synonyms: ['mean corpuscular volume'],
    ref_range: { low: 80, high: 100 },
    explanation_low: 'Low MCV may indicate iron deficiency or other types of anemia.',
    explanation_high: 'High MCV may indicate vitamin B12 or folate deficiency.',
    explanation_normal: 'Your MCV is normal, indicating proper red blood cell size.'
  },
  mch: {
    name: 'MCH',
    unit: 'pg',
    synonyms: ['mean corpuscular hemoglobin'],
    ref_range: { low: 27, high: 31 },
    explanation_low: 'Low MCH may indicate iron deficiency anemia.',
    explanation_high: 'High MCH may indicate vitamin B12 or folate deficiency.',
    explanation_normal: 'Your MCH is normal, indicating proper hemoglobin content in red blood cells.'
  },
  mchc: {
    name: 'MCHC',
    unit: 'g/dL',
    synonyms: ['mean corpuscular hemoglobin concentration'],
    ref_range: { low: 32, high: 36 },
    explanation_low: 'Low MCHC may indicate iron deficiency anemia.',
    explanation_high: 'High MCHC may indicate certain blood disorders.',
    explanation_normal: 'Your MCHC is normal, indicating proper hemoglobin concentration.'
  },
  esr: {
    name: 'ESR',
    unit: 'mm/hr',
    synonyms: ['erythrocyte sedimentation rate', 'sed rate'],
    ref_range: { low: 0, high: 15 },
    explanation_low: 'Low ESR is generally normal and healthy.',
    explanation_high: 'High ESR may indicate inflammation or infection in your body.',
    explanation_normal: 'Your ESR is normal, indicating no significant inflammation.'
  }
};

export default MEDICAL_TESTS_DATABASE;