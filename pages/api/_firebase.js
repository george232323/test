// pages/api/_firebase.js
import admin from "firebase-admin";

function safeParseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env not set");
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch (e) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON: " + e.message);
  }
  if (!sa.project_id || typeof sa.project_id !== "string") {
    throw new Error('Service account JSON missing "project_id" property. Keys: ' + Object.keys(sa).join(", "));
  }
  return sa;
}

if (!admin.apps.length) {
  const svc = safeParseServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(svc)
  });
}

const db = admin.firestore();
export default db;
