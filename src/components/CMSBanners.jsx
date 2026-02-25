import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";

export default function CMSBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const response = await fetch(API_ENDPOINTS.CMS.GET_BANNERS_PUBLIC);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || banners.length === 0) return null;

  return (
    <>
      {banners.map((banner, index) => (
        <section 
          key={banner._id} 
          className="container slide-up" 
          style={{ marginTop: index === 0 ? "40px" : "12px", marginBottom: "12px" }}
        >
          <a
            href={banner.link || "#"}
            target={banner.link ? "_blank" : "_self"}
            rel={banner.link ? "noopener noreferrer" : ""}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: banner.image 
                  ? `url(${banner.image}) no-repeat center/cover`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: 'clamp(24px, 5vw, 40px)',
                color: '#ffffff',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 90vw, 400px), 1fr))',
                gap: '24px',
                alignItems: 'center',
                minHeight: banner.image ? 'auto' : '200px',
                cursor: banner.link ? 'pointer' : 'default',
                opacity: 0.9,
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => banner.link && (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => banner.link && (e.currentTarget.style.opacity = '0.9')}
            >
              {!banner.image && (
                <div>
                  <h2 style={{ margin: '0 0 12px 0', fontSize: 'clamp(20px, 5vw, 32px)' }}>
                    {banner.title}
                  </h2>
                  <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                    {banner.description}
                  </p>
                </div>
              )}
            </div>
          </a>
        </section>
      ))}
    </>
  );
}
