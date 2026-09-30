const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_academic_in_firestore.json', 'utf8'));

const verbal = [];
const academic = [];

data.forEach((q, idx) => {
  const textStr = String(q.text || '');
  const lower = textStr.toLowerCase();
  
  // Verbal indicators
  const isVerbal = 
    lower.includes('odd one out') ||
    textStr.includes('::') ||
    lower.includes('analogy') ||
    lower.includes('what comes next in the series') ||
    lower.includes('series:') ||
    lower.includes('coded as') ||
    lower.includes('coding') ||
    lower.includes('point to a photograph') ||
    lower.includes('sister of') ||
    lower.includes('brother of') ||
    lower.includes('km north') ||
    lower.includes('km south') ||
    lower.includes('synonym of') ||
    lower.includes('antonym of') ||
    lower.includes('one word for');

  if (isVerbal) {
    verbal.push({ ...q, text: textStr });
  } else {
    academic.push({ ...q, text: textStr });
  }
});

console.log('Verbal count:', verbal.length);
console.log('Academic count:', academic.length);
console.log('\n--- VERBAL SAMPLE ---');
verbal.slice(0, 15).forEach(q => console.log(`[${q.id}] ${q.text}`));
console.log('\n--- ACADEMIC SAMPLE ---');
academic.slice(0, 15).forEach(q => console.log(`[${q.id}] ${q.text}`));
