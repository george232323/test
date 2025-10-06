// pages/vote/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PollPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchPoll() {
    if (!slug) return;
    try {
      const r = await fetch(`/api/poll/${slug}`);
      const j = await r.json();
      if (j.ok) setPoll(j.poll);
    } catch (e) {
      console.warn(e);
    }
  }

  useEffect(() => {
    fetchPoll();
    // polling every 3s to refresh totals (lightweight)
    const iv = setInterval(fetchPoll, 3000);
    return () => clearInterval(iv);
  }, [slug]);

  function selectProduct(id) {
    setSelected(id);
    setMsg("");
  }

  async function applyVote() {
    if (!selected) { setMsg("اختار منتج أولا"); return; }
    // client-side guard
    if (localStorage.getItem(`voted_${slug}`)) { setMsg("انت صوتت بالفعل"); return; }

    setLoading(true);
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: slug, productId: selected })
      });
      const j = await r.json();
      if (j.ok) {
        localStorage.setItem(`voted_${slug}`, JSON.stringify({ at: Date.now(), product: selected }));
        setMsg("تم التصويت. شكراً!");
        // update local totals quickly (optimistic)
        await fetchPoll();
      } else if (j.already) {
        setMsg("انت صوتت بالفعل");
        localStorage.setItem(`voted_${slug}`, JSON.stringify({ at: Date.now(), product: selected }));
        await fetchPoll();
      } else {
        setMsg(j.error || "حصل خطأ أثناء التصويت");
      }
    } catch (e) {
      console.error(e);
      setMsg("حصل خطأ بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  if (!poll) return <div style={{ padding: 20 }}>جاري التحميل...</div>;

  const totals = poll.totals || {};
  const a = totals[poll.products[0].id] || 0;
  const b = totals[poll.products[1].id] || 0;
  const sum = a + b;
  const pa = sum === 0 ? 0 : Math.round((a / sum) * 100);
  const pb = sum === 0 ? 0 : 100 - pa;

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 12, fontFamily: "Arial,sans-serif", color: "#fff" }}>
      <h1 style={{ textAlign: "center" }}>{poll.title}</h1>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap", marginTop: 20 }}>
        {poll.products.map((p, idx) => {
          const isSelected = selected === p.id;
          const count = totals[p.id] || 0;
          const pct = sum === 0 ? 0 : Math.round((count / sum) * 100);
          return (
            <div key={p.id} onClick={() => selectProduct(p.id)}
              style={{
                width: 420, maxWidth: "45%", cursor: "pointer",
                borderRadius: 12, overflow: "hidden",
                boxShadow: isSelected ? "0 20px 40px rgba(0,0,0,0.6)" : "0 8px 24px rgba(0,0,0,0.4)",
                border: isSelected ? "2px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.25)",
                textAlign: "center", paddingBottom: 14
              }}>
              <div style={{ position: "relative" }}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", right: 12, top: 12, background: isSelected ? "#1E3A8A" : "rgba(0,0,0,0.5)", color: "#fff", padding: "6px 10px", borderRadius: 8 }}>
                  {isSelected ? "محدد" : "اختار"}
                </div>
              </div>

              <h3 style={{ marginTop: 12 }}>{p.name}</h3>
              <p style={{ color: "rgba(255,255,255,0.78)" }}>{p.desc || ""}</p>

              <div style={{ width: "88%", margin: "10px auto" }}>
                <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: idx === 0 ? "linear-gradient(90deg,#36d1dc,#5b86e5)" : "linear-gradient(90deg,#ff9a9e,#fad0c4)", transition: "width .5s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <div style={{ fontWeight: 700 }}>{pct}%</div>
                  <div style={{ color: "rgba(255,255,255,0.8)" }}>{count} صوت</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <button onClick={applyVote} disabled={loading} style={{
          background: "#1E3A8A", color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "جاري..." : "Apply"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 10, color: "#ffdddd" }}>{msg}</div>
    </div>
  );
}
