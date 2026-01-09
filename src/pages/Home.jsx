import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const [location, setLocation] = useState("india");
  const [detecting, setDetecting] = useState(false);
  
  // Enhanced modal state to support subcategories
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const categories = [
    { title: "Home Cleaning", key: "Cleaning", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
    { title: "Electrician", key: "Electrician", img: "https://i.postimg.cc/s2dBNzKj/electrician-working-on-electrical-panel-circuit-breaker-box.jpg" },
    { title: "Plumber", key: "Plumber", img: "https://i.postimg.cc/0Nn801Bt/Local-Plumber-Broomall-WM-Henderson-Photo.jpg" },
    { title: "AC & Appliances", key: "Appliances", img: "https://i.postimg.cc/q7v7Y7yf/hvac-technician-performing-air-conditioner-600nw-2488702851.webp" },
    { title: "Salon & Beauty (Women)", key: "Beauty", img: "https://i.postimg.cc/XJF6DM2x/Beauty-Salon-And-Spa.webp" },
    { title: "Men's Salon & Grooming", key: "Men", img: "https://i.postimg.cc/3x3QzW8C/mens-salon.jpg" },
    { title: "Painting & Wall Care", key: "Painting", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705" },
    { title: "Carpentry", key: "Carpentry", img: "https://i.postimg.cc/nVCd48RB/679c741cfd2f81997c15fb20-Featured-image.jpg" },
    { title: "Home Maintenance", key: "Maintenance", img: "https://images.unsplash.com/photo-1533451230409-6d21b7f7b284" },
    { title: "Pest Control", key: "Pest", img: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4" },
    { title: "More Services", key: "All", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" }
  ];

  // Professional category icons (folder/category style)
  const CATEGORY_ICONS = {
    Cleaning: 'https://cdn-icons-png.flaticon.com/512/4097/4097458.png',
    Electrician: 'https://cdn-icons-png.flaticon.com/512/929/929430.png',
    Plumber: 'https://cdn-icons-png.flaticon.com/512/1995/1995501.png',
    Appliances: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
    Beauty: 'https://cdn-icons-png.flaticon.com/512/3621/3621997.png',
    Men: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    Painting: 'https://cdn-icons-png.flaticon.com/512/3191/3191288.png',
    Carpentry: 'https://cdn-icons-png.flaticon.com/512/1995/1995548.png',
    Maintenance: 'https://cdn-icons-png.flaticon.com/512/924/924514.png',
    Pest: 'https://cdn-icons-png.flaticon.com/512/1995/1995543.png',
    All: 'https://cdn-icons-png.flaticon.com/512/4436/4436481.png'
  };

  // Subcategory folder icons
  const SUBCATEGORY_ICONS = {
    'Home Cleaning': 'https://cdn-icons-png.flaticon.com/512/3050/3050159.png',
    'Specific Cleaning': 'https://cdn-icons-png.flaticon.com/512/681/681494.png',
    'AC Services': 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
    'Kitchen Appliances': 'https://cdn-icons-png.flaticon.com/512/1995/1995467.png',
    'Hair Services': 'https://cdn-icons-png.flaticon.com/512/1995/1995542.png',
    'Skin & Facial': 'https://cdn-icons-png.flaticon.com/512/3621/3621997.png',
    'Special Services': 'https://cdn-icons-png.flaticon.com/512/1995/1995473.png',
    'Grooming': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'Styling & Care': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'Wall Services': 'https://cdn-icons-png.flaticon.com/512/3191/3191288.png',
    'Protective Services': 'https://cdn-icons-png.flaticon.com/512/3191/3191288.png',
    'Furniture': 'https://cdn-icons-png.flaticon.com/512/1995/1995548.png',
    'Doors & Windows': 'https://cdn-icons-png.flaticon.com/512/1995/1995548.png',
    'Installation': 'https://cdn-icons-png.flaticon.com/512/924/924514.png',
    'Handyman': 'https://cdn-icons-png.flaticon.com/512/924/924514.png',
    'Pest Control': 'https://cdn-icons-png.flaticon.com/512/1995/1995543.png',
    'Electrical Repairs': 'https://cdn-icons-png.flaticon.com/512/929/929430.png',
    'Major Installations': 'https://cdn-icons-png.flaticon.com/512/929/929430.png',
    'Plumbing Repairs': 'https://cdn-icons-png.flaticon.com/512/1995/1995501.png',
    'Installation Services': 'https://cdn-icons-png.flaticon.com/512/1995/1995501.png'
  };

  // small sample services (used in modal quick-list)
  const SAMPLE_SERVICES = [
    { id: "1", title: "Full Home Deep Cleaning", category: "Cleaning", price: 1999, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
    { id: "2", title: "AC Service & Repair", category: "Appliances", price: 699, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b" },
    { id: "3", title: "Electrician Visit", category: "Electrician", price: 249, image: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4" },
    { id: "4", title: "Plumbing Service", category: "Plumber", price: 299, image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3" }
  ];

  // Add function to get featured services with ratings
  const getFeaturedServices = () => {
    return [
      { id: 'cl1', title: 'Full Home Deep Cleaning', category: 'Cleaning', price: 1999, image: 'src/assets/images/Full Home Deep Cleaning.png', rating: 4.8, reviews: 2340, desc: 'Professional deep cleaning with eco-friendly products' },
      { id: 'el2', title: 'Fan Installation / Repair ', category: 'Electrician', price: 299, image: 'src/assets/images/Fan Installation  Repair.png', rating: 4.7, reviews: 1856, desc: 'Expert fan installation and repair services' },
      { id: 'pl1', title: 'Tap & Mixer Repair', category: 'Plumber', price: 199, image: 'src/assets/images/Tap & Mixer Repair.png', rating: 4.9, reviews: 3120, desc: 'Professional tap and mixer repair solutions' },
      { id: 'el5', title: 'Inverter & UPS Installation', category: 'Electrician', price: 799, image: 'src/assets/images/Inverter & UPS Installation.png', rating: 4.6, reviews: 1540, desc: 'Expert inverter and UPS installation service' },
      { id: 'ap1', title: 'AC Service', category: 'Appliances', price: 699, image: 'src/assets/images/AC Service.png', rating: 4.8, reviews: 4230, desc: 'Professional AC service and maintenance' },
      { id: 'el3', title: 'Light / Chandelier Installation', category: 'Electrician', price: 399, image: 'src/assets/images/Light  Chandelier Installation.png', rating: 4.7, reviews: 1204, desc: 'Professional lighting installation and setup' }
    ];
  };

  const SERVICES_BY_CATEGORY = {
    Cleaning: [
      { id: 'cl1', title: 'Full Home Deep Cleaning', price: 1999, image: 'https://i.postimg.cc/jdFmRtz7/Gemini-Generated-Image-kwxs91kwxs91kwxs.png' },
      { id: 'cl2', title: 'Kitchen Deep Cleaning', price: 899, image: 'https://i.postimg.cc/HkSxYJ6n/Gemini-Generated-Image-20t86s20t86s20t8.png' },
      { id: 'cl3', title: 'Bathroom & Toilet Cleaning', price: 499, image: 'https://i.postimg.cc/9f8JYBJQ/Gemini-Generated-Image-isvbauisvbauisvb.png' },
      { id: 'cl4', title: 'Sofa Cleaning', price: 569, image: 'https://i.postimg.cc/rpNLV7V3/Gemini-Generated-Image-fw4oj8fw4oj8fw4o.png' },
      { id: 'cl5', title: 'Carpet Cleaning', price: 699, image: 'https://i.postimg.cc/R0XbbmV3/Gemini-Generated-Image-x3ihmvx3ihmvx3ih.png' },
      { id: 'cl6', title: 'Mattress Cleaning', price: 499, image: 'https://i.postimg.cc/nV0BjLSc/Gemini-Generated-Image-h4zojbh4zojbh4zo.png' },
      { id: 'cl7', title: 'Window & Glass Cleaning', price: 299, image: 'https://i.postimg.cc/sgyMTdLz/Gemini-Generated-Image-93bou793bou793bo.png' },
      { id: 'cl8', title: 'Water Tank Cleaning', price: 799, image: 'https://i.postimg.cc/Dz6Lryfs/Gemini-Generated-Image-nx1iasnx1iasnx1i.png' },
      { id: 'cl9', title: 'Move-In / Move-Out Cleaning', price: 2499, image: 'https://i.postimg.cc/gky9qfR6/Gemini-Generated-Image-vfofnivfofnivfof.png' },
      { id: 'cl10', title: 'Post-Construction Cleaning', price: 2999, image: 'https://i.postimg.cc/qM1wTwH2/Gemini-Generated-Image-22zfvo22zfvo22zf.png' }
    ],

    Electrician: [
      { id: 'el1', title: 'Switch & Socket Repair', price: 199, image: 'https://i.postimg.cc/hGmtLKL3/Gemini-Generated-Image-w66mf8w66mf8w66m.png' },
      { id: 'el2', title: 'Fan Installation / Repair', price: 299, image: 'https://i.postimg.cc/v8NCs5FK/Gemini-Generated-Image-bx1oyjbx1oyjbx1o.png' },
      { id: 'el3', title: 'Light / Chandelier Installation', price: 399, image: 'https://i.postimg.cc/1t2xJFyG/Gemini-Generated-Image-4krxr54krxr54krx.png' },
      { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png' },
      { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png' },
      { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png' },
      { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png' },
      { id: 'el8', title: 'Short Circuit Fix', price: 399, image: 'https://i.postimg.cc/W1BkLWX2/Gemini-Generated-Image-419nud419nud419n.png' },
      { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png' }
    ],

    Plumber: [
      { id: 'pl1', title: 'Tap & Mixer Repair', price: 199, image: 'https://i.postimg.cc/jSnLqHF2/Gemini-Generated-Image-v6q2mfv6q2mfv6q2.png' },
      { id: 'pl2', title: 'Basin & Sink Installation', price: 499, image: 'https://i.postimg.cc/xTwbzpH3/Gemini-Generated-Image-plfkrcplfkrcplfk.png' },
      { id: 'pl3', title: 'Toilet Repair / Installation', price: 599, image: 'https://i.postimg.cc/FK8KM7ZP/Gemini-Generated-Image-kd6smxkd6smxkd6s.png' },
      { id: 'pl4', title: 'Pipe Leakage Fix', price: 349, image: 'https://i.postimg.cc/TYC42mD6/Gemini-Generated-Image-ao0q82ao0q82ao0q.png' },
      { id: 'pl5', title: 'Blockage Removal', price: 399, image: 'https://i.postimg.cc/7Y6NVR5C/Gemini-Generated-Image-oz6j8voz6j8voz6j.png' },
      { id: 'pl6', title: 'Water Motor Installation', price: 999, image: 'https://i.postimg.cc/8C83xGv7/Gemini-Generated-Image-7ra0kk7ra0kk7ra0.png' },
      { id: 'pl7', title: 'Overhead Tank Pipe Work', price: 699, image: 'https://i.postimg.cc/GtkJ80tp/Gemini-Generated-Image-tgktfetgktfetgkt.png' },
      { id: 'pl8', title: 'Bathroom Fittings Installation', price: 399, image: 'https://i.postimg.cc/50568fBR/Gemini-Generated-Image-1lac7b1lac7b1lac.png' },
      { id: 'pl9', title: 'Full Plumbing Inspection', price: 499, image: 'https://i.postimg.cc/qBSvghHV/Gemini-Generated-Image-x069nvx069nvx069.png' }
    ],

    Appliances: [
      { id: 'ap1', title: 'AC Service', price: 699, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://img.icons8.com/fluency/96/gas.png' },
      { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://img.icons8.com/fluency/96/gear.png' },
      { id: 'ap6', title: 'AC Repair (Split / Window)', price: 799, image: 'https://img.icons8.com/fluency/96/repair.png' },

      { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://img.icons8.com/fluency/96/fridge.png' },
      { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://img.icons8.com/fluency/96/washing-machine.png' },
      { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png' },
      { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://img.icons8.com/fluency/96/geyser.png' },
      { id: 'ap11', title: 'Chimney Repair', price: 499, image: 'https://img.icons8.com/fluency/96/chimney.png' },
      { id: 'ap12', title: 'RO / Water Purifier Service', price: 599, image: 'https://img.icons8.com/fluency/96/water-purifier.png' },
      { id: 'ap13', title: 'Dishwasher Repair', price: 699, image: 'https://img.icons8.com/fluency/96/dishwasher.png' }
    ],

    Beauty: [
      { id: 'b1', title: 'Haircut & Styling', price: 399, image: 'https://i.postimg.cc/vT5Q8hGg/salon-icon.png' },
      { id: 'b2', title: 'Hair Spa', price: 599, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png' },
      { id: 'b3', title: 'Hair Color', price: 899, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png' },
      { id: 'b4', title: 'Facial & Cleanup', price: 499, image: 'https://i.postimg.cc/0y7C2h1L/spa-icon.png' },
      { id: 'b5', title: 'Waxing (Full/Half)', price: 399, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' },
      { id: 'b6', title: 'Manicure & Pedicure', price: 499, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' }
    ],

    Men: [
      { id: 'm1', title: 'Haircut', price: 299, image: 'https://img.icons8.com/fluency/96/haircut.png' },
      { id: 'm2', title: 'Beard Trim & Styling', price: 249, image: 'https://img.icons8.com/fluency/96/beard.png' },
      { id: 'm3', title: 'Shave', price: 199, image: 'https://img.icons8.com/fluency/96/shave.png' },
      { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png' },
      { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png' },
      { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png' }
    ],

    Painting: [
      { id: 'pt1', title: 'Interior Painting', price: 1999, image: 'https://img.icons8.com/fluency/96/paint-palette.png' },
      { id: 'pt2', title: 'Exterior Painting', price: 2999, image: 'https://img.icons8.com/fluency/96/paint-roller.png' },
      { id: 'pt3', title: 'Wall Texture & Designer Paint', price: 3499, image: 'https://img.icons8.com/fluency/96/wall.png' },
      { id: 'pt4', title: 'Waterproofing', price: 2499, image: 'https://img.icons8.com/fluency/96/waterproofing.png' },
      { id: 'pt5', title: 'Crack Filling & Putty Work', price: 999, image: 'https://img.icons8.com/fluency/96/putty-knife.png' },
      { id: 'pt6', title: 'Wallpaper Installation', price: 699, image: 'https://img.icons8.com/fluency/96/wallpaper.png' }
    ],

    Carpentry: [
      { id: 'cr1', title: 'Furniture Assembly', price: 499, image: 'https://img.icons8.com/fluency/96/assembly.png' },
      { id: 'cr2', title: 'Door & Window Repair', price: 399, image: 'https://img.icons8.com/fluency/96/door.png' },
      { id: 'cr3', title: 'Modular Kitchen Repair', price: 999, image: 'https://img.icons8.com/fluency/96/kitchen.png' },
      { id: 'cr4', title: 'Bed / Wardrobe Repair', price: 599, image: 'https://img.icons8.com/fluency/96/bed.png' },
      { id: 'cr5', title: 'Lock & Hinge Installation', price: 199, image: 'https://img.icons8.com/fluency/96/lock.png' },
      { id: 'cr6', title: 'Custom Furniture Work', price: 2499, image: 'https://img.icons8.com/fluency/96/custom-furniture.png' }
    ],

    Maintenance: [
      { id: 'mt1', title: 'Handyman Services', price: 399, image: 'https://img.icons8.com/fluency/96/handyman.png' },
      { id: 'mt2', title: 'Curtain Rod Installation', price: 199, image: 'https://img.icons8.com/fluency/96/curtain.png' },
      { id: 'mt3', title: 'TV Wall Mount Installation', price: 499, image: 'https://img.icons8.com/fluency/96/installation.png' },
      { id: 'mt4', title: 'Drilling & Hanging Work', price: 249, image: 'https://img.icons8.com/fluency/96/drill.png' },
      { id: 'mt5', title: 'Bathroom Accessories Installation', price: 299, image: 'https://img.icons8.com/fluency/96/accessories.png' }
    ],

    Pest: [
      { id: 'ps1', title: 'General Pest Control', price: 699, image: 'https://img.icons8.com/fluency/96/pest-control.png' },
      { id: 'ps2', title: 'Rodent Treatment', price: 499, image: 'https://img.icons8.com/fluency/96/rat.png' },
      { id: 'ps3', title: 'Mosquito Fogging', price: 599, image: 'https://img.icons8.com/fluency/96/mosquito.png' },
      { id: 'ps4', title: 'Termite Treatment', price: 999, image: 'https://img.icons8.com/fluency/96/termite.png' },
      { id: 'ps5', title: 'Bed Bug Treatment', price: 799, image: 'https://img.icons8.com/fluency/96/bed-bug.png' },
      { id: 'ps6', title: 'Wood Borers Treatment', price: 599, image: 'https://img.icons8.com/fluency/96/wood.png' }
    ]
  };

  // Subcategories for better browsing experience
  const SUBCATEGORIES = {
    Appliances: {
      'AC Services': ['ap1', 'ap2', 'ap3', 'ap4', 'ap5', 'ap6'],
      'Kitchen Appliances': ['ap7', 'ap8', 'ap9', 'ap10', 'ap11', 'ap12', 'ap13']
    },
    Cleaning: {
      'Home Cleaning': ['cl1', 'cl2', 'cl3', 'cl4', 'cl5', 'cl9', 'cl10'],
      'Specific Cleaning': ['cl6', 'cl7', 'cl8']
    },
    Beauty: {
      'Hair Services': ['b1', 'b2', 'b3'],
      'Skin & Facial': ['b4', 'b5', 'b6']
    },
    Men: {
      'Grooming': ['m1', 'm2', 'm3'],
      'Styling & Care': ['m4', 'm5', 'm6']
    },
    Painting: {
      'Wall Services': ['pt1', 'pt2', 'pt3'],
      'Protective Services': ['pt4', 'pt5', 'pt6']
    },
    Carpentry: {
      'Furniture': ['cr1', 'cr4', 'cr6'],
      'Doors & Windows': ['cr2', 'cr3', 'cr5']
    },
    Maintenance: {
      'Installation': ['mt2', 'mt3', 'mt5'],
      'Handyman': ['mt1', 'mt4']
    },
    Pest: {
      'General Pest Control': ['ps1', 'ps2', 'ps3'],
      'Specialized Services': ['ps4', 'ps5', 'ps6']
    },
    Electrician: {
      'Electrical Repairs': ['el1', 'el2', 'el3', 'el8'],
      'Major Installations': ['el4', 'el5', 'el6', 'el7', 'el9']
    },
    Plumber: {
      'Plumbing Repairs': ['pl1', 'pl4', 'pl5'],
      'Installation Services': ['pl2', 'pl3', 'pl6', 'pl7', 'pl8', 'pl9']
    }
  };

  // offers data (used in Offers carousel)
  const OFFERS = [
    { id: 1, title: 'Winter Home Care Special', subtitle: 'Get 20% off on all services', discount: '20%', cta: 'Get Quote', img: 'https://i.postimg.cc/xdGnf4T5/1.jpg' },
    { id: 2, title: 'Deep Sofa & Upholstery Cleaning', subtitle: 'Just ₹569 - Deep clean & sanitize', discount: 'Save ₹400', cta: 'Get Quote', img: 'https://i.postimg.cc/XqxCdmz4/Chat-GPT-Image-Dec-24-2025-03-28-53-PM.png' },
    { id: 3, title: 'Salon Services for Women', subtitle: 'Hair, makeup, spa - all under one app', discount: 'Starting ₹199', cta: 'Get Quote', img: 'https://i.postimg.cc/CKRk9bhM/s1.webp' },
    { id: 4, title: 'AC Maintenance & Service', subtitle: 'Avoid summer breakdowns - preventive care', discount: 'Full inspection ₹599', cta: 'Get Quote', img: 'https://i.postimg.cc/BnkfJCCH/ac-maintenance.jpg' },
    { id: 5, title: 'Complete Kitchen Deep Clean', subtitle: 'Hygienic, sparkling, and organized', discount: 'Starting ₹899', cta: 'Get Quote', img: 'https://i.postimg.cc/C1tvWFTQ/professional-kitchen-cleaning-hometriangle-blog.jpg' },
    { id: 6, title: 'Home Painting Services', subtitle: 'Interior & exterior - professional quality', discount: 'Free quote', cta: 'Get Quote', img: 'https://i.postimg.cc/PrvMBzPf/wall-painting-service.jpg' }
  ];

  async function getLocation() {
    // keep existing behaviour (toasts already in place) and ensure detecting state stays consistent
    if (!navigator.geolocation) {
      addToast("Location not supported by browser", 'warning');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();

          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            "Your Area";

          setLocation(city);
        } catch {
          addToast("Location lookup failed", 'error');
        }

        setDetecting(false);
      },
      () => {
        addToast("Permission denied", 'warning');
        setDetecting(false);
      }
    );
  }

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  function openCategoryModal(catKey) {
    setModalCategory(catKey);
    setSelectedSubcategory(null);
    setModalOpen(true);
  }

  function selectSubcategory(subcat) {
    setModalOpen(false);
    navigate(`/services?category=${encodeURIComponent(modalCategory)}&subcategory=${encodeURIComponent(subcat)}`);
  }

  function backToCategory() {
    setSelectedSubcategory(null);
  }

  function viewAllCategory(catKey) {
    setModalOpen(false);
    setSelectedSubcategory(null);
    navigate(`/services?category=${encodeURIComponent(catKey)}`);
  }

  function handleAddToCart(service) {
    addToCart({ id: service.id, title: service.title, price: service.price, image: service.image });
    addToast(`${service.title} added to cart`, 'success');
    // keep modal open so user can add multiple services like UrbanCompany's quick modal
  }

  function checkoutFromModal() {
    setModalOpen(false);
    const isLoggedIn = localStorage.getItem('auth') === 'true';
    if (!isLoggedIn) {
      // redirect user to login and after login they will be sent to checkout
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  }

  // Refs & autoplay state for Get Quote carousel
  const getQuoteRef = useRef(null);
  const currentGetQuoteRef = useRef(0);
  const isPausedGetQuoteRef = useRef(false);
  const [getQuoteIndex, setGetQuoteIndex] = useState(0);

  // Refs & autoplay state for Offers carousel
  const offersRef = useRef(null);
  const currentOfferRef = useRef(0);
  const isPausedOffersRef = useRef(false);
  const [offerIndex, setOfferIndex] = useState(0);

  // Auto-scroll for Get Quote carousel
  useEffect(() => {
    const wrap = getQuoteRef.current;
    if (!wrap) return;

    const onEnter = () => (isPausedGetQuoteRef.current = true);
    const onLeave = () => (isPausedGetQuoteRef.current = false);

    const onScroll = () => {
      const left = wrap.scrollLeft;
      let nearest = 0;
      let min = Infinity;
      Array.from(wrap.children).forEach((c, idx) => {
        const delta = Math.abs(c.offsetLeft - left);
        if (delta < min) { min = delta; nearest = idx; }
      });
      currentGetQuoteRef.current = nearest;
      setGetQuoteIndex(nearest);
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('scroll', onScroll, { passive: true });

    const interval = setInterval(() => {
      if (isPausedGetQuoteRef.current) return;
      const count = wrap.children.length || 1;
      const next = (currentGetQuoteRef.current + 1) % count;
      const child = wrap.children[next];
      if (child) {
        wrap.scrollTo({ left: child.offsetLeft - 6, behavior: 'smooth' });
        currentGetQuoteRef.current = next;
        setGetQuoteIndex(next);
      }
    }, 3500);

    document.addEventListener('visibilitychange', () => {
      isPausedGetQuoteRef.current = document.hidden;
    });

    return () => {
      clearInterval(interval);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Auto-scroll for Offers carousel
  useEffect(() => {
    const wrap = offersRef.current;
    if (!wrap) return;

    const onEnter = () => (isPausedOffersRef.current = true);
    const onLeave = () => (isPausedOffersRef.current = false);

    const onScroll = () => {
      const left = wrap.scrollLeft;
      let nearest = 0;
      let min = Infinity;
      Array.from(wrap.children).forEach((c, idx) => {
        const delta = Math.abs(c.offsetLeft - left);
        if (delta < min) { min = delta; nearest = idx; }
      });
      currentOfferRef.current = nearest;
      setOfferIndex(nearest);
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('scroll', onScroll, { passive: true });

    const interval = setInterval(() => {
      if (isPausedOffersRef.current) return;
      const count = wrap.children.length || 1;
      const next = (currentOfferRef.current + 1) % count;
      const child = wrap.children[next];
      if (child) {
        wrap.scrollTo({ left: child.offsetLeft - 6, behavior: 'smooth' });
        currentOfferRef.current = next;
        setOfferIndex(next);
      }
    }, 3500);

    document.addEventListener('visibilitychange', () => {
      isPausedOffersRef.current = document.hidden;
    });

    return () => {
      clearInterval(interval);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div>

{/* HERO SECTION */}
<section className="container hero fade-in">
  <div>

    {/* <span className="hero-badge">⭐ 50,000+ Happy Customers in {location}</span> */}

    <h1 className="hero-title">HomeService99: Trusted Home Services at Your Doorstep</h1>

    {/* <p className="hero-subtitle">
      Book verified professionals for cleaning, repairs, beauty, and maintenance in minutes. Transparent pricing, quality guaranteed, and payment after service completion.
    </p> */}

    {/* <div className="search-card">

      <div className="search-location" onClick={getLocation} style={{ cursor: "pointer" }} aria-hidden="false">
        {detecting ? "Detecting location..." : `${location} · Change`}
      </div>

      <div className="search-input">
        <input aria-label="Search services" placeholder="Search services (cleaning, AC repair, salon...)" />
      </div>

      <button type="button" className="btn-primary" onClick={() => navigate('/services')} aria-label="Find professionals">Find professionals</button>
    </div> */}

    

    <div className="category-card">
      <h3 className="category-card-title">What are you looking for?</h3>

      <div className="category-grid" aria-hidden={false}>
        {categories.slice(0, 9).map((c) => (
          <button key={c.key} className="category-tile" onClick={() => openCategoryModal(c.key)} aria-label={c.title}>
            <div className="category-icon" aria-hidden="true">
              <img src={CATEGORY_ICONS[c.key] || CATEGORY_ICONS['All']} alt={c.title} style={{width: '48px', height: '48px', objectFit: 'contain'}} />
            </div>
            <span>{c.title}</span>
          </button>
        ))}
      </div>
    </div>
<div className="search-helpers">
      <div className="search-pill">Background-verified experts</div>
      <div className="search-pill">Pay securely after service</div>
    </div>

    <div className="hero-metrics">
      <span>50k+ bookings completed</span>
      <span>4.8 average rating</span>
      <span>30 min avg. response</span>
    </div>
  </div>

  <div>
    <div className="hero-mosaic">
      <div className="mosaic-item large">
        <img src="https://i.postimg.cc/JzC2BKTC/Gemini-Generated-Image-s06x51s06x51s06x.png" alt="Salon" />
      </div>
      <div className="mosaic-item">
        <img src="https://i.postimg.cc/X7SGMyH5/body-massage-parlour-jpg.webp" alt="Massage" />
      </div>
      <div className="mosaic-item">
        <img src="https://i.postimg.cc/C1rGHLS1/834431670584630.jpg" alt="Repair" />
      </div>
      <div className="mosaic-item wide">
        <img src="https://i.postimg.cc/1XzWsj5g/service.webp" alt="AC service" />
      </div>
    </div>
  </div>
</section>

{/* CATEGORY QUICK-MODAL WITH SUBCATEGORIES */}
{modalOpen && (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal modal-large">
      {/* Modal Header */}
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {selectedSubcategory && (
            <button 
              className="btn-icon" 
              onClick={backToCategory}
              aria-label="Back to categories"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ←
            </button>
          )}
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
              {selectedSubcategory ? selectedSubcategory : `${modalCategory} Services`}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {selectedSubcategory ? 'Select a service' : 'Choose a category'}
            </p>
          </div>
        </div>
        <button className="btn-outline" onClick={() => setModalOpen(false)} aria-label="Close modal">✕</button>
      </div>

      {/* Service Cards Grid View - Category Wise */}
      <div className="modal-body">
        {Object.keys(SUBCATEGORIES[modalCategory] || {}).map((subcategoryName) => (
          <div key={subcategoryName} style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
              {subcategoryName}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
              {SUBCATEGORIES[modalCategory][subcategoryName]?.map((serviceId) => {
                const service = SERVICES_BY_CATEGORY[modalCategory]?.find(s => s.id === serviceId);
                return service ? (
                  <div
                    key={service.id}
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/services?category=${encodeURIComponent(modalCategory)}`);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px' }} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x90?text=Service'; }} 
                    />
                    <p style={{ margin: '0', fontSize: '11px', fontWeight: '600', color: '#0f172a', textAlign: 'center', lineHeight: '1.3' }}>
                      {service.title}
                    </p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{/* PROMOTIONAL SLIDER SECTION */}
<section className="container slide-up" style={{ marginTop: "40px" }}>
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => {
        const promoScroll = document.querySelector('.promo-slider');
        if (promoScroll) promoScroll.scrollBy({ left: -340, behavior: 'smooth' });
      }}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="promo-slider"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { 
            id: 1, 
            img: 'src/assets/images/Ac_service.jpg',
            category: 'Appliances'
          },
          { 
            id: 2, 
            img: 'src/assets/images/plumber.jpg',
            category: 'Plumber'
          },
          { 
            id: 3, 
            img: 'src/assets/images/carpenter.jpg',
            category: 'Carpentry'
          },
          { 
            id: 4, 
            img: 'src/assets/images/painter.jpg',
            category: 'Painting'
          },
          { 
            id: 5, 
            img: 'src/assets/images/pestcontrol.jpg',
            category: 'Pest Control'
          }
        ].map((promo) => (
          <div 
            key={promo.id}
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '320px',
              scrollSnapAlign: 'start',
              height: '220px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => navigate(`/services?category=${encodeURIComponent(promo.category)}`)}
          >
            {/* Image Only */}
            <img 
              src={promo.img} 
              alt={`Promo ${promo.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/320x220?text=Service+Image';
              }}
            />
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => {
        const promoScroll = document.querySelector('.promo-slider');
        if (promoScroll) promoScroll.scrollBy({ left: 340, behavior: 'smooth' });
      }}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* FEATURED SERVICES CARDS - SLIDER */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Popular Services</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Highly-rated services from verified professionals</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => {
        const servicesScroll = document.querySelector('.services-slider');
        if (servicesScroll) servicesScroll.scrollBy({ left: -280, behavior: 'smooth' });
      }}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="services-slider"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {getFeaturedServices().map((service) => (
          <div 
            key={service.id}
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '240px',
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => {
              navigate(`/services?category=${encodeURIComponent(service.category)}`);
            }}
          >
            {/* Service Image */}
            <div style={{
              width: '100%',
              height: '160px',
              borderRadius: '12px 12px 0 0',
              overflow: 'hidden',
              background: '#f1f5f9'
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/240x160?text=' + service.category;
                }}
              />
            </div>
            
            {/* Service Body */}
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Title */}
              <h3 style={{
                margin: '0 0 6px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                lineHeight: '1.3'
              }}>
                {service.title}
              </h3>
              
              {/* Category Badge */}
              <span style={{
                display: 'inline-block',
                background: '#e0e7ff',
                color: '#2563eb',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                marginBottom: '6px',
                width: 'fit-content'
              }}>
                {service.category}
              </span>
              
              {/* Rating */}
              <div style={{ marginBottom: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  color: '#0f172a',
                  fontWeight: '500'
                }}>
                  ⭐ {service.rating}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginLeft: '4px'
                }}>
                  ({service.reviews})
                </span>
              </div>
              
              {/* Price */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '6px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  From
                </div>
                <strong style={{
                  fontSize: '16px',
                  color: '#2563eb'
                }}>
                  ₹{service.price}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => {
        const servicesScroll = document.querySelector('.services-slider');
        if (servicesScroll) servicesScroll.scrollBy({ left: 280, behavior: 'smooth' });
      }}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* GET QUOTE - PROFESSIONAL SLIDER */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Get Quote</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Grab limited-time deals and curated packages</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => getQuoteRef.current?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="offers-scroll" 
        role="list" 
        ref={getQuoteRef}
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {OFFERS.map((offer) => (
          <div 
            key={offer.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={offer.img} 
                alt={offer.title}
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {offer.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => getQuoteRef.current?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* OFFERS & DISCOUNTS - PROFESSIONAL SLIDER */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Offers & discounts</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Grab limited-time deals and curated packages</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => offersRef.current?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="offers-scroll" 
        role="list"
        ref={offersRef}
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {OFFERS.map((offer) => (
          <div 
            key={offer.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={offer.img} 
                alt={offer.title}
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {offer.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => offersRef.current?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* SALON FOR MEN - GROOMING ESSENTIALS */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Salon for men</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Grooming essentials</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.salon-men-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="salon-men-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'm1', title: 'Haircut', rating: 4.8, reviews: 470, price: 299, image: 'src/assets/images/Haircut.png' },
          { id: 'm2', title: 'Beard trim & styling', rating: 4.87, reviews: 139, price: 249, image: 'src/assets/images/Beard Trim & Styling.png' },
          { id: 'm3', title: 'Haircut for kids', rating: 4.85, reviews: 105, price: 299, image: 'src/assets/images/Haircut for kids.png' },
          { id: 'm4', title: 'Clean shave', rating: 4.86, reviews: 68, price: 249, image: 'src/assets/images/Shave.png' },
          { id: 'm5', title: 'Head, neck & shoulder massage', rating: 4.83, reviews: 50, price: 349, image: 'src/assets/images/Head Massage.png' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
            onClick={() => navigate(`/services?category=Men`)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.salon-men-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* MASSAGE FOR MEN */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Massage for Men</h2>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.massage-men-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="massage-men-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'mm1', title: 'Foot massage', rating: 4.87, reviews: 39, price: 549, image: 'src/assets/images/Foot massage.png' },
          { id: 'mm2', title: 'Head, neck & shoulder massage', rating: 4.87, reviews: 41, price: 649, image: 'src/assets/images/Head, neck & shoulder massage.png' },
          { id: 'mm3', title: 'Leg pain relief massage for men', rating: 4.87, reviews: 12, price: 849, image: 'src/assets/images/Leg pain relief massage for men.png' },
          { id: 'mm4', title: 'Warm deep tissue pain relief massage', rating: 4.83, reviews: 2, price: 1449, image: 'src/assets/images/Warm deep tissue pain relief massage.png' },
          { id: 'mm5', title: 'Quick Comfort Therapy', rating: 4.83, reviews: 11, price: 999, image: 'src/assets/images/Quick Comfort Therapy.png', badge: '17% OFF' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start',
              position: 'relative'
            }}
            onClick={() => navigate(`/services?category=Men`)}
          >
            {service.badge && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#059669',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                zIndex: 5
              }}>
                {service.badge}
              </div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.massage-men-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* HOME REPAIR & INSTALLATION */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Home repair & installation</h2>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.repair-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="repair-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'r1', title: 'Decor installation', rating: 4.83, reviews: 83, price: 79, image: 'src/assets/images/Decor installation.png' },
          { id: 'r2', title: 'Plumber consultation', rating: 4.73, reviews: 92, price: 49, image: 'src/assets/images/Plumber consultation.png' },
          { id: 'r3', title: 'Electrician consultation', rating: 4.74, reviews: 76, price: 49, image: 'src/assets/images/Electrician consultation.png' },
          { id: 'r4', title: 'Switchboard repair & replacement', rating: 4.82, reviews: 46, price: 99, image: 'src/assets/images/Switchboard repair & replacement.png' },
          { id: 'r5', title: 'Cupboard repair', rating: 4.77, reviews: 48, price: 89, image: 'src/assets/images/Cupboard repair.png' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
            onClick={() => navigate(`/services?category=Maintenance`)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.repair-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* APPLIANCE SERVICE & REPAIR */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Appliance Service & Repair</h2>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.appliance-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="appliance-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'a1', title: 'Geyser check-up', rating: 4.73, reviews: 99, price: 249, image: 'src/assets/images/Geyser check-up.png' },
          { id: 'a2', title: 'Automatic top load machine check-up', rating: 4.77, reviews: 346, price: 199, image: 'src/assets/images/Automatic top load machine check-up.png' },
          { id: 'a3', title: 'TV check-up', rating: 4.77, reviews: 158, price: 249, image: 'src/assets/images/TV check-up.png' },
          { id: 'a4', title: 'Geyser service', rating: 4.76, reviews: 74, price: 599, image: 'src/assets/images/Geyser service.png' },
          { id: 'a5', title: 'Geyser installation', rating: 4.78, reviews: 46, price: 499, image: 'src/assets/images/Geyser installation.png' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
            onClick={() => navigate(`/services?category=Appliances`)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.appliance-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* CLEANING ESSENTIALS */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Cleaning Essentials</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Monthly cleaning essential services</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.cleaning-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="cleaning-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'c1', title: 'Intense bathroom cleaning', rating: 4.79, reviews: '4M', price: 399, original: 499, image: 'src/assets/images/Intense bathroom cleaning.png' },
          { id: 'c2', title: 'Intense cleaning (2 bathrooms)', rating: 4.79, reviews: '4M', price: 798, original: 998, image: 'src/assets/images/Intense cleaning (2 bathrooms).png' },
          { id: 'c3', title: 'Chimney cleaning', rating: 4.83, reviews: '157K', price: 399, image: 'src/assets/images/Chimney cleaning.png' },
          { id: 'c4', title: 'Fridge cleaning', rating: 4.83, reviews: '125K', price: 399, image: 'src/assets/images/Fridge cleaning.png.png' },
          { id: 'c5', title: 'Cockroach control (with utensil removal)', rating: 4.79, reviews: '137K', price: 1098, image: 'src/assets/images/Cockroach control (with utensil removal).png' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start'
            }}
            onClick={() => navigate(`/services?category=Cleaning`)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews})</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price} {service.original && <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '6px' }}>₹{service.original}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.cleaning-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* SPA FOR WOMEN */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Spa for Women</h2>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.spa-women-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="spa-women-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'sp1', title: 'Warm Swedish stress relief massage', rating: 4.83, reviews: 6, price: 1349, image: 'src/assets/images/Warm Swedish stress relief massage.png', badge: 'Hot bed' },
          { id: 'sp2', title: 'Warm deep tissue pain relief massage', rating: 4.83, reviews: 6, price: 1499, image: 'src/assets/images/Warm deep tissue pain relief massage.png', badge: 'Hot bed' },
          { id: 'sp3', title: '4 sessions (Mon-Sat only): Swedish massage', rating: 4.82, reviews: 231, price: 1299, image: 'src/assets/images/4 sessions (Mon-Sat only) Swedish massage.png' },
          { id: 'sp4', title: '4 sessions (Mon-Sat only): Deep tissue massage', rating: 4.82, reviews: 157, price: 1449, image: 'src/assets/images/4 sessions (Mon-Sat only) Deep tissue massage create image .png', badge: 'Hot bed' },
          { id: 'sp5', title: 'Leg pain relief massage for women', rating: 4.85, reviews: 12, price: 849, image: 'src/assets/images/Leg pain relief massage for women.png.png' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start',
              position: 'relative'
            }}
            onClick={() => navigate(`/services?category=Beauty`)}
          >
            {service.badge && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: '#92400e',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                zIndex: 5
              }}>
                {service.badge}
              </div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.spa-women-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* SALON FOR WOMEN */}
<section className="container slide-up" style={{ marginTop: "24px" }}>
  <h2 className="section-title">Salon for Women</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Pamper yourself at home</p>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.salon-women-scroll')?.scrollBy({ left: -268, behavior: 'smooth' })}
      aria-label="Scroll left"
      style={{
        position: 'absolute',
        left: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ‹
    </button>

    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div 
        className="salon-women-scroll" 
        role="list"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {[
          { id: 'sw1', title: 'Roll-on waxing (Full arms, legs & underarms)', rating: 4.88, reviews: 66, price: 899, image: 'src/assets/images/Roll-on waxing (Full arms, legs & underarms).png' },
          { id: 'sw2', title: 'Spatula waxing (Full arms, legs & underarms)', rating: 4.86, reviews: 47, price: 699, image: 'src/assets/images/Spatula waxing (Full arms, legs & underarms).png' },
          { id: 'sw3', title: 'Crystal rose pedicure', rating: 4.83, reviews: 134, price: 759, image: 'src/assets/images/Crystal rose pedicure.png' },
          { id: 'sw4', title: 'Mani-pedi delight', rating: 4.82, reviews: 191, price: 1359, original: 1458, image: 'src/assets/images/Mani-pedi delight.png', badge: '7% OFF' }
        ].map((service) => (
          <div 
            key={service.id} 
            role="listitem"
            style={{
              flex: '0 0 calc(25% - 12px)',
              minWidth: '220px',
              scrollSnapAlign: 'start',
              position: 'relative'
            }}
            onClick={() => navigate(`/services?category=Beauty`)}
          >
            {service.badge && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#059669',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                zIndex: 5
              }}>
                {service.badge}
              </div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {service.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#f59e0b' }}>★ {service.rating}</span>
                <span style={{ color: '#6b7280' }}>({service.reviews}K)</span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                ₹{service.price} {service.original && <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '6px' }}>₹{service.original}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button 
      className="carousel-arrow"
      onClick={() => document.querySelector('.salon-women-scroll')?.scrollBy({ left: 268, behavior: 'smooth' })}
      aria-label="Scroll right"
      style={{
        position: 'absolute',
        right: '-50px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      ›
    </button>
  </div>
</section>

{/* HOW IT WORKS */}
<section className="container slide-up" style={{ marginTop: "24px", marginBottom: "24px" }}>
  <div style={{ marginBottom: "60px", textAlign: "center" }}>
    <h2 className="section-title" style={{ fontSize: "32px", marginBottom: "12px", fontWeight: "700" }}>How HomeService99 Works</h2>
    <p style={{ fontSize: "16px", color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
      Simple, transparent, and secure. Book your service in just 6 easy steps.
    </p>
  </div>
  
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
    maxWidth: "1400px",
    margin: "0 auto"
  }}>
    {[
      { 
        step: "1", 
        icon: "🔍", 
        title: "Browse Services", 
        desc: "Explore thousands of verified services available in your area with detailed descriptions and ratings" 
      },
      { 
        step: "2", 
        icon: "📅", 
        title: "Select Time", 
        desc: "Choose your preferred date and time for the service. Get instant availability updates." 
      },
      { 
        step: "3", 
        icon: "✓", 
        title: "Confirm Booking", 
        desc: "Complete all details and confirm your appointment. Receive instant confirmation via SMS/Email." 
      },
      { 
        step: "4", 
        icon: "👨‍🔧", 
        title: "Professional Arrives", 
        desc: "Our verified expert arrives at your doorstep on scheduled time with all necessary tools." 
      },
      { 
        step: "5", 
        icon: "⭐", 
        title: "Service Completed", 
        desc: "Service is delivered with 100% quality assurance and attention to detail." 
      },
      { 
        step: "6", 
        icon: "💰", 
        title: "Pay & Rate", 
        desc: "Safe payment after service is completed. Share your feedback and help us improve." 
      }
    ].map((item, idx) => (
      <div 
        key={idx} 
        style={{
          position: "relative",
          padding: "36px 28px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "2px solid #e2e8f0",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(15, 23, 42, 0.12)";
          e.currentTarget.style.borderColor = "#2563eb";
          e.currentTarget.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.background = "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)";
        }}
      >
        {/* Step Circle */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "20px",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}
        >
          {item.step}
        </div>

        {/* Icon */}
        <div style={{
          fontSize: "56px",
          marginBottom: "16px",
          display: "inline-block",
          animation: "float 3s ease-in-out infinite"
        }}>
          {item.icon}
        </div>

        {/* Title */}
        <h3 style={{
          margin: "0 0 12px 0",
          fontSize: "20px",
          fontWeight: "700",
          color: "#0f172a",
          lineHeight: "1.4"
        }}>
          {item.title}
        </h3>

        {/* Description */}
        <p style={{
          margin: "0",
          fontSize: "14px",
          color: "#64748b",
          lineHeight: "1.6",
          fontWeight: "500"
        }}>
          {item.desc}
        </p>
      </div>
    ))}
  </div>

  {/* Animated floating styles */}
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
  `}</style>
</section>



{/* FAQ SECTION */}
<section className="container slide-up" style={{ marginTop: "24px", marginBottom: "40px" }}>
  <h2 className="section-title">Frequently Asked Questions</h2>
  <div className="faq-container">
    {[
      { 
        q: "Is it safe to book services through HomeService99?", 
        a: "Yes! All professionals are background-verified, trained, and insured. We guarantee customer safety and service quality. You can pay after the service is completed."
      },
      { 
        q: "What if the professional doesn't turn up?", 
        a: "If the professional doesn't arrive within 30 minutes of the scheduled time, you'll get a full refund or we'll reschedule at no extra cost."
      },
      { 
        q: "Can I cancel my booking?", 
        a: "Yes! You can cancel free of charge up to 3 hours before the scheduled service time. Cancellations after that may incur a small fee."
      },
      { 
        q: "How are prices determined?", 
        a: "Prices are transparent and vary based on service type, duration, and location. You'll see the exact cost before confirming your booking."
      },
      { 
        q: "What if I'm not satisfied with the service?", 
        a: "We have a 100% satisfaction guarantee. If you're unhappy, contact us within 24 hours for a rework or full refund."
      },
      { 
        q: "Can I book recurring services?", 
        a: "Yes! You can set up weekly, bi-weekly, or monthly recurring bookings for services like cleaning, laundry, and maintenance at special discounted rates."
      }
    ].map((item, idx) => (
      <div key={idx} className="faq-item">
        <details className="faq-details">
          <summary className="faq-question">
            <span>❓</span> {item.q}
          </summary>
          <p className="faq-answer">{item.a}</p>
        </details>
      </div>
    ))}
  </div>
</section>

{/* CTA SECTION - VENDOR SIGNUP */}
<section className="container slide-up" style={{ marginBottom: "24px", marginTop: "24px" }}>
  <div style={{
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    padding: "40px 32px",
    textAlign: "center",
    border: "2px solid #2563eb",
    maxWidth: "700px",
    margin: "0 auto",
    transition: "all 0.3s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = "0 12px 32px rgba(37, 99, 235, 0.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
  }}>
    {/* Icon */}
    <div style={{
      fontSize: "40px",
      marginBottom: "16px",
      display: "inline-block"
    }}>
      🧩
    </div>

    {/* Heading */}
    <h2 style={{
      margin: "0 0 12px 0",
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      lineHeight: "1.3"
    }}>
      Are you a skilled professional?
    </h2>

    {/* Description */}
    <p style={{
      margin: "0 0 24px 0",
      fontSize: "14px",
      color: "#64748b",
      lineHeight: "1.5",
      maxWidth: "550px",
      marginLeft: "auto",
      marginRight: "auto",
      fontWeight: "500"
    }}>
      Elevate your business by joining HomeService99 as a Service Expert. Highlight your expertise, engage with homeowners, and expand your reach. Become a member now!
    </p>

    {/* Button */}
    <button 
      onClick={() => navigate('/vendor-signup')}
      style={{
        padding: "12px 36px",
        fontSize: "15px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "#1e40af";
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "#2563eb";
        e.target.style.transform = "translateY(0)";
      }}
    >
      Join Our Pro Network
    </button>
  </div>
</section>

    </div>
  );
}
