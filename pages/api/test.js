import db from "./_firebase";

export default async function handler(req, res) {
  const doc = await db.collection("comparisons").doc("compare-1").get();
  res.status(200).json(doc.data());
}
