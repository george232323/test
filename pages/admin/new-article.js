// pages/admin/new-article.js
import { useState } from "react";

export default function NewArticle(){
  const [title,setTitle]=useState("");
  const [slug,setSlug]=useState("");
  const [meta,setMeta]=useState("");
  const [content,setContent]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e){
    e.preventDefault();
    setMsg("جاري النشر...");
    const res = await fetch("/api/admin/createArticle", {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title, slug, meta, content })
    });
    const j = await res.json();
    if (res.ok) {
      setMsg("تم النشر: /articles/" + j.slug);
      setTitle(""); setSlug(""); setMeta(""); setContent("");
    } else {
      setMsg(j.error || "خطأ");
    }
  }

  return (
    <div style={{maxWidth:900, margin:"30px auto"}}>
      <h2>إنشاء Article</h2>
      <form onSubmit={submit}>
        <label>العنوان</label><br/>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",padding:8}}/>
        <br/><label>slug (مثال: best-coffee)</label><br/>
        <input value={slug} onChange={e=>setSlug(e.target.value)} style={{width:"100%",padding:8}}/>
        <br/><label>meta description</label><br/>
        <input value={meta} onChange={e=>setMeta(e.target.value)} style={{width:"100%",padding:8}}/>
        <br/><label>المحتوى (HTML مسموح)</label><br/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={12} style={{width:"100%",padding:8}}/>
        <br/><br/>
        <button>نشر المقال</button>
      </form>
      <div style={{marginTop:12,color:"green"}}>{msg}</div>
    </div>
  );
}
