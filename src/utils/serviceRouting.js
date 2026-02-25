export function buildServicesUrl(category, subcategory, extraParams = {}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
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

  const category = params.get("category") || routeParams.category || null;
  const subcategory = params.get("subcategory") || null;

  return { category, subcategory };
}

export function isValidCategory(category, servicesData) {
  if (!category || !servicesData || typeof servicesData !== "object") {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(servicesData, category);
}
