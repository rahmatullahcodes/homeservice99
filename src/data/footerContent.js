import { Facebook, Instagram, Linkedin, X, Youtube } from "lucide-react";

export const navSections = [
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

export const socialLinks = [
  { icon: Instagram, label: "Instagram", url: "https://instagram.com/homeservice99" },
  { icon: Facebook, label: "Facebook", url: "https://facebook.com/homeservice99" },
  { icon: X, label: "X", url: "https://x.com/homeservice99" },
  { icon: Youtube, label: "YouTube", url: "https://youtube.com/@homeservice99" },
  { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com/company/homeservice99" },
];

export const cities = [
  "Bangalore", "Chennai", "Hyderabad", "Mumbai", "Pune", "Delhi", "Ahmedabad", "Kolkata",
  "Coimbatore", "Gurgaon", "Jaipur", "Kochi", "Lucknow", "Madurai", "Mysore", "Noida",
  "Trivandrum", "Warangal", "Tirupati", "Vijayawada", "Visakhapatnam", "Bhubaneswar", "Guntur",
  "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Ongole", "Vizianagaram",
  "Eluru", "Nandyal", "Madanapalle", "Machilipatnam", "Chittoor", "Hindupur", "Srikakulam",
  "Bhimavaram", "Dharamavaram", "Annamayya", "Bapatla", "East Godavari", "Krishna", "NTR",
  "Palnadu", "Prakasam", "Sri Satya Sai", "West Godavari", "YSR", "Parvathipuram Manyam",
  "Dr. B. R. Ambedkar Konaseema",
];
