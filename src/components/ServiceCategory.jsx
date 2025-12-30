import React from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES_DATA } from "../pages/Services";
import "../styles/ServiceCategory.css";

const ServiceCategory = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const category = window.location.pathname.split("/").pop();
  const subcategory = params.get("subcategory");

  const categoryData = SERVICES_DATA[category];
  const subcatServices = subcategory && categoryData ? categoryData.subcategories[subcategory] : null;

  // Example: Use first service for banner and info
  const firstService = subcatServices ? subcatServices[0] : null;

  // Fallbacks for demo
  const location = "Noida";
  const address = "Gautam Buddha Nagar, Noida - 201304, Uttar Pradesh, India...";
  const title = `${categoryData ? categoryData.label : "Service"} in ${location}`;
  const rating = firstService ? firstService.rating : 4.5;
  const reviews = firstService ? firstService.reviews : 737;
  const bannerImg = firstService ? firstService.image : "/assets/festive-lighting.jpg";
  const bannerText = firstService ? `${firstService.title} from ₹${firstService.price}` : "Festive Lightings from ₹149";
  const services = subcatServices
    ? subcatServices.map(s => ({ icon: categoryData.icon, label: s.title }))
    : [
        { icon: "⏰", label: "Book by hour" },
        { icon: "💡", label: "Installation Services" },
        { icon: "🔌", label: "UPS Inverter" },
        { icon: "👷‍♂️", label: "Book a consultation" },
        { icon: "🏠", label: "Christmas Lights Installation" },
      ];
  const offers = [
    "Free visit charge for orders above ₹149",
    "Amazon cashback upto ₹500",
    "CRED cashback upto ₹500",
  ];
  const whyUs = [
    "Verified & Vetted professionals",
    "Matched to your Needs.",
    "Customer support at every step.",
  ];

  return (
    <div className="service-category-container">
      <div className="service-category-main">
        <div className="service-category-header">
          <div>
            <div className="service-location">{location}</div>
            <div className="service-address">{address}</div>
          </div>
          <div className="service-cart">No package selected</div>
        </div>
        <div className="service-title-rating">
          <div className="service-title">{title}</div>
          <div className="service-rating">
            <span>⭐ {rating}</span>
            <span className="service-reviews">({reviews} reviews)</span>
          </div>
        </div>
        <div className="service-banner">
          <img src={bannerImg} alt="Banner" className="service-banner-img" />
          <div className="service-banner-text">{bannerText}</div>
        </div>
        <div className="service-options">
          <div className="service-options-title">What service do you need ?</div>
          <div className="service-options-list">
            {services.map((s, i) => (
              <div className="service-option" key={i}>
                <div className="service-option-icon">{s.icon}</div>
                <div className="service-option-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="service-category-side">
        <div className="service-offers">
          {offers.map((offer, i) => (
            <div className="service-offer" key={i}>{offer}</div>
          ))}
        </div>
        <div className="service-why-us">
          <div className="service-why-title">Why Home Triangle?</div>
          <ul>
            {whyUs.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;
