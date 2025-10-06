// pages/admin/index.js
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const j = await res.json();
    if (res.ok) {
      setOk(true);
    } else {
      setMsg(j.error || "خطأ");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout");
    setOk(false);
    setMsg("تم تسجيل الخروج");
  }

  return (
    <div style={{maxWidth:700, margin:"40px auto", padding:20}}>
      <h1>VotUp — Admin</h1>
      {!ok ? (
        <form onSubmit={submit}>
          <label>كلمة السر</label>
          <br />
          <input value={password} onChange={e=>setPassword(e.target.value)} style={{padding:8, width:"100%", marginTop:8}}/>
          <button style={{marginTop:12}}>دخول</button>
          <div style={{color:"red", marginTop:8}}>{msg}</div>
        </form>
      ) : (
        <div>
          <div style={{marginBottom:12}}>
            <button onClick={logout}>تسجيل خروج</button>
          </div>

          <h3>Admin Actions</h3>
          <ul>
            <li><a href="/admin/new-poll">إنشاء Poll جديد</a></li>
            <li><a href="/admin/new-article">إنشاء Article جديد</a></li>
            <li><a href="/admin/list">قائمة Polls & Articles</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}
