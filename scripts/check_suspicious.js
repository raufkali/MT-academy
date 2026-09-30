const fs = require('fs');
const data = JSON.parse(fs.readFileSync('all_academic_in_firestore.json', 'utf8'));

const bad = data.filter(q => {
  const t = String(q.text || '');
  return !isNaN(Number(t)) || t.length < 5 || !t.includes(' ');
});

console.log('Suspicious questions:', bad.length);
bad.forEach(b => console.log(b.id, '|', b.text, '| options:', b.options));
