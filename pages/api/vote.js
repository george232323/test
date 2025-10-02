import db from "./_firebase";
import crypto from "crypto";

function hashIp(ip) {
  return crypto.createHash("sha256").update(String(ip || "")).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { comparisonId, productId, userId } = req.body || {};
  if (!comparisonId || !productId) return res.status(400).json({ error: "Missing comparisonId or productId" });

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const ipHash = hashIp(ip);

  try {
    // Read everything first (no writes before all reads)
    const prodRef = db.collection("comparisons").doc(comparisonId).collection("products").doc(productId);
    const ipLogRef = db.collection("comparisons").doc(comparisonId).collection("ipLogs").doc(ipHash);
    const userVoteRef = userId ? db.collection("comparisons").doc(comparisonId).collection("userVotes").doc(userId) : null;

    const readResult = await db.runTransaction(async (t) => {
      const [prodSnap, ipSnap, userSnap] = await Promise.all([
        t.get(prodRef),
        t.get(ipLogRef),
        userVoteRef ? t.get(userVoteRef) : Promise.resolve(null)
      ]);

      // checks based on reads
      if (userSnap && userSnap.exists) {
        throw { code: "USER_ALREADY_VOTED", message: "User already voted in this comparison" };
      }

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const ipRecent = (ipSnap && ipSnap.exists && ipSnap.data().recent) ? ipSnap.data().recent.filter(ts => ts > oneHourAgo) : [];

      if (ipRecent.length >= 3) {
        throw { code: "IP_RATE_LIMIT", message: "Too many votes from this IP (hourly)" };
      }

      // prepare writes (do all writes AFTER reads)
      // update product count
      const currentVotes = prodSnap && prodSnap.exists ? (prodSnap.data().votes || 0) : 0;

      // new ipRecent array to store
      const newIpRecent = ipRecent.concat([now]);

      // queue writes
      if (!prodSnap.exists) {
        t.set(prodRef, { votes: 1 }, { merge: true });
      } else {
        t.update(prodRef, { votes: currentVotes + 1 });
      }

      t.set(ipLogRef, { recent: newIpRecent }, { merge: true });

      t.set(db.collection("comparisons").doc(comparisonId).collection("votes").doc(), {
        productId,
        ipHash,
        userId: userId || null,
        createdAt: now
      });

      if (userVoteRef) {
        t.set(userVoteRef, { productId, votedAt: now, ipHash }, { merge: true });
      }

      return { newVotes: currentVotes + 1 };
    });

    // After transaction, fetch totals to return (or you can incrementally compute)
    const totalsSnap = await db.collection("comparisons").doc(comparisonId).collection("products").get();
    const totals = [];
    totalsSnap.forEach(d => totals.push({ product_id: d.id, votes: d.data().votes || 0 }));

    return res.status(200).json({ ok: true, totals });

  } catch (err) {
    // handle our thrown objects
    if (err && err.code === "USER_ALREADY_VOTED") {
      console.warn("vote denied:", err.message);
      return res.status(409).json({ error: err.message });
    }
    if (err && err.code === "IP_RATE_LIMIT") {
      console.warn("rate limit:", err.message);
      return res.status(429).json({ error: err.message });
    }

    // Firestore transaction / permission / env errors
    console.error("vote error:", err && err.message ? err.message : err);
    // expose a safe message
    return res.status(500).json({ error: "Server error during voting" });
  }
}
