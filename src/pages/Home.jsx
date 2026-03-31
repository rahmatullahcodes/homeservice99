import { DEFAULT_HOME_PAGE_SETTINGS, CURATED_VISIBILITY_KEY_MAP, BEAUTY_SUBCATEGORIES, getFeaturedServices, SERVICES_BY_CATEGORY, SUBCATEGORIES, OFFERS, homeDiscoveryTiles, CURATED_SERVICE_SECTION_DATA, MODAL_TITLE_MAP } from "../data/homePageData";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { buildServicesUrl } from "../utils/serviceRouting";
import { ensureServiceableLocation } from "../utils/serviceAvailability";
import CMSBanners from "../components/CMSBanners";
import { API_ENDPOINTS } from "../config/api";
import { buildServicesDataFromList, flattenServicesByCategory, pickFeaturedServices, pickServicesByKeywords } from "../utils/servicesData";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;

const HOME_PAGE_CACHE_KEY = "hs99_home_page_settings";

const CURATED_SECTION_TEMPLATES = [
  {
    key: "salon-men",
    title: "Salon for men",
    category: "Men",
    keywords: ["hair", "beard", "shave", "groom", "salon"],
    limit: 5,
  },
  {
    key: "massage-men",
    title: "Massage for Men",
    category: "Men",
    keywords: ["massage"],
    limit: 5,
  },
  {
    key: "home-repair-installation",
    title: "Home repair & installation",
    category: "Maintenance",
    limit: 5,
  },
  {
    key: "appliance-service-repair",
    title: "Appliance Service & Repair",
    category: "Appliances",
    limit: 5,
  },
  {
    key: "cleaning-essentials",
    title: "Cleaning Essentials",
    category: "Cleaning",
    keywords: ["clean", "bathroom", "kitchen", "sofa", "carpet"],
    limit: 5,
  },
  {
    key: "spa-women",
    title: "Spa for Women",
    category: "Beauty",
    beautyType: "spa-for-women",
    keywords: ["spa", "massage", "relief"],
    limit: 5,
  },
  {
    key: "salon-women",
    title: "Salon for Women",
    category: "Beauty",
    beautyType: "salon-for-women",
    keywords: ["salon", "wax", "facial", "pedicure", "manicure", "cleanup"],
    limit: 5,
  },
];

function normalizeHomePageSettings(value = {}) {
  const incoming = value && typeof value === "object" ? value : {};

  return {
    ...DEFAULT_HOME_PAGE_SETTINGS,
    ...incoming,
    heroStats: {
      ...DEFAULT_HOME_PAGE_SETTINGS.heroStats,
      ...(incoming.heroStats || {})
    },
    sections: {
      ...DEFAULT_HOME_PAGE_SETTINGS.sections,
      ...(incoming.sections || {})
    },
    curatedSectionVisibility: {
      ...DEFAULT_HOME_PAGE_SETTINGS.curatedSectionVisibility,
      ...(incoming.curatedSectionVisibility || {})
    }
  };
}

function readHomePageCache() {
  try {
    const raw = localStorage.getItem(HOME_PAGE_CACHE_KEY);
    if (!raw) return null;
    return normalizeHomePageSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeHomePageCache(value) {
  try {
    localStorage.setItem(HOME_PAGE_CACHE_KEY, JSON.stringify(normalizeHomePageSettings(value)));
  } catch {
    // Ignore storage failures
  }
}

export default function Home() {
  const [location, setLocation] = useState("india");
  const [detecting, setDetecting] = useState(false);
  const [homePageSettings, setHomePageSettings] = useState(DEFAULT_HOME_PAGE_SETTINGS);
  const [servicesData, setServicesData] = useState(null);
  const [servicesList, setServicesList] = useState(null);
  
  // Enhanced modal state to support subcategories
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  

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

  const servicesByCategory = useMemo(() => {
    if (servicesData === null) {
      return SERVICES_BY_CATEGORY;
    }
    return flattenServicesByCategory(servicesData);
  }, [servicesData]);

  const featuredServices = useMemo(() => {
    if (servicesList === null) {
      return getFeaturedServices();
    }
    return pickFeaturedServices(servicesList, 6);
  }, [servicesList]);

  const curatedSectionData = useMemo(() => {
    if (servicesList === null || servicesData === null) {
      return CURATED_SERVICE_SECTION_DATA;
    }

    return CURATED_SECTION_TEMPLATES.map((template) => {
      const services = pickServicesByKeywords(
        servicesByCategory[template.category] || [],
        template.keywords || [],
        template.limit || 5
      ).map((service) => ({
        ...service,
        original: service.original ?? service.oldPrice ?? service.original,
      }));

      return {
        ...template,
        services,
      };
    });
  }, [servicesData, servicesList, servicesByCategory]);

  const modalSubcategoryEntries = useMemo(() => {
    if (!modalCategory || !servicesData || !servicesData[modalCategory]) {
      return null;
    }
    return Object.entries(servicesData[modalCategory].subcategories || {});
  }, [modalCategory, servicesData]);
  const useStaticModalFallback = servicesData === null;

  // Helper function to scroll carousel
  const scrollCarousel = (ref, direction = 'right') => {
    if (ref?.current) {
      const scrollAmount = 280; // Scroll by one item width
      ref.current.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
    }
  };

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function getLocation() {
    // keep existing behaviour (toasts already in place) and ensure detecting state stays consistent
    if (!navigator.geolocation) {
      addToast("Location not supported by browser", 'warning');
      return;
    }

    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      addToast("Location works only on HTTPS (or localhost)", 'warning');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
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
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
      }
    );
  }

  function goToCategory(category, subcategory = null, extraParams = {}) {
    const baseUrl = buildServicesUrl(category, subcategory);
    const [path, query = ""] = baseUrl.split("?");
    const params = new URLSearchParams(query);
    const shouldOpenCompleteCategory = modalOpen;
    const normalizedExtraParams = shouldOpenCompleteCategory ? {} : { ...extraParams };

    Object.entries(normalizedExtraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });

    if (shouldOpenCompleteCategory) {
      params.delete("serviceType");
      params.delete("beautyType");
      params.delete("appliance");
    }

    const nextQuery = params.toString();
    navigate(nextQuery ? `${path}?${nextQuery}` : path);
  }

  function goToBeautyType(subcategory, serviceType) {
    goToCategory("Beauty", subcategory, { serviceType });
  }

  const curatedSectionRefs = {
    "salon-men": salonMenRef,
    "massage-men": massageMenRef,
    "home-repair-installation": homeRepairRef,
    "appliance-service-repair": applianceRef,
    "cleaning-essentials": cleaningEssentialsRef,
    "spa-women": spaWomenRef,
    "salon-women": salonWomenRef
  };

  const curatedServiceSections = curatedSectionData.map((section) => {
    const ref = curatedSectionRefs[section.key];
    const onServiceClick = section.beautyType
      ? (service) => goToBeautyType(service.subcategory, section.beautyType)
      : () => goToCategory(section.category);

    return {
      ...section,
      ref,
      onServiceClick
    };
  });

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

  async function loadHomePageSettings() {
    const adminToken = localStorage.getItem("adminToken") || localStorage.getItem("token");

    async function fetchHomeConfig(endpoint, withAuth = false) {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(withAuth && adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return null;
      return data;
    }

    try {
      const publicData = await fetchHomeConfig(API_ENDPOINTS.HOME_PAGE.GET_PUBLIC, false);
      if (publicData?.homePage) {
        const normalized = normalizeHomePageSettings(publicData.homePage);
        setHomePageSettings(normalized);
        writeHomePageCache(normalized);
        return;
      }

      if (adminToken) {
        const adminDataPrimary = await fetchHomeConfig(API_ENDPOINTS.HOME_PAGE.ADMIN_GET, true);
        if (adminDataPrimary?.homePage) {
          const normalized = normalizeHomePageSettings(adminDataPrimary.homePage);
          setHomePageSettings(normalized);
          writeHomePageCache(normalized);
          return;
        }

        const adminDataFallback = await fetchHomeConfig(API_ENDPOINTS.HOME_PAGE.ADMIN_GET_FALLBACK, true);
        if (adminDataFallback?.homePage) {
          const normalized = normalizeHomePageSettings(adminDataFallback.homePage);
          setHomePageSettings(normalized);
          writeHomePageCache(normalized);
          return;
        }

        const settingsData = await fetchHomeConfig(API_ENDPOINTS.SETTINGS.GET_ALL, true);
        const homePageFromSettings = settingsData?.homePage || settingsData?.data?.homePage;
        if (homePageFromSettings) {
          const normalized = normalizeHomePageSettings(homePageFromSettings);
          setHomePageSettings(normalized);
          writeHomePageCache(normalized);
          return;
        }
      }

      const cached = readHomePageCache();
      if (cached) {
        setHomePageSettings(cached);
      }
    } catch {
      const cached = readHomePageCache();
      if (cached) {
        setHomePageSettings(cached);
      }
    }
  }

  useEffect(() => {
    void loadHomePageSettings();

    function handleHomePageSettingsUpdate() {
      void loadHomePageSettings();
    }

    function handleStorageUpdate(event) {
      if (event.key === HOME_PAGE_CACHE_KEY) {
        void loadHomePageSettings();
      }
    }

    window.addEventListener("hs99-homepage-settings-updated", handleHomePageSettingsUpdate);
    window.addEventListener("focus", handleHomePageSettingsUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("hs99-homepage-settings-updated", handleHomePageSettingsUpdate);
      window.removeEventListener("focus", handleHomePageSettingsUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        const response = await fetch(API_ENDPOINTS.SERVICES.GET_ALL, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          return;
        }

        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const { data, services } = buildServicesDataFromList(rawList);

        if (isMounted) {
          setServicesData(data);
          setServicesList(services);
        }
      } catch {
        // keep fallback static data on error
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  function isSectionVisible(key) {
    return homePageSettings.sections?.[key] !== false;
  }

  function isCuratedSectionVisible(sectionKey) {
    const visibilityKey = CURATED_VISIBILITY_KEY_MAP[sectionKey];
    if (!visibilityKey) return true;
    return homePageSettings.curatedSectionVisibility?.[visibilityKey] !== false;
  }

  function handleAddToCart(service) {
    if (!ensureServiceableLocation(addToast)) {
      return;
    }
    addToCart({ id: service.id, title: service.title, price: service.price, image: service.image });
    addToast(`${service.title} added to cart`, 'success');
    // keep modal open so user can add multiple services like UrbanCompany's quick modal
  }

  function checkoutFromModal() {
    if (!ensureServiceableLocation(addToast)) {
      return;
    }
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

  

  

  const renderUnifiedServiceSection = (section) => {
    if (!section) return null;
    if (!Array.isArray(section.services) || section.services.length === 0) {
      return null;
    }

    return (
      <section className="container slide-up" style={{ marginTop: '24px' }}>
        <h2 className="section-title">{section.title}</h2>
        {section.subtitle && (
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{section.subtitle}</p>
        )}

        <div className="services-carousel-wrap">
          <div
            className="home-services-track home-services-track--catalog"
            ref={section.ref}
            style={{
              display: 'flex',
              gap: '20px',
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
                className="home-slider-card home-slider-card--service"
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

  

  const modalTitle = selectedSubcategory
    ? selectedSubcategory
    : (MODAL_TITLE_MAP[modalCategory] || `${modalCategory} Services`);

  return (
    <div className="home-page-white">
      {isSectionVisible("banners") ? <CMSBanners /> : null}

{/* HERO SECTION */}
{isSectionVisible("hero") ? (
<section className="container hero hero-home fade-in">
  <div className="hero-left-pane">

    {/* <span className="hero-badge">? 50,000+ Happy Customers in {location}</span> */}

    <h4 className="hero-title">{homePageSettings.heroTitle}</h4>

    <div className="hero-metrics">
      <span>{homePageSettings.heroStats.bookingsCompleted}</span>
      <span>{homePageSettings.heroStats.averageRating}</span>
      <span>{homePageSettings.heroStats.responseTime}</span>
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
      <h5 className="service-discovery-title">{homePageSettings.discoveryTitle}</h5>
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
) : null}

{/* CATEGORY QUICK-MODAL WITH SUBCATEGORIES */}
{modalOpen && (
  <div
    className="modal-backdrop home-quick-modal-backdrop"
    role="dialog"
    aria-modal="true"
    onClick={() => setModalOpen(false)}
  >
    <div className="modal modal-large home-quick-modal" onClick={(e) => e.stopPropagation()}>
      {/* Modal Header */}
      <div className="modal-header home-quick-modal-header">
        <div className="home-quick-modal-heading">
          {selectedSubcategory && (
            <button 
              className="home-quick-modal-back"
              onClick={backToCategory}
              aria-label="Back to categories"
            >
              &larr;
            </button>
          )}
          <div className="home-quick-modal-title-wrap">
            <h3 className="home-quick-modal-title">{modalTitle}</h3>
            <p className="home-quick-modal-subtitle">
              {selectedSubcategory ? 'Select a service' : 'Choose a category'}
            </p>
          </div>
        </div>
        <button
          className="home-quick-modal-close"
          onClick={() => setModalOpen(false)}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      {/* Service Cards Grid View - Category Wise */}
      <div className="modal-body home-quick-modal-body">
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
          modalSubcategoryEntries && modalSubcategoryEntries.length > 0 ? (
            modalSubcategoryEntries.map(([subcategoryName, services]) => (
              <div key={subcategoryName} style={{ marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                  {subcategoryName}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(98px, 1fr))', gap: '12px' }}>
                  {services.slice(0, 8).map((service) => (
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
                  ))}
                </div>
              </div>
            ))
          ) : useStaticModalFallback ? (
            Object.keys(SUBCATEGORIES[modalCategory] || {}).map((subcategoryName) => (
              <div key={subcategoryName} style={{ marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                  {subcategoryName}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(98px, 1fr))', gap: '12px' }}>
                  {SUBCATEGORIES[modalCategory][subcategoryName]?.map((serviceId) => {
                    const service = servicesByCategory[modalCategory]?.find(s => s.id === serviceId);
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
          ) : null
        )}
      </div>
    </div>
  </div>
)}

{/* PROMOTIONAL SLIDER SECTION */}
{isSectionVisible("promoSlider") ? (
<section className="container slide-up" style={{ marginTop: "48px" }}>
  <div className="services-carousel-wrap">
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div 
        ref={promoSliderRef}
        className="promo-slider home-services-track home-services-track--promo"
        style={{ 
          display: 'flex',
          gap: '20px',
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
            className="home-slider-card home-slider-card--promo"
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
) : null}

{/* FEATURED SERVICES CARDS - HORIZONTAL CAROUSEL */}
{isSectionVisible("popularServices") ? (
<section className="container slide-up" style={{ marginTop: "24px", marginBottom: "8px", paddingBottom: "4px" }}>
  <h2 className="section-title">{homePageSettings.popularServicesTitle}</h2>
  

  <div className="services-carousel-wrap">
    <div 
      className="home-services-track home-services-track--popular"
      ref={popularServicesRef}
      style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: '4px'
      }}
    >
      {featuredServices.map((service, index) => (
        <div 
          key={`${service.id}-${index}`}
          className="home-slider-card home-slider-card--service"
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
            height: '156px',
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
) : null}

{/* GET QUOTE - PROFESSIONAL SLIDER */}
{isSectionVisible("getQuote") ? (
<section className="container slide-up" style={{ marginTop: "24px", paddingTop: "4px" }}>
  <h2 className="section-title">{homePageSettings.getQuoteTitle}</h2>
 

  <div className="services-carousel-wrap">
    <div
      className="home-services-track home-services-track--quote"
      ref={getQuoteRef}
      style={{
        display: 'flex',
        gap: '16px',
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
        className="home-slider-card home-slider-card--offer"
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
            height: '156px',
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
) : null}

{/* OFFERS & DISCOUNTS - PROFESSIONAL SLIDER */}
{isSectionVisible("offersDiscounts") ? (
<section className="container slide-up" style={{ marginTop: "24px", paddingTop: "6px" }}>
  <h2 className="section-title">{homePageSettings.offersDiscountsTitle}</h2>
 

  <div className="services-carousel-wrap">
    <div
      className="home-services-track home-services-track--offers"
      ref={offersRef}
      style={{
        display: 'flex',
        gap: '6px',
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
        className="home-slider-card home-slider-card--offer"
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
            height: '156px',
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
) : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[0]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[0])
  : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[1]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[1])
  : null}

{/* ADS BANNER - After Massage for Men */}
{isSectionVisible("promoBanner1") ? (
<section className="container slide-up" style={{ marginTop: "32px", marginBottom: "20px" }}>
  <div className="home-promo-banner-box" style={{
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
) : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[2]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[2])
  : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[3]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[3])
  : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[4]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[4])
  : null}

{/* ADS BANNER - After Massage for Men */}
{isSectionVisible("promoBanner2") ? (
<section className="container slide-up" style={{ marginTop: "32px", marginBottom: "20px" }}>
  <div className="home-promo-banner-box" style={{
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
) : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[5]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[5])
  : null}

{isSectionVisible("curatedServices") && isCuratedSectionVisible(curatedServiceSections[6]?.key)
  ? renderUnifiedServiceSection(curatedServiceSections[6])
  : null}

{/* ADS BANNER - After Massage for Men */}
{isSectionVisible("promoBanner3") ? (
<section className="container slide-up" style={{ marginTop: "32px", marginBottom: "20px" }}>
  <div className="home-promo-banner-box" style={{
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
) : null}



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







