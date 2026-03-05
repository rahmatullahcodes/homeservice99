const CATEGORY_ALIASES = {
  appliance: "Appliances",
  appliances: "Appliances",
  applianches: "Appliances",
};

export function normalizeCategoryKey(category) {
  if (!category || typeof category !== "string") {
    return null;
  }

  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    return null;
  }

  const normalizedAlias = CATEGORY_ALIASES[trimmedCategory.toLowerCase()];
  return normalizedAlias || trimmedCategory;
}

export function buildServicesUrl(category, subcategory, extraParams = {}) {
  const params = new URLSearchParams();
  const normalizedCategory = normalizeCategoryKey(category);

  if (normalizedCategory) {
    params.set("category", normalizedCategory);
  }

  if (subcategory) {
    params.set("subcategory", subcategory);
  }

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `/services?${query}` : "/services";
}

export function parseServicesParams(locationSearch = "", routeParams = {}) {
  const params = new URLSearchParams(locationSearch || "");

  const rawCategory = params.get("category") || routeParams.category || null;
  const category = normalizeCategoryKey(rawCategory);
  const subcategory = params.get("subcategory") || null;

  return { category, subcategory };
}

export function isValidCategory(category, servicesData) {
  if (!servicesData || typeof servicesData !== "object") {
    return false;
  }

  const normalizedCategory = normalizeCategoryKey(category);
  if (!normalizedCategory) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(servicesData, normalizedCategory);
}
