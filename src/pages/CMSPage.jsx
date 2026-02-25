import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";

export default function CMSPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchPage();
  }, [slug]);

  async function fetchPage() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_ENDPOINTS.CMS.GET_PAGE_BY_SLUG(slug));
      if (!response.ok) throw new Error("Page not found");
      
      const data = await response.json();
      
      // Update meta tags
      if (data.metaTitle) document.title = data.metaTitle;
      if (data.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', data.metaDescription);
      }
      if (data.metaKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', data.metaKeywords);
      }
      
      setPage(data);
    } catch (err) {
      setError(err.message);
      addToast("Failed to load page", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p>Loading page...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Page not found</h2>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ marginBottom: "30px", fontSize: "2.5em" }}>{page.title}</h1>
        
        <div 
          className="cms-content" 
          style={{
            lineHeight: "1.8",
            fontSize: "1em",
            color: "#333"
          }}
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
        />
        
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          <button className="btn-outline" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}
