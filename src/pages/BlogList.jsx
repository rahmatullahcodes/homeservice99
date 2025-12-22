import { Link } from "react-router-dom";

const POSTS = [
  { id: 1, title: "5 tips to keep your home spotless", summary: "Quick wins for busy people." },
  { id: 2, title: "When should you service your AC?", summary: "Avoid breakdowns in peak summer." }
];

export default function BlogList() {
  return (
    <div className="container">
      <h1 className="section-title">Blog</h1>
      <div className="service-grid">
        {POSTS.map((p) => (
          <div key={p.id} className="service-card">
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <Link to={`/blog/${p.id}`} className="btn-primary btn-sm">
              Read more
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
