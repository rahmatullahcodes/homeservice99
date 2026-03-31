const SERVICEABLE_LOCATION_KEYWORDS = ["delhi", "noida"];

const normalizeLocationText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export function isServiceableLocation(location) {
  const normalized = normalizeLocationText(location);
  if (!normalized) {
    return false;
  }
  return SERVICEABLE_LOCATION_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function getStoredLocation() {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem("selectedLocation") || "";
}

export function getServiceabilityMessage(location) {
  const cleaned = typeof location === "string" ? location.trim() : "";
  if (!cleaned) {
    return "Please select your location. Currently we serve Delhi & Noida only.";
  }
  return `We don't serve ${cleaned} yet. Currently we serve Delhi & Noida only. We'll be in your city soon.`;
}

export function ensureServiceableLocation(addToast, locationOverride) {
  const location = locationOverride ?? getStoredLocation();
  if (isServiceableLocation(location)) {
    return true;
  }
  if (typeof addToast === "function") {
    addToast(getServiceabilityMessage(location), "warning", 6000);
  }
  return false;
}

