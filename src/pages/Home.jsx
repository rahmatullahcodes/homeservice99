import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { buildServicesUrl } from "../utils/serviceRouting";
import CMSBanners from "../components/CMSBanners";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;




export default function Home() {
  const [location, setLocation] = useState("india");
  const [detecting, setDetecting] = useState(false);
  
  // Enhanced modal state to support subcategories
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
const BEAUTY_SUBCATEGORIES = [
  {
    key: "salon-for-women",
    label: "Salon for Women",
    subcategory: "Waxing",
    icon: assetImage("salonicon.png")
  },
  {
    key: "spa-for-women",
    label: "Spa for Women",
    subcategory: "Super saver packs",
    icon: assetImage("Spa for Womenicon.png")
  },
  {
    key: "hair-studio-for-women",
    label: "Hair Studio for Women",
    subcategory: "Korean facial",
    icon: assetImage("Hair Studio for Women.png")
  },
  {
    key: "makeup-styling-studio",
    label: "Makeup & Styling Studio",
    subcategory: "Makeup & Styling",
    icon: assetImage("Makeup & Styling Studio.png")
  }
];



  // Carousel refs for all horizontal scroll sections
  const popularServicesRef = useRef(null);
  const promoSliderRef = useRef(null);
  const salonMenRef = useRef(null);
  const massageMenRef = useRef(null);
  const homeRepairRef = useRef(null);
  const applianceRef = useRef(null);
  const cleaningEssentialsRef = useRef(null);
  const spaWomenRef = useRef(null);
  const salonWomenRef = useRef(null);

  // Helper function to scroll carousel
  const scrollCarousel = (ref, direction = 'right') => {
    if (ref?.current) {
      const scrollAmount = 280; // Scroll by one item width
      ref.current.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
    }
  };

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
      { id: 'cl1', title: 'Full Home Deep Cleaning', price: 299, image: assetImage("Full Home Deep Cleaning.png"), rating: 4.8, reviews: 2340, desc: 'Professional deep cleaning with eco-friendly products' },
      { id: 'el2', title: 'Fan Installation / Repair ', category: 'Electrician', price: 299, image: assetImage("Fan Installation  Repair.png"), rating: 4.7, reviews: 1856, desc: 'Expert fan installation and repair services' },
      { id: 'pl1', title: 'Tap & Mixer Repair', category: 'Plumber', price: 199, image: assetImage("Tap & Mixer Repair.png"), rating: 4.9, reviews: 3120, desc: 'Professional tap and mixer repair solutions' },
      { id: 'el5', title: 'Inverter & UPS Installation', category: 'Electrician', price: 799, image: assetImage("Inverter & UPS Installation.png"), rating: 4.6, reviews: 1540, desc: 'Expert inverter and UPS installation service' },
      { id: 'ap1', title: 'AC Service', category: 'Appliances', price: 699, image: assetImage("AC Service.png"), rating: 4.8, reviews: 4230, desc: 'Professional AC service and maintenance' },
      { id: 'el3', title: 'Light / Chandelier Installation', category: 'Electrician', price: 399, image: assetImage("Light  Chandelier Installation.png"), rating: 4.7, reviews: 1204, desc: 'Professional lighting installation and setup' }
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
      'Home appliances': [
        {
          key: 'AC',
          label: 'AC',
          instant: true,
          icon: 'https://img.icons8.com/fluency/96/air-conditioner.png'
        },
        {
          key: 'Washing Machine',
          label: 'Washing Machine',
          instant: true,
          icon: 'https://img.icons8.com/fluency/96/washing-machine.png'
        },
        {
          key: 'Television',
          label: 'Television',
          instant: false,
          icon: 'https://img.icons8.com/fluency/96/tv.png'
        },
        {
          key: 'Laptop',
          label: 'Laptop',
          instant: false,
          icon: 'https://img.icons8.com/fluency/96/laptop.png'
        },
        {
          key: 'Air Purifier',
          label: 'Air Purifier',
          instant: false,
          icon: assetImage("Air Purifier.png")
        },
        {
          key: 'Air Cooler',
          label: 'Air Cooler',
          instant: false,
          icon: 'https://img.icons8.com/fluency/96/fan.png'
        },
        {
          key: 'Geyser',
          label: 'Geyser',
          instant: true,
          icon: assetImage("Geysericon.png")
        }
      ],
      'Kitchen appliances': [
        {
          key: 'Water Purifier',
          label: 'Water Purifier Repair',
          instant: false,
          icon: assetImage("Water Purifier Repair.png")
        },
        {
          key: 'Refrigerator',
          label: 'Refrigerator',
          instant: true,
          icon: 'https://img.icons8.com/fluency/96/fridge.png'
        },
        {
          key: 'Microwave',
          label: 'Microwave',
          instant: false,
          icon: 'https://img.icons8.com/fluency/96/microwave.png'
        },
        {
          key: 'Chimney',
          label: 'Chimney',
          instant: false,
          icon: assetImage("Chimney.png")
        },
        {
          key: 'Stove',
          label: 'Stove / Hob',
          instant: false,
          icon: assetImage("StoveHob.png")
        }
      ]
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
    { id: 2, title: 'Deep Sofa & Upholstery Cleaning', subtitle: 'Just Rs 569 - Deep clean & sanitize', discount: 'Save Rs 400', cta: 'Get Quote', img: 'https://i.postimg.cc/XqxCdmz4/Chat-GPT-Image-Dec-24-2025-03-28-53-PM.png' },
    { id: 3, title: 'Salon Services for Women', subtitle: 'Hair, makeup, spa - all under one app', discount: 'Starting Rs 199', cta: 'Get Quote', img: 'https://i.postimg.cc/CKRk9bhM/s1.webp' },
    { id: 4, title: 'AC Maintenance & Service', subtitle: 'Avoid summer breakdowns - preventive care', discount: 'Full inspection Rs 599', cta: 'Get Quote', img: 'https://i.postimg.cc/BnkfJCCH/ac-maintenance.jpg' },
    { id: 5, title: 'Complete Kitchen Deep Clean', subtitle: 'Hygienic, sparkling, and organized', discount: 'Starting Rs 899', cta: 'Get Quote', img: 'https://i.postimg.cc/C1tvWFTQ/professional-kitchen-cleaning-hometriangle-blog.jpg' },
    // { id: 6, title: 'Home Painting Services', subtitle: 'Interior & exterior - professional quality', discount: 'Free quote', cta: 'Get Quote', img: 'https://i.postimg.cc/PrvMBzPf/wall-painting-service.jpg' }
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

  function goToCategory(category, subcategory = null, extraParams = {}) {
    const baseUrl = buildServicesUrl(category, subcategory);
    const [path, query = ""] = baseUrl.split("?");
    const params = new URLSearchParams(query);

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });

    const nextQuery = params.toString();
    navigate(nextQuery ? `${path}?${nextQuery}` : path);
  }

  function goToBeautyType(subcategory, serviceType) {
    goToCategory("Beauty", subcategory, { serviceType });
  }

  function openCategoryModal(catKey) {
    setModalCategory(catKey);
    setSelectedSubcategory(null);
    setModalOpen(true);
  }

  function selectSubcategory(subcat) {
    setModalOpen(false);
    goToCategory(modalCategory, subcat);
  }

  function backToCategory() {
    setSelectedSubcategory(null);
  }

  function viewAllCategory(catKey) {
    setModalOpen(false);
    setSelectedSubcategory(null);
    goToCategory(catKey);
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

  // Manual-only carousel refs (slides move only when user clicks arrows)
  const getQuoteRef = useRef(null);
  const offersRef = useRef(null);

  const homeDiscoveryTiles = [
    {
      label: "Women's Salon & Spa",
      key: "Beauty",
      icon: "https://cdn-icons-png.flaticon.com/512/3621/3621997.png"
    },
    {
      label: "Men's Salon & Massage",
      key: "Men",
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    },
    {
      label: "Cleaning & Pest Control",
      key: "Cleaning",
      icon: "https://cdn-icons-png.flaticon.com/512/4097/4097458.png"
    },
    {
      label: "Electrician, Plumber & Carpenter",
      key: "Electrician",
      icon: "https://cdn-icons-png.flaticon.com/512/929/929430.png"
    },
    {
      label: "Painting & Waterproofing",
      key: "Painting",
      icon: "https://cdn-icons-png.flaticon.com/512/3191/3191288.png"
    },
    {
      label: "AC & Appliance Repair",
      key: "Appliances",
      icon: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
    }
  ];

  const curatedServiceSections = [
    {
      key: 'salon-men',
      title: 'Salon for men',
      
      ref: salonMenRef,
      onServiceClick: () => goToCategory('Men'),
      services: [
        { id: 'm1', title: 'Haircut', rating: 4.8, price: 299, image: assetImage("Haircut.png") },
        { id: 'm2', title: 'Beard trim & styling', rating: 4.87, price: 249, image: assetImage("Beard Trim & Styling.png") },
        { id: 'm3', title: 'Haircut for kids', rating: 4.85, price: 299, image: assetImage("Haircut for kids.png") },
        { id: 'm4', title: 'Clean shave', rating: 4.86, price: 249, image: assetImage("Shave.png") },
        { id: 'm5', title: 'Head, neck & shoulder massage', rating: 4.83, price: 349, image: assetImage("Head Massage.png") }
      ]
    },
    {
      key: 'massage-men',
      title: 'Massage for Men',
      subtitle: 'Therapeutic massage by trained experts',
      ref: massageMenRef,
      onServiceClick: () => goToCategory('Men'),
      services: [
        { id: 'mm1', title: 'Foot massage', rating: 4.87, price: 549, image: assetImage("Foot massage.png") },
        { id: 'mm2', title: 'Head, neck & shoulder massage', rating: 4.87, price: 649, image: assetImage("Head, neck & shoulder massage.png") },
        { id: 'mm3', title: 'Leg pain relief massage for men', rating: 4.87, price: 849, image: assetImage("Leg pain relief massage for men.png") },
        { id: 'mm4', title: 'Warm deep tissue pain relief massage', rating: 4.83, price: 1449, image: assetImage("Warm deep tissue pain relief massage.png") },
        { id: 'mm5', title: 'Quick Comfort Therapy', rating: 4.83, price: 999, image: assetImage("Quick Comfort Therapy.png") }
      ]
    },
    {
      key: 'home-repair-installation',
      title: 'Home repair & installation',
      subtitle: 'Trusted professionals for quick fixes',
      ref: homeRepairRef,
      onServiceClick: () => goToCategory('Maintenance'),
      services: [
        { id: 'r1', title: 'Decor installation', rating: 4.83, price: 79, image: assetImage("Decor installation.png") },
        { id: 'r2', title: 'Plumber consultation', rating: 4.73, price: 49, image: assetImage("Plumber consultation.png") },
        { id: 'r3', title: 'Electrician consultation', rating: 4.74, price: 49, image: assetImage("Electrician consultation.png") },
        { id: 'r4', title: 'Switchboard repair & replacement', rating: 4.82, price: 99, image: assetImage("Switchboard repair & replacement.png") },
        { id: 'r5', title: 'Cupboard repair', rating: 4.77, price: 89, image: assetImage("Cupboard repair.png") }
      ]
    },
    {
      key: 'appliance-service-repair',
      title: 'Appliance Service & Repair',
      subtitle: 'Expert appliance diagnosis and repair',
      ref: applianceRef,
      onServiceClick: () => goToCategory('Appliances'),
      services: [
        { id: 'a1', title: 'Geyser check-up', rating: 4.73, price: 249, image: assetImage("Geyser check-up.png") },
        { id: 'a2', title: 'Automatic top load machine check-up', rating: 4.77, price: 199, image: assetImage("Automatic top load machine check-up.png") },
        { id: 'a3', title: 'TV check-up', rating: 4.77, price: 249, image: assetImage("TV check-up.png") },
        { id: 'a4', title: 'Geyser service', rating: 4.76, price: 599, image: assetImage("Geyser service.png") },
        { id: 'a5', title: 'Geyser installation', rating: 4.78, price: 499, image: assetImage("Geyser installation.png") }
      ]
    },
    {
      key: 'cleaning-essentials',
      title: 'Cleaning Essentials',
      subtitle: 'Monthly cleaning essential services',
      ref: cleaningEssentialsRef,
      onServiceClick: () => goToCategory('Cleaning'),
      services: [
        { id: 'c1', title: 'Intense bathroom cleaning', rating: 4.79, price: 399, original: 499, image: assetImage("Intense bathroom cleaning.png") },
        { id: 'c2', title: 'Intense cleaning (2 bathrooms)', rating: 4.79, price: 798, original: 998, image: assetImage("Intense cleaning (2 bathrooms).png") },
        { id: 'c3', title: 'Chimney cleaning', rating: 4.83, price: 399, image: assetImage("Chimney cleaning.png") },
        { id: 'c4', title: 'Fridge cleaning', rating: 4.83, price: 399, image: assetImage("Fridge cleaning.png.png") },
        { id: 'c5', title: 'Cockroach control (with utensil removal)', rating: 4.79, price: 1098, image: assetImage("Cockroach control (with utensil removal).png") }
      ]
    },
    {
      key: 'spa-women',
      title: 'Spa for Women',
      subtitle: 'Relaxing spa therapies at home',
      ref: spaWomenRef,
      onServiceClick: (service) => goToBeautyType(service.subcategory, 'spa-for-women'),
      services: [
        { id: 'sp1', title: 'Warm Swedish stress relief massage', rating: 4.83, price: 1349, image: assetImage("Warm Swedish stress relief massage.png"), subcategory: 'Stress relief' },
        { id: 'sp2', title: 'Warm deep tissue pain relief massage', rating: 4.83, price: 1499, image: assetImage("Warm deep tissue pain relief massage.png"), subcategory: 'Pain relief' },
        { id: 'sp3', title: '4 sessions (Mon-Sat only): Swedish massage', rating: 4.82, price: 1299, image: assetImage("4 sessions (Mon-Sat only) Swedish massage.png"), subcategory: 'Super saver packs' },
        { id: 'sp4', title: '4 sessions (Mon-Sat only): Deep tissue massage', rating: 4.82, price: 1449, image: assetImage("4 sessions (Mon-Sat only) Deep tissue massage create image .png"), subcategory: 'Super saver packs' },
        { id: 'sp5', title: 'Leg pain relief massage for women', rating: 4.85, price: 849, image: assetImage("Leg pain relief massage for women.png.png"), subcategory: 'Pain relief' }
      ]
    },
    {
      key: 'salon-women',
      title: 'Salon for Women',
      subtitle: 'Pamper yourself at home',
      ref: salonWomenRef,
      onServiceClick: (service) => goToBeautyType(service.subcategory, 'salon-for-women'),
      services: [
        { id: 'sw1', title: 'Roll-on waxing (Full arms, legs & underarms)', rating: 4.88, price: 899, image: assetImage("Roll-on waxing (Full arms, legs & underarms).png"), subcategory: 'Waxing' },
        { id: 'sw2', title: 'Spatula waxing (Full arms, legs & underarms)', rating: 4.86, price: 699, image: assetImage("Spatula waxing (Full arms, legs & underarms).png"), subcategory: 'Waxing' },
        { id: 'sw3', title: 'Crystal rose pedicure', rating: 4.83, price: 759, image: assetImage("Crystal rose pedicure.png"), subcategory: 'Pedicure & manicure' },
        { id: 'sw4', title: 'Mani-pedi delight', rating: 4.82, price: 1359, original: 1458, image: assetImage("Mani-pedi delight.png"), subcategory: 'Pedicure & manicure' }
      ]
    }
  ];

  const renderUnifiedServiceSection = (section) => {
    if (!section) return null;

    return (
      <section className="container slide-up" style={{ marginTop: '12px' }}>
        <h2 className="section-title">{section.title}</h2>
        {section.subtitle && (
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{section.subtitle}</p>
        )}

        <div className="services-carousel-wrap">
          <div
            ref={section.ref}
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '8px'
            }}
          >
            {section.services.map((service) => (
              <div
                key={service.id}
                style={{
                  flex: '0 0 240px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  background: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
                onClick={() => {
                  section.onServiceClick(service);
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '140px',
                    overflow: 'hidden',
                    background: '#f1f5f9',
                    position: 'relative'
                  }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/240x140?text=${section.title}`;
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: '10px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 5px 0',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#0f172a',
                      lineHeight: '1.4'
                    }}
                  >
                    {service.title}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '5px',
                      fontSize: '10px'
                    }}
                  >
                    <span style={{ color: '#0f172a', fontWeight: '500' }}>&#9733; {service.rating}</span>
                    <span style={{ color: '#6b7280' }}>{"\u2022"} Instant</span>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '5px',
                      borderTop: '1px solid #e5e7eb'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '13px',
                          color: '#0f172a'
                        }}
                      >
                        &#8377;{service.price}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          textDecoration: 'line-through'
                        }}
                      >
                        &#8377;{service.original ?? Math.round(service.price * 1.3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="services-carousel-arrow"
            onClick={() => scrollCarousel(section.ref, 'right')}
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#0f172a',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            ?
          </button>
        </div>
      </section>
    );
  };
  return (
    <div>
      <CMSBanners />

{/* HERO SECTION */}
<section className="container hero hero-home fade-in">
  <div className="hero-left-pane">

    {/* <span className="hero-badge">? 50,000+ Happy Customers in {location}</span> */}

    <h4 className="hero-title">Trusted Home Services at Your Doorstep</h4>

    <div className="hero-metrics">
      <span>50k+ bookings completed</span>
      <span>4.8 average rating</span>
      <span>30 min avg. response</span>
    </div>

    {/* <p className="hero-subtitle">
      Book verified professionals for cleaning, repairs, beauty, and maintenance in minutes. Transparent pricing, quality guaranteed, and payment after service completion.
    </p> */}

    {/* <div className="search-card">

      <div className="search-location" onClick={getLocation} style={{ cursor: "pointer" }} aria-hidden="false">
        {detecting ? "Detecting location..." : `${location} \u00B7 Change`}
      </div>

      <div className="search-input">
        <input aria-label="Search services" placeholder="Search services (cleaning, AC repair, salon...)" />
      </div>

      <button type="button" className="btn-primary" onClick={() => navigate('/services')} aria-label="Find professionals">Find professionals</button>
    </div> */}

    

    <div className="service-discovery-card">
      <h5 className="service-discovery-title">What are you looking for?</h5>
      <div className="service-discovery-grid">
        {homeDiscoveryTiles.map((tile) => (
          <button
            key={tile.label}
            className="service-discovery-tile"
            onClick={() => openCategoryModal(tile.key)}
            type="button"
            aria-label={tile.label}
          >
            <span className="service-discovery-icon-wrap">
              <img src={tile.icon} alt="" className="service-discovery-icon" loading="lazy" />
            </span>
            <span className="service-discovery-label">{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
{/* <div className="search-helpers">
      <div className="search-pill">Background-verified experts</div>
      <div className="search-pill">Pay securely after service</div>
    </div> */}
  </div>

  <div className="hero-right-pane">
    <div className="hero-mosaic">
      <div className="mosaic-item large">
        <img src={assetImage("painterheader.jpg")} alt="Salon" />
      </div>
      <div className="mosaic-item">
        <img src={assetImage("plumberheader.jpg")} alt="Massage" />
      </div>
      {/* <div className="mosaic-item">
        <img src="https://i.postimg.cc/C1rGHLS1/834431670584630.jpg" alt="Repair" />
      </div> */}
      <div className="mosaic-item wide">
        <img src="https://i.postimg.cc/1XzWsj5g/service.webp" alt="AC service" />
      </div>
       <div className="mosaic-item wide">
        <img src={assetImage("male-electrician.jpg")} alt="AC service" />
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
              &larr;
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
        <button className="btn-outline" onClick={() => setModalOpen(false)} aria-label="Close modal">&times;</button>
      </div>

      {/* Service Cards Grid View - Category Wise */}
      <div className="modal-body">
        {modalCategory === 'Beauty' ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
    {BEAUTY_SUBCATEGORIES.map((item) => (
      <div
        key={item.label}
        onClick={() => {
          setModalOpen(false);
          goToCategory("Beauty", item.subcategory, { serviceType: item.key });
        }}
        style={{
          textAlign: 'center',
          cursor: 'pointer',
          transition: '0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div style={{
          width: '65px',
          height: '65px',
          background: '#fce7f3',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={item.icon}
            alt={item.label}
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
        </div>

        <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
          {item.label}
        </p>
      </div>
    ))}
  </div>
) 
 
        : modalCategory === 'Men' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <div
              onClick={() => {
                setModalOpen(false);
                goToCategory("Men", "Pedicure", { serviceType: "salon-for-men" });
              }}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '65px',
                height: '65px',
                background: '#e3f2fd',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}>
                <img src={assetImage("Salon for Men.png")} alt="Salon for Men" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                Salon for Men
              </p>
            </div>

            <div
              onClick={() => {
                setModalOpen(false);
                goToCategory("Men", "Massage", { serviceType: "massage-for-men" });
              }}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '65px',
                height: '65px',
                background: '#e3f2fd',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}>
                <img src={assetImage("Massage for Men.png")} alt="Massage for Men" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                Massage for Men
              </p>
            </div>
          </div>
        ) : modalCategory === 'Cleaning' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Cleaning Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                Cleaning
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Cleaning", "Home Cleaning", { serviceType: "bathroom-cleaning" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Bathroom Cleaning.png")} alt="Bathroom Cleaning" style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Bathroom Cleaning
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Cleaning", "Home Cleaning", { serviceType: "kitchen-cleaning" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Kitchen Cleaning.png")} alt="Kitchen Cleaning" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Kitchen Cleaning
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Cleaning", "Home Cleaning", { serviceType: "living-bedroom-cleaning" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img src={assetImage("Living & Bedroom Cleaning.png")} alt="Living & Bedroom Cleaning" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff1493',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      NEW
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Living & Bedroom Cleaning
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Cleaning", "Home Cleaning", { serviceType: "full-home-movein-cleaning" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/cardboard-box.png" alt="Full Home / Move-in Cleaning" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Full Home / Move-in Cleaning
                  </p>
                </div>
              </div>
            </div>

            {/* Pest Control Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                Pest Control
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Pest", "General Pest Control", { serviceType: "cockroach-control" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffebee',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/cockroach.png" alt="Cockroach Control" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Cockroach Control
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Pest", "Specialized Services", { serviceType: "termite-control" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffebee',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Termite Control.png")} alt="Termite Control" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Termite Control
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Pest", "Specialized Services", { serviceType: "bed-bugs-control" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffebee',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Bed Bugs Control.png")} alt="Bed Bugs Control" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Bed Bugs Control
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Pest", "General Pest Control", { serviceType: "ant-control" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffebee',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/ant.png" alt="Ant Control" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff1493',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      NEW
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Ant Control
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : modalCategory === 'Electrician' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Repairs Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                Repairs
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Electrician", "Switch & Socket", { serviceType: "electrician-repair" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#e3f2fd',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Electrician.png")} alt="Electrician" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Electrician
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Plumber", "Plumbing Repairs", { serviceType: "plumber-repair" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffebee',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Plumber.png")} alt="Plumber" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Plumber
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Carpentry", "Furniture", { serviceType: "carpenter-general" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/hammer.png" alt="Carpenter" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Carpenter
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Electrician", "Light", { serviceType: "festival-lights" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#f3e5f5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/light-on.png" alt="Festival Lights" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Festival Lights
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>
              </div>
            </div>

            {/* Installations & Other Services Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                Installations & other services
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Electrician", "Fan", { serviceType: "fan-installation" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#e3f2fd',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Fan Installation.png")} alt="Fan Installation" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Fan Installation
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Carpentry", "Furniture", { serviceType: "furniture-assembly" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/sofa.png" alt="Furniture Assembly" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Furniture Assembly
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Appliances", "Repair & Gas Refill", { serviceType: "geyser", appliance: "Geyser" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#e0f2f1',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("Geyser.png")} alt="Geyser" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Geyser
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Carpentry", "Furniture", { serviceType: "ikea-furniture-assembly" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={assetImage("IKEA Furniture Assembly.png")} alt="IKEA Furniture Assembly" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    IKEA Furniture Assembly
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>? Instant</span>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Painting", "Protective Services", { serviceType: "tile-grouting" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#f3e5f5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img src={assetImage("Tile Grouting.png")} alt="Tile Grouting" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff1493',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      NEW
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Tile Grouting
                  </p>
                </div>

                <div
                  onClick={() => {
                    setModalOpen(false);
                    goToCategory("Carpentry", "Furniture", { serviceType: "wood-polish" });
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: '#fff3e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img src="https://img.icons8.com/fluency/96/wood.png" alt="Wood Polish" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff1493',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      NEW
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                    Wood Polish
                  </p>
                </div>
              </div>
            </div>
          </div>



        ) : modalCategory === 'Painting' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <div
              onClick={() => {
                setModalOpen(false);
                goToCategory("Painting", "Wall Services", { serviceType: "full-home-painting" });
              }}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '90px',
                height: '90px',
                background: '#f3e5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img src="https://img.icons8.com/fluency/96/paint-palette.png" alt="Full home painting" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: '#ff1493',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  NEW
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                Full home painting
              </p>
            </div>

            <div
              onClick={() => {
                setModalOpen(false);
                goToCategory("Painting", "Wall Services", { serviceType: "walls-rooms-painting" });
              }}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '90px',
                height: '90px',
                background: '#fce4ec',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={assetImage("Walls & Rooms Painting.png")} alt="Walls & Rooms Painting" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                Walls & Rooms Painting
              </p>
            </div>
          </div>
        ) : modalCategory === 'Appliances' ? (
          Object.entries(SUBCATEGORIES.Appliances).map(([groupName, items]) => (
            <div key={groupName} style={{ marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                {groupName}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {items.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setModalOpen(false);
                      goToCategory("Appliances", null, { serviceType: item.key, appliance: item.key });
                    }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: '0.25s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                  <div style={{
                      width: '70px',
                      height: '70px',
                      background: '#f5f5f5',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <img
                        src={item.icon}
                        alt={item.key}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=' + item.key; }}
                      />
                      {item.instant && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '20px',
                          height: '20px',
                          background: '#10b981',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ?
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0' }}>
                      {item.label || item.key}
                    </p>
                    {item.instant && (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        ? Instant
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          Object.keys(SUBCATEGORIES[modalCategory] || {}).map((subcategoryName) => (
            <div key={subcategoryName} style={{ marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                {subcategoryName}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(98px, 1fr))', gap: '12px' }}>
                {SUBCATEGORIES[modalCategory][subcategoryName]?.map((serviceId) => {
                  const service = SERVICES_BY_CATEGORY[modalCategory]?.find(s => s.id === serviceId);
                  return service ? (
                    <div
                      key={service.id}
                      onClick={() => {
                        setModalOpen(false);
                        goToCategory(modalCategory);
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
          ))
        )}
      </div>
    </div>
  </div>
)}

{/* PROMOTIONAL SLIDER SECTION */}
<section className="container slide-up" style={{ marginTop: "16px" }}>
  <div className="services-carousel-wrap">
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div 
        ref={promoSliderRef}
        className="promo-slider"
        style={{ 
          display: 'flex',
          gap: '12px',
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
            img: assetImage("Ac_service.jpg"),
            category: 'Appliances'
          },
          { 
            id: 2, 
            img: assetImage("plumber.jpg"),
            category: 'Plumber'
          },
          { 
            id: 3, 
            img: assetImage("carpenter.jpg"),
            category: 'Carpentry'
          },
          { 
            id: 4, 
            img: assetImage("painter.jpg"),
            category: 'Painting'
          },
          { 
            id: 5, 
            img: assetImage("pestcontrol.jpg"),
            category: 'Pest Control'
          }
        ].map((promo) => (
          <div 
            key={promo.id}
            style={{
              flex: '0 0 clamp(280px, 85vw, 360px)',
              minWidth: 'clamp(280px, 85vw, 360px)',
              scrollSnapAlign: 'start',
              height: 'clamp(180px, 40vw, 220px)',
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
            onClick={() => goToCategory(promo.category)}
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
                e.target.src = 'https://via.placeholder.com/360x220?text=Service+Image';
              }}
            />
          </div>
        ))}
      </div>
    </div>
    <button
      className="services-carousel-arrow"
      onClick={() => scrollCarousel(promoSliderRef, 'right')}
      style={{
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px',
        color: '#0f172a',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      &rarr;
    </button>
  </div>
</section>

{/* FEATURED SERVICES CARDS - HORIZONTAL CAROUSEL */}
<section className="container slide-up" style={{ marginTop: "12px", marginBottom: "20px" }}>
  <h2 className="section-title">Popular Services</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Highly-rated services from verified professionals</p>

  <div className="services-carousel-wrap">
    <div 
      ref={popularServicesRef}
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: '8px'
      }}
    >
      {getFeaturedServices().map((service, index) => (
        <div 
          key={`${service.id}-${index}`}
          style={{
            flex: '0 0 240px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            background: '#fff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          }}
          onClick={() => {
            goToCategory(service.category);
          }}
        >
          {/* Service Image */}
          <div style={{
            width: '100%',
            height: '140px',
            overflow: 'hidden',
            background: '#f1f5f9',
            position: 'relative'
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
                e.target.src = 'https://via.placeholder.com/240x140?text=' + service.category;
              }}
            />
          </div>
          
          {/* Service Body */}
          <div style={{
            padding: '10px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Title */}
            <h3 style={{
              margin: '0 0 5px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0f172a',
              lineHeight: '1.4'
            }}>
              {service.title}
            </h3>
            
            {/* Rating & Instant Badge */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '5px',
              fontSize: '10px'
            }}>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>
                &#9733; {service.rating}
              </span>
              <span style={{ color: '#6b7280' }}>
                {"\u2022"} Instant
              </span>
            </div>
            
            {/* Price */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '5px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <strong style={{
                  fontSize: '13px',
                  color: '#0f172a'
                }}>
                  &#8377;{service.price}
                </strong>
                <span style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  textDecoration: 'line-through'
                }}>
                  &#8377;{Math.round(service.price * 1.3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <button
      className="services-carousel-arrow"
      onClick={() => scrollCarousel(popularServicesRef, 'right')}
      style={{
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px',
        color: '#0f172a',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      &rarr;
    </button>
  </div>
</section>

{/* GET QUOTE - PROFESSIONAL SLIDER */}
<section className="container slide-up" style={{ marginTop: "12px" }}>
  <h2 className="section-title">Get Quote</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Grab limited-time deals and curated packages</p>

  <div className="services-carousel-wrap">
    <div
      ref={getQuoteRef}
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
    {OFFERS.map((offer) => (
      <div 
        key={offer.id}
        style={{
          flex: '0 0 clamp(200px, 85vw, 250px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
        <img 
          src={offer.img} 
          alt={offer.title}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        />
        <p style={{
          margin: '0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#0f172a',
          textAlign: 'center',
          lineHeight: '1.3'
        }}>
          {offer.title}
        </p>
      </div>
    ))}
    </div>
    <button
      className="services-carousel-arrow"
      onClick={() => scrollCarousel(getQuoteRef, 'right')}
      style={{
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px',
        color: '#0f172a',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      &rarr;
    </button>
  </div>
</section>

{/* OFFERS & DISCOUNTS - PROFESSIONAL SLIDER */}
<section className="container slide-up" style={{ marginTop: "12px" }}>
  <h2 className="section-title">Offers & discounts</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Grab limited-time deals and curated packages</p>

  <div className="services-carousel-wrap">
    <div
      ref={offersRef}
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
    {OFFERS.map((offer) => (
      <div 
        key={offer.id}
        style={{
          flex: '0 0 clamp(200px, 85vw, 250px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
        <img 
          src={offer.img} 
          alt={offer.title}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        />
        <p style={{
          margin: '0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#0f172a',
          textAlign: 'center',
          lineHeight: '1.3'
        }}>
          {offer.title}
        </p>
      </div>
    ))}
    </div>
    <button
      className="services-carousel-arrow"
      onClick={() => scrollCarousel(offersRef, 'right')}
      style={{
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px',
        color: '#0f172a',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      &rarr;
    </button>
  </div>
</section>

{renderUnifiedServiceSection(curatedServiceSections[0])}

{renderUnifiedServiceSection(curatedServiceSections[1])}

{/* ADS BANNER - After Massage for Men */}
<section className="container slide-up" style={{ marginTop: "20px", marginBottom: "20px" }}>
  <div style={{
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    background: '#e5e7eb'
  }}>
    <img
      src={assetImage("banner1.png")}
      alt="Electrician service banner"
      loading="lazy"
      decoding="async"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        imageRendering: 'auto'
      }}
    />
  </div>
</section>

{renderUnifiedServiceSection(curatedServiceSections[2])}

{renderUnifiedServiceSection(curatedServiceSections[3])}

{renderUnifiedServiceSection(curatedServiceSections[4])}

{/* ADS BANNER - After Massage for Men */}
<section className="container slide-up" style={{ marginTop: "20px", marginBottom: "20px" }}>
  <div style={{
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    background: '#e5e7eb'
  }}>
    <img
      src={assetImage("banner2.png")}
      alt="Home service promotion banner"
      loading="lazy"
      decoding="async"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        imageRendering: 'auto'
      }}
    />
  </div>
</section>

{renderUnifiedServiceSection(curatedServiceSections[5])}

{renderUnifiedServiceSection(curatedServiceSections[6])}

{/* ADS BANNER - After Massage for Men */}
<section className="container slide-up" style={{ marginTop: "20px", marginBottom: "20px" }}>
  <div style={{
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    background: '#e5e7eb'
  }}>
    <img
      src={assetImage("banner3.png")}
      alt="Home services discount banner"
      loading="lazy"
      decoding="async"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        imageRendering: 'auto'
      }}
    />
  </div>
</section>



{/* FAQ SECTION */}
{/* <section className="container slide-up" style={{ marginTop: "12px", marginBottom: "20px" }}>
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
            <span>+</span> {item.q}
          </summary>
          <p className="faq-answer">{item.a}</p>
        </details>
      </div>
    ))}
  </div>
</section> */}




    </div>
  );
}







