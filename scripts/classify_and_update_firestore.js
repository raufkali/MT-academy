const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { initializeFirestore, doc, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBG0LfZVnRf85Z_weV3-XXWliNTRoENMig",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-blogiii.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-blogiii",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-blogiii.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "473877404798",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:473877404798:web:d0775afead8c1116344c2f"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

function determineModuleAndSubject(q) {
  const text = String(q.text || q.questionText || '').trim();
  const lower = text.toLowerCase();

  // Excel date artifact fix: '23623.00013888889'
  if (text.includes('23623') && Array.isArray(q.options) && q.options.includes('16')) {
    return {
      moduleType: 'verbal',
      subject: 'Series Completion',
      topic: 'Number Series',
      questionText: 'What comes next in the following series: 2, 4, 8, ...?'
    };
  }

  // Verbal Patterns
  if (text.includes('::') || lower.includes('analogy')) {
    return { moduleType: 'verbal', subject: 'Analogies', topic: 'Word Analogies', questionText: text };
  }
  if (lower.includes('odd one out') || lower.includes('not belong')) {
    return { moduleType: 'verbal', subject: 'Classification', topic: 'Odd One Out', questionText: text };
  }
  if (lower.includes('coded as') || lower.includes('code for') || lower.includes('coding')) {
    return { moduleType: 'verbal', subject: 'Coding-Decoding', topic: 'Letter Coding', questionText: text };
  }
  if (lower.includes('next in the series') || lower.includes('series:') || lower.includes('what comes next')) {
    return { moduleType: 'verbal', subject: 'Series Completion', topic: 'Logical Series', questionText: text };
  }
  if (lower.includes('brother of') || lower.includes('sister of') || lower.includes('pointing to a photograph') || lower.includes('father of')) {
    return { moduleType: 'verbal', subject: 'Blood Relations', topic: 'Kinship', questionText: text };
  }
  if (lower.includes('km north') || lower.includes('km south') || lower.includes('direction is he')) {
    return { moduleType: 'verbal', subject: 'Direction Sense', topic: 'Compass Direction', questionText: text };
  }
  if (lower.includes('synonym of')) {
    return { moduleType: 'verbal', subject: 'Verbal Reasoning', topic: 'Synonyms', questionText: text };
  }
  if (lower.includes('antonym of')) {
    return { moduleType: 'verbal', subject: 'Verbal Reasoning', topic: 'Antonyms', questionText: text };
  }
  if (lower.includes('one word for')) {
    return { moduleType: 'verbal', subject: 'Verbal Reasoning', topic: 'One Word Substitution', questionText: text };
  }

  // Academic Patterns (English Grammar, Sentence correction, Prepositions, etc.)
  return {
    moduleType: 'academic',
    subject: 'English',
    topic: lower.includes('spelling') ? 'Spellings' :
           lower.includes('idiom') ? 'Idioms & Phrases' :
           lower.includes('participle') ? 'Verb Forms' :
           lower.includes('speech') ? 'Direct & Indirect Speech' :
           'Grammar & Usage',
    questionText: text
  };
}

async function run() {
  const data = JSON.parse(fs.readFileSync('all_academic_in_firestore.json', 'utf8'));
  console.log(`Loaded ${data.length} questions from local backup with Firestore doc IDs...`);

  const chunkSize = 150;
  let verbalCount = 0;
  let academicCount = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const q of chunk) {
      const classification = determineModuleAndSubject(q);
      const docRef = doc(db, 'questions', q.id);

      if (classification.moduleType === 'verbal') {
        verbalCount++;
        batch.update(docRef, {
          moduleType: 'verbal',
          subject: classification.subject,
          topic: classification.topic,
          questionText: classification.questionText,
          updatedAt: new Date().toISOString()
        });
      } else {
        academicCount++;
        batch.update(docRef, {
          moduleType: 'academic',
          subject: classification.subject,
          topic: classification.topic,
          questionText: classification.questionText,
          updatedAt: new Date().toISOString()
        });
      }
    }

    await batch.commit();
    console.log(`Committed chunk ${i + chunk.length}/${data.length}...`);
  }

  console.log(`Finished updating! Classified ${verbalCount} as 'verbal' and ${academicCount} as 'academic'.`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
