// pages/api/articles-list.js
import db from "./_firebase";

export default async function handler(req, res) {
  try {
    const snap = await db.collection("articles").where("published", "==", true).orderBy("createdAt", "desc").limit(20).get();
    const articles = [];
    snap.forEach(d => {
      const data = d.data();
      articles.push({
        slug: data.slug || d.id,
        title: data.title,
        meta: data.meta || "",
        excerpt: (data.content || "").slice(0, 160),
        createdAt: data.createdAt || null,
        hero: data.hero || null
      });
    });
    return res.status(200).json({ ok: true, articles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
