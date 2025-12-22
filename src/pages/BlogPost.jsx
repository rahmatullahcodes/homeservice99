import { useParams, useNavigate } from "react-router-dom";

const POSTS = {
  1: {
    title: "5 Pro Tips to Keep Your Home Spotless",
    author: "Sarah Johnson",
    date: "Dec 20, 2025",
    category: "Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    readTime: "5 min read",
    body: `
      Maintaining a clean home doesn't have to be overwhelming. Here are 5 professional tips that'll transform your space:

      **1. Declutter First, Clean Second**
      Before picking up a mop or cloth, remove unnecessary items from your space. This prevents dust from settling on clutter and makes cleaning faster.

      **2. Work Top-to-Bottom**
      Always start cleaning from the top of a room. Dust and debris naturally fall downward, so you'll end up cleaning surfaces twice if you work upward.

      **3. Establish a Cleaning Schedule**
      Dedicate 15-30 minutes daily to light cleaning instead of one exhausting day. This prevents buildup and keeps your home consistently fresh.

      **4. Use the Right Tools**
      Invest in microfiber cloths, quality vacuums, and eco-friendly cleaners. Better tools make cleaning faster and more effective.

      **5. One Room at a Time**
      Focus on completing one room before moving to the next. This gives you a sense of achievement and prevents getting overwhelmed.

      **Pro tip:** Clean when you have energy, usually in the morning. Your home will stay cleaner longer, and you'll feel more motivated.
    `
  },
  2: {
    title: "AC Maintenance Guide: Avoid Summer Breakdowns",
    author: "Mike Chen",
    date: "Dec 18, 2025",
    category: "Maintenance",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
    readTime: "6 min read",
    body: `
      Your AC is crucial during hot months. Regular maintenance can extend its life and save you money on repairs.

      **When Should You Service Your AC?**
      Ideally, service your AC twice a year — before summer and winter. If you use it year-round, quarterly maintenance is recommended.

      **What Does Service Include?**
      - Filter cleaning/replacement
      - Coolant level check
      - Electrical component inspection
      - Deep coil cleaning
      - Fan motor lubrication

      **Why Regular Maintenance Matters**
      1. Improves cooling efficiency (saves electricity bills)
      2. Prevents expensive breakdown repairs
      3. Extends AC lifespan by 5-7 years
      4. Reduces allergens and improves air quality

      **DIY Tips Between Professional Services**
      - Clean or replace filters monthly
      - Keep outdoor unit clear of debris
      - Don't block indoor vents
      - Use a stabilizer to protect electrical components

      **Common AC Problems & Solutions**
      - Water leaking: Check drain pipe blockage
      - Weak cooling: Service coolant and filters
      - Strange noise: Professional inspection needed
      - High electricity: Efficiency decline, needs servicing

      Don't wait for summer to arrive. Schedule your AC service now!
    `
  },
  3: {
    title: "Home Painting Trends 2025",
    author: "Emma Davis",
    date: "Dec 15, 2025",
    category: "Painting",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705",
    readTime: "7 min read",
    body: `
      Want to refresh your home's look? Here are the top painting trends experts are seeing in 2025.

      **Color Trends:**
      - Warm earth tones (terracotta, sage green, warm beige)
      - Bold accent walls (deep navy, forest green)
      - Soft pastels for bedrooms (lavender, blush pink)

      **Texture & Finishes:**
      - Matte finishes for a sophisticated look
      - Textured walls for visual interest
      - Combination of finishes in same room

      **Space-Specific Recommendations:**
      - Living rooms: Warm neutrals with accent walls
      - Bedrooms: Calming pastels or deep colors for relaxation
      - Kitchens: Light, clean colors to expand space
      - Bathrooms: Moisture-resistant paints in cool tones

      Professional painters can help you choose colors that match your style and lighting conditions.
    `
  }
};

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = POSTS[id];

  if (!post) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Post not found</h2>
        <p>Sorry, the blog post you're looking for doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate('/blog')}>Back to Blog</button>
      </div>
    );
  }

  return (
    <div>
      {/* HERO IMAGE */}
      <section className="blog-post-hero">
        <img src={post.image} alt={post.title} className="blog-hero-image" />
      </section>

      {/* ARTICLE */}
      <article className="container blog-post-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <div className="blog-post-header">
          <span className="blog-category">{post.category}</span>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <span>✍️ By {post.author}</span>
            <span>📅 {post.date}</span>
            <span>⏱️ {post.readTime}</span>
          </div>
        </div>

        <div className="blog-post-body">
          {post.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="blog-post-footer" style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          <button className="btn-outline" onClick={() => navigate('/blog')}>← Back to Blog</button>
        </div>
      </article>
    </div>
  );
}
