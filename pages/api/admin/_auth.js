// pages/api/admin/_auth.js
import crypto from "crypto";

const cookieName = "votup_admin";
function hashPass(p){ return crypto.createHash("sha256").update(p||"").digest("hex"); }

export function isAdmin(req) {
  try {
    const cookies = (req.headers.cookie || "").split(";").map(s=>s.trim());
    const kv = {};
    cookies.forEach(c=>{
      const [k,v] = c.split("=");
      if (k) kv[k]=v;
    });
    const token = kv[cookieName];
    if (!token) return false;
    if (!process.env.ADMIN_PASSWORD) return false;
    return token === hashPass(process.env.ADMIN_PASSWORD);
  } catch(e) { return false; }
}
