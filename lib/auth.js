import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  onAuthStateChanged,
  getAuth
} from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, firebaseConfig } from "./firebase";
import { seedInitialDataIfEmpty, createAccessGrant } from "./firestore";

export const SUPER_ADMIN_EMAIL = "ahmadraufbd@gmail.com";
export const SUPER_ADMIN_PASS = "unlocking5.";
export const SUPER_ADMIN_PASS_ALT = "unlocking5";

// Helper to get or create a secondary Firebase app instance
// This allows creating new users in Firebase Auth without signing out the current admin!
function getSecondaryAuth() {
  const secondaryAppName = "secondaryAdminCreator";
  let secondaryApp;
  const existingApps = getApps();
  const found = existingApps.find(app => app.name === secondaryAppName);
  if (found) {
    secondaryApp = found;
  } else {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }
  return getAuth(secondaryApp);
}

/**
 * Log in a user (Super Admin, Admin, or Candidate) with Username or Email
 */
export async function loginUser(identifier, password) {
  const cleanInput = (identifier || "").toLowerCase().trim();
  let emailToUse = cleanInput;

  // If user entered a username instead of an email (does not contain '@')
  if (!cleanInput.includes("@")) {
    try {
      const usersRef = collection(db, "users");
      const snap = await getDocs(query(usersRef, where("username", "==", cleanInput)));
      if (!snap.empty) {
        emailToUse = snap.docs[0].data().email || `${cleanInput}@mtacademy.com`;
      } else {
        emailToUse = `${cleanInput}@mtacademy.com`;
      }
    } catch (e) {
      emailToUse = `${cleanInput}@mtacademy.com`;
    }
  }

  const cleanEmail = emailToUse.toLowerCase().trim();
  const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  } catch (err) {
    // If super admin and password was unlocking5 or unlocking5. with/without dot, try the other variant
    if (isSuper && (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")) {
      const altPassword = password.endsWith(".") ? password.slice(0, -1) : password + ".";
      try {
        credential = await signInWithEmailAndPassword(auth, cleanEmail, altPassword);
      } catch (altErr) {
        throw err;
      }
    } else {
      throw err;
    }
  }

  const uid = credential.user.uid;

  // Retrieve user document from Firestore
  let userSnap = await getDoc(doc(db, "users", uid));
  let profile = userSnap.exists() ? userSnap.data() : null;

  // If no profile or if super admin profile needs sync
  if (!profile || (isSuper && profile.role !== "super_admin")) {
    const role = isSuper ? "super_admin" : (profile?.role || (cleanEmail.includes("admin") ? "admin" : "candidate"));
    profile = {
      uid,
      email: cleanEmail,
      username: profile?.username || cleanEmail.split("@")[0],
      name: isSuper ? "Super Administrator" : (profile?.name || (cleanEmail.includes("admin") ? "MTacademy Administrator" : "Candidate")),
      role,
      isSuperAdmin: isSuper,
      invisible: isSuper,
      accountStatus: "active",
      createdAt: profile?.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, "users", uid), profile, { merge: true });
  }

  if (profile.accountStatus === "suspended") {
    await signOut(auth);
    throw new Error("Your account has been suspended by MTacademy administrator.");
  }

  return { user: credential.user, profile };
}

/**
 * Register a new Candidate account
 */
export async function registerCandidate(name, email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const uid = credential.user.uid;

  const profile = {
    uid,
    email: cleanEmail,
    name: name.trim(),
    role: "candidate",
    accountStatus: "active",
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", uid), profile);
  return { user: credential.user, profile };
}

/**
 * Create a new Admin account (callable by Super Admin or authorized Admin)
 * Uses secondary auth so current admin session is not interrupted
 */
export async function createAdminAccount(name, email, password, creatorUser) {
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Cannot re-create Super Admin account.");
  }

  const secondaryAuth = getSecondaryAuth();
  try {
    await signOut(secondaryAuth);
  } catch (e) {}

  const credential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
  const newUid = credential.user.uid;

  // Sign out secondary auth immediately so it remains clean
  try {
    await signOut(secondaryAuth);
  } catch (e) {}

  const profile = {
    uid: newUid,
    email: cleanEmail,
    name: name.trim() || "PMA Administrator",
    role: "admin",
    isSuperAdmin: false,
    invisible: false,
    accountStatus: "active",
    createdBy: creatorUser?.email || "admin",
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", newUid), profile);
  return profile;
}

/**
 * Issue a temporary candidate credential account with username, email, and password
 * Callable by MTacademy Admin. Uses secondary auth so current admin session is preserved.
 */
export async function createTemporaryCandidateAccount({
  name,
  username,
  email,
  temporaryPassword,
  testId,
  testTitle,
  permittedAttempts = 1,
  expiryDate,
  paymentRef,
  internalNote
}, creatorUser) {
  let cleanUsername = (username || "").toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
  if (!cleanUsername) {
    cleanUsername = "pma_" + Math.floor(1000 + Math.random() * 9000);
  }

  let cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail) {
    cleanEmail = `${cleanUsername}@mtacademy.com`;
  }

  const cleanPass = (temporaryPassword || "").trim() || ("MTA" + Math.floor(1000 + Math.random() * 9000));
  const candidateName = (name || "").trim() || cleanUsername;

  const secondaryAuth = getSecondaryAuth();
  try {
    await signOut(secondaryAuth);
  } catch (e) {}

  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
    uid = cred.user.uid;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const usersRef = collection(db, "users");
      const qSnap = await getDocs(query(usersRef, where("email", "==", cleanEmail)));
      if (!qSnap.empty) {
        uid = qSnap.docs[0].id;
        const oldData = qSnap.docs[0].data();
        if (oldData.temporaryPassword && oldData.temporaryPassword !== cleanPass) {
          try {
            const prevCred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, oldData.temporaryPassword);
            await updatePassword(prevCred.user, cleanPass);
          } catch (pErr) {
            console.warn("Could not sync password update in secondary auth", pErr);
          }
        }
      } else {
        uid = "cand_" + Date.now();
      }
    } else {
      throw err;
    }
  } finally {
    try {
      await signOut(secondaryAuth);
    } catch (e) {}
  }

  const profile = {
    uid,
    name: candidateName,
    username: cleanUsername,
    email: cleanEmail,
    temporaryPassword: cleanPass,
    role: "candidate",
    accountStatus: "active",
    createdBy: creatorUser?.email || "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, "users", uid), profile, { merge: true });

  const grant = await createAccessGrant({
    candidateId: uid,
    candidateEmail: cleanEmail,
    candidateUsername: cleanUsername,
    candidateName: candidateName,
    temporaryPassword: cleanPass,
    testId,
    testTitle,
    permittedAttempts: Number(permittedAttempts) || 1,
    expiryDate: expiryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentRef: paymentRef || "JazzCash / Easypaisa Manual",
    internalNote: internalNote || ""
  }, creatorUser);

  return {
    uid,
    name: candidateName,
    username: cleanUsername,
    email: cleanEmail,
    temporaryPassword: cleanPass,
    grant
  };
}

/**
 * Bootstrap Super Admin (ahmadraufbd@gmail.com / unlocking5.) and default data
 */
export async function ensureDefaultAdmin() {
  await seedInitialDataIfEmpty();

  // Use secondaryAuth so it NEVER logs into the active browser session!
  const secondaryAuth = getSecondaryAuth();
  let cred = null;
  try {
    cred = await signInWithEmailAndPassword(secondaryAuth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS);
  } catch (err1) {
    try {
      cred = await signInWithEmailAndPassword(secondaryAuth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS_ALT);
    } catch (err2) {
      if (
        err2.code === "auth/user-not-found" ||
        err1.code === "auth/user-not-found" ||
        err2.code === "auth/invalid-credential"
      ) {
        try {
          cred = await createUserWithEmailAndPassword(secondaryAuth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS);
        } catch (createErr) {
          console.warn("Super admin creation note:", createErr.message);
        }
      }
    }
  }

  if (cred?.user) {
    // Ensure Firestore profile is set with role: 'super_admin' and invisible: true
    await setDoc(
      doc(db, "users", cred.user.uid),
      {
        uid: cred.user.uid,
        email: SUPER_ADMIN_EMAIL.toLowerCase(),
        name: "Super Administrator",
        role: "super_admin",
        isSuperAdmin: true,
        invisible: true,
        accountStatus: "active",
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );
  }

  // Always sign out secondary auth so no session remains
  try {
    await signOut(secondaryAuth);
  } catch (e) {}
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Get profile by UID
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
}
