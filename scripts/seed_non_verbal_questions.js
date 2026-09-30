const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  writeBatch,
  setDoc,
  getDoc,
  addDoc
} = require('firebase/firestore');

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

async function main() {
  const jsonPath = path.join(__dirname, "..", "non_verbal_questions_ready.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }

  const questions = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${questions.length} ready-made Non-Verbal questions.`);

  const qRef = collection(db, "questions");
  const chunkSize = 250;
  let seededCount = 0;

  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const q of chunk) {
      // Use stable document id based on source id
      const docId = q.id || `nv-${i + seededCount + 1}`;
      const docRef = doc(qRef, docId);
      batch.set(docRef, {
        moduleType: "non-verbal",
        subject: q.subject || "Non-Verbal Intelligence",
        topic: q.topic || "Spatial Reasoning",
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswerIndex: Number.isInteger(q.correctAnswerIndex) ? q.correctAnswerIndex : 0,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        disableOptionShuffle: true,
        status: "active",
        createdAt: new Date().toISOString(),
        source: "NTSEBench"
      });
      seededCount++;
    }

    await batch.commit();
    console.log(`Committed chunk: ${seededCount}/${questions.length} questions written to Firestore...`);
  }

  // Update or ensure PMA Non-Verbal Test definition in tests collection
  const testRef = doc(db, "tests", "pma-nonverbal-module");
  await setDoc(testRef, {
    id: "pma-nonverbal-module",
    title: "Non-Verbal Intelligence Test (PMA Long Course)",
    description: "Evaluates spatial visualization, pattern matrix completion, visual analogies, mirror reflections, and odd-one-out figures under timed examination conditions.",
    moduleType: "non-verbal",
    durationMinutes: 30,
    questionCount: 64, // Official PMA Non-Verbal format (64 questions in 30 minutes)
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: [
      "Non-Verbal Series",
      "Non-Verbal Odd One Out",
      "Non-Verbal Analogy",
      "Mirror, Water and Images",
      "Paper Folding & Cutting",
      "Cube and Dice",
      "Figure Partition & Counting",
      "Pattern Completion",
      "Embedded Figure",
      "Missing Character Matrix",
      "Venn Diagrams",
      "Dot Problem"
    ],
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    },
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log("Updated 'pma-nonverbal-module' test configuration in Firestore.");

  // Also ensure Full Mock test is updated to include non-verbal subjects
  const fullMockRef = doc(db, "tests", "pma-full-mock");
  await setDoc(fullMockRef, {
    id: "pma-full-mock",
    title: "PMA Initial Full Mock Examination (All Modules)",
    description: "Comprehensive 3-phase examination simulating the authentic Pakistan Military Academy initial screening test (Verbal, Non-Verbal, and Academic).",
    moduleType: "full-mock",
    durationMinutes: 90,
    questionCount: 198,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    testConfig: {
      moduleMix: {
        verbal: 84,
        "non-verbal": 64,
        academic: 50
      }
    },
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log("Updated 'pma-full-mock' test configuration in Firestore.");

  // Record Admin Audit Log
  try {
    await addDoc(collection(db, "adminAuditLogs"), {
      adminEmail: "system",
      adminId: "migration-script",
      action: "SEED_NON_VERBAL_DATASET",
      targetType: "questions",
      targetId: "ntsebench-dataset",
      details: {
        count: seededCount,
        source: "NTSEBench",
        compression: "84.8% WebP"
      },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    // Ignore audit logging error
  }

  console.log(`\nSUCCESS: ${seededCount} Non-Verbal questions with diagrams successfully seeded into Firestore!`);
  process.exit(0);
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
