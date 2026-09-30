const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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
  const snap = await getDocs(collection(db, 'questions'));
  const subjects = {};
  snap.forEach(d => {
    const data = d.data();
    const key = (data.moduleType || 'unknown') + ' -> ' + (data.subject || 'unknown');
    subjects[key] = (subjects[key] || 0) + 1;
  });
  console.log(JSON.stringify(subjects, null, 2));
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
