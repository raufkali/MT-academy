const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBG0LfZVnRf85Z_weV3-XXWliNTRoENMig",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-blogiii.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-blogiii",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-blogiii.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "473877404798",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:473877404798:web:d0775afead8c1116344c2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateFirestoreNonVerbal() {
  const data = JSON.parse(fs.readFileSync('non_verbal_questions_ready.json', 'utf8'));
  console.log(`Loaded ${data.length} cleaned non-verbal questions to sync with Firestore...`);

  const qRef = collection(db, "questions");
  const chunkSize = 200;
  let updatedCount = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const q of chunk) {
      const docId = q.id;
      const docRef = doc(qRef, docId);
      batch.update(docRef, {
        questionText: q.questionText,
        updatedAt: new Date().toISOString()
      });
      updatedCount++;
    }

    await batch.commit();
    console.log(`Updated chunk ${updatedCount}/${data.length}...`);
  }

  console.log('Successfully updated all non-verbal questions in Firestore!');
  process.exit(0);
}

updateFirestoreNonVerbal().catch(err => {
  console.error('Firestore update error:', err);
  process.exit(1);
});
