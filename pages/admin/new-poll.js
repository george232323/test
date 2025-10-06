// pages/admin/new-poll.js
import { useState } from "react";

export default function NewPoll() {
  const [title,setTitle]=useState("");
  const [slug,setSlug]=useState("");
  const [aName,setAName]=useState("");
  const [aImage,setAImage]=useState("");
  const [bName,setBName]=useState("");
  const [bImage,setBImage]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e){
    e.preventDefault();
    setMsg("جاري الإنشاء...");
    const res = await fetch("/api/admin/createPoll", {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title, slug, products: [
        { id: "productA", name: aName, image: aImage },
        { id: "productB", name: bName, image: bImage }
      ]})
    });
    const j = await res.json();
    if (res.ok) {
      setMsg("تم الإنشاء: /vote/" + j.slug);
      setTitle(""); setSlug(""); setAName(""); setAImage(""); setBName(""); setBImage("");
    } else {
      setMsg(j.error || "خطأ");
    }
  }

  return (
    <div style={{maxWidth:800, margin:"30px auto"}}>
      <h2>إنشاء Poll جديد</h2>
      <form onSubmit={submit}>
        <label>عنوان التصويت</label><br/>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",padding:8}}/>
        <br/><label>slug (مثال: coffee-brands)</label><br/>
        <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="coffee-brands" style={{width:"100%",padding:8}}/>
        <hr/>
        <h4>المنتج أ</h4>
        <input value={aName} onChange={e=>setAName(e.target.value)} placeholder="اسم المنتج A" style={{width:"100%",padding:8}}/><br/>
        <input value={aImage} onChange={e=>setAImage(e.target.value)} placeholder="رابط الصورة (URL)" style={{width:"100%",padding:8}}/>
        <hr/>
        <h4>المنتج ب</h4>
        <input value={bName} onChange={e=>setBName(e.target.value)} placeholder="اسم المنتج B" style={{width:"100%",padding:8}}/><br/>
        <input value={bImage} onChange={e=>setBImage(e.target.value)} placeholder="رابط الصورة (URL)" style={{width:"100%",padding:8}}/>
        <br/><br/>
        <button>انشئ Poll</button>
      </form>
      <div style={{marginTop:12,color:"green"}}>{msg}</div>
    </div>
  );
}
