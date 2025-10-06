// pages/api/poll/[slug].js
import db from "../../_firebase";

export default async function handler(req,res){
  const { slug } = req.query;
  try {
    const snap = await db.collection("polls").doc(slug).get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: "Not found" });
    return res.status(200).json({ ok: true, poll: snap.data() });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
}
