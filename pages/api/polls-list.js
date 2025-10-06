// pages/api/polls-list.js
import db from "./_firebase";

export default async function handler(req, res) {
  try {
    const snap = await db.collection("polls").orderBy("updatedAt", "desc").limit(20).get();
    const polls = [];
    snap.forEach(d => {
      const data = d.data();
      polls.push({
        slug: data.slug || d.id,
        title: data.title,
        products: data.products || [],
        totals: data.totals || {},
        updatedAt: data.updatedAt || data.createdAt || null
      });
    });
    return res.status(200).json({ ok: true, polls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
