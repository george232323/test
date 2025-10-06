// pages/api/admin/createPoll.js
import db from "../_firebase";
import { isAdmin } from "./_auth";

export default async function handler(req,res){
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAdmin(req)) return res.status(401).json({ error: "Not authorized" });

  const { title, slug, products } = req.body || {};
  if (!title || !slug || !products) return res.status(400).json({ error: "Missing fields" });

  try {
    const docRef = db.collection("polls").doc(slug);
    const now = Date.now();
    await docRef.set({
      title,
      slug,
      products,
      totals: products.reduce((acc,p)=>{ acc[p.id]=0; return acc; }, {}),
      createdAt: now,
      updatedAt: now
    }, { merge: true });
    return res.status(200).json({ ok: true, slug });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
