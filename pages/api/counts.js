import db from "./_firebase";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { comparisonId } = req.query;
  if (!comparisonId) return res.status(400).json({ error: "Missing comparisonId" });

  try {
    const snap = await db.collection("comparisons").doc(comparisonId).collection("products").get();
    const totals = [];
    snap.forEach(d => totals.push({ product_id: d.id, votes: d.data().votes || 0 }));
    res.status(200).json({ totals });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
}
