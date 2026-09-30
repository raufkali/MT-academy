const fs = require('fs');
const data = JSON.parse(fs.readFileSync('non_verbal_questions_ready.json', 'utf8'));
const list = data.map((q, i) => `${q.id} | [${q.subject}] | ${q.questionText}`);
fs.writeFileSync('all_non_verbal_texts.txt', list.join('\n'), 'utf8');
console.log('Wrote', list.length, 'questions to all_non_verbal_texts.txt');
