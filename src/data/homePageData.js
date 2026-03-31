// Auto-generated data for Home page. Do not edit UI here.

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;

export const DEFAULT_HOME_PAGE_SETTINGS = {
  heroTitle: "Trusted Home Services at Your Doorstep",
  discoveryTitle: "What are you looking for?",
  popularServicesTitle: "Popular Services",
  getQuoteTitle: "Get Quote",
  offersDiscountsTitle: "Offers & discounts",
  heroStats: {
    bookingsCompleted: "50k+ bookings completed",
    averageRating: "4.8 average rating",
    responseTime: "30 min avg. response"
  },
  sections: {
    banners: true,
    hero: true,
    promoSlider: true,
    popularServices: true,
    getQuote: true,
    offersDiscounts: true,
    curatedServices: true,
    promoBanner1: true,
    promoBanner2: true,
    promoBanner3: true
  },
  curatedSectionVisibility: {
    salonMen: true,
    massageMen: true,
    homeRepairInstallation: true,
    applianceServiceRepair: true,
    cleaningEssentials: true,
    spaWomen: true,
    salonWomen: true
  }
};

export const CURATED_VISIBILITY_KEY_MAP = {
  "salon-men": "salonMen",
  "massage-men": "massageMen",
  "home-repair-installation": "homeRepairInstallation",
  "appliance-service-repair": "applianceServiceRepair",
  "cleaning-essentials": "cleaningEssentials",
  "spa-women": "spaWomen",
  "salon-women": "salonWomen"
};

export const BEAUTY_SUBCATEGORIES = [
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

export const categories = [
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

export const CATEGORY_ICONS = {
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

export const SUBCATEGORY_ICONS = {
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

export const SAMPLE_SERVICES = [
  { id: "1", title: "Full Home Deep Cleaning", category: "Cleaning", price: 1999, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
  { id: "2", title: "AC Service & Repair", category: "Appliances", price: 699, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b" },
  { id: "3", title: "Electrician Visit", category: "Electrician", price: 249, image: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4" },
  { id: "4", title: "Plumbing Service", category: "Plumber", price: 299, image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3" }
];

export const getFeaturedServices = () => {
  return [
    { id: 'cl1', title: 'Full Home Deep Cleaning', price: 299, image: assetImage("Full Home Deep Cleaning.png"), rating: 4.8, reviews: 2340, desc: 'Professional deep cleaning with eco-friendly products' },
    { id: 'el2', title: 'Fan Installation / Repair ', category: 'Electrician', price: 299, image: assetImage("Fan Installation  Repair.png"), rating: 4.7, reviews: 1856, desc: 'Expert fan installation and repair services' },
    { id: 'pl1', title: 'Tap & Mixer Repair', category: 'Plumber', price: 199, image: assetImage("Tap & Mixer Repair.png"), rating: 4.9, reviews: 3120, desc: 'Professional tap and mixer repair solutions' },
    { id: 'el5', title: 'Inverter & UPS Installation', category: 'Electrician', price: 799, image: assetImage("Inverter & UPS Installation.png"), rating: 4.6, reviews: 1540, desc: 'Expert inverter and UPS installation service' },
    { id: 'ap1', title: 'AC Service', category: 'Appliances', price: 699, image: assetImage("AC Service.png"), rating: 4.8, reviews: 4230, desc: 'Professional AC service and maintenance' },
    { id: 'el3', title: 'Light / Chandelier Installation', category: 'Electrician', price: 399, image: assetImage("Light  Chandelier Installation.png"), rating: 4.7, reviews: 1204, desc: 'Professional lighting installation and setup' }
  ];
};

export const SERVICES_BY_CATEGORY = {
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

export const SUBCATEGORIES = {
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

export const OFFERS = [
    { id: 1, title: 'Winter Home Care Special', subtitle: 'Get 20% off on all services', discount: '20%', cta: 'Get Quote', img: 'https://i.postimg.cc/xdGnf4T5/1.jpg' },
    { id: 2, title: 'Deep Sofa & Upholstery Cleaning', subtitle: 'Just Rs 569 - Deep clean & sanitize', discount: 'Save Rs 400', cta: 'Get Quote', img: 'https://i.postimg.cc/XqxCdmz4/Chat-GPT-Image-Dec-24-2025-03-28-53-PM.png' },
    { id: 3, title: 'Salon Services for Women', subtitle: 'Hair, makeup, spa - all under one app', discount: 'Starting Rs 199', cta: 'Get Quote', img: 'https://i.postimg.cc/CKRk9bhM/s1.webp' },
    { id: 4, title: 'AC Maintenance & Service', subtitle: 'Avoid summer breakdowns - preventive care', discount: 'Full inspection Rs 599', cta: 'Get Quote', img: 'https://i.postimg.cc/BnkfJCCH/ac-maintenance.jpg' },
    { id: 5, title: 'Complete Kitchen Deep Clean', subtitle: 'Hygienic, sparkling, and organized', discount: 'Starting Rs 899', cta: 'Get Quote', img: 'https://i.postimg.cc/C1tvWFTQ/professional-kitchen-cleaning-hometriangle-blog.jpg' },
    // { id: 6, title: 'Home Painting Services', subtitle: 'Interior & exterior - professional quality', discount: 'Free quote', cta: 'Get Quote', img: 'https://i.postimg.cc/PrvMBzPf/wall-painting-service.jpg' }
  ];

export const homeDiscoveryTiles = [
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

export const CURATED_SERVICE_SECTION_DATA = [
    {
      key: 'salon-men',
      title: 'Salon for men',
      category: "Men",
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
      category: "Men",
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
      // subtitle: 'Trusted professionals for quick fixes',
      category: "Maintenance",
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
      // subtitle: 'Expert appliance diagnosis and repair',
      category: "Appliances",
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
      // subtitle: 'Monthly cleaning essential services',
      category: "Cleaning",
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
      // subtitle: 'Relaxing spa therapies at home',
      beautyType: "spa-for-women",
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
      // subtitle: 'Pamper yourself at home',
      beautyType: "salon-for-women",
      services: [
        { id: 'sw1', title: 'Roll-on waxing (Full arms, legs & underarms)', rating: 4.88, price: 899, image: assetImage("Roll-on waxing (Full arms, legs & underarms).png"), subcategory: 'Waxing' },
        { id: 'sw2', title: 'Spatula waxing (Full arms, legs & underarms)', rating: 4.86, price: 699, image: assetImage("Spatula waxing (Full arms, legs & underarms).png"), subcategory: 'Waxing' },
        { id: 'sw3', title: 'Crystal rose pedicure', rating: 4.83, price: 759, image: assetImage("Crystal rose pedicure.png"), subcategory: 'Pedicure & manicure' },
        { id: 'sw4', title: 'Mani-pedi delight', rating: 4.82, price: 1359, original: 1458, image: assetImage("Mani-pedi delight.png"), subcategory: 'Pedicure & manicure' }
      ]
    }
  ];

export const MODAL_TITLE_MAP = {
    Appliances: "AC & Appliance Repair",
    Men: "Men's Grooming Services"
  };
