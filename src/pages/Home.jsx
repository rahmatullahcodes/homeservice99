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
      { id: 'cl1', title: 'Full Home Deep Cleaning', category: 'Cleaning', price: 1999, image: 'https://i.postimg.cc/jdFmRtz7/Gemini-Generated-Image-kwxs91kwxs91kwxs.png', rating: 4.8, reviews: 2340, desc: 'Professional deep cleaning with eco-friendly products' },
      { id: 'el2', title: 'Fan Installation / Repair', category: 'Electrician', price: 299, image: 'https://i.postimg.cc/v8NCs5FK/Gemini-Generated-Image-bx1oyjbx1oyjbx1o.png', rating: 4.7, reviews: 1856, desc: 'Expert fan installation and repair services' },
      { id: 'pl1', title: 'Tap & Mixer Repair', category: 'Plumber', price: 199, image: 'https://i.postimg.cc/jSnLqHF2/Gemini-Generated-Image-v6q2mfv6q2mfv6q2.png', rating: 4.9, reviews: 3120, desc: 'Professional tap and mixer repair solutions' },
      { id: 'el5', title: 'Inverter & UPS Installation', category: 'Electrician', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', rating: 4.6, reviews: 1540, desc: 'Expert inverter and UPS installation service' },
      { id: 'ap1', title: 'AC Service', category: 'Appliances', price: 699, image: 'https://i.postimg.cc/jj64X0Dg/Gemini-Generated-Image-fe28zlfe28zlfe28.png', rating: 4.8, reviews: 4230, desc: 'Professional AC service and maintenance' },
      { id: 'el3', title: 'Light / Chandelier Installation', category: 'Electrician', price: 399, image: 'https://i.postimg.cc/1t2xJFyG/Gemini-Generated-Image-4krxr54krxr54krx.png', rating: 4.7, reviews: 1204, desc: 'Professional lighting installation and setup' }
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
      { id: 'ap1', title: 'AC Service', price: 699, image: 'https://i.postimg.cc/BbYpZKLj/Gemini-Generated-Image-mwb21dmwb21dmwb2.png' },
      { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://i.postimg.cc/JhgW0Pvt/Gemini-Generated-Image-p02kysp02kysp02k.png' },
      { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://i.postimg.cc/DZqYh6K6/Gemini-Generated-Image-eui3pbeui3pbeui3.png' },
      { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://i.postimg.cc/C5c7M6r4/Gemini-Generated-Image-2emk6i2emk6i2emk.png' },
      { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://i.postimg.cc/8zRFhrNG/Gemini-Generated-Image-8ubmnm8ubmnm8ubm.png' },
      { id: 'ap6', title: 'AC Repair (Split / Window)', price: 799, image: 'https://i.postimg.cc/y8MMzkZZ/Gemini-Generated-Image-ogntwrogntwrognt.png' },

      { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://i.postimg.cc/h4YMYNmZ/Gemini-Generated-Image-zc03jvzc03jvzc03.png' },
      { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://i.postimg.cc/5Nw7FnHP/Gemini-Generated-Image-pwfxwrpwfxwrpwfx.png' },
      { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://i.postimg.cc/RZpc3HTg/Gemini-Generated-Image-bw98hnbw98hnbw98.png' },
      { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://i.postimg.cc/nhXXPw4c/Gemini-Generated-Image-jguuiojguuiojguu.png' },
      { id: 'ap11', title: 'Chimney Repair', price: 499, image: 'https://i.postimg.cc/MZsKJmKZ/Gemini-Generated-Image-z2suzkz2suzkz2su.png' },
      { id: 'ap12', title: 'RO / Water Purifier Service', price: 599, image: 'https://i.postimg.cc/RVHrp7Wd/Gemini-Generated-Image-fgjsuafgjsuafgjs.png' },
      { id: 'ap13', title: 'Dishwasher Repair', price: 699, image: 'https://i.postimg.cc/cJ6PYfGf/Gemini-Generated-Image-p2pw2xp2pw2xp2pw.png' }
    ],

    Beauty: [
      { id: 'b1', title: 'Haircut & Styling', price: 399, image: 'https://i.postimg.cc/B6B5nww9/Gemini-Generated-Image-y61e4xy61e4xy61e.png' },
      { id: 'b2', title: 'Hair Spa', price: 599, image: 'https://i.postimg.cc/sxRVwT3b/Gemini-Generated-Image-m5hd68m5hd68m5hd.png' },
      { id: 'b3', title: 'Hair Color', price: 899, image: 'https://i.postimg.cc/mg15gBYV/Gemini-Generated-Image-bx9n4cbx9n4cbx9n.png' },
      { id: 'b4', title: 'Facial & Cleanup', price: 499, image: 'https://i.postimg.cc/mZq32MmD/Gemini-Generated-Image-466riz466riz466r.png' },
      { id: 'b5', title: 'Waxing (Full / Half)', price: 399, image: 'https://i.postimg.cc/wMKhFYyg/Gemini-Generated-Image-h2dm8ah2dm8ah2dm.png' },
      { id: 'b6', title: 'Manicure & Pedicure', price: 499, image: 'https://i.postimg.cc/MprfdJNL/Gemini-Generated-Image-1piqz81piqz81piq.png' },
      { id: 'b7', title: 'Threading', price: 199, image: 'https://i.postimg.cc/NjTvP1zh/Gemini-Generated-Image-simtt2simtt2simt.png' },
      { id: 'b8', title: 'Bridal Makeup', price: 2499, image: 'https://i.postimg.cc/rmRHKc2m/Gemini-Generated-Image-o0ipqo0ipqo0ipqo.png' },
      { id: 'b9', title: 'Party Makeup', price: 1499, image: 'https://i.postimg.cc/C1Cjv6j1/Gemini-Generated-Image-5lb1yo5lb1yo5lb1.png' }
    ],

    Men: [
      { id: 'm1', title: 'Haircut', price: 299, image: 'https://i.postimg.cc/qq2QfXWW/Gemini-Generated-Image-77uwxf77uwxf77uw.png' },
      { id: 'm2', title: 'Beard Trim & Styling', price: 249, image: 'https://i.postimg.cc/zvnBnVRn/Gemini-Generated-Image-byb8h5byb8h5byb8.png' },
      { id: 'm3', title: 'Shave', price: 199, image: 'https://i.postimg.cc/CKBwGz3Z/Gemini-Generated-Image-fewy55fewy55fewy.png' },
      { id: 'm4', title: 'Facial', price: 299, image: 'https://i.postimg.cc/V6vnBBYX/Gemini-Generated-Image-bby5j7bby5j7bby5.png' },
      { id: 'm5', title: 'Hair Color', price: 399, image: 'https://i.postimg.cc/RV5G9yS2/Gemini-Generated-Image-cv8pb8cv8pb8cv8p.png' },
      { id: 'm6', title: 'Head Massage', price: 349, image: 'https://i.postimg.cc/T32V3Xz3/Gemini-Generated-Image-ir7hmiir7hmiir7h.png' }
    ],

    Painting: [
      { id: 'pt1', title: 'Interior Painting', price: 1999, image: 'https://i.postimg.cc/SN1scFXp/Gemini-Generated-Image-xdk6h5xdk6h5xdk6.png' },
      { id: 'pt2', title: 'Exterior Painting', price: 2999, image: 'https://i.postimg.cc/Gh4rwBpZ/Gemini-Generated-Image-fq24isfq24isfq24.png' },
      { id: 'pt3', title: 'Wall Texture & Designer Paint', price: 3499, image: 'https://i.postimg.cc/y6gB2gWs/Gemini-Generated-Image-348sp2348sp2348s.png' },
      { id: 'pt4', title: 'Waterproofing', price: 2499, image: 'https://i.postimg.cc/hGf3hmkj/Gemini-Generated-Image-8ye6zi8ye6zi8ye6.png' },
      { id: 'pt5', title: 'Crack Filling & Putty Work', price: 999, image: 'https://i.postimg.cc/WzC4L0cb/Gemini-Generated-Image-c5boobc5boobc5bo.png' },
      { id: 'pt6', title: 'Wallpaper Installation', price: 699, image: 'https://i.postimg.cc/PqSTn1mn/Gemini-Generated-Image-xaxn7ixaxn7ixaxn.png' },
      { id: 'pt7', title: 'Wall Polishing', price: 899, image: 'https://i.postimg.cc/PqGJ6gmX/Gemini-Generated-Image-tjfhkitjfhkitjfh.png' }
    ],

    Carpentry: [
      { id: 'cr1', title: 'Furniture Assembly', price: 499, image: 'https://i.postimg.cc/3WMzMF9k/Gemini-Generated-Image-60z1n360z1n360z1.png' },
      { id: 'cr2', title: 'Door & Window Repair', price: 399, image: 'https://i.postimg.cc/wjxY909Y/Gemini-Generated-Image-s1nosps1nosps1no.png' },
      { id: 'cr3', title: 'Modular Kitchen Repair', price: 999, image: 'https://i.postimg.cc/pr0YzW5K/Gemini-Generated-Image-ncblynncblynncbl.png' },
      { id: 'cr4', title: 'Bed / Wardrobe Repair', price: 599, image: 'https://i.postimg.cc/Rh8JvNnb/Gemini-Generated-Image-rtsfr3rtsfr3rtsf.png' },
      { id: 'cr5', title: 'Lock & Hinge Installation', price: 199, image: 'https://i.postimg.cc/k51bT1X0/Gemini-Generated-Image-6w6nwz6w6nwz6w6n.png' },
      { id: 'cr6', title: 'Custom Furniture Work', price: 2499, image: 'https://i.postimg.cc/MGRCD4Dk/Gemini-Generated-Image-yuw9biyuw9biyuw9.png' }
    ],

    Maintenance: [
      { id: 'mt1', title: 'Handyman Services', price: 399, image: 'https://i.postimg.cc/sgCq2Kzk/Gemini-Generated-Image-a6fcnza6fcnza6fc.png' },
      { id: 'mt2', title: 'Curtain Rod Installation', price: 199, image: 'https://i.postimg.cc/fLSfmnjG/Gemini-Generated-Image-mo8uxzmo8uxzmo8u.png' },
      { id: 'mt3', title: 'TV Wall Mount Installation', price: 499, image: 'https://i.postimg.cc/ydTYfWTw/Gemini-Generated-Image-xpwfqgxpwfqgxpwf.png' },
      { id: 'mt4', title: 'Drilling & Hanging Work', price: 249, image: 'https://i.postimg.cc/HLxqGndV/Gemini-Generated-Image-wam2twam2twam2tw.png' },
      { id: 'mt5', title: 'Bathroom Accessories Installation', price: 299, image: 'https://i.postimg.cc/pdJHv4ns/Gemini-Generated-Image-5m67065m67065m67.png' }
    ],

    Pest: [
      { id: 'ps1', title: 'Cockroach Control', price: 499, image: 'https://img.icons8.com/fluency/96/bug.png' },
      { id: 'ps2', title: 'Termite Control', price: 999, image: 'https://img.icons8.com/fluency/96/termite.png' },
      { id: 'ps3', title: 'Bed Bug Treatment', price: 899, image: 'https://img.icons8.com/fluency/96/bed-bug.png' },
      { id: 'ps4', title: 'Mosquito Control', price: 399, image: 'https://img.icons8.com/fluency/96/mosquito.png' },
      { id: 'ps5', title: 'Rodent Control', price: 699, image: 'https://img.icons8.com/fluency/96/rat.png' },
      { id: 'ps6', title: 'General Pest Control', price: 599, image: 'https://img.icons8.com/fluency/96/pest-control.png' }
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
      'Skin & Facial': ['b4', 'b5', 'b6'],
      'Special Services': ['b7', 'b8', 'b9']
    },
    Men: {
      'Grooming': ['m1', 'm2', 'm3'],
      'Styling & Care': ['m4', 'm5', 'm6']
    },
    Painting: {
      'Wall Services': ['pt1', 'pt2', 'pt3'],
      'Protective Services': ['pt4', 'pt5', 'pt6', 'pt7']
    },
    Carpenter: {
      'Furniture': ['cr1', 'cr4', 'cr6'],
      'Doors & Windows': ['cr2', 'cr3', 'cr5']
    },
    Maintenance: {
      'Installation': ['mt2', 'mt3', 'mt5'],
      'Handyman': ['mt1', 'mt4']
    },
    Pest: {
      'Pest Control': ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6']
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

  // Refs & autoplay state for offers carousel
  const offersRef = useRef(null);
  const currentOfferRef = useRef(0);
  const isPausedRef = useRef(false);
  const [offerIndex, setOfferIndex] = useState(0);

  useEffect(() => {
    const wrap = offersRef.current;
    if (!wrap) return;

    const onEnter = () => (isPausedRef.current = true);
    const onLeave = () => (isPausedRef.current = false);

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
      if (isPausedRef.current) return;
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
      isPausedRef.current = document.hidden;
    });

    return () => {
      clearInterval(interval);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('scroll', onScroll);
    };
  }, []);

  function scrollToOffer(i) {
    const wrap = offersRef.current;
    if (!wrap) return;
    const child = wrap.children[i];
    if (!child) return;
    wrap.scrollTo({ left: child.offsetLeft - 6, behavior: 'smooth' });
    currentOfferRef.current = i;
    setOfferIndex(i);
  }

  return (
    <div>

{/* HERO SECTION */}
<section className="container hero fade-in">
  <div>

    <span className="hero-badge">⭐ 50,000+ Happy Customers in {location}</span>

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

    <div className="search-helpers">
      <div className="search-pill">Background-verified experts</div>
      <div className="search-pill">Pay securely after service</div>
    </div>

    <div className="hero-metrics">
      <span>50k+ bookings completed</span>
      <span>4.8 average rating</span>
      <span>30 min avg. response</span>
    </div>

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

{/* FEATURED SERVICES CARDS */}
<section className="container slide-up" style={{ marginTop: "60px" }}>
  <h2 className="section-title">Popular Services</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Highly-rated services from verified professionals</p>
  
  <div className="services-grid">
    {getFeaturedServices().map((service) => (
      <div key={service.id} className="service-card">
        {/* Service Image */}
        <div className="service-card-image">
          <img src={service.image} alt={service.title} />
        </div>
        
        {/* Service Body */}
        <div className="service-card-body">
          {/* Title */}
          <h3 className="service-card-title">{service.title}</h3>
          
          {/* Category Badge */}
          <span className="service-category-badge">{service.category}</span>
          
          {/* Rating */}
          <div className="service-rating">
            <span className="stars">⭐ {service.rating}</span>
            <span className="review-count">({service.reviews} reviews)</span>
          </div>
          
          {/* Description */}
          <p className="service-description">{service.desc}</p>
          
          {/* Price */}
          <div className="service-price">
            <span>Starting from</span>
            <strong>₹{service.price}</strong>
          </div>
          
          {/* Action Button */}
          <button 
            className="btn-service-card"
            onClick={() => {
              navigate(`/services?category=${encodeURIComponent(service.category)}`);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

{/* OFFERS & DISCOUNTS */}
<section className="container slide-up offers-section">
  <h2 className="section-title">Get Quote</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Grab limited-time deals and curated packages</p>

  <div className="offers-wrap">
    <button className="offers-nav left" aria-label="Scroll left" onClick={() => { offersRef.current?.scrollBy({ left: -320, behavior: 'smooth' }); }}>&#8249;</button>

    <div className="offers-scroll" role="list" ref={offersRef}>
      {OFFERS.map((offer) => (
        <div className="offer-card" key={offer.id} role="listitem">
          <img src={offer.img} alt={offer.title} />
          <div className="offer-body">
            <strong>{offer.title}</strong>
            <p className="offer-sub">{offer.subtitle}</p>
            <div style={{ marginTop: 8 }}>
              <button className="btn-outline">{offer.cta}</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button className="offers-nav right" aria-label="Scroll right" onClick={() => { offersRef.current?.scrollBy({ left: 320, behavior: 'smooth' }); }}>&#8250;</button>

    <div className="offers-indicators" aria-hidden={OFFERS.length <= 1}>
      {OFFERS.map((o, i) => (
        <button key={o.id} className={`dot ${i === offerIndex ? 'active' : ''}`} onClick={() => scrollToOffer(i)} aria-label={`Go to offer ${i + 1}`}></button>
      ))}
    </div>
  </div>
</section>

{/* OFFERS & DISCOUNTS */}
<section className="container slide-up offers-section">
  <h2 className="section-title">Offers & discounts</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Grab limited-time deals and curated packages</p>

  <div className="offers-wrap">
    <button className="offers-nav left" aria-label="Scroll left" onClick={() => { offersRef.current?.scrollBy({ left: -320, behavior: 'smooth' }); }}>&#8249;</button>

    <div className="offers-scroll" role="list" ref={offersRef}>
      {OFFERS.map((offer) => (
        <div className="offer-card" key={offer.id} role="listitem">
          <img src={offer.img} alt={offer.title} />
          <div className="offer-body">
            <strong>{offer.title}</strong>
            <p className="offer-sub">{offer.subtitle}</p>
            <div style={{ marginTop: 8 }}>
              <button className="btn-outline">{offer.cta}</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button className="offers-nav right" aria-label="Scroll right" onClick={() => { offersRef.current?.scrollBy({ left: 320, behavior: 'smooth' }); }}>&#8250;</button>

    <div className="offers-indicators" aria-hidden={OFFERS.length <= 1}>
      {OFFERS.map((o, i) => (
        <button key={o.id} className={`dot ${i === offerIndex ? 'active' : ''}`} onClick={() => scrollToOffer(i)} aria-label={`Go to offer ${i + 1}`}></button>
      ))}
    </div>
  </div>
</section>

{/* HOW IT WORKS */}
<section className="container slide-up" style={{ marginTop: "60px" }}>
  <h2 className="section-title">How HomeService99 Works</h2>
  <div className="how-it-works-grid">
    {[
      { step: "1", icon: "🔍", title: "Browse Services", desc: "Explore thousands of services available in your area" },
      { step: "2", icon: "📅", title: "Select Time", desc: "Choose your preferred date and time for the service" },
      { step: "3", icon: "✓", title: "Confirm Booking", desc: "Complete details and confirm your appointment" },
      { step: "4", icon: "👨‍🔧", title: "Professional Arrives", desc: "Expert arrives at your doorstep on scheduled time" },
      { step: "5", icon: "⭐", title: "Service Completed", desc: "Service delivered with quality assurance" },
      { step: "6", icon: "💰", title: "Pay & Rate", desc: "Safe payment after service + leave your review" }
    ].map((item, idx) => (
      <div key={idx} className="how-it-works-card">
        <div className="how-step-circle">{item.step}</div>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>{item.icon}</div>
        <strong>{item.title}</strong>
        <p style={{ fontSize: "13px", color: "#000000ff", textAlign: "center" }}>{item.desc}</p>
      </div>
    ))}
  </div>
</section>



{/* FAQ SECTION */}
<section className="container slide-up" style={{ marginTop: "60px", marginBottom: "60px" }}>
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

{/* CTA SECTION */}
<section className="container slide-up" style={{ marginBottom: "40px" }}>
  <div className="cta-banner">
    <h2 style={{ margin: "0 0 12px 0", fontSize: "24px" }}>Ready to Get Started?</h2>
    <p style={{ margin: "0 0 20px 0", fontSize: "15px", color: "#000000ff" }}>Book your first service in seconds. No signup required for browsing.</p>
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
      <button className="btn-outline" onClick={() => navigate('/about')}>Learn More</button>
    </div>
  </div>
</section>

    </div>
  );
}
