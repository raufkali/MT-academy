import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_TESTS, SAMPLE_QUESTIONS } from "./sampleData";

// Helper for generating secure random strings
export function generateRandomToken(length = 24) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Simple hash for invitation token storage (one-way association)
export function hashToken(token) {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "tok_" + Math.abs(hash).toString(36) + "_" + token.slice(0, 4);
}

// ==================== SYSTEM SEED ====================
export async function seedInitialDataIfEmpty() {
  try {
    const initRef = doc(db, "systemSettings", "initialization");
    const initSnap = await getDoc(initRef);
    if (initSnap.exists() && initSnap.data().initialized) {
      return; // Already initialized; do not re-seed when empty
    }

    const testsRef = collection(db, "tests");
    const testSnapshot = await getDocs(query(testsRef, limit(1)));
    if (testSnapshot.empty) {
      console.log("Seeding default PMA tests...");
      for (const test of DEFAULT_TESTS) {
        await setDoc(doc(db, "tests", test.id), {
          ...test,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    const questionsRef = collection(db, "questions");
    const qSnapshot = await getDocs(query(questionsRef, limit(1)));
    if (qSnapshot.empty) {
      console.log("Seeding demonstration sample questions...");
      for (const q of SAMPLE_QUESTIONS) {
        await addDoc(questionsRef, {
          ...q,
          createdAt: new Date().toISOString()
        });
      }
    }

    await setDoc(initRef, { initialized: true, seededAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error("Seed check failed:", err);
  }
}

// ==================== QUESTIONS ====================
export async function getQuestions(filterModule = null, filterSubject = null) {
  try {
    const qRef = collection(db, "questions");
    let qQuery = query(qRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(qQuery);
    let items = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        questionText: String(data.questionText ?? ""),
        subject: String(data.subject ?? "General"),
        topic: String(data.topic ?? ""),
        options: Array.isArray(data.options) ? data.options.map(o => String(o ?? "")) : ["", "", "", ""]
      };
    });

    if (filterModule && filterModule !== "all") {
      items = items.filter(q => q.moduleType === filterModule);
    }
    if (filterSubject && filterSubject !== "all") {
      items = items.filter(q => q.subject === filterSubject);
    }
    return items;
  } catch (err) {
    console.error("Error fetching questions:", err);
    // Graceful fallback to SAMPLE_QUESTIONS if Firestore rules block access
    let fallback = SAMPLE_QUESTIONS.map((q, idx) => ({ id: `sample-${idx}`, ...q }));
    if (filterModule && filterModule !== "all") {
      fallback = fallback.filter(q => q.moduleType === filterModule);
    }
    if (filterSubject && filterSubject !== "all") {
      fallback = fallback.filter(q => q.subject === filterSubject);
    }
    return fallback;
  }
}

export async function createQuestion(data, adminUser) {
  const qRef = collection(db, "questions");
  const cleanQText = String(data.questionText ?? "");
  const docRef = await addDoc(qRef, {
    ...data,
    questionText: cleanQText,
    subject: String(data.subject ?? "General"),
    topic: String(data.topic ?? ""),
    options: Array.isArray(data.options) ? data.options.map(o => String(o ?? "")) : ["", "", "", ""],
    status: data.status || "active",
    createdAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "CREATE_QUESTION", "questions", docRef.id, {
    questionText: cleanQText.slice(0, 50),
    moduleType: data.moduleType
  });
  return docRef.id;
}

export async function updateQuestion(id, data, adminUser) {
  const docRef = doc(db, "questions", id);
  const cleanQText = String(data.questionText ?? "");
  await updateDoc(docRef, {
    ...data,
    questionText: cleanQText,
    subject: String(data.subject ?? "General"),
    topic: String(data.topic ?? ""),
    options: Array.isArray(data.options) ? data.options.map(o => String(o ?? "")) : ["", "", "", ""],
    updatedAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "UPDATE_QUESTION", "questions", id, {
    questionText: cleanQText.slice(0, 50)
  });
}

export async function deleteQuestion(id, adminUser) {
  await deleteDoc(doc(db, "questions", id));
  await logAdminAction(adminUser, "DELETE_QUESTION", "questions", id, {});
}

export async function deleteAllQuestions(adminUser, moduleFilter = null) {
  const qRef = collection(db, "questions");
  let qQuery = qRef;
  if (moduleFilter && moduleFilter !== "all") {
    qQuery = query(qRef, where("moduleType", "==", moduleFilter));
  }
  const snapshot = await getDocs(qQuery);
  if (snapshot.empty) return 0;

  const total = snapshot.docs.length;
  const chunkSize = 400;

  for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
    const chunk = snapshot.docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  // Prevent automatic sample re-seeding when question bank is intentionally cleared
  try {
    await setDoc(doc(db, "systemSettings", "initialization"), { initialized: true, clearedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    // ignore
  }

  await logAdminAction(adminUser, "DELETE_ALL_QUESTIONS", "questions", moduleFilter || "all", { count: total });
  return total;
}

export async function deleteMultipleQuestions(questionIds, adminUser) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) return 0;

  const chunkSize = 400;
  let deletedCount = 0;

  for (let i = 0; i < questionIds.length; i += chunkSize) {
    const chunk = questionIds.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((id) => {
      batch.delete(doc(db, "questions", id));
      deletedCount++;
    });
    await batch.commit();
  }

  await logAdminAction(adminUser, "BATCH_DELETE_QUESTIONS", "questions", "batch", {
    count: deletedCount
  });

  return deletedCount;
}

export async function bulkImportQuestions(questionList, adminUser) {
  let createdCount = 0;
  const qRef = collection(db, "questions");
  const chunkSize = 400;

  for (let i = 0; i < questionList.length; i += chunkSize) {
    const chunk = questionList.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const q of chunk) {
      const newDoc = doc(qRef);
      batch.set(newDoc, {
        moduleType: String(q.moduleType || "academic"),
        subject: String(q.subject || "General"),
        topic: String(q.topic || "General"),
        questionText: String(q.questionText ?? ""),
        imageUrl: q.imageUrl ? String(q.imageUrl) : null,
        disableOptionShuffle: Boolean(q.disableOptionShuffle || q.imageUrl),
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt ?? "")) : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswerIndex: Number.isInteger(q.correctAnswerIndex) ? q.correctAnswerIndex : 0,
        explanation: String(q.explanation || ""),
        difficulty: String(q.difficulty || "medium"),
        status: "active",
        createdAt: new Date().toISOString()
      });
      createdCount++;
    }

    await batch.commit();
  }

  // Ensure system initialization flag is set
  try {
    await setDoc(doc(db, "systemSettings", "initialization"), { initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    // ignore
  }

  await logAdminAction(adminUser, "BULK_IMPORT_QUESTIONS", "questions", "batch", { count: createdCount });
  return createdCount;
}

// ==================== TESTS ====================
export async function getTests(onlyActive = false) {
  try {
    const tRef = collection(db, "tests");
    const snapshot = await getDocs(tRef);
    let tests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (onlyActive) {
      tests = tests.filter(t => t.status === "active");
    }
    // If database is empty, fallback to DEFAULT_TESTS
    if (tests.length === 0) {
      let fallback = DEFAULT_TESTS;
      if (onlyActive) fallback = fallback.filter(t => t.status === "active");
      return fallback;
    }
    return tests;
  } catch (err) {
    console.error("Error fetching tests:", err);
    // Graceful fallback to DEFAULT_TESTS if Firestore rules block access
    let fallback = DEFAULT_TESTS;
    if (onlyActive) {
      fallback = fallback.filter(t => t.status === "active");
    }
    return fallback;
  }
}

export async function getTestById(id) {
  try {
    const docSnap = await getDoc(doc(db, "tests", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return DEFAULT_TESTS.find(t => t.id === id) || null;
  } catch (err) {
    console.error("Error fetching test by id:", err);
    return DEFAULT_TESTS.find(t => t.id === id) || null;
  }
}

export async function createTest(testData, adminUser) {
  const tRef = collection(db, "tests");
  const docRef = await addDoc(tRef, {
    ...testData,
    status: testData.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "CREATE_TEST", "tests", docRef.id, { title: testData.title });
  return docRef.id;
}

export async function updateTest(id, testData, adminUser) {
  const tRef = doc(db, "tests", id);
  await updateDoc(tRef, {
    ...testData,
    updatedAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "UPDATE_TEST", "tests", id, { title: testData.title });
}

// ==================== ACCESS MANAGEMENT (MANUAL PAYMENT) ====================
export async function createAccessGrant(grantData, adminUser) {
  const grantRef = collection(db, "accessGrants");
  const newGrant = {
    candidateId: grantData.candidateId || "",
    candidateEmail: (grantData.candidateEmail || "").toLowerCase().trim(),
    candidateUsername: grantData.candidateUsername || "",
    candidateName: grantData.candidateName || "",
    temporaryPassword: grantData.temporaryPassword || "",
    testId: grantData.testId,
    testTitle: grantData.testTitle,
    permittedAttempts: Number(grantData.permittedAttempts) || 1,
    usedAttempts: 0,
    expiryDate: grantData.expiryDate, // ISO string
    status: "active",
    internalNote: grantData.internalNote || "",
    paymentRef: grantData.paymentRef || "Manual (WhatsApp/JazzCash/Easypaisa)",
    createdBy: adminUser?.email || "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(grantRef, newGrant);

  await logAdminAction(adminUser, "CREATE_ACCESS_GRANT", "accessGrants", docRef.id, {
    candidateEmail: newGrant.candidateEmail,
    testTitle: newGrant.testTitle,
    paymentRef: newGrant.paymentRef
  });

  return { id: docRef.id, ...newGrant };
}

export async function generateInvitationLink(data, adminUser) {
  const plainToken = generateRandomToken(32);
  const tokenHash = hashToken(plainToken);

  const invitationData = {
    tokenHash,
    tokenPreview: plainToken.slice(0, 6) + "...",
    intendedEmail: (data.intendedEmail || "").toLowerCase().trim(),
    intendedName: data.intendedName || "",
    testId: data.testId,
    testTitle: data.testTitle,
    permittedAttempts: Number(data.permittedAttempts) || 1,
    expiryDate: data.expiryDate,
    status: "pending",
    internalNote: data.internalNote || "",
    paymentRef: data.paymentRef || "Manual Payment Confirmed",
    createdBy: adminUser.email || "admin",
    createdAt: new Date().toISOString(),
    redeemedAt: null,
    redeemedByCandidateId: null
  };

  const docRef = await addDoc(collection(db, "accessInvitations"), invitationData);

  await logAdminAction(adminUser, "GENERATE_INVITATION", "accessInvitations", docRef.id, {
    intendedEmail: invitationData.intendedEmail,
    testTitle: invitationData.testTitle
  });

  return {
    id: docRef.id,
    token: plainToken,
    ...invitationData
  };
}

export async function redeemInvitation(token, candidateUser) {
  const tokenHash = hashToken(token);
  const invRef = collection(db, "accessInvitations");
  const q = query(invRef, where("tokenHash", "==", tokenHash), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Invalid or expired invitation token.");
  }

  const invDoc = snapshot.docs[0];
  const inv = invDoc.data();

  if (inv.status !== "pending") {
    throw new Error(`This invitation link has already been ${inv.status}.`);
  }

  const now = new Date();
  if (inv.expiryDate && new Date(inv.expiryDate) < now) {
    await updateDoc(doc(db, "accessInvitations", invDoc.id), { status: "expired" });
    throw new Error("This invitation link has expired.");
  }

  // Create active access grant for candidate
  const grantData = {
    candidateId: candidateUser.uid,
    candidateEmail: candidateUser.email.toLowerCase().trim(),
    candidateName: candidateUser.name || candidateUser.displayName || inv.intendedName || "Candidate",
    testId: inv.testId,
    testTitle: inv.testTitle,
    permittedAttempts: inv.permittedAttempts,
    usedAttempts: 0,
    expiryDate: inv.expiryDate,
    status: "active",
    internalNote: `Redeemed via token (${inv.internalNote || ""})`,
    paymentRef: inv.paymentRef,
    createdBy: inv.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const grantDocRef = await addDoc(collection(db, "accessGrants"), grantData);

  // Mark invitation as redeemed
  await updateDoc(doc(db, "accessInvitations", invDoc.id), {
    status: "redeemed",
    redeemedAt: new Date().toISOString(),
    redeemedByCandidateId: candidateUser.uid,
    associatedGrantId: grantDocRef.id
  });

  return { grantId: grantDocRef.id, ...grantData };
}

export async function getCandidateAccessGrants(candidateEmail, candidateId) {
  try {
    const grantsRef = collection(db, "accessGrants");
    const snapshot = await getDocs(grantsRef);
    const now = new Date();

    const grants = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const matchesEmail = data.candidateEmail && data.candidateEmail.toLowerCase() === (candidateEmail || "").toLowerCase();
      const matchesId = candidateId && data.candidateId === candidateId;

      if (matchesEmail || matchesId) {
        let currentStatus = data.status;
        if (data.expiryDate && new Date(data.expiryDate) < now && currentStatus === "active") {
          currentStatus = "expired";
        } else if (data.usedAttempts >= data.permittedAttempts && currentStatus === "active") {
          currentStatus = "exhausted";
        }
        grants.push({ id: docSnap.id, ...data, computedStatus: currentStatus });
      }
    });

    return grants;
  } catch (err) {
    console.error("Error getting candidate grants:", err);
    return [];
  }
}

export async function getAllAccessGrants() {
  try {
    const grantsRef = collection(db, "accessGrants");
    const snapshot = await getDocs(query(grantsRef, orderBy("createdAt", "desc")));
    const now = new Date();

    return snapshot.docs.map(d => {
      const data = d.data();
      let computedStatus = data.status;
      if (data.expiryDate && new Date(data.expiryDate) < now && computedStatus === "active") {
        computedStatus = "expired";
      } else if (data.usedAttempts >= data.permittedAttempts && computedStatus === "active") {
        computedStatus = "exhausted";
      }
      return { id: d.id, ...data, computedStatus };
    });
  } catch (err) {
    console.error("Error getting all grants:", err);
    return [];
  }
}

export async function updateAccessGrantStatus(grantId, newStatus, adminUser) {
  const docRef = doc(db, "accessGrants", grantId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "UPDATE_ACCESS_STATUS", "accessGrants", grantId, { newStatus });
}

export async function extendAccessGrant(grantId, extraAttempts, newExpiryDate, adminUser) {
  const docRef = doc(db, "accessGrants", grantId);
  const updatePayload = {
    updatedAt: new Date().toISOString()
  };
  if (extraAttempts) {
    updatePayload.permittedAttempts = increment(extraAttempts);
    updatePayload.status = "active";
  }
  if (newExpiryDate) {
    updatePayload.expiryDate = newExpiryDate;
    updatePayload.status = "active";
  }
  await updateDoc(docRef, updatePayload);
  await logAdminAction(adminUser, "EXTEND_ACCESS", "accessGrants", grantId, { extraAttempts, newExpiryDate });
}

// ==================== EXAM ATTEMPT ENGINE ====================
export async function startExamAttempt(testId, candidateUser) {
  const test = await getTestById(testId);
  if (!test || test.status !== "active") {
    throw new Error("This examination is currently not available.");
  }

  const cleanEmail = (candidateUser.email || "").toLowerCase().trim();
  const uid = candidateUser.uid;

  // 1. FIRST check if candidate ALREADY has an ongoing active attempt for this test
  const attemptsRef = collection(db, "examAttempts");
  let activeAttempt = null;

  try {
    const userAttemptsSnap = await getDocs(query(attemptsRef, where("candidateId", "==", uid)));
    const activeDoc = userAttemptsSnap.docs.find(d => {
      const data = d.data();
      return data.testId === testId && data.status === "active";
    });
    if (activeDoc) {
      activeAttempt = { id: activeDoc.id, ...activeDoc.data() };
    }
  } catch (err) {
    console.warn("Direct query by candidateId error:", err);
  }

  // Fallback by email if not found by uid
  if (!activeAttempt && cleanEmail) {
    try {
      const emailAttemptsSnap = await getDocs(query(attemptsRef, where("candidateEmail", "==", cleanEmail)));
      const activeDoc = emailAttemptsSnap.docs.find(d => {
        const data = d.data();
        return data.testId === testId && data.status === "active";
      });
      if (activeDoc) {
        activeAttempt = { id: activeDoc.id, ...activeDoc.data() };
      }
    } catch (err) {
      console.warn("Fallback query by candidateEmail error:", err);
    }
  }

  if (activeAttempt) {
    const currentExpiry = activeAttempt.isMultiStage && activeAttempt.stageExpiryTime
      ? new Date(activeAttempt.stageExpiryTime)
      : new Date(activeAttempt.expiryTime);

    // Check if expired
    if (new Date() > currentExpiry) {
      // Auto finalize or advance expired attempt
      if (activeAttempt.isMultiStage) {
        await advanceStageOrFinalize(activeAttempt.id, activeAttempt.currentStageIndex || 0, true);
      } else {
        await finalizeAttempt(activeAttempt.id);
      }
    } else {
      // Return existing active attempt to resume!
      return { ...activeAttempt, isResumed: true };
    }
  }

  // 2. No active attempt in progress — check access authorization for starting a new attempt
  const grants = await getCandidateAccessGrants(cleanEmail, uid);
  const eligibleGrant = grants.find(g =>
    (g.testId === testId || g.testId === "pma-full-mock") &&
    g.computedStatus === "active" &&
    (g.usedAttempts || 0) < (g.permittedAttempts || 1)
  );

  if (!eligibleGrant) {
    throw new Error("You do not have active access or remaining attempts for this test. Please contact the administrator.");
  }

  // Fetch approved questions for this test dynamically from questions collection
  let allQuestions = await getQuestions();
  if (allQuestions.length === 0) {
    throw new Error("No examination questions are currently loaded in the MTacademy question bank. Please contact the administrator.");
  }

  const norm = (str) => {
    const s = String(str || "").toLowerCase().trim();
    if (s.includes("non")) return "non-verbal";
    if (s.includes("verbal")) return "verbal";
    if (s.includes("acad")) return "academic";
    if (s.includes("full") || s.includes("mock")) return "full-mock";
    return s;
  };

  const targetModule = norm(test.moduleType);
  const isMultiStage = targetModule === "full-mock";
  let candidatePool = [];
  let stages = null;
  const startTime = new Date();
  const durationMs = (test.durationMinutes || 30) * 60 * 1000;
  let expiryTime = new Date(startTime.getTime() + durationMs);
  let stageStartTime = startTime.toISOString();
  let stageExpiryTime = expiryTime.toISOString();

  if (isMultiStage) {
    const targetVerbal = test.testConfig?.moduleMix?.verbal || 84;
    const targetNonVerbal = test.testConfig?.moduleMix?.["non-verbal"] || 64;
    const targetAcademic = test.testConfig?.moduleMix?.academic || 50;

    const verbalQs = allQuestions.filter(q => norm(q.moduleType) === "verbal");
    const nonVerbalQs = allQuestions.filter(q => norm(q.moduleType) === "non-verbal");
    const academicQs = allQuestions.filter(q => norm(q.moduleType) === "academic");

    const selectedVerbal = (test.randomizeQuestions !== false ? shuffleArray(verbalQs) : verbalQs).slice(0, Math.min(verbalQs.length, targetVerbal));
    const selectedNonVerbal = (test.randomizeQuestions !== false ? shuffleArray(nonVerbalQs) : nonVerbalQs).slice(0, Math.min(nonVerbalQs.length, targetNonVerbal));
    const selectedAcademic = (test.randomizeQuestions !== false ? shuffleArray(academicQs) : academicQs).slice(0, Math.min(academicQs.length, targetAcademic));

    // Staged sequence: 1. Verbal -> 2. Non-Verbal -> 3. Academic
    candidatePool = [
      ...selectedVerbal,
      ...selectedNonVerbal,
      ...selectedAcademic
    ];

    const verbalCount = selectedVerbal.length;
    const nonVerbalCount = selectedNonVerbal.length;
    const academicCount = selectedAcademic.length;

    // 30 minutes per stage
    const stageDurationMinutes = 30;
    const stage1Expiry = new Date(startTime.getTime() + stageDurationMinutes * 60 * 1000);
    stageExpiryTime = stage1Expiry.toISOString();

    stages = [
      {
        stageIndex: 0,
        stageId: "verbal",
        title: "Verbal Intelligence",
        startIndex: 0,
        count: verbalCount,
        durationMinutes: stageDurationMinutes,
        passingPercentage: 50,
        status: "active"
      },
      {
        stageIndex: 1,
        stageId: "non-verbal",
        title: "Non-Verbal Intelligence",
        startIndex: verbalCount,
        count: nonVerbalCount,
        durationMinutes: stageDurationMinutes,
        passingPercentage: 50,
        status: "locked"
      },
      {
        stageIndex: 2,
        stageId: "academic",
        title: "Academic Test",
        startIndex: verbalCount + nonVerbalCount,
        count: academicCount,
        durationMinutes: stageDurationMinutes,
        passingPercentage: 50,
        status: "locked"
      }
    ];
  } else {
    let matchingQs = allQuestions.filter(q => norm(q.moduleType) === targetModule);
    if (matchingQs.length === 0) {
      matchingQs = allQuestions;
    }
    const targetCount = Number(test.questionCount) || (targetModule === "verbal" ? 84 : targetModule === "non-verbal" ? 64 : 50);
    const shuffled = test.randomizeQuestions !== false ? shuffleArray(matchingQs) : matchingQs;
    candidatePool = shuffled.slice(0, Math.min(shuffled.length, targetCount));
  }

  if (candidatePool.length === 0) {
    throw new Error(`No questions found matching the ${test.title} module in MTacademy bank.`);
  }

  // Build safe questions snapshot with options randomized per candidate session
  const safeQuestionsSnapshot = [];
  const serverAnswerKey = [];

  candidatePool.forEach((q, idx) => {
    let opts = Array.isArray(q.options) && q.options.length >= 4
      ? q.options.map(o => String(o ?? ""))
      : ["Option A", "Option B", "Option C", "Option D"];
    let correctIdx = Number.isInteger(q.correctAnswerIndex) ? q.correctAnswerIndex : 0;

    // Per-candidate option randomization (A, B, C, D) if test randomizeQuestions is enabled
    // Note: Do not shuffle generic letter options (Option A, Option B...) or questions with diagram-labeled options!
    const isGenericOptionLabel = opts.every((o, i) => {
      const clean = o.trim().toLowerCase();
      return (
        clean === `option ${String.fromCharCode(97 + i)}` ||
        clean === String.fromCharCode(97 + i) ||
        clean === `figure ${i + 1}` ||
        clean === `${i + 1}`
      );
    });

    const shouldShuffle = test.randomizeQuestions !== false && !q.disableOptionShuffle && !isGenericOptionLabel;

    if (shouldShuffle) {
      const tagged = opts.map((text, i) => ({ text, isCorrect: i === correctIdx }));
      for (let i = tagged.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
      }
      opts = tagged.map(t => t.text);
      correctIdx = tagged.findIndex(t => t.isCorrect);
      if (correctIdx < 0) correctIdx = 0;
    }

    safeQuestionsSnapshot.push({
      questionId: q.id,
      questionIndex: idx,
      moduleType: q.moduleType || targetModule,
      subject: q.subject || "General",
      topic: q.topic || "",
      questionText: String(q.questionText ?? ""),
      imageUrl: q.imageUrl || null,
      options: opts,
      difficulty: q.difficulty || "medium"
    });

    serverAnswerKey.push(correctIdx);
  });

  const attemptData = {
    candidateId: candidateUser.uid,
    candidateEmail: candidateUser.email.toLowerCase(),
    candidateName: candidateUser.name || candidateUser.displayName || "Candidate",
    testId: test.id,
    testTitle: test.title,
    moduleType: test.moduleType,
    isMultiStage: Boolean(isMultiStage),
    stages: stages || null,
    currentStageIndex: 0,
    stageStartTime: isMultiStage ? stageStartTime : null,
    stageExpiryTime: isMultiStage ? stageExpiryTime : null,
    stageResults: {},
    failStage: null,
    isScreenedOut: false,
    accessGrantId: eligibleGrant.id,
    attemptNumber: (eligibleGrant.usedAttempts || 0) + 1,
    questionCount: safeQuestionsSnapshot.length,
    questionsSnapshot: safeQuestionsSnapshot,
    serverAnswerKey, // stored in Firestore doc for backend-calculated results
    savedAnswers: {}, // index -> optionIndex
    markedForReview: [],
    startTime: startTime.toISOString(),
    expiryTime: expiryTime.toISOString(),
    durationMinutes: test.durationMinutes || 30,
    submissionTime: null,
    status: "active",
    score: null,
    createdAt: startTime.toISOString()
  };

  const attemptDocRef = await addDoc(attemptsRef, attemptData);

  // Increment used attempts on access grant
  await updateDoc(doc(db, "accessGrants", eligibleGrant.id), {
    usedAttempts: increment(1),
    updatedAt: new Date().toISOString()
  });

  return { id: attemptDocRef.id, ...attemptData, isResumed: false };
}

export async function saveExamAnswer(attemptId, questionIndex, selectedOptionIndex, isMarkedForReview = null) {
  const attemptRef = doc(db, "examAttempts", attemptId);
  const attemptSnap = await getDoc(attemptRef);

  if (!attemptSnap.exists()) {
    throw new Error("Attempt not found.");
  }

  const attempt = attemptSnap.data();
  if (attempt.status !== "active") {
    throw new Error("This attempt is no longer active.");
  }

  // Check deadline
  const currentExpiry = attempt.isMultiStage && attempt.stageExpiryTime
    ? new Date(attempt.stageExpiryTime)
    : new Date(attempt.expiryTime);

  if (new Date() > currentExpiry) {
    if (attempt.isMultiStage) {
      await advanceStageOrFinalize(attemptId, attempt.currentStageIndex || 0, true);
    } else {
      await finalizeAttempt(attemptId);
    }
    throw new Error("Examination time has expired.");
  }

  const updates = {
    [`savedAnswers.${questionIndex}`]: selectedOptionIndex
  };

  if (isMarkedForReview !== null) {
    let marked = attempt.markedForReview || [];
    if (isMarkedForReview && !marked.includes(questionIndex)) {
      marked.push(questionIndex);
    } else if (!isMarkedForReview) {
      marked = marked.filter(idx => idx !== questionIndex);
    }
    updates.markedForReview = marked;
  }

  await updateDoc(attemptRef, updates);
  return true;
}

export async function finalizeAttempt(attemptId) {
  const attemptRef = doc(db, "examAttempts", attemptId);
  const snap = await getDoc(attemptRef);
  if (!snap.exists()) return null;

  const attempt = snap.data();
  if (attempt.status === "submitted") {
    return attempt;
  }

  if (attempt.isMultiStage && attempt.stages) {
    return await advanceStageOrFinalize(attemptId, attempt.currentStageIndex || 0, true);
  }

  const answerKey = attempt.serverAnswerKey || [];
  const savedAnswers = attempt.savedAnswers || {};
  const total = attempt.questionCount || answerKey.length;

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  // Breakdown by module
  const moduleBreakdown = {};

  for (let i = 0; i < total; i++) {
    const qSnapshot = attempt.questionsSnapshot?.[i] || {};
    const mod = qSnapshot.moduleType || "general";
    if (!moduleBreakdown[mod]) {
      moduleBreakdown[mod] = { correct: 0, total: 0 };
    }
    moduleBreakdown[mod].total++;

    const chosen = savedAnswers[i];
    const actual = answerKey[i];

    if (chosen === undefined || chosen === null) {
      unanswered++;
    } else if (chosen === actual) {
      correct++;
      moduleBreakdown[mod].correct++;
    } else {
      incorrect++;
    }
  }

  const percentage = total > 0 ? Math.round((correct / total) * 100 * 10) / 10 : 0;
  const test = await getTestById(attempt.testId);
  const passingScore = test?.passingPercentage || 50;
  const passed = percentage >= passingScore;

  const submissionTime = new Date().toISOString();
  const scoreData = {
    correct,
    incorrect,
    unanswered,
    total,
    percentage,
    passed,
    passingScore,
    moduleBreakdown
  };

  await updateDoc(attemptRef, {
    status: "submitted",
    submissionTime,
    score: scoreData
  });

  return { id: attemptId, ...attempt, status: "submitted", submissionTime, score: scoreData };
}

export async function advanceStageOrFinalize(attemptId, currentStageIdx, isAuto = false) {
  const attemptRef = doc(db, "examAttempts", attemptId);
  const snap = await getDoc(attemptRef);
  if (!snap.exists()) throw new Error("Attempt not found.");

  const attempt = snap.data();
  if (attempt.status === "submitted") return attempt;

  if (!attempt.isMultiStage || !attempt.stages) {
    return await finalizeAttempt(attemptId);
  }

  const currentStage = attempt.stages[currentStageIdx];
  if (!currentStage) {
    return await finalizeAttempt(attemptId);
  }

  const answerKey = attempt.serverAnswerKey || [];
  const savedAnswers = attempt.savedAnswers || {};
  const start = currentStage.startIndex;
  const count = currentStage.count;
  const end = start + count;

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (let i = start; i < end; i++) {
    const chosen = savedAnswers[i];
    const actual = answerKey[i];
    if (chosen === undefined || chosen === null) {
      unanswered++;
    } else if (chosen === actual) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const percentage = count > 0 ? Math.round((correct / count) * 100 * 10) / 10 : 0;
  const passingRequirement = currentStage.passingPercentage || 50;
  const passed = percentage >= passingRequirement;

  const stageResult = {
    stageId: currentStage.stageId,
    title: currentStage.title,
    correct,
    incorrect,
    unanswered,
    total: count,
    percentage,
    passed,
    passingRequirement,
    evaluatedAt: new Date().toISOString()
  };

  const updatedStages = [...attempt.stages];
  updatedStages[currentStageIdx] = {
    ...currentStage,
    status: passed ? "passed" : "failed"
  };

  const updatedStageResults = {
    ...(attempt.stageResults || {}),
    [currentStage.stageId]: stageResult
  };

  // IF STAGE FAILED -> CANDIDATE IS SCREENED OUT / DISQUALIFIED!
  if (!passed) {
    const submissionTime = new Date().toISOString();
    let totalCorrectSoFar = 0;
    Object.values(updatedStageResults).forEach(sr => {
      totalCorrectSoFar += (sr.correct || 0);
    });

    const scoreData = {
      correct: totalCorrectSoFar,
      incorrect: end - totalCorrectSoFar,
      unanswered,
      total: attempt.questionCount,
      percentage: Math.round((totalCorrectSoFar / end) * 100 * 10) / 10,
      passed: false,
      passingScore: passingRequirement,
      failStage: currentStage.stageId,
      screenedOut: true,
      stageResults: updatedStageResults
    };

    const finalData = {
      status: "submitted",
      submissionTime,
      failStage: currentStage.stageId,
      isScreenedOut: true,
      stages: updatedStages,
      stageResults: updatedStageResults,
      score: scoreData
    };

    await updateDoc(attemptRef, finalData);

    return {
      id: attemptId,
      ...attempt,
      ...finalData,
      canProceed: false,
      screenedOut: true,
      failedStage: currentStage.stageId,
      stageResult
    };
  }

  // IF STAGE PASSED:
  const isLastStage = currentStageIdx >= updatedStages.length - 1;

  if (isLastStage) {
    // All stages passed! Finalize entire mock exam!
    const submissionTime = new Date().toISOString();
    let totalCorrect = 0;
    Object.values(updatedStageResults).forEach(sr => {
      totalCorrect += sr.correct;
    });

    const totalOverall = attempt.questionCount;
    const overallPercentage = totalOverall > 0 ? Math.round((totalCorrect / totalOverall) * 100 * 10) / 10 : 0;

    const scoreData = {
      correct: totalCorrect,
      incorrect: totalOverall - totalCorrect,
      unanswered: 0,
      total: totalOverall,
      percentage: overallPercentage,
      passed: true,
      passingScore: passingRequirement,
      stageResults: updatedStageResults,
      isScreenedOut: false
    };

    const finalData = {
      status: "submitted",
      submissionTime,
      stages: updatedStages,
      stageResults: updatedStageResults,
      score: scoreData
    };

    await updateDoc(attemptRef, finalData);

    return {
      id: attemptId,
      ...attempt,
      ...finalData,
      canProceed: false,
      isCompleted: true,
      stageResult
    };
  }

  // UNLOCK NEXT STAGE
  const nextStageIdx = currentStageIdx + 1;
  updatedStages[nextStageIdx] = {
    ...updatedStages[nextStageIdx],
    status: "unlocked"
  };

  await updateDoc(attemptRef, {
    stages: updatedStages,
    stageResults: updatedStageResults
  });

  return {
    id: attemptId,
    ...attempt,
    stages: updatedStages,
    stageResults: updatedStageResults,
    canProceed: true,
    nextStageIndex: nextStageIdx,
    nextStageTitle: updatedStages[nextStageIdx].title,
    nextStageCount: updatedStages[nextStageIdx].count,
    nextStageDuration: updatedStages[nextStageIdx].durationMinutes,
    stageResult
  };
}

export async function startNextStage(attemptId, nextStageIdx) {
  const attemptRef = doc(db, "examAttempts", attemptId);
  const snap = await getDoc(attemptRef);
  if (!snap.exists()) throw new Error("Attempt not found.");

  const attempt = snap.data();
  if (attempt.status === "submitted") return attempt;

  const stages = [...attempt.stages];
  const targetStage = stages[nextStageIdx];
  if (!targetStage) throw new Error("Stage not found.");

  stages[nextStageIdx] = {
    ...targetStage,
    status: "active"
  };

  const now = new Date();
  const stageDurationMs = (targetStage.durationMinutes || 30) * 60 * 1000;
  const stageExpiry = new Date(now.getTime() + stageDurationMs);

  const updates = {
    stages,
    currentStageIndex: nextStageIdx,
    stageStartTime: now.toISOString(),
    stageExpiryTime: stageExpiry.toISOString()
  };

  await updateDoc(attemptRef, updates);

  return {
    id: attemptId,
    ...attempt,
    ...updates
  };
}

export async function getAttemptById(attemptId) {
  const snap = await getDoc(doc(db, "examAttempts", attemptId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

export async function getCandidateAttempts(candidateId, candidateEmail = null) {
  try {
    const attemptsRef = collection(db, "examAttempts");
    // Query without orderBy to avoid requiring a composite index in Firestore
    const q = query(attemptsRef, where("candidateId", "==", candidateId));
    const snap = await getDocs(q);
    let attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Fallback search by email if candidateId didn't match any attempts
    if (attempts.length === 0 && candidateEmail) {
      const qEmail = query(attemptsRef, where("candidateEmail", "==", candidateEmail.toLowerCase().trim()));
      const snapEmail = await getDocs(qEmail);
      attempts = snapEmail.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Sort in-memory descending by createdAt / submissionTime
    attempts.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.submissionTime || a.startTime || 0).getTime();
      const dateB = new Date(b.createdAt || b.submissionTime || b.startTime || 0).getTime();
      return dateB - dateA;
    });

    return attempts;
  } catch (err) {
    console.error("Error fetching candidate attempts:", err);
    // Ultimate fallback: scan attempts collection
    try {
      const allSnap = await getDocs(collection(db, "examAttempts"));
      const cleanEmail = candidateEmail ? candidateEmail.toLowerCase().trim() : null;
      let matched = allSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.candidateId === candidateId || (cleanEmail && a.candidateEmail?.toLowerCase() === cleanEmail));
      matched.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.submissionTime || a.startTime || 0).getTime();
        const dateB = new Date(b.createdAt || b.submissionTime || b.startTime || 0).getTime();
        return dateB - dateA;
      });
      return matched;
    } catch (e2) {
      console.error("Ultimate fallback failed:", e2);
      return [];
    }
  }
}

export async function getAllAttempts() {
  try {
    const attemptsRef = collection(db, "examAttempts");
    const snap = await getDocs(attemptsRef);
    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    attempts.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.submissionTime || a.startTime || 0).getTime();
      const dateB = new Date(b.createdAt || b.submissionTime || b.startTime || 0).getTime();
      return dateB - dateA;
    });
    return attempts;
  } catch (err) {
    console.error("Error getting all attempts:", err);
    return [];
  }
}

// ==================== RETRY MANAGEMENT ====================
export async function submitRetryRequest(candidateUser, attemptId, reason) {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) throw new Error("Attempt not found.");

  const retryData = {
    candidateId: candidateUser.uid,
    candidateName: candidateUser.name || candidateUser.displayName || "Candidate",
    candidateEmail: candidateUser.email.toLowerCase(),
    testId: attempt.testId,
    testTitle: attempt.testTitle,
    attemptId: attemptId,
    previousScore: attempt.score?.correct || 0,
    previousPercentage: attempt.score?.percentage || 0,
    reason: reason || "Candidate requesting an additional examination attempt.",
    status: "pending", // 'pending' | 'approved' | 'rejected'
    adminDecisionNote: "",
    grantedAttempts: 0,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "retryRequests"), retryData);
  return { id: docRef.id, ...retryData };
}

export async function getPendingRetryRequests() {
  try {
    const rRef = collection(db, "retryRequests");
    const snap = await getDocs(query(rRef, orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching retries:", err);
    return [];
  }
}

export async function resolveRetryRequest(requestId, decision, additionalAttempts, adminNote, adminUser) {
  const reqRef = doc(db, "retryRequests", requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) throw new Error("Retry request not found.");

  const req = snap.data();
  const isApproved = decision === "approved";

  await updateDoc(reqRef, {
    status: decision,
    grantedAttempts: isApproved ? Number(additionalAttempts) || 1 : 0,
    adminDecisionNote: adminNote || "",
    resolvedBy: adminUser.email || "admin",
    resolvedAt: new Date().toISOString()
  });

  // If approved, update candidate access grant
  if (isApproved) {
    const grants = await getCandidateAccessGrants(req.candidateEmail, req.candidateId);
    const targetGrant = grants.find(g => g.testId === req.testId);
    if (targetGrant) {
      await extendAccessGrant(targetGrant.id, Number(additionalAttempts) || 1, null, adminUser);
    }
  }

  await logAdminAction(adminUser, "RESOLVE_RETRY_REQUEST", "retryRequests", requestId, {
    decision,
    candidateEmail: req.candidateEmail,
    testTitle: req.testTitle
  });
}

// ==================== CANDIDATE USERS ====================
export async function getAllCandidates(currentUser = null) {
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => {
        if (u.role !== "candidate") return false;
        // Mock demo admin or super admin shouldn't appear in candidate list
        if (u.email?.toLowerCase() === "admin@pma.edu.pk") return false;
        if (u.invisible === true || u.isSuperAdmin || u.email?.toLowerCase() === "ahmadraufbd@gmail.com") {
          return false;
        }
        return true;
      });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    return [];
  }
}

// ==================== ADMIN TEAM USERS ====================
export async function getAllAdmins(currentUser = null) {
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    const isSuper = currentUser?.email?.toLowerCase() === "ahmadraufbd@gmail.com";

    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => {
        if (u.role !== "admin" && u.role !== "super_admin") return false;
        // Completely exclude mock demo admin
        if (u.email?.toLowerCase() === "admin@pma.edu.pk") return false;
        // The Super Admin is completely INVISIBLE to other admins or anyone
        if (!isSuper && (u.invisible === true || u.isSuperAdmin || u.email?.toLowerCase() === "ahmadraufbd@gmail.com")) {
          return false;
        }
        return true;
      });
  } catch (err) {
    console.error("Error fetching admins:", err);
    return [];
  }
}

export async function updateUserAccountStatus(userId, status, adminUser) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    accountStatus: status,
    updatedAt: new Date().toISOString()
  });
  await logAdminAction(adminUser, "UPDATE_USER_STATUS", "users", userId, { newStatus: status });
}

export async function updateCandidateUser(candidateId, updates, adminUser) {
  const userRef = doc(db, "users", candidateId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Candidate user not found.");
  }

  const cleanData = {
    updatedAt: new Date().toISOString()
  };
  if (updates.name !== undefined) cleanData.name = updates.name.trim();
  if (updates.username !== undefined) cleanData.username = updates.username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
  if (updates.email !== undefined) cleanData.email = updates.email.toLowerCase().trim();
  if (updates.temporaryPassword !== undefined) cleanData.temporaryPassword = updates.temporaryPassword.trim();
  if (updates.accountStatus !== undefined) cleanData.accountStatus = updates.accountStatus;

  await updateDoc(userRef, cleanData);

  // Sync candidate details across their access grants
  try {
    const grantsRef = collection(db, "accessGrants");
    const qSnap = await getDocs(query(grantsRef, where("candidateId", "==", candidateId)));
    if (!qSnap.empty) {
      const batch = writeBatch(db);
      qSnap.docs.forEach((docSnap) => {
        const grantUpdates = {};
        if (cleanData.name) grantUpdates.candidateName = cleanData.name;
        if (cleanData.username) grantUpdates.candidateUsername = cleanData.username;
        if (cleanData.email) grantUpdates.candidateEmail = cleanData.email;
        if (cleanData.temporaryPassword) grantUpdates.temporaryPassword = cleanData.temporaryPassword;
        batch.update(docSnap.ref, grantUpdates);
      });
      await batch.commit();
    }
  } catch (e) {
    console.warn("Could not sync grants for candidate update:", e);
  }

  await logAdminAction(adminUser, "UPDATE_CANDIDATE", "users", candidateId, {
    candidateEmail: cleanData.email || userSnap.data().email
  });

  return { id: candidateId, ...userSnap.data(), ...cleanData };
}

export async function deleteCandidateUser(candidateId, candidateEmail, adminUser) {
  // 1. Delete user document
  await deleteDoc(doc(db, "users", candidateId));

  // 2. Delete all access grants for this candidate
  try {
    const grantsRef = collection(db, "accessGrants");
    const q1 = query(grantsRef, where("candidateId", "==", candidateId));
    const snap1 = await getDocs(q1);
    const batch = writeBatch(db);
    snap1.docs.forEach((d) => batch.delete(d.ref));

    if (candidateEmail) {
      const q2 = query(grantsRef, where("candidateEmail", "==", candidateEmail.toLowerCase().trim()));
      const snap2 = await getDocs(q2);
      snap2.docs.forEach((d) => batch.delete(d.ref));
    }
    await batch.commit();
  } catch (e) {
    console.warn("Error deleting candidate grants:", e);
  }

  // 3. Delete all exam attempts for this candidate
  try {
    const attemptsRef = collection(db, "examAttempts");
    const qA = query(attemptsRef, where("candidateId", "==", candidateId));
    const snapA = await getDocs(qA);
    const batchA = writeBatch(db);
    snapA.docs.forEach((d) => batchA.delete(d.ref));
    await batchA.commit();
  } catch (e) {
    console.warn("Error deleting candidate attempts:", e);
  }

  await logAdminAction(adminUser, "DELETE_CANDIDATE", "users", candidateId, {
    candidateEmail
  });

  return true;
}

export async function deleteAdminUser(userId, adminUser) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const data = userSnap.data();
  if (data.email?.toLowerCase() === "ahmadraufbd@gmail.com") {
    throw new Error("Cannot delete Super Administrator.");
  }
  await deleteDoc(userRef);
  await logAdminAction(adminUser, "DELETE_ADMIN", "users", userId, { email: data.email });
}

// ==================== AUDIT LOGGING ====================
export async function logAdminAction(adminUser, action, targetType, targetId, details = {}) {
  try {
    await addDoc(collection(db, "adminAuditLogs"), {
      adminEmail: adminUser?.email || "admin",
      adminId: adminUser?.uid || "system",
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to log audit:", err);
  }
}

export async function getAdminAuditLogs(currentUser = null, limitCount = 100) {
  try {
    const aRef = collection(db, "adminAuditLogs");
    const snap = await getDocs(query(aRef, orderBy("timestamp", "desc"), limit(limitCount)));
    const isSuper = currentUser?.email?.toLowerCase() === "ahmadraufbd@gmail.com";

    return snap.docs.map(d => {
      const data = d.data();
      if (!isSuper && data.adminEmail?.toLowerCase() === "ahmadraufbd@gmail.com") {
        return { id: d.id, ...data, adminEmail: "System Administrator" };
      }
      return { id: d.id, ...data };
    });
  } catch (err) {
    console.error("Error getting audit logs:", err);
    return [];
  }
}

// ==================== DASHBOARD ANALYTICS ====================
export async function getAdminDashboardStats() {
  try {
    const candidates = await getAllCandidates();
    const tests = await getTests();
    const attempts = await getAllAttempts();
    const retries = await getPendingRetryRequests();

    const completedAttempts = attempts.filter(a => a.status === "submitted");
    const activeAttempts = attempts.filter(a => a.status === "active");
    const pendingRetries = retries.filter(r => r.status === "pending");

    // Performance distribution
    let passCount = 0;
    let failCount = 0;
    let scoreBins = { "0-39%": 0, "40-59%": 0, "60-79%": 0, "80-100%": 0 };

    completedAttempts.forEach(a => {
      const p = a.score?.percentage || 0;
      if (a.score?.passed) passCount++;
      else failCount++;

      if (p < 40) scoreBins["0-39%"]++;
      else if (p < 60) scoreBins["40-59%"]++;
      else if (p < 80) scoreBins["60-79%"]++;
      else scoreBins["80-100%"]++;
    });

    const performanceDistribution = Object.keys(scoreBins).map(key => ({
      range: key,
      count: scoreBins[key]
    }));

    // Module averages
    const moduleScores = { verbal: { sum: 0, count: 0 }, "non-verbal": { sum: 0, count: 0 }, academic: { sum: 0, count: 0 } };
    completedAttempts.forEach(a => {
      const mod = a.moduleType || "academic";
      if (moduleScores[mod]) {
        moduleScores[mod].sum += a.score?.percentage || 0;
        moduleScores[mod].count++;
      }
    });

    const moduleAverages = [
      { module: "Verbal", avg: moduleScores.verbal.count ? Math.round(moduleScores.verbal.sum / moduleScores.verbal.count) : 0 },
      { module: "Non-Verbal", avg: moduleScores["non-verbal"].count ? Math.round(moduleScores["non-verbal"].sum / moduleScores["non-verbal"].count) : 0 },
      { module: "Academic", avg: moduleScores.academic.count ? Math.round(moduleScores.academic.sum / moduleScores.academic.count) : 0 }
    ];

    return {
      totalCandidates: candidates.length,
      activeTests: tests.filter(t => t.status === "active").length,
      totalCompletedAttempts: completedAttempts.length,
      activeSessions: activeAttempts.length,
      pendingRetriesCount: pendingRetries.length,
      passCount,
      failCount,
      performanceDistribution,
      moduleAverages
    };
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return {
      totalCandidates: 0,
      activeTests: 0,
      totalCompletedAttempts: 0,
      activeSessions: 0,
      pendingRetriesCount: 0,
      passCount: 0,
      failCount: 0,
      performanceDistribution: [],
      moduleAverages: []
    };
  }
}

// Utility: Fisher-Yates array shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
