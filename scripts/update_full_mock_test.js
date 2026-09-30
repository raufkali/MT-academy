const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function updatePmaFullMock() {
  const testRef = doc(db, "tests", "pma-full-mock");
  await setDoc(testRef, {
    id: "pma-full-mock",
    title: "Complete PMA Mock Examination (Full 3-in-1 Package)",
    description: "Official 3-stage elimination examination simulating the Pakistan Military Academy (PMA) initial computerized test: Verbal Intelligence (84 Qs, 30 Mins), Non-Verbal Intelligence (64 Qs, 30 Mins), and Academic Test (50 Qs, 30 Mins). Passing each stage is strictly required to unlock the next.",
    moduleType: "full-mock",
    durationMinutes: 90,
    questionCount: 198,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: ["Verbal Intelligence", "Non-Verbal Intelligence", "Academic"],
    testConfig: {
      moduleMix: {
        verbal: 84,
        "non-verbal": 64,
        academic: 50
      }
    },
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    },
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log("Updated tests/pma-full-mock in Firestore.");
  process.exit(0);
}

updatePmaFullMock().catch(e => { console.error(e); process.exit(1); });
