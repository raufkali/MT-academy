const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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
  console.log('Total academic docs:', snap.size);
  const rows = [];
  snap.forEach(d => {
    const data = d.data();
    rows.push({ id: d.id, text: data.questionText, options: data.options });
  });
  console.log('Sample 40 questions:');
  rows.slice(0, 40).forEach((r, idx) => {
    console.log(`${idx+1}. [${r.id}] ${r.text}`);
  });
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
