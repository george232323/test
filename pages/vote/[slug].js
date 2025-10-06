// pages/vote/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PollPage(){
  const router = useRouter();
  const { slug } = router.query;
  const [poll,setPoll] = useState(null);
  const [selected,setSelected] = useState("");
  const [msg,setMsg] = useState("");

  useEffect(()=> {
    if (!slug) return;
    fetch(`/api/poll/${slug}`).then(r=>r.json()).then(j=> setPoll(j.ok ? j.poll : null));
  }, [slug]);

  async function vote(){
    if (!selected) { setMsg("اختار منتج"); return; }
    const res = await fetch('/api/vote', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ comparisonId: slug, productId: selected })});
    const j = await res.json();
    if (res.ok) setMsg("تم التصويت");
    else setMsg(j.error || "خطأ");
    // refresh counts
    fetch(`/api/poll/${slug}`).then(r=>r.json()).then(j=> setPoll(j.ok ? j.poll : poll));
  }

  if (!poll) return <div style={{padding:20}}>Loading...</div>;
  return (
    <div style={{maxWidth:900, margin:"20px auto"}}>
      <h1>{poll.title}</h1>
      <div style={{display:"flex",gap:20}}>
        {poll.products.map(p=>(
          <div key={p.id} style={{flex:1, border: "1px solid #ddd", padding:12}}>
            <img src={p.image} alt={p.name} style={{width:"100%", height:220, objectFit:"cover"}}/>
            <h3>{p.name}</h3>
            <button onClick={()=>setSelected(p.id)} style={{background: selected===p.id ? "#1E3A8A":"#eee", color: selected===p.id ? "#fff":"#000"}}>اختر</button>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button onClick={vote}>Apply</button>
      </div>
      <div style={{marginTop:8,color:"green"}}>{msg}</div>
    </div>
  );
}
