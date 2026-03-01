import { Link } from "react-router-dom";
import { Facebook, House, Instagram, Linkedin, X, Youtube } from "lucide-react";
import "./Footer.css";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;


const navSections = [
  {
    title: "Home Service",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Professionals", to: "/professionals" },
      { label: "Terms Of Use", to: "/terms-conditions" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Career", to: "/careers" },
    ],
  },
  {
    title: "Need Help?",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "My Bookings", to: "/account/bookings" },
      { label: "Reviews", to: "/reviews" },
      { label: "Stories", to: "/stories" },
    ],
  },
  {
    title: "Explore More",
    links: [
      { label: "All Services", to: "/services" },
      { label: "Join ONDC", to: "/ondc" },
      { label: "Blogs", to: "/blog" },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", url: "https://instagram.com/homeservice99" },
  { icon: Facebook, label: "Facebook", url: "https://facebook.com/homeservice99" },
  { icon: X, label: "X", url: "https://x.com/homeservice99" },
  { icon: Youtube, label: "YouTube", url: "https://youtube.com/@homeservice99" },
  { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com/company/homeservice99" },
];

const cities = [
  "Bangalore", "Chennai", "Hyderabad", "Mumbai", "Pune", "Delhi", "Ahmedabad", "Kolkata",
  "Coimbatore", "Gurgaon", "Jaipur", "Kochi", "Lucknow", "Madurai", "Mysore", "Noida",
  "Trivandrum", "Warangal", "Tirupati", "Vijayawada", "Visakhapatnam", "Bhubaneswar", "Guntur",
  "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Ongole", "Vizianagaram",
  "Eluru", "Nandyal", "Madanapalle", "Machilipatnam", "Chittoor", "Hindupur", "Srikakulam",
  "Bhimavaram", "Dharamavaram", "Annamayya", "Bapatla", "East Godavari", "Krishna", "NTR",
  "Palnadu", "Prakasam", "Sri Satya Sai", "West Godavari", "YSR", "Parvathipuram Manyam",
  "Dr. B. R. Ambedkar Konaseema",
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-row">
        <Link to="/" className="footer-logo-link" aria-label="HomeService99">
          <img 
            src={assetImage("logohs99-removebg-preview.png")} 
            alt="HomeService99 Logo" 
            className="footer-logo-image"
            style={{ height: "50px", width: "auto", objectFit: "contain" }}
          />
        </Link>
      </div>

      <div className="footer-top">
        <div className="footer-columns">
          {navSections.map((section) => (
            <div key={section.title} className="footer-column">
              <h4>{section.title}</h4>
              {section.links.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="footer-column">
            <h4>Follow Us</h4>
            <div className="footer-underline" />
            <div className="footer-socials">
              {socialLinks.map(({ icon: Icon, label, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon size={20} />
                </a>
              ))}
            </div>
            <Link to="/vendor-signup" className="footer-pro-btn">
              Join Our Pro Network
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-locations">
        <p>
          We are available in :{" "}
          {cities.map((city, index) => (
            <span key={city}>
              {city}
              {index !== cities.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <div className="footer-bottom">
        <p className="legal">
          &copy; 2026 HomeServices99 Online Services Pvt Ltd. All rights reserved | CIN U72200KA2015PTC078917.
        </p>
        <p className="made-in">Made with love in India</p>
      </div>
    </footer>
  );
}