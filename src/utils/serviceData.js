export const coerceServicesList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.services)) {
    return payload.services;
  }

  if (Array.isArray(payload?.data?.services)) {
    return payload.data.services;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const normalizeServiceRecord = (service = {}) => {
  const resolvedId = service.id || service._id || "";
  const category = typeof service.category === "string" ? service.category.trim() : "";
  const subcategory = typeof service.subcategory === "string" ? service.subcategory.trim() : "";
  const title = typeof service.title === "string" ? service.title.trim() : "";

  return {
    ...service,
    id: resolvedId || title || "service",
    category: category || "Other",
    subcategory: subcategory || "General",
    title: title || "Service",
    price: Number(service.price) || 0,
    rating: Number(service.rating) || 0,
    reviews: Number(service.reviews) || 0,
    duration: service.duration || "-",
    image: service.image || "",
    features: Array.isArray(service.features)
      ? service.features.filter(Boolean)
      : [],
    badge: service.badge || null,
    options: Number(service.options) || 0,
  };
};
