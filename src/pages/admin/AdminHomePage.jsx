import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useToast } from "../../context/ToastContext";
import { DEFAULT_HOME_PAGE_SETTINGS, SECTION_LABELS, CURATED_LABELS } from "../../data/adminHomePageData";

const SECTION_KEYS = SECTION_LABELS.map((item) => item.key);
const SECTION_LABEL_MAP = SECTION_LABELS.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

const HOME_PAGE_CACHE_KEY = "hs99_home_page_settings";

async function parseJson(response) {
  return response.json().catch(() => ({}));
}

function normalizeSectionOrder(order, fallback = SECTION_KEYS) {
  const base = Array.isArray(fallback) && fallback.length ? fallback : SECTION_KEYS;
  const incoming = Array.isArray(order) ? order : [];
  const filtered = incoming.filter((key) => base.includes(key));
  const missing = base.filter((key) => !filtered.includes(key));
  return [...filtered, ...missing];
}

function buildMergedHomePageForm(homePage = {}) {
  return {
    ...DEFAULT_HOME_PAGE_SETTINGS,
    ...(homePage || {}),
    heroStats: {
      ...DEFAULT_HOME_PAGE_SETTINGS.heroStats,
      ...(homePage?.heroStats || {})
    },
    sections: {
      ...DEFAULT_HOME_PAGE_SETTINGS.sections,
      ...(homePage?.sections || {})
    },
    sectionOrder: normalizeSectionOrder(
      homePage?.sectionOrder,
      DEFAULT_HOME_PAGE_SETTINGS.sectionOrder || SECTION_KEYS
    ),
    curatedSectionVisibility: {
      ...DEFAULT_HOME_PAGE_SETTINGS.curatedSectionVisibility,
      ...(homePage?.curatedSectionVisibility || {})
    }
  };
}

function saveHomePageCache(homePage) {
  try {
    localStorage.setItem(HOME_PAGE_CACHE_KEY, JSON.stringify(buildMergedHomePageForm(homePage)));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hs99-homepage-settings-updated"));
    }
  } catch {
    // Ignore storage failures
  }
}

function loadHomePageCache() {
  try {
    const raw = localStorage.getItem(HOME_PAGE_CACHE_KEY);
    if (!raw) return null;
    return buildMergedHomePageForm(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function requestHomePageWithFallback({ token, method = "GET", payload = null }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const candidates = method === "PATCH"
    ? [
        {
          endpoint: API_ENDPOINTS.HOME_PAGE.ADMIN_UPDATE,
          payload
        },
        {
          endpoint: API_ENDPOINTS.HOME_PAGE.ADMIN_UPDATE_FALLBACK,
          payload
        },
        {
          endpoint: API_ENDPOINTS.SETTINGS.UPDATE,
          payload: { homePage: payload?.homePage || payload || {} },
          normalize: (data) => ({
            homePage: data?.homePage || data?.data?.homePage || payload?.homePage || {}
          })
        }
      ]
    : [
        {
          endpoint: API_ENDPOINTS.HOME_PAGE.ADMIN_GET
        },
        {
          endpoint: API_ENDPOINTS.HOME_PAGE.ADMIN_GET_FALLBACK
        },
        {
          endpoint: API_ENDPOINTS.SETTINGS.GET_ALL,
          normalize: (data) => ({
            homePage: data?.homePage || data?.data?.homePage || {}
          })
        }
      ];

  for (const candidate of candidates) {
    const response = await fetch(candidate.endpoint, {
      method,
      headers,
      ...(candidate.payload ? { body: JSON.stringify(candidate.payload) } : {})
    });
    const data = await parseJson(response);
    if (response.ok) {
      return candidate.normalize ? candidate.normalize(data) : data;
    }
    if (response.status !== 404) {
      throw new Error(data.message || `Failed to ${method === "PATCH" ? "save" : "fetch"} settings (${response.status})`);
    }
  }

  throw new Error("Home page settings endpoint not found on server");
}

export default function AdminHomePage() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_HOME_PAGE_SETTINGS);

  useEffect(() => {
    void fetchHomePageSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHomePageSettings() {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required");
      }

      const data = await requestHomePageWithFallback({ token, method: "GET" });
      const merged = buildMergedHomePageForm(data.homePage);
      setForm(merged);
      saveHomePageCache(merged);
    } catch (error) {
      const cached = loadHomePageCache();
      if (cached) {
        setForm(cached);
        addToast("Loaded cached home page settings", "warning");
      } else {
        addToast(error.message || "Failed to load home page settings", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  function updateTextField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHeroStat(key, value) {
    setForm((prev) => ({
      ...prev,
      heroStats: {
        ...prev.heroStats,
        [key]: value
      }
    }));
  }

  function updateSectionToggle(key, value) {
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: value
      }
    }));
  }

  function moveSection(key, direction) {
    setForm((prev) => {
      const order = normalizeSectionOrder(
        prev.sectionOrder,
        DEFAULT_HOME_PAGE_SETTINGS.sectionOrder || SECTION_KEYS
      );
      const index = order.indexOf(key);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
        return prev;
      }
      const nextOrder = [...order];
      [nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]];
      return {
        ...prev,
        sectionOrder: nextOrder
      };
    });
  }

  function updateCuratedToggle(key, value) {
    setForm((prev) => ({
      ...prev,
      curatedSectionVisibility: {
        ...prev.curatedSectionVisibility,
        [key]: value
      }
    }));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required");
      }

      const data = await requestHomePageWithFallback({
        token,
        method: "PATCH",
        payload: { homePage: form }
      });

      addToast("Home page settings updated", "success");
      const merged = buildMergedHomePageForm(data.homePage || form);
      setForm(merged);
      saveHomePageCache(merged);
    } catch (error) {
      addToast(error.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h2>Home Page Management</h2>
        <p className="admin-subtitle">Edit labels and hide/show homepage sections from admin panel</p>
      </div>

      {loading ? (
        <div className="admin-loading">Loading home page settings...</div>
      ) : (
        <>
          <div className="detail-box">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Content Labels</h3>
            <div className="form-row">
              <input
                className="admin-input"
                placeholder="Hero title"
                value={form.heroTitle}
                onChange={(event) => updateTextField("heroTitle", event.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Discovery title"
                value={form.discoveryTitle}
                onChange={(event) => updateTextField("discoveryTitle", event.target.value)}
              />
            </div>
            <div className="form-row mt-12">
              <input
                className="admin-input"
                placeholder="Popular services heading"
                value={form.popularServicesTitle}
                onChange={(event) => updateTextField("popularServicesTitle", event.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Get quote heading"
                value={form.getQuoteTitle}
                onChange={(event) => updateTextField("getQuoteTitle", event.target.value)}
              />
            </div>
            <div className="form-row mt-12">
              <input
                className="admin-input"
                placeholder="Offers heading"
                value={form.offersDiscountsTitle}
                onChange={(event) => updateTextField("offersDiscountsTitle", event.target.value)}
              />
            </div>
          </div>

          <div className="detail-box mt-24">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Hero Metrics</h3>
            <div className="form-row">
              <input
                className="admin-input"
                placeholder="Bookings completed text"
                value={form.heroStats.bookingsCompleted}
                onChange={(event) => updateHeroStat("bookingsCompleted", event.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Average rating text"
                value={form.heroStats.averageRating}
                onChange={(event) => updateHeroStat("averageRating", event.target.value)}
              />
            </div>
            <div className="form-row mt-12">
              <input
                className="admin-input"
                placeholder="Response time text"
                value={form.heroStats.responseTime}
                onChange={(event) => updateHeroStat("responseTime", event.target.value)}
              />
            </div>
          </div>

          <div className="detail-box mt-24">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Visibility Controls</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {normalizeSectionOrder(
                form.sectionOrder,
                DEFAULT_HOME_PAGE_SETTINGS.sectionOrder || SECTION_KEYS
              ).map((key, index, list) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    background: "#fff"
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(form.sections[key])}
                      onChange={(event) => updateSectionToggle(key, event.target.checked)}
                    />
                    {SECTION_LABEL_MAP[key] || key}
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn-sm outline"
                      onClick={() => moveSection(key, -1)}
                      disabled={index === 0}
                      aria-label="Move section up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-sm outline"
                      onClick={() => moveSection(key, 1)}
                      disabled={index === list.length - 1}
                      aria-label="Move section down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-box mt-24">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Curated Section Visibility</h3>
            <p className="text-muted" style={{ marginTop: 0, marginBottom: 12 }}>
              These toggles apply inside curated service rows.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {CURATED_LABELS.map((item) => (
                <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(form.curatedSectionVisibility[item.key])}
                    onChange={(event) => updateCuratedToggle(item.key, event.target.checked)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="payment-method-actions">
            <button className="btn-sm outline" onClick={fetchHomePageSettings} disabled={saving}>
              Reset Changes
            </button>
            <button className="btn-sm" onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Home Page Settings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
