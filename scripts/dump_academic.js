const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBG0LfZVnRf85Z_weV3-XXWliNTRoENMig',
  authDomain: 'my-blogiii.firebaseapp.com',
  projectId: 'my-blogiii',
  storageBucket: 'my-blogiii.firebasestorage.app',
  messagingSenderId: '473877404798',
  appId: '1:473877404798:web:d0775afead8c1116344c2f'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(query(collection(db, 'questions'), where('moduleType', '==', 'academic')));
  const rows = [];
  snap.forEach(d => {
    const data = d.data();
    rows.push({
      id: d.id,
      text: data.questionText,
      options: data.options,
      correctAnswerIndex: data.correctAnswerIndex,
      subject: data.subject,
      topic: data.topic
    });
  });
  fs.writeFileSync('all_academic_in_firestore.json', JSON.stringify(rows, null, 2), 'utf8');
  console.log(`Saved ${rows.length} questions to all_academic_in_firestore.json`);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
