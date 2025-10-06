// pages/api/admin/login.js
import crypto from "crypto";

const cookieName = "votup_admin";

function hashPass(p){ return crypto.createHash("sha256").update(p||"").digest("hex"); }

export default async function handler(req,res){
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: "ADMIN_PASSWORD not set" });

  if (hashPass(password) === hashPass(process.env.ADMIN_PASSWORD)) {
    // set cookie (httpOnly, secure in production)
    const token = hashPass(process.env.ADMIN_PASSWORD);
    const secure = process.env.NODE_ENV === "production";
    res.setHeader("Set-Cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax${secure?"; Secure":""}; Max-Age=${60*60*24}`);
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: "كلمة السر خاطئة" });
}
