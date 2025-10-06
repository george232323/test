// pages/api/admin/createArticle.js
import db from "../_firebase";
import { isAdmin } from "./_auth";

export default async function handler(req,res){
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAdmin(req)) return res.status(401).json({ error: "Not authorized" });

  const { title, slug, meta, content } = req.body || {};
  if (!title || !slug || !content) return res.status(400).json({ error: "Missing fields" });

  try {
    const docRef = db.collection("articles").doc(slug);
    const now = Date.now();
    await docRef.set({
      title, slug, meta, content, createdAt: now, updatedAt: now, published: true
    }, { merge: true });
    return res.status(200).json({ ok: true, slug });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
