import { normalizeCategoryKey } from "./serviceRouting";

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeText = (value) => String(value || "").trim();

export const sortByFeaturedScore = (a, b) => {
  const ratingDiff = (Number(b?.rating) || 0) - (Number(a?.rating) || 0);
  if (ratingDiff !== 0) return ratingDiff;

  const reviewsDiff = (Number(b?.reviews) || 0) - (Number(a?.reviews) || 0);
  if (reviewsDiff !== 0) return reviewsDiff;

  const dateDiff =
    new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
  if (Number.isFinite(dateDiff) && dateDiff !== 0) return dateDiff;

  return (Number(b?.price) || 0) - (Number(a?.price) || 0);
};

export const normalizeService = (raw = {}) => {
  const fallbackIdSource = `${normalizeText(raw.category)}-${normalizeText(
    raw.subcategory
  )}-${normalizeText(raw.title)}`;
  const fallbackId = fallbackIdSource
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "service";

  const id = raw.id || raw._id || raw.serviceId || raw.slug || raw.title || fallbackId;

  const category = normalizeText(raw.category) || "Other";
  const subcategory = normalizeText(raw.subcategory) || "General";

  return {
    ...raw,
    id: String(id),
    title: normalizeText(raw.title) || "Service",
    category,
    subcategory,
    price: toNumber(raw.price, 0),
    oldPrice: raw.oldPrice !== undefined && raw.oldPrice !== null ? toNumber(raw.oldPrice, 0) : null,
    rating: toNumber(raw.rating, 0),
    reviews: toNumber(raw.reviews, 0),
    options: raw.options !== undefined && raw.options !== null ? toNumber(raw.options, 0) : raw.options,
    image: raw.image || raw.imageUrl || raw.thumbnail || "",
    features: Array.isArray(raw.features)
      ? raw.features
      : raw.features
      ? [String(raw.features)]
      : [],
  };
};

const createEmptyServicesShell = (baseData = {}) => {
  const shell = {};
  Object.entries(baseData || {}).forEach(([category, data]) => {
    shell[category] = {
      icon: data?.icon || "",
      label: data?.label || category,
      subcategories: {},
    };
    Object.keys(data?.subcategories || {}).forEach((subcategory) => {
      shell[category].subcategories[subcategory] = [];
    });
  });
  return shell;
};

const resolveCategoryKey = (rawCategory, categoryAliases = {}) => {
  const normalized = normalizeCategoryKey(rawCategory) || normalizeText(rawCategory);
  const fallback = normalized || "Other";
  const aliasKey = normalizeText(fallback).toLowerCase();
  return categoryAliases[aliasKey] || fallback;
};

export const buildServicesDataFromList = (
  rawServices = [],
  {
    categoryMeta = {},
    categoryOrder = [],
    categoryAliases = {},
    baseData = null,
    allowUnknownCategories = baseData ? false : true,
  } = {}
) => {
  const services = Array.isArray(rawServices)
    ? rawServices.map(normalizeService)
    : [];
  const data = baseData ? createEmptyServicesShell(baseData) : {};
  const hasBase = Boolean(baseData);

  const ensureCategory = (category) => {
    if (!data[category]) {
      if (hasBase && !allowUnknownCategories) {
        return false;
      }
      data[category] = {
        icon: categoryMeta[category]?.icon || "",
        label: categoryMeta[category]?.label || category,
        subcategories: {},
      };
    }
    return true;
  };

  services.forEach((service) => {
    const category = resolveCategoryKey(service.category, categoryAliases);
    const subcategory = normalizeText(service.subcategory) || "General";

    if (!ensureCategory(category)) {
      return;
    }

    const normalizedService =
      service.category === category ? service : { ...service, category };

    if (!data[category].subcategories[subcategory]) {
      data[category].subcategories[subcategory] = [];
    }
    data[category].subcategories[subcategory].push(normalizedService);
  });

  Object.values(data).forEach((category) => {
    Object.values(category.subcategories || {}).forEach((list) => {
      list.sort(sortByFeaturedScore);
    });
  });

  const orderedData = {};
  if (Array.isArray(categoryOrder) && categoryOrder.length > 0) {
    categoryOrder.forEach((category) => {
      if (data[category]) {
        orderedData[category] = data[category];
      }
    });
  }

  Object.keys(data).forEach((category) => {
    if (!orderedData[category]) {
      orderedData[category] = data[category];
    }
  });

  return { data: orderedData, services };
};

export const flattenServicesByCategory = (servicesData = {}) => {
  const map = {};
  Object.entries(servicesData || {}).forEach(([category, categoryData]) => {
    const services = Object.values(categoryData?.subcategories || {}).flat();
    map[category] = services;
  });
  return map;
};

export const pickFeaturedServices = (services = [], limit = 6) => {
  if (!Array.isArray(services) || services.length === 0) return [];
  return [...services].sort(sortByFeaturedScore).slice(0, limit);
};

export const pickServicesByKeywords = (services = [], keywords = [], limit = 5) => {
  const list = Array.isArray(services) ? services : [];
  if (list.length === 0) return [];

  const normalizedKeywords = (keywords || [])
    .map((keyword) => normalizeText(keyword).toLowerCase())
    .filter(Boolean);

  const matches =
    normalizedKeywords.length === 0
      ? list
      : list.filter((service) => {
          const haystack = `${service.title} ${service.subcategory} ${service.category}`
            .toLowerCase()
            .trim();
          return normalizedKeywords.some((keyword) => haystack.includes(keyword));
        });

  const result = [];
  const seen = new Set();
  const addItems = (items) => {
    for (const service of items) {
      const key = service.id || service._id || service.title;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(service);
      if (result.length >= limit) break;
    }
  };

  addItems(matches);
  if (result.length < limit) {
    addItems(list);
  }

  return result.slice(0, limit);
};
