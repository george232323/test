// pages/api/_firebase.js
import admin from "firebase-admin";

function safeParseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env not set");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  }
}

if (!admin.apps.length) {
  const svc = safeParseServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(svc)
  });
}

const db = admin.firestore();
export default db;
