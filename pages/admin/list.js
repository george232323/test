// pages/admin/list.js
import { useEffect, useState } from "react";

export default function List() {
  const [items,setItems]=useState({ polls: [], articles: []});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch("/api/admin/list").then(r=>r.json()).then(j=>{
      if (j.ok) setItems({ polls: j.polls || [], articles: j.articles || []});
      setLoading(false);
    });
  },[]);

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  return (
    <div style={{maxWidth:1000, margin:"20px auto"}}>
      <h2>قائمة Polls</h2>
      <ul>
        {items.polls.map(p=>(
          <li key={p.id}><a href={"/vote/"+p.slug} target="_blank" rel="noreferrer">{p.title}</a> — {p.slug}</li>
        ))}
      </ul>

      <h2>قائمة Articles</h2>
      <ul>
        {items.articles.map(a=>(
          <li key={a.id}><a href={"/articles/"+a.slug} target="_blank" rel="noreferrer">{a.title}</a> — {a.slug}</li>
        ))}
      </ul>
    </div>
  );
}
