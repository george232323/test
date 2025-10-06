// pages/index.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [polls, setPolls] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [pr, ar] = await Promise.all([
        fetch("/api/polls-list").then(r=>r.json()),
        fetch("/api/articles-list").then(r=>r.json()),
      ]);
      if (pr.ok) setPolls(pr.polls || []);
      if (ar.ok) setArticles(ar.articles || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"18px 0"}}>
        <h1>VotUp</h1>
        <nav>
          <Link href="/"><a style={{marginRight:12}}>Home</a></Link>
          <Link href="/articles"><a style={{marginRight:12}}>Articles</a></Link>
          <Link href="/vote"><a>Polls</a></Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-left">
            <h2>Featured Articles</h2>
            {articles.slice(0,3).map(a=>(
              <article key={a.slug} className="featured">
                <Link href={`/articles/${a.slug}`}><a>
                  <div className="thumb">{a.hero ? <img src={a.hero} alt={a.title}/> : <div className="placeholder" />}</div>
                  <div>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                  </div>
                </a></Link>
              </article>
            ))}
          </div>

          <div className="hero-right">
            <h2>Active Polls</h2>
            {polls.slice(0,3).map(p=>(
              <div key={p.slug} className="poll-card">
                <h3>{p.title}</h3>
                <div className="poll-preview">
                  {p.products.slice(0,2).map(prod => (
                    <div key={prod.id} className="pp">
                      <img src={prod.image} alt={prod.name}/>
                      <div className="pname">{prod.name}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:8}}>
                  <Link href={`/vote/${p.slug}`}><a className="btn">Vote</a></Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mid">
          <div className="articles-list">
            <h3>Latest Articles</h3>
            {articles.map(a=>(
              <div key={a.slug} className="article-row">
                <Link href={`/articles/${a.slug}`}><a>
                  <div className="art-thumb"><img src={a.hero || "/images/default-hero.jpg"} alt={a.title}/></div>
                  <div>
                    <h4>{a.title}</h4>
                    <p>{a.excerpt}</p>
                  </div>
                </a></Link>
              </div>
            ))}
          </div>

          <aside className="polls-sidebar">
            <h4>Trending Polls</h4>
            {polls.map(p=>(
              <div key={p.slug} className="side-poll">
                <Link href={`/vote/${p.slug}`}><a>
                  <strong>{p.title}</strong>
                  <div className="side-products">
                    {p.products.slice(0,2).map(x=> <span key={x.id}>{x.name}</span>)}
                  </div>
                </a></Link>
              </div>
            ))}
          </aside>
        </section>
      </main>
    </div>
  );
}
