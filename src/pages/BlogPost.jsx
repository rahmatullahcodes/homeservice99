import { useParams } from "react-router-dom";

const POSTS = {
  1: {
    title: "5 tips to keep your home spotless",
    body: "Tip 1: Declutter first. Tip 2: Work room by room... (static demo text)."
  },
  2: {
    title: "When should you service your AC?",
    body: "Ideally before the summer season. Regular servicing improves efficiency..."
  }
};

export default function BlogPost() {
  const { id } = useParams();
  const post = POSTS[id];

  if (!post) return <div className="container">Post not found.</div>;

  return (
    <div className="container">
      <h1 className="section-title">{post.title}</h1>
      <p className="blog-body">{post.body}</p>
    </div>
  );
}
