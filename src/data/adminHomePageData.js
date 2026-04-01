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
  sectionOrder: [
    "banners",
    "hero",
    "promoSlider",
    "popularServices",
    "getQuote",
    "offersDiscounts",
    "curatedServices",
    "promoBanner1",
    "promoBanner2",
    "promoBanner3"
  ],
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

export const SECTION_LABELS = [
  { key: "banners", label: "CMS Banners" },
  { key: "hero", label: "Hero Section" },
  { key: "promoSlider", label: "Promotional Slider" },
  { key: "popularServices", label: "Popular Services" },
  { key: "getQuote", label: "Get Quote Slider" },
  { key: "offersDiscounts", label: "Offers & Discounts" },
  { key: "curatedServices", label: "Curated Services Block" },
  { key: "promoBanner1", label: "Banner 1" },
  { key: "promoBanner2", label: "Banner 2" },
  { key: "promoBanner3", label: "Banner 3" }
];

export const CURATED_LABELS = [
  { key: "salonMen", label: "Salon for Men" },
  { key: "massageMen", label: "Massage for Men" },
  { key: "homeRepairInstallation", label: "Home Repair & Installation" },
  { key: "applianceServiceRepair", label: "Appliance Service & Repair" },
  { key: "cleaningEssentials", label: "Cleaning Essentials" },
  { key: "spaWomen", label: "Spa for Women" },
  { key: "salonWomen", label: "Salon for Women" }
];
