import { Link } from "react-router-dom";
import "./Footer.css";
import { navSections, socialLinks, cities } from "../data/footerContent";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-row">
        <Link to="/" className="footer-logo-link" aria-label="HomeService99">
          <img 
            src={assetImage("logohs99-removebg-preview.png")} 
            alt="HomeService99 Logo" 
            className="footer-logo-image"
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
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
