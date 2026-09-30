const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

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
  const snap = await getDocs(query(collection(db, 'questions'), where('moduleType', '==', 'academic'), limit(30)));
  snap.forEach((d, i) => {
    const data = d.data();
    console.log(`${i+1}. [${data.topic || 'No topic'}] ${data.questionText} (Options: ${data.options ? data.options.join(', ') : 'none'})`);
  });
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
