import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  buildServicesUrl,
  parseServicesParams,
  isValidCategory,
  normalizeCategoryKey,
} from "../utils/serviceRouting";
import "../styles/services-layout.css";
import { SERVICES_DATA as STATIC_SERVICES_DATA, CATEGORY_VIEW_RULES, PLUMBER_SELECT_SERVICE_ORDER, DEFAULT_BULK_DISCOUNTS, DEFAULT_REVIEW_SHARES, buildDefaultCustomerReviews } from "../data/servicesPageData";
import { API_ENDPOINTS } from "../config/api";
import { buildServicesDataFromList } from "../utils/servicesData";
import { ensureServiceableLocation } from "../utils/serviceAvailability";

const SERVICES_PAGE_BANNER = new URL(
  "../assets/images/banner1.png",
  import.meta.url
).href;

const CATEGORY_META = Object.fromEntries(
  Object.entries(STATIC_SERVICES_DATA).map(([key, value]) => [
    key,
    { icon: value.icon, label: value.label },
  ])
);

const CATEGORY_ORDER = Object.keys(STATIC_SERVICES_DATA);


// Complete service database with categories and subcategories






const getSelectServiceLabel = (subcategoryName) => {
  if (subcategoryName === "Install/uninst") {
    return "Installation / Uninstallation";
  }
  return subcategoryName;
};

const formatCompactCount = (value) => {
  const count = Number(value) || 0;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000)}K`;
  }
  return `${count}`;
};

const buildGeneratedSubServices = (service) => {
  const optionCount = Math.min(Math.max(Number(service?.options) || 0, 0), 8);
  if (optionCount <= 1) {
    return [];
  }

  const basePrice = Number(service?.price) || 0;
  const title = String(service?.title || "").toLowerCase();
  const unitLabel = title.includes("ac") ? "AC" : "Unit";
  const discounts = DEFAULT_BULK_DISCOUNTS;

  return Array.from({ length: optionCount }, (_, index) => {
    const quantity = index + 1;
    const rawPrice = basePrice * quantity;
    const discount = discounts[quantity] || 0;
    const discountedPrice =
      discount > 0 ? Math.round(rawPrice * (1 - discount / 100)) : rawPrice;
    const label = quantity === 1 ? `1 ${unitLabel}` : `${quantity} ${unitLabel}s`;
    const perUnit = quantity > 1 ? Math.round(discountedPrice / quantity) : null;

    return {
      id: `${service.id}-option-${quantity}`,
      title: label,
      price: discountedPrice,
      oldPrice: discount > 0 ? rawPrice : null,
      subtitle: perUnit ? `(₹${perUnit}/${unitLabel})` : null,
      discountText: discount > 0 ? `${discount}% off` : null,
    };
  });
};

const getServiceOptionPackages = (service) => {
  if (Array.isArray(service?.subServices) && service.subServices.length > 0) {
    return service.subServices;
  }
  return buildGeneratedSubServices(service);
};

const buildServiceReviewBreakdown = (service) => {
  if (Array.isArray(service?.reviewBreakdown) && service.reviewBreakdown.length > 0) {
    return service.reviewBreakdown;
  }

  const total = Math.max(Number(service?.reviews) || 0, 100);
  const shares = DEFAULT_REVIEW_SHARES;

  return [5, 4, 3, 2, 1].map((stars, idx) => ({
    stars,
    count: Math.round(total * shares[idx]),
  }));
};

const buildServiceCustomerReviews = (service) => {
  if (Array.isArray(service?.customerReviews) && service.customerReviews.length > 0) {
    return service.customerReviews;
  }

  return buildDefaultCustomerReviews(service);
};

const normalizeSubcategoryName = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeTypeKey = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const resolveSubcategoryKey = (subcategories = {}, requestedSubcategory) => {
  if (!requestedSubcategory) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(subcategories, requestedSubcategory)) {
    return requestedSubcategory;
  }

  const normalizedRequested = normalizeSubcategoryName(requestedSubcategory);
  if (!normalizedRequested) {
    return null;
  }

  return (
    Object.keys(subcategories).find(
      (key) => normalizeSubcategoryName(key) === normalizedRequested
    ) || null
  );
};

const getCategoryViewRule = (categoryKey, serviceType) => {
  if (!categoryKey || !serviceType) {
    return null;
  }

  const categoryRules = CATEGORY_VIEW_RULES[categoryKey];
  if (!categoryRules) {
    return null;
  }

  return categoryRules[normalizeTypeKey(serviceType)] || null;
};

const getFilteredSubcategoryEntries = (categoryKey, subcategories, serviceType) => {
  const entries = Object.entries(subcategories || {});
  const viewRule = getCategoryViewRule(categoryKey, serviceType);

  if (!viewRule?.subcategories?.length) {
    return entries;
  }

  const allowedSet = new Set(
    viewRule.subcategories.map((subcategory) => normalizeSubcategoryName(subcategory))
  );

  const filteredEntries = entries.filter(([subcategory]) =>
    allowedSet.has(normalizeSubcategoryName(subcategory))
  );

  return filteredEntries.length > 0 ? filteredEntries : entries;
};

const filterServicesByViewRule = (services, categoryKey, serviceType) => {
  if (!Array.isArray(services) || services.length === 0) {
    return [];
  }

  const viewRule = getCategoryViewRule(categoryKey, serviceType);
  if (!viewRule) {
    return services;
  }

  if (Array.isArray(viewRule.serviceIds) && viewRule.serviceIds.length > 0) {
    const idSet = new Set(viewRule.serviceIds);
    const filteredById = services.filter((service) => idSet.has(service.id));
    if (filteredById.length > 0) {
      return filteredById;
    }
  }

  if (
    Array.isArray(viewRule.serviceTitleKeywords) &&
    viewRule.serviceTitleKeywords.length > 0
  ) {
    const keywords = viewRule.serviceTitleKeywords.map((keyword) =>
      normalizeSubcategoryName(keyword)
    );
    const filteredByKeyword = services.filter((service) => {
      const normalizedTitle = normalizeSubcategoryName(service?.title || "");
      return keywords.some((keyword) => normalizedTitle.includes(keyword));
    });

    if (filteredByKeyword.length > 0) {
      return filteredByKeyword;
    }
  }

  return services;
};

export default function Services() {

  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity: updateCartItemQuantity,
  } = useCart();
  const { addToast } = useToast();
  const [servicesData, setServicesData] = useState(STATIC_SERVICES_DATA);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [serviceDetailsModal, setServiceDetailsModal] = useState(null);
  const [selectedServiceOptionId, setSelectedServiceOptionId] = useState(null);
  
  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'price-low-to-high', 'price-high-to-low', 'rating'
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const leftDrawerRef = useRef(null);
  const rightDrawerRef = useRef(null);
  const previousDrawerOpenRef = useRef(false);
  const drawerReturnFocusRef = useRef(null);
  const mobileCategoriesButtonRef = useRef(null);
  const mobileFiltersButtonRef = useRef(null);
  const mainPanelRef = useRef(null);
  const stickyBannerRef = useRef(null);
  const subcategorySectionRefs = useRef({});
  const pendingScrollSubcategoryRef = useRef(null);
  const serviceCardRefs = useRef({});
  const pendingScrollServiceRef = useRef(null);
  
  const location = useLocation();
  const serviceType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance")
    );
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SERVICES.GET_ALL, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load services");
        }

        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const { data } = buildServicesDataFromList(rawList, {
          categoryMeta: CATEGORY_META,
          categoryOrder: CATEGORY_ORDER,
          baseData: STATIC_SERVICES_DATA,
        });

        if (isMounted) {
          setServicesData(data);
        }
      } catch (err) {
        if (isMounted) {
          setServicesData(STATIC_SERVICES_DATA);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const getServicesUrlWithCurrentContext = (category, subcategory = null) => {
    const params = new URLSearchParams(location.search);
    const extraParams = {};
    const currentServiceType =
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance");

    if (currentServiceType) {
      extraParams.serviceType = currentServiceType;
    }

    const appliance = params.get("appliance");
    if (category === "Appliances" && appliance) {
      extraParams.appliance = appliance;
    }

    return buildServicesUrl(category, subcategory, extraParams);
  };

  const servicesDataSafe =
    servicesData && typeof servicesData === "object" ? servicesData : {};
  const hasServicesData = Object.keys(servicesDataSafe).length > 0;

  useEffect(() => {
    if (!hasServicesData) {
      return;
    }

    const { category, subcategory } = parseServicesParams(location.search);
    const params = new URLSearchParams(location.search);
    const rawCategory = params.get("category") || null;
    const normalizedCategory = normalizeCategoryKey(rawCategory);
    const routeServiceType =
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance");

    if (rawCategory && normalizedCategory && rawCategory !== normalizedCategory) {
      params.set("category", normalizedCategory);
      const canonicalQuery = params.toString();
      navigate(canonicalQuery ? `/services?${canonicalQuery}` : "/services", {
        replace: true,
      });
      return;
    }

    if (!isValidCategory(category, servicesDataSafe)) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setShowCategoryModal(false);
      return;
    }

    const subcategories = servicesDataSafe[category].subcategories;
    const visibleSubcategories = getFilteredSubcategoryEntries(
      category,
      subcategories,
      routeServiceType
    ).map(([subcategoryKey]) => subcategoryKey);

    setSelectedCategory(category);

    if (visibleSubcategories.length === 0) {
      setSelectedSubcategory(null);
      setShowCategoryModal(false);
      return;
    }

    const resolvedSubcategory = resolveSubcategoryKey(subcategories, subcategory);
    const isVisibleSubcategory =
      resolvedSubcategory && visibleSubcategories.includes(resolvedSubcategory);

    setSelectedSubcategory(
      isVisibleSubcategory ? resolvedSubcategory : visibleSubcategories[0]
    );
    setShowCategoryModal(false);
  }, [location.search, navigate, hasServicesData, servicesData]);

  const visibleSubcategoryEntries = useMemo(() => {
    if (!selectedCategory || !servicesDataSafe[selectedCategory]) {
      return [];
    }

    return getFilteredSubcategoryEntries(
      selectedCategory,
      servicesDataSafe[selectedCategory].subcategories,
      serviceType
    );
  }, [selectedCategory, serviceType, servicesData]);

  useEffect(() => {
    const handleResize = () => {
      const nextMobileState = window.innerWidth < 1024;
      setIsMobileLayout(nextMobileState);
      if (!nextMobileState) {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLeftDrawerOpen && !isRightDrawerOpen && !serviceDetailsModal) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (serviceDetailsModal) {
          setServiceDetailsModal(null);
          setSelectedServiceOptionId(null);
        }
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLeftDrawerOpen, isRightDrawerOpen, serviceDetailsModal]);

  useEffect(() => {
    const isAnyDrawerOpen = isLeftDrawerOpen || isRightDrawerOpen;
    const shouldLockScroll = isAnyDrawerOpen || Boolean(serviceDetailsModal);

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
      if (isLeftDrawerOpen) {
        leftDrawerRef.current?.focus();
      } else if (isRightDrawerOpen) {
        rightDrawerRef.current?.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (previousDrawerOpenRef.current && drawerReturnFocusRef.current) {
        drawerReturnFocusRef.current.focus();
        drawerReturnFocusRef.current = null;
      }
    }

    previousDrawerOpenRef.current = isAnyDrawerOpen;

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLeftDrawerOpen, isRightDrawerOpen, serviceDetailsModal]);

  const closeDrawers = () => {
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
  };

  const openLeftDrawer = () => {
    drawerReturnFocusRef.current = mobileCategoriesButtonRef.current;
    setIsRightDrawerOpen(false);
    setIsLeftDrawerOpen(true);
  };

  const openRightDrawer = () => {
    drawerReturnFocusRef.current = mobileFiltersButtonRef.current;
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(true);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMinRatingChange = (value) => {
    setMinRating(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(10000);
    setMinRating(0);
    setSortBy("relevance");
    if (isMobileLayout) closeDrawers();
  };


  const handleAddToCart = (service) => {
    if (!ensureServiceableLocation(addToast)) {
      return;
    }
    const quantity = quantities[service.id] || 1;
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      quantity: quantity
    });
    addToast(`${service.title} (Qty: ${quantity}) added to cart!`, 'success');
    setQuantities({ ...quantities, [service.id]: 1 });
  };

  const closeServiceDetailsModal = () => {
    setServiceDetailsModal(null);
    setSelectedServiceOptionId(null);
  };

  const openServiceDetailsModal = (service) => {
    if (!service) {
      return;
    }

    const optionPackages = getServiceOptionPackages(service);
    if (optionPackages.length === 0) {
      handleAddToCart(service);
      return;
    }

    setServiceDetailsModal(service);
    setSelectedServiceOptionId(optionPackages[0].id);
  };

  const handleAddServiceOptionToCart = (service, option) => {
    if (!service || !option) {
      return;
    }
    if (!ensureServiceableLocation(addToast)) {
      return;
    }

    const optionPrice = Number(option.price) || Number(service.price) || 0;
    const cartTitle = option.title ? `${service.title} - ${option.title}` : service.title;

    addToCart({
      id: option.id || `${service.id}-option`,
      title: cartTitle,
      price: optionPrice,
      image: service.image,
    });

    addToast(`${cartTitle} added to cart!`, "success");
  };

  const handlePrimaryServiceAction = (service) => {
    if (!service) {
      return;
    }

    const optionPackages = getServiceOptionPackages(service);
    if (optionPackages.length > 0) {
      openServiceDetailsModal(service);
      return;
    }

    handleAddToCart(service);
  };

  const updateQuantity = (serviceId, change) => {
    const current = quantities[serviceId] || 1;
    const newQuantity = Math.max(1, current + change);
    setQuantities({ ...quantities, [serviceId]: newQuantity });
  };

  // Not used in this layout
  const handleViewService = () => {};

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
    setSelectedSubcategory(null);
    setSelectedServiceId(null);
    pendingScrollSubcategoryRef.current = null;
    pendingScrollServiceRef.current = null;
    navigate(buildServicesUrl(category));
  };

  const scrollToSubcategorySection = (subcategory, behavior = "smooth") => {
    const scrollContainer = mainPanelRef.current;
    const sectionNode = subcategorySectionRefs.current[subcategory];
    const scrollOffset = isMobileLayout ? 10 : 16;

    if (!scrollContainer || !sectionNode) {
      return false;
    }

    const mainPanelRect = scrollContainer.getBoundingClientRect();
    const sectionRect = sectionNode.getBoundingClientRect();
    const nextScrollTop =
      scrollContainer.scrollTop +
      (sectionRect.top - mainPanelRect.top) -
      scrollOffset;

    scrollContainer.scrollTo({
      top: Math.max(nextScrollTop, 0),
      behavior,
    });
    return true;
  };

  const setSubcategorySectionRef = (subcategory) => (node) => {
    if (node) {
      subcategorySectionRefs.current[subcategory] = node;
      return;
    }

    delete subcategorySectionRefs.current[subcategory];
  };

  const getServiceRefKey = (subcategory, serviceId) =>
    `${subcategory}::${serviceId}`;

  const setServiceCardRef = (subcategory, serviceId) => (node) => {
    const key = getServiceRefKey(subcategory, serviceId);
    if (node) {
      serviceCardRefs.current[key] = node;
      return;
    }

    delete serviceCardRefs.current[key];
  };

  const scrollToServiceCard = (subcategory, serviceId, behavior = "smooth") => {
    const scrollContainer = mainPanelRef.current;
    const cardNode = serviceCardRefs.current[getServiceRefKey(subcategory, serviceId)];
    const scrollOffset = isMobileLayout ? 10 : 16;

    if (!scrollContainer || !cardNode) {
      return false;
    }

    const mainPanelRect = scrollContainer.getBoundingClientRect();
    const cardRect = cardNode.getBoundingClientRect();
    const nextScrollTop =
      scrollContainer.scrollTop + (cardRect.top - mainPanelRect.top) - scrollOffset;

    scrollContainer.scrollTo({
      top: Math.max(nextScrollTop, 0),
      behavior,
    });

    return true;
  };

  const handleSubcategorySelect = (subcategory, options = {}) => {
    const { shouldScroll = true } = options;
    if (selectedSubcategory === subcategory && shouldScroll) {
      const nextUrl = getServicesUrlWithCurrentContext(selectedCategory, subcategory);
      setShowCategoryModal(false);
      setSelectedServiceId(null);
      pendingScrollServiceRef.current = null;
      scrollToSubcategorySection(subcategory, "smooth");
      if (isMobileLayout) closeDrawers();
      if (`${location.pathname}${location.search}` !== nextUrl) {
        navigate(nextUrl);
      }
      return;
    }

    setSelectedSubcategory(subcategory);
    setShowCategoryModal(false);
    setSelectedServiceId(null);
    pendingScrollSubcategoryRef.current = shouldScroll ? subcategory : null;
    pendingScrollServiceRef.current = null;
    if (isMobileLayout) closeDrawers();
    navigate(getServicesUrlWithCurrentContext(selectedCategory, subcategory));
  };

  const handlePlumberServiceSelect = (serviceItem) => {
    if (!serviceItem?.subcategory || !serviceItem?.id) {
      return;
    }

    const nextUrl = getServicesUrlWithCurrentContext(
      selectedCategory,
      serviceItem.subcategory
    );

    setSelectedServiceId(serviceItem.id);
    setShowCategoryModal(false);
    pendingScrollSubcategoryRef.current = null;
    pendingScrollServiceRef.current = {
      subcategory: serviceItem.subcategory,
      serviceId: serviceItem.id,
    };

    if (isMobileLayout) closeDrawers();

    if (selectedSubcategory !== serviceItem.subcategory) {
      setSelectedSubcategory(serviceItem.subcategory);
      navigate(nextUrl);
      return;
    }

    const didScroll = scrollToServiceCard(
      serviceItem.subcategory,
      serviceItem.id,
      "smooth"
    );

    if (didScroll) {
      pendingScrollServiceRef.current = null;
    }

    if (`${location.pathname}${location.search}` !== nextUrl) {
      navigate(nextUrl);
    }
  };

  // Filter and sort services
  const getFilteredAndSortedServices = (services) => {
    let filtered = services.filter(service => {
      const matchesPrice = service.price >= minPrice && service.price <= maxPrice;
      const matchesRating = service.rating >= minRating;
      return matchesPrice && matchesRating;
    });

    // Apply sorting
    if (sortBy === 'price-low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  // Not used in this layout
  const handleBack = () => {
    setShowCategoryModal(false);
  };

  useEffect(() => {
    setServiceDetailsModal(null);
    setSelectedServiceOptionId(null);
  }, [selectedCategory, selectedSubcategory]);

  useEffect(() => {
    if (selectedCategory !== "Plumber") {
      setSelectedServiceId(null);
      pendingScrollServiceRef.current = null;
      return;
    }

    if (!selectedSubcategory) {
      setSelectedServiceId(null);
      return;
    }

    const subcategoryServices =
      servicesDataSafe.Plumber?.subcategories?.[selectedSubcategory] || [];

    if (subcategoryServices.length === 0) {
      setSelectedServiceId(null);
      return;
    }

    const hasCurrentSelection = subcategoryServices.some(
      (service) => service.id === selectedServiceId
    );

    if (!hasCurrentSelection) {
      setSelectedServiceId(subcategoryServices[0].id);
    }
  }, [selectedCategory, selectedSubcategory, selectedServiceId, servicesData]);

  useEffect(() => {
    if (!selectedSubcategory) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const pendingServiceTarget = pendingScrollServiceRef.current;

      if (pendingServiceTarget) {
        const didScrollToService = scrollToServiceCard(
          pendingServiceTarget.subcategory,
          pendingServiceTarget.serviceId,
          "smooth"
        );

        if (didScrollToService) {
          pendingScrollServiceRef.current = null;
          pendingScrollSubcategoryRef.current = null;
          return;
        }
      }

      const targetSubcategory =
        pendingScrollSubcategoryRef.current || selectedSubcategory;
      const behavior =
        pendingScrollSubcategoryRef.current ? "smooth" : "auto";
      const didScrollToSubcategory = scrollToSubcategorySection(
        targetSubcategory,
        behavior
      );

      if (
        didScrollToSubcategory &&
        pendingScrollSubcategoryRef.current === targetSubcategory
      ) {
        pendingScrollSubcategoryRef.current = null;
      }
    }, 60);

    return () => window.clearTimeout(scrollTimer);
  }, [selectedSubcategory, minPrice, maxPrice, minRating, sortBy, isMobileLayout]);

  // Render Main Layout
  if (!selectedCategory) {
    // Show category selection grid
    return (
      <section className="services-category-landing">
        <div className="services-category-landing-inner">
          <p className="services-category-eyebrow">HomeService99 Categories</p>
          <h1 className="services-category-title">What are you looking for?</h1>
          <p className="services-category-subtitle">Select a service category to explore</p>

          <div className="services-category-meta">
            <span>{Object.keys(servicesDataSafe).length}+ categories</span>
            <span>Verified professionals</span>
            <span>Transparent pricing</span>
          </div>

          <div className="services-category-grid">
            {Object.entries(servicesDataSafe).map(([key, data]) => (
              <button
                key={key}
                type="button"
                className="services-category-card"
                onClick={() => handleCategorySelect(key)}
                aria-label={`Explore ${data.label}`}
              >
                <span className="services-category-card-icon" aria-hidden="true">{data.icon}</span>
                <span className="services-category-card-label">{data.label}</span>
                <span className="services-category-card-hint">Tap to explore</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Category Modal - Show subcategories
  if (showCategoryModal && selectedCategory) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(12px, 2vw, 20px)',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'clamp(14px, 2vw, 20px)',
          maxWidth: '600px',
          width: '100%',
          padding: 'clamp(24px, 3vw, 32px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {/* Close Button */}
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: 'clamp(14px, 1.5vw, 20px)',
              right: 'clamp(14px, 1.5vw, 20px)',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 'clamp(22px, 2.5vw, 28px)',
              cursor: 'pointer',
              padding: '0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>

          {/* Modal Title */}
          <h2 style={{
            fontSize: 'clamp(18px, 3.5vw, 24px)',
            fontWeight: '700',
            marginBottom: 'clamp(4px, 0.8vw, 8px)',
            color: '#0f172a',
            paddingRight: '40px'
          }}>
            {servicesDataSafe[selectedCategory]?.label}
          </h2>

          {/* Modal Subtitle */}
          <p style={{
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            color: '#6b7280',
            margin: '0 0 clamp(24px, 2vw, 32px) 0'
          }}>
            Choose a category
          </p>

          {/* Subcategories Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100px, 20vw, 130px), 1fr))',
            gap: 'clamp(16px, 2.2vw, 24px)'
          }}>
            {Object.entries(servicesDataSafe[selectedCategory]?.subcategories || {}).map(([subcat, services]) => (
              <div
                key={subcat}
                onClick={() => handleSubcategorySelect(subcat)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'clamp(10px, 1.5vw, 14px)',
                  padding: 'clamp(14px, 1.8vw, 18px)',
                  backgroundColor: '#f8f9fb',
                  borderRadius: 'clamp(12px, 1.5vw, 16px)',
                  cursor: 'pointer',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
                  e.currentTarget.style.borderColor = '#d8b4fe';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(168,85,247,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Service Image */}
                <div style={{
                  width: 'clamp(56px, 12vw, 80px)',
                  height: 'clamp(56px, 12vw, 80px)',
                  borderRadius: 'clamp(10px, 1.2vw, 14px)',
                  overflow: 'hidden',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <img
                    src={services[0]?.image}
                    alt={subcat}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Subcategory Name */}
                <p style={{
                  fontSize: 'clamp(12px, 1.8vw, 14px)',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0',
                  lineHeight: '1.3'
                }}>
                  {subcat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main two-column layout for selected category
  const categoryData = servicesDataSafe[selectedCategory] || {
    label: selectedCategory,
    subcategories: {},
  };
  const subcategories = visibleSubcategoryEntries;
  const baseServices =
    selectedSubcategory && categoryData.subcategories[selectedSubcategory]
      ? categoryData.subcategories[selectedSubcategory]
      : [];
  const services = filterServicesByViewRule(
    baseServices,
    selectedCategory,
    serviceType
  );
  const filteredServices = getFilteredAndSortedServices(services);
  const serviceSections = subcategories
    .map(([subcategoryName, subcategoryServices]) => {
      const visibleServices = filterServicesByViewRule(
        subcategoryServices,
        selectedCategory,
        serviceType
      );

      return {
        subcategory: subcategoryName,
        services: getFilteredAndSortedServices(visibleServices),
      };
    })
    .filter((section) => section.services.length > 0);
  const totalVisibleServices = serviceSections.reduce(
    (total, section) => total + section.services.length,
    0
  );
  const featuredService =
    filteredServices[0] || serviceSections[0]?.services[0] || null;
  const plumberServiceLookup = {};
  if (selectedCategory === "Plumber") {
    subcategories.forEach(([subcategoryName, subcategoryServices]) => {
      const visibleServices = filterServicesByViewRule(
        subcategoryServices,
        selectedCategory,
        serviceType
      );

      visibleServices.forEach((service) => {
        if (!plumberServiceLookup[service.id]) {
          plumberServiceLookup[service.id] = {
            ...service,
            subcategory: subcategoryName,
          };
        }
      });
    });
  }
  const plumberOrderAvailable =
    selectedCategory === "Plumber" &&
    PLUMBER_SELECT_SERVICE_ORDER.some(
      (serviceId) => plumberServiceLookup[serviceId]
    );
  const fallbackPlumberServices = plumberOrderAvailable
    ? []
    : Object.values(plumberServiceLookup).sort(
        (a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0)
      );
  const firstPlumberServiceIdForSubcategory =
    selectedCategory === "Plumber"
      ? plumberOrderAvailable
        ? PLUMBER_SELECT_SERVICE_ORDER.find(
            (serviceId) =>
              plumberServiceLookup[serviceId]?.subcategory === selectedSubcategory
          ) || null
        : fallbackPlumberServices.find(
            (service) => service.subcategory === selectedSubcategory
          )?.id || null
      : null;
  const selectServiceItems =
    selectedCategory === "Plumber"
      ? (plumberOrderAvailable
          ? PLUMBER_SELECT_SERVICE_ORDER.map(
              (serviceId) => plumberServiceLookup[serviceId]
            ).filter(Boolean)
          : fallbackPlumberServices
        ).map((service) => ({
          key: service.id,
          label: service.title,
          image: service.image,
          badge: service.badge || null,
          subcategory: service.subcategory,
          serviceId: service.id,
          isPlumberItem: true,
        }))
      : subcategories.map(([subcategoryName, subcategoryServices]) => ({
          key: subcategoryName,
          label: getSelectServiceLabel(subcategoryName),
          image: subcategoryServices[0]?.image,
          badge: subcategoryServices[0]?.badge || null,
          subcategory: subcategoryName,
          serviceId: null,
          isPlumberItem: false,
        }));
  const featuredServiceOptionsCount = featuredService
    ? getServiceOptionPackages(featuredService).length
    : 0;
  const serviceDetailsOptions = serviceDetailsModal
    ? getServiceOptionPackages(serviceDetailsModal)
    : [];
  const selectedServiceOption =
    serviceDetailsOptions.find((option) => option.id === selectedServiceOptionId) ||
    serviceDetailsOptions[0] ||
    null;
  const serviceDetailsReviewBreakdown = serviceDetailsModal
    ? buildServiceReviewBreakdown(serviceDetailsModal)
    : [];
  const serviceDetailsReviews = serviceDetailsModal
    ? buildServiceCustomerReviews(serviceDetailsModal)
    : [];
  const maxReviewBreakdownCount = serviceDetailsReviewBreakdown.reduce(
    (maxCount, item) => Math.max(maxCount, Number(item?.count) || 0),
    0
  );
  return (
    <div
      className="services-layout"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)",
        display: "grid",
        gridTemplateColumns: isMobileLayout ? "1fr" : "252px 1fr 252px",
        gap: 0,
        width: "100%",
      }}
    >
      {/* LEFT SIDEBAR - FIXED */}
      <aside
        className={`services-left-panel services-left-drawer${isLeftDrawerOpen ? " is-open" : ""}`}
        ref={leftDrawerRef}
        tabIndex={-1}
        style={{
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div className="services-drawer-header">
          <h3>Categories</h3>
          <button type="button" className="services-drawer-close" onClick={closeDrawers} aria-label="Close categories panel">
            Close
          </button>
        </div>
        {/* Category Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef7 100%)',
          borderRadius: 'clamp(8px, 1.2vw, 12px)',
          padding: 'clamp(10px, 1.2vw, 14px)',
          textAlign: 'center',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: '700', margin: '0 0 clamp(6px, 0.8vw, 8px) 0', color: '#0f172a' }}>
            {categoryData.label}
          </h2>
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            ⭐ <span style={{ fontWeight: '600', color: '#0f172a' }}>4.74</span> <span>(11.4M)</span>
          </div>
        </div>

        {/* Service Type Cards - BEAUTY STYLE GRID */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
        }}>
  <h3
    style={{
      fontSize: "12px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.4px"
    }}
  >
    Select a service
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "10px",
      overflowY: "auto",
      paddingRight: "4px"
    }}
  >
    {selectServiceItems.map((item) => {
      const isActive = item.isPlumberItem
        ? selectedServiceId
          ? selectedServiceId === item.serviceId
          : item.serviceId === firstPlumberServiceIdForSubcategory
        : selectedSubcategory === item.subcategory;
      const normalizedLabel = item.label.toLowerCase();
      const isNew = normalizedLabel.includes("korean");
      const isOffer = normalizedLabel.includes("super");
      const handleSelectClick = item.isPlumberItem
        ? () =>
            handlePlumberServiceSelect({
              id: item.serviceId,
              subcategory: item.subcategory,
            })
        : () => handleSubcategorySelect(item.subcategory);

      return (
        <div
          key={item.key}
          onClick={handleSelectClick}
          style={{
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {/* Image Card */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#f2f2f2",
              border: isActive ? "2px solid #2563eb" : "1px solid #e5e7eb",
              boxShadow: isActive
                ? "0 4px 10px rgba(37,99,235,0.2)"
                : "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease"
            }}
          >
            <img
              src={item.image}
              alt={item.label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />

            {/* BADGES */}
            {isNew && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "#e11d48",
                  color: "#fff",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontWeight: "700"
                }}
              >
                NEW
              </div>
            )}

            {isOffer && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  background: "#16a34a",
                  color: "#fff",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontWeight: "700"
                }}
              >
                {item.badge || "20% OFF"}
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: "600",
              lineHeight: "1.2",
              color: "#0f172a",
              minHeight: "26px",
              display: "flex",
              alignItems: "center"
            }}
          >
            {item.label}
          </div>
        </div>
      );
    })}
  </div>
</div>
      </aside>

      {/* MIDDLE SECTION - SCROLLABLE */}
      <main
        className="services-main-panel"
        ref={mainPanelRef}
        style={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "clamp(12px, 1.5vw, 18px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 1.5vw, 16px)",
        }}
      >
        {/* Header with banner */}
        <div className="services-mobile-toolbar">
          <button
            ref={mobileCategoriesButtonRef}
            type="button"
            onClick={openLeftDrawer}
            aria-label="Open categories panel"
          >
            Categories
          </button>
          <button
            ref={mobileFiltersButtonRef}
            type="button"
            onClick={openRightDrawer}
            aria-label="Open filters and cart panel"
          >
            Filters & Cart
          </button>
        </div>
        <div className="services-sticky-banner-shell" ref={stickyBannerRef}>
          <div
            className="services-main-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div className="services-header-banner services-header-banner-static">
              <img
                src={SERVICES_PAGE_BANNER}
                alt={`${categoryData.label} banner`}
                className="services-header-banner-static-image"
              />
            </div>
            <div
              className="services-count-chip"
              style={{
                padding: "8px 12px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {totalVisibleServices} Services
            </div>
          </div>
        </div>

        {selectedSubcategory && (
          <>
            {/* Featured Package */}
            {featuredService && (
            <div
              className="services-featured-card"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #f8fbff 100%)",
                borderRadius: "clamp(10px, 1.2vw, 14px)",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.07)",
                display: "grid",
                gridTemplateColumns: isMobileLayout ? "1fr" : "1.1fr minmax(220px, 320px)",
                gap: "clamp(12px, 1.8vw, 16px)",
                padding: "clamp(12px, 1.5vw, 16px)",
                alignItems: "stretch",
                flexShrink: 0,
                border: "1px solid #e5e7eb",
              }}
            >
              <div className="services-featured-media" style={{ position: 'relative', order: isMobileLayout ? 0 : 2 }}>
                <img
                  src={featuredService.image}
                  alt={featuredService.title}
                  style={{
                    width: '100%',
                    height: 'clamp(160px, 24vw, 220px)',
                    objectFit: 'cover',
                    borderRadius: 'clamp(10px, 1vw, 12px)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  zIndex: 2
                }}>
                  {selectedSubcategory.slice(0, 12)}
                </div>
              </div>
              <div style={{ order: 1 }}>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 34px)', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.15 }}>
                  {featuredService.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {featuredService.features?.[0] || 'Professional service'}
                </p>
                <div className="services-featured-meta" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                      From
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                      ₹{featuredService.price}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>⭐ {featuredService.rating}</span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>({featuredService.reviews})</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>
                  ⏱ {featuredService.duration}
                </div>
                <button
                  onClick={() => handlePrimaryServiceAction(featuredService)}
                  style={{
                    padding: '10px 24px',
                    background: '#fff',
                    border: '2px solid #2563eb',
                    color: '#2563eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                >
                  Add
                </button>
                {featuredServiceOptionsCount > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                    {featuredServiceOptionsCount} options available
                  </div>
                )}
              </div>
            </div>
            )}

            {/* All Services List - UrbanCompany Style Sections */}
            <div className="services-service-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {serviceSections.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 8px 0' }}>
                    No services found
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    Try adjusting your filters.
                  </p>
                </div>
              ) : (
                serviceSections.map((section) => (
                <section
                  key={section.subcategory}
                  ref={setSubcategorySectionRef(section.subcategory)}
                  className="services-subcategory-section"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    scrollMarginTop: isMobileLayout ? '150px' : '180px'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                    {section.subcategory}
                  </h3>
                  {section.services.map((service, idx) => {
                    const serviceKey = `${section.subcategory}-${service.id}-${idx}`;
                    const isExpanded = expandedService === serviceKey;
                    const optionPackages = getServiceOptionPackages(service);
                    const hasServiceOptions = optionPackages.length > 0;

                    return (
                      <div
                        key={serviceKey}
                        className="services-service-card"
                        ref={setServiceCardRef(section.subcategory, service.id)}
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          padding: "14px",
                          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
                          display: "grid",
                          gridTemplateColumns: isMobileLayout ? "1fr" : "minmax(0, 1fr) clamp(120px, 15vw, 170px)",
                          gap: "14px",
                          alignItems: "start",
                          transition: "all 0.3s ease",
                          position: "relative",
                          border: "1px solid #e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.12)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Image with Badge */}
                        <div className="services-service-media" style={{ position: 'relative', order: isMobileLayout ? 0 : 2 }}>
                          <img
                            src={service.image}
                            alt={service.title}
                            style={{
                              width: '100%',
                              height: 'clamp(110px, 13vw, 132px)',
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          />
                          {section.subcategory === 'AC Services' && idx < 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#1a1a1a',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              zIndex: 2
                            }}>
                              {idx === 0 ? '2 ACs PACK' : idx === 1 ? '4 ACs PACK' : '5 ACs PACK'}
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="services-service-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', order: 1 }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                              {service.title}
                            </h4>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                              {service.features?.[0] || 'Professional service included'}
                            </p>
                          </div>

                          {/* Rating, Duration, Price */}
                          <div className="services-service-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                            <div>
                              <span style={{ color: '#8b5cf6', fontWeight: '700', marginRight: '4px' }}>⭐ {service.rating}</span>
                              <span style={{ color: '#6b7280' }}>({service.reviews})</span>
                            </div>
                            <div style={{ color: '#6b7280' }}>⏱ {service.duration}</div>
                            <div style={{ marginLeft: 'auto' }}>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Starts at</div>
                              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>₹{service.price}</div>
                            </div>
                          </div>

                          {/* Features List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(service.features || []).slice(0, isExpanded ? undefined : 2).map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#4b5563' }}>
                                <span style={{ color: '#059669', fontWeight: 'bold', marginTop: '2px' }}>✓</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>

                          {hasServiceOptions ? (
                            <button
                              onClick={() => openServiceDetailsModal(service)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: 0,
                                textAlign: 'left'
                              }}
                            >
                              View details
                            </button>
                          ) : (
                            service.features &&
                            service.features.length > 2 && (
                              <button
                                onClick={() => setExpandedService(isExpanded ? null : serviceKey)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: 0,
                                  textAlign: 'left'
                                }}
                              >
                                {isExpanded ? 'View less' : 'View details'}
                              </button>
                            )
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handlePrimaryServiceAction(service)}
                              style={{
                                padding: '8px 18px',
                                background: '#fff',
                                border: '2px solid #2563eb',
                                color: '#2563eb',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '80px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2563eb';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                            >
                              Add
                            </button>
                            {hasServiceOptions && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                {optionPackages.length} options
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              ))
              )}
            </div>
          </>
        )}
      </main>

      {/* BACKDROP */}
      {(isLeftDrawerOpen || isRightDrawerOpen) && (
        <button
          type="button"
          className="services-drawer-backdrop"
          aria-label="Close side panel"
          onClick={closeDrawers}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 30,
            border: "none",
            cursor: "pointer",
          }}
        />
      )}

      {/* RIGHT SIDEBAR - FIXED */}
      <aside
        className={`services-right-panel services-right-drawer${isRightDrawerOpen ? " is-open" : ""}`}
        ref={rightDrawerRef}
        tabIndex={-1}
        style={{
          background: "#fff",
          borderLeft: "1px solid #e5e7eb",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div className="services-drawer-header">
          <h3>Filters & Cart</h3>
          <button type="button" className="services-drawer-close" onClick={closeDrawers} aria-label="Close filters and cart panel">
            Close
          </button>
        </div>
        {/* Cart */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              Cart ({cartCount})
            </div>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0
              }}
            >
              View cart
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px 6px' }}>
              <div style={{ fontSize: 'clamp(24px, 4.2vw, 32px)', marginBottom: '6px' }}>🛒</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                No items in your cart
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px', lineHeight: '1.25' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                        ₹{item.price * (item.quantity || 1)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) - 1)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: 1
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '12px', minWidth: '14px', textAlign: 'center', fontWeight: '600' }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) + 1)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: 1
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginTop: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Subtotal</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>₹{cartTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '9px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Go to cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* Offers */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
            Offers
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>
                Get Rs 50 coupon
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                After first service delivery
              </div>
            </div>
          </div>
        </div>

        {/* Promises */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flex: 1,
          overflow: 'auto',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
            UC Promise
          </h4>
          {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#0f172a',
              marginBottom: i < 2 ? '8px' : 0
            }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </aside>

      {serviceDetailsModal && (
        <div
          role="presentation"
          onClick={closeServiceDetailsModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 120,
            display: "flex",
            alignItems: isMobileLayout ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobileLayout ? "0" : "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${serviceDetailsModal.title} details`}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(860px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: isMobileLayout ? "16px 16px 0 0" : "16px",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.35)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                position: "relative",
                height: isMobileLayout ? "220px" : "290px",
                overflow: "hidden",
                borderRadius: isMobileLayout ? "16px 16px 0 0" : "16px 16px 0 0",
              }}
            >
              <img
                src={serviceDetailsModal.image}
                alt={serviceDetailsModal.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {serviceDetailsModal.promoTag && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#15803d",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {serviceDetailsModal.promoTag}
                </div>
              )}
              <button
                type="button"
                onClick={closeServiceDetailsModal}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  border: "none",
                  background: "rgba(255, 255, 255, 0.92)",
                  color: "#0f172a",
                  fontSize: "20px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close service details"
              >
                x
              </button>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "14px 16px",
                  background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.84) 100%)",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: "700", color: "#fff", lineHeight: 1.1 }}>
                  {serviceDetailsModal.title}
                </div>
                <div style={{ marginTop: "4px", color: "#e2e8f0", fontSize: "17px" }}>
                  {serviceDetailsModal.description ||
                    serviceDetailsModal.features?.[0] ||
                    "Professional doorstep service"}
                </div>
              </div>
            </div>

            <div style={{ padding: isMobileLayout ? "16px 14px 20px" : "20px 22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ color: "#8b5cf6", fontWeight: "700", fontSize: "14px" }}>
                  * {serviceDetailsModal.rating}
                  <span
                    style={{
                      color: "#64748b",
                      fontWeight: "500",
                      marginLeft: "6px",
                      textDecoration: "underline",
                    }}
                  >
                    ({formatCompactCount(serviceDetailsModal.reviews)} reviews)
                  </span>
                </div>
                <div style={{ color: "#047857", fontSize: "14px", fontWeight: "600" }}>
                  Add more and save up to 25%
                </div>
              </div>

              {serviceDetailsOptions.length > 0 && (
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                    Select an option
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {serviceDetailsOptions.map((option) => {
                      const isOptionActive = option.id === selectedServiceOptionId;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedServiceOptionId(option.id)}
                          style={{
                            border: isOptionActive ? "2px solid #2563eb" : "1px solid #dbe2ea",
                            borderRadius: "10px",
                            padding: "10px",
                            cursor: "pointer",
                            background: isOptionActive ? "#eff6ff" : "#fff",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                            {option.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                              Rs {option.price}
                            </span>
                            {option.oldPrice && (
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#94a3b8",
                                  textDecoration: "line-through",
                                }}
                              >
                                Rs {option.oldPrice}
                              </span>
                            )}
                          </div>
                          {option.subtitle && (
                            <div style={{ fontSize: "14px", color: "#334155" }}>{option.subtitle}</div>
                          )}
                          {option.discountText && (
                            <div style={{ fontSize: "14px", color: "#047857", fontWeight: "700" }}>
                              {option.discountText}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddServiceOptionToCart(serviceDetailsModal, option);
                              closeServiceDetailsModal();
                            }}
                            style={{
                              marginTop: "2px",
                              border: "1px solid #8b5cf6",
                              color: "#7c3aed",
                              background: "#fff",
                              borderRadius: "8px",
                              height: "34px",
                              fontSize: "16px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedServiceOption && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddServiceOptionToCart(serviceDetailsModal, selectedServiceOption);
                    closeServiceDetailsModal();
                  }}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Add selected option
                </button>
              )}

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "14px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {(serviceDetailsModal.features || []).slice(0, 4).map((feature, index) => (
                  <div
                    key={`${serviceDetailsModal.id}-feature-${index}`}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                  >
                    <span style={{ fontSize: "12px", lineHeight: "18px", color: "#475569" }}>-</span>
                    <span style={{ fontSize: "14px", color: "#475569", lineHeight: "1.35" }}>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                  Ratings
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {serviceDetailsReviewBreakdown.map((item) => (
                    <div
                      key={`${serviceDetailsModal.id}-breakdown-${item.stars}`}
                      style={{ display: "grid", gridTemplateColumns: "34px 1fr 44px", gap: "8px", alignItems: "center" }}
                    >
                      <span style={{ color: "#0f172a", fontWeight: "600", fontSize: "13px" }}>
                        * {item.stars}
                      </span>
                      <div style={{ height: "4px", borderRadius: "99px", background: "#e5e7eb", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${
                              maxReviewBreakdownCount > 0
                                ? Math.max(4, (Number(item.count) / maxReviewBreakdownCount) * 100)
                                : 0
                            }%`,
                            height: "100%",
                            background: "#111827",
                          }}
                        />
                      </div>
                      <span style={{ color: "#334155", fontSize: "13px", textAlign: "right" }}>
                        {formatCompactCount(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "22px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                  All reviews
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {serviceDetailsReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ fontSize: "17px", fontWeight: "700", color: "#020617", lineHeight: 1.2 }}>
                          {review.user}
                        </div>
                        <div
                          style={{
                            background: "#047857",
                            color: "#fff",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontWeight: "700",
                          }}
                        >
                          * {review.rating}
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {review.date} - For {serviceDetailsModal.title}
                      </div>
                      <div style={{ fontSize: "15px", color: "#0f172a", lineHeight: "1.45" }}>{review.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLeftDrawerOpen && !isMobileLayout && (
        <></>  
      )}
    </div>
  );

  // Render Subcategories View
  if (step === 'subcategories' && selectedCategory) {
    const categoryData = servicesDataSafe[selectedCategory];
    const subcategories = Object.entries(categoryData?.subcategories || {});

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '16px'
            }}
          >
            ←
          </button>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#0f172a'
          }}>
            {categoryData.label} Services
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subcategories.map(([subcat, services]) => (
              <div key={subcat} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => handleSubcategorySelect(subcat)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#0f172a',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <span>{subcat}</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {services.length} services
                  </span>
                </button>
                <button
                  onClick={() => navigate(getServicesUrlWithCurrentContext(selectedCategory, subcat))}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    border: '2px solid #2563eb',
                    color: '#2563eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  View Category
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Services View
  if (step === 'services' && selectedCategory && selectedSubcategory) {
    const categoryData = servicesDataSafe[selectedCategory];
    const services = categoryData?.subcategories?.[selectedSubcategory] || [];

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ paddingTop: '20px', marginBottom: '32px' }}>
            <button
              onClick={handleBack}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                marginBottom: '16px',
                color: '#2563eb'
              }}
            >
              ← Back
            </button>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0f172a',
              margin: '0'
            }}>
              {selectedSubcategory}
            </h1>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>
              Select a service
            </p>
          </div>

          {/* Service Cards - Detailed List View */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 85vw, 320px), 1fr))',
            gap: 'clamp(12px, 1.8vw, 16px)',
            marginBottom: 'clamp(24px, 3vw, 40px)'
          }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'clamp(10px, 1.2vw, 14px)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Service Content */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Service Image */}
                  <div style={{
                    width: '100%',
                    height: 'clamp(120px, 20vw, 140px)',
                    backgroundColor: '#e5e7eb',
                    overflow: 'hidden'
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
                        e.target.style.objectFit = 'contain';
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </div>

                  {/* Service Details */}
                  <div style={{ padding: 'clamp(10px, 1.5vw, 14px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                    {/* Title and Rating */}
                    <div>
                      <h3 style={{
                        fontSize: 'clamp(14px, 2.2vw, 16px)',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 clamp(4px, 0.8vw, 8px) 0',
                        lineHeight: '1.3'
                      }}>
                        {service.title}
                      </h3>
                      
                      {/* Rating and Reviews */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 8px)', marginBottom: 'clamp(8px, 1.2vw, 12px)' }}>
                        <span style={{ color: '#fbbf24', fontSize: 'clamp(12px, 2vw, 16px)' }}>★</span>
                        <span style={{ fontWeight: '600', color: '#0f172a', fontSize: 'clamp(12px, 2vw, 14px)' }}>
                          {service.rating}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
                          ({service.reviews})
                        </span>
                      </div>

                      {/* Price and Duration */}
                      <div style={{ marginBottom: 'clamp(8px, 1.2vw, 12px)' }}>
                        <p style={{
                          color: '#2563eb',
                          fontWeight: '700',
                          fontSize: 'clamp(13px, 2.2vw, 16px)',
                          margin: '0'
                        }}>
                          ₹{service.price}
                        </p>
                        <p style={{
                          color: '#6b7280',
                          fontSize: 'clamp(10px, 1.5vw, 12px)',
                          margin: '2px 0 0 0'
                        }}>
                          {service.duration}
                        </p>
                      </div>

                      {/* Features - Minimal */}
                      <div style={{ marginBottom: 'clamp(8px, 1.2vw, 10px)' }}>
                        {service.features && (
                          <div>
                            {service.features.slice(0, 1).map((feature, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 'clamp(4px, 0.8vw, 6px)',
                                  marginBottom: 'clamp(4px, 0.6vw, 6px)',
                                  fontSize: 'clamp(10px, 1.5vw, 12px)',
                                  color: '#374151'
                                }}
                              >
                                <span style={{ color: '#10b981', marginTop: '1px', flexShrink: 0 }}>✓</span>
                                <span style={{ lineHeight: '1.2' }}>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 12px)', marginTop: 'clamp(10px, 1.5vw, 14px)' }}>
                      {/* Quantity Selector */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #d1d5db',
                        borderRadius: 'clamp(4px, 0.6vw, 6px)',
                        backgroundColor: '#f9fafb'
                      }}>
                        <button
                          onClick={() => updateQuantity(service.id, -1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1vw, 10px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 1.8vw, 14px)',
                            color: '#6b7280'
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: 'clamp(24px, 4vw, 30px)', textAlign: 'center', fontSize: 'clamp(11px, 1.6vw, 13px)', fontWeight: '600' }}>
                          {quantities[service.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(service.id, 1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1vw, 10px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 1.8vw, 14px)',
                            color: '#6b7280'
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddToCart(service)}
                        style={{
                          flex: 1,
                          padding: 'clamp(8px, 1.2vw, 10px) clamp(12px, 1.8vw, 16px)',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'clamp(4px, 0.6vw, 6px)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: 'clamp(12px, 1.8vw, 14px)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Add to Cart
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => handleViewService(service)}
                        style={{
                          padding: 'clamp(8px, 1.2vw, 10px) clamp(12px, 1.8vw, 16px)',
                          backgroundColor: 'white',
                          border: '2px solid #2563eb',
                          color: '#2563eb',
                          borderRadius: 'clamp(4px, 0.6vw, 6px)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: 'clamp(12px, 1.8vw, 14px)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}


