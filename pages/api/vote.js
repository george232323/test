// pages/api/vote.js
import db from "./_firebase";
import crypto from "crypto";

function ipFromReq(req) {
  const ipHeader = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  return Array.isArray(ipHeader) ? ipHeader[0] : String(ipHeader).split(",")[0].trim();
}
function hashIp(ip) {
  return crypto.createHash("sha256").update(String(ip||"")).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { pollId, productId } = req.body || {};
  if (!pollId || !productId) return res.status(400).json({ ok: false, error: "Missing fields" });

  const ip = ipFromReq(req);
  const ipHash = hashIp(ip);
  const votersRef = db.collection("polls").doc(pollId).collection("voters").doc(ipHash);
  const pollRef = db.collection("polls").doc(pollId);

  try {
    const result = await db.runTransaction(async (t) => {
      const voterDoc = await t.get(votersRef);
      if (voterDoc.exists) {
        return { ok: false, already: true };
      }
      const pollSnap = await t.get(pollRef);
      if (!pollSnap.exists) throw new Error("Poll not found");
      const poll = pollSnap.data();
      const totals = poll.totals || {};
      totals[productId] = (totals[productId] || 0) + 1;

      t.set(votersRef, { seenAt: Date.now(), productId }, { merge: true });
      t.set(pollRef, { totals, updatedAt: Date.now() }, { merge: true });

      return { ok: true, totals };
    });

    if (!result.ok) return res.status(200).json({ ok: false, already: true, message: "You already voted" });
    return res.status(200).json({ ok: true, totals: result.totals || {} });
  } catch (err) {
    console.error("vote error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
