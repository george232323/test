// pages/api/admin/logout.js
export default async function handler(req,res){
  res.setHeader("Set-Cookie", `votup_admin=; Path=/; HttpOnly; Max-Age=0`);
  res.status(200).json({ ok: true });
}
