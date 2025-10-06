// pages/api/admin/list.js
import db from "../_firebase";
import { isAdmin } from "./_auth";

export default async function handler(req,res){
  if (!isAdmin(req)) return res.status(401).json({ error: "Not authorized" });
  try {
    const pollsSnap = await db.collection("polls").orderBy("createdAt","desc").limit(200).get();
    const articlesSnap = await db.collection("articles").orderBy("createdAt","desc").limit(200).get();
    const polls = []; pollsSnap.forEach(d=>polls.push({...d.data(), id: d.id}));
    const articles = []; articlesSnap.forEach(d=>articles.push({...d.data(), id: d.id}));
    res.status(200).json({ ok: true, polls, articles });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
