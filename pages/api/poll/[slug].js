// pages/api/poll/[slug].js
import db from "../_firebase";

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });
  try {
    const snap = await db.collection("polls").doc(slug).get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: "Not found" });
    const data = snap.data();
    // ensure totals exist
    data.totals = data.totals || data.products?.reduce((a,p)=>{ a[p.id]=a[p.id]||0; return a; }, {}) || {};
    return res.status(200).json({ ok: true, poll: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
