import { useEffect, useMemo, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useToast } from "../../context/ToastContext";
import { SECTION_KEYS, SECTION_ITEMS, INITIAL_FORM } from "../../data/adminServicesData";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function normalizeText(value) {
  return String(value || "").trim();
}

function getServiceId(service) {
  return service?._id || service?.id;
}

function buildTaxonomyFromServices(services) {
  const categoryMap = new Map();

  for (const service of services) {
    const categoryName = normalizeText(service.category) || "Uncategorized";
    const subcategoryName = normalizeText(service.subcategory);
    const active = Boolean(service.active);

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        totalServices: 0,
        activeServices: 0,
        subMap: new Map()
      });
    }

    const categoryBucket = categoryMap.get(categoryName);
    categoryBucket.totalServices += 1;
    if (active) categoryBucket.activeServices += 1;

    if (subcategoryName) {
      if (!categoryBucket.subMap.has(subcategoryName)) {
        categoryBucket.subMap.set(subcategoryName, {
          name: subcategoryName,
          totalServices: 0,
          activeServices: 0
        });
      }
      const subBucket = categoryBucket.subMap.get(subcategoryName);
      subBucket.totalServices += 1;
      if (active) subBucket.activeServices += 1;
    }
  }

  return Array.from(categoryMap.values())
    .map((category) => ({
      name: category.name,
      totalServices: category.totalServices,
      activeServices: category.activeServices,
      active: category.activeServices > 0,
      subcategories: Array.from(category.subMap.values())
        .map((sub) => ({
          name: sub.name,
          totalServices: sub.totalServices,
          activeServices: sub.activeServices,
          active: sub.activeServices > 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminServices() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [services, setServices] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState(SECTION_KEYS.SERVICES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [focusedCategory, setFocusedCategory] = useState("");

  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const didBootstrap = useRef(false);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;
    loadData();
  });

  useEffect(() => {
    if (!taxonomy.length) {
      setFocusedCategory("");
      return;
    }

    const exists = taxonomy.some((item) => item.name === focusedCategory);
    if (!exists) {
      setFocusedCategory(taxonomy[0].name);
    }
  }, [taxonomy, focusedCategory]);

  async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("adminUser");
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }

  async function refreshTaxonomy(serviceList) {
    try {
      const taxonomyData = await apiRequest(API_ENDPOINTS.ADMIN.GET_SERVICE_TAXONOMY);
      if (Array.isArray(taxonomyData?.categories)) {
        setTaxonomy(taxonomyData.categories);
      } else {
        setTaxonomy(buildTaxonomyFromServices(serviceList));
      }
    } catch {
      setTaxonomy(buildTaxonomyFromServices(serviceList));
    }
  }

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const serviceData = await apiRequest(API_ENDPOINTS.ADMIN.GET_SERVICES);
      const safeServices = Array.isArray(serviceData) ? serviceData : [];
      setServices(safeServices);
      await refreshTaxonomy(safeServices);
    } catch (err) {
      const message = err.message || "Failed to load services";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm(prefill = {}) {
    setForm({
      ...INITIAL_FORM,
      category: prefill.category || "",
      subcategory: prefill.subcategory || ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setActiveSection(SECTION_KEYS.CREATE);
    setSelectedService(null);
  }

  function openEditForm(service) {
    setForm({
      id: getServiceId(service),
      title: normalizeText(service.title),
      category: normalizeText(service.category),
      subcategory: normalizeText(service.subcategory),
      price: service.price ?? "",
      image: normalizeText(service.image),
      active: Boolean(service.active)
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setActiveSection(SECTION_KEYS.CREATE);
    setSelectedService(null);
  }

  async function submitService(event) {
    event.preventDefault();

    const title = normalizeText(form.title);
    const category = normalizeText(form.category);
    const subcategory = normalizeText(form.subcategory);
    const image = normalizeText(form.image);
    const price = Number(form.price);

    if (!title || !category || Number.isNaN(price) || price < 0) {
      addToast("Title, category and valid price are required", "warning");
      return;
    }

    const payload = {
      title,
      category,
      subcategory: subcategory || null,
      price,
      image: image || null,
      active: Boolean(form.active)
    };

    setIsSubmitting(true);
    try {
      if (form.id) {
        const updated = await apiRequest(API_ENDPOINTS.ADMIN.UPDATE_SERVICE(form.id), {
          method: "PATCH",
          body: payload
        });

        setServices((prev) => {
          const next = prev.map((item) => (getServiceId(item) === form.id ? updated : item));
          void refreshTaxonomy(next);
          return next;
        });
        addToast("Service updated", "success");
      } else {
        const created = await apiRequest(API_ENDPOINTS.ADMIN.CREATE_SERVICE, {
          method: "POST",
          body: payload
        });

        setServices((prev) => {
          const next = [created, ...prev];
          void refreshTaxonomy(next);
          return next;
        });
        addToast("Service created", "success");
      }

      setForm(INITIAL_FORM);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setActiveSection(SECTION_KEYS.SERVICES);
    } catch (err) {
      addToast(err.message || "Failed to save service", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      addToast("Image size should be 2MB or less", "warning");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, image: String(dataUrl || "") }));
      addToast("Image attached", "success");
    } catch (err) {
      addToast(err.message || "Unable to read selected image", "error");
    }
  }

  function removeImage() {
    setForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function toggleService(service) {
    const id = getServiceId(service);
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updated = await apiRequest(API_ENDPOINTS.ADMIN.TOGGLE_SERVICE(id), {
        method: "PATCH"
      });
      setServices((prev) => {
        const next = prev.map((item) => (getServiceId(item) === id ? updated : item));
        void refreshTaxonomy(next);
        return next;
      });
      if (selectedService && getServiceId(selectedService) === id) {
        setSelectedService(updated);
      }
      addToast(updated.active ? "Service enabled" : "Service disabled", "success");
    } catch (err) {
      addToast(err.message || "Failed to update service status", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeService(service) {
    const id = getServiceId(service);
    if (!id) return;
    if (!window.confirm(`Delete service "${service.title}"?`)) return;

    setIsSubmitting(true);
    try {
      await apiRequest(API_ENDPOINTS.ADMIN.DELETE_SERVICE(id), { method: "DELETE" });
      setServices((prev) => {
        const next = prev.filter((item) => getServiceId(item) !== id);
        void refreshTaxonomy(next);
        return next;
      });
      if (selectedService && getServiceId(selectedService) === id) {
        setSelectedService(null);
      }
      addToast("Service deleted", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete service", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function renameCategory(categoryName) {
    const newName = normalizeText(window.prompt("Rename category", categoryName));
    if (!newName || newName.toLowerCase() === categoryName.toLowerCase()) return;

    setIsSubmitting(true);
    try {
      await apiRequest(API_ENDPOINTS.ADMIN.RENAME_SERVICE_CATEGORY, {
        method: "PATCH",
        body: { oldCategory: categoryName, newCategory: newName }
      });
      addToast("Category renamed", "success");
      await loadData();
    } catch (err) {
      addToast(err.message || "Failed to rename category", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleCategory(categoryItem) {
    const nextActive = !categoryItem.active;
    if (!window.confirm(`This will ${nextActive ? "enable" : "disable"} all services in ${categoryItem.name}. Continue?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(API_ENDPOINTS.ADMIN.TOGGLE_SERVICE_CATEGORY_STATUS, {
        method: "PATCH",
        body: { category: categoryItem.name, active: nextActive }
      });
      addToast(nextActive ? "Category enabled" : "Category disabled", "success");
      await loadData();
    } catch (err) {
      addToast(err.message || "Failed to update category status", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function renameSubcategory(categoryName, subcategoryName) {
    const newName = normalizeText(window.prompt("Rename subcategory", subcategoryName));
    if (!newName || newName.toLowerCase() === subcategoryName.toLowerCase()) return;

    setIsSubmitting(true);
    try {
      await apiRequest(API_ENDPOINTS.ADMIN.RENAME_SERVICE_SUBCATEGORY, {
        method: "PATCH",
        body: {
          category: categoryName,
          oldSubcategory: subcategoryName,
          newSubcategory: newName
        }
      });
      addToast("Subcategory renamed", "success");
      await loadData();
    } catch (err) {
      addToast(err.message || "Failed to rename subcategory", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleSubcategory(categoryName, subcategory) {
    const nextActive = !subcategory.active;
    if (!window.confirm(`This will ${nextActive ? "enable" : "disable"} all services in ${subcategory.name}. Continue?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(API_ENDPOINTS.ADMIN.TOGGLE_SERVICE_SUBCATEGORY_STATUS, {
        method: "PATCH",
        body: {
          category: categoryName,
          subcategory: subcategory.name,
          active: nextActive
        }
      });
      addToast(nextActive ? "Subcategory enabled" : "Subcategory disabled", "success");
      await loadData();
    } catch (err) {
      addToast(err.message || "Failed to update subcategory status", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeCategory = useMemo(
    () => taxonomy.find((item) => item.name === focusedCategory) || null,
    [taxonomy, focusedCategory]
  );

  function startAddCategory() {
    const categoryName = normalizeText(window.prompt("New category name"));
    if (!categoryName) return;
    openCreateForm({ category: categoryName });
    addToast("Save service to persist this category", "info");
  }

  function startAddSubcategory() {
    if (!activeCategory) {
      addToast("Select a category first", "warning");
      return;
    }
    const subcategoryName = normalizeText(window.prompt("New subcategory name"));
    if (!subcategoryName) return;
    openCreateForm({ category: activeCategory.name, subcategory: subcategoryName });
    addToast("Save service to persist this subcategory", "info");
  }

  const categoryNames = useMemo(() => taxonomy.map((item) => item.name), [taxonomy]);

  const allSubcategoryNames = useMemo(() => {
    const names = new Set();
    for (const categoryItem of taxonomy) {
      for (const sub of categoryItem.subcategories || []) {
        if (sub.name) names.add(sub.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [taxonomy]);

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();
    return services.filter((service) => {
      const text = `${normalizeText(service.title)} ${normalizeText(service.category)} ${normalizeText(service.subcategory)}`.toLowerCase();
      const queryMatch = !query || text.includes(query);
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && service.active) ||
        (statusFilter === "inactive" && !service.active);
      const categoryMatch =
        categoryFilter === "all" ||
        normalizeText(service.category).toLowerCase() === categoryFilter.toLowerCase();

      return queryMatch && statusMatch && categoryMatch;
    });
  }, [services, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((item) => item.active).length;
    const subcategories = taxonomy.reduce((sum, item) => sum + item.subcategories.length, 0);
    return {
      total,
      active,
      categories: taxonomy.length,
      subcategories
    };
  }, [services, taxonomy]);

  return (
    <div className="admin-page services-admin-page">
      <div className="services-admin-hero">
        <div>
          <p className="services-admin-eyebrow">Services Catalog</p>
          <h2>Services Management</h2>
          <p className="admin-subtitle">
            Clear workflow for category, subcategory, services list and add/edit service with image support
          </p>
        </div>
        <div className="services-admin-hero-actions">
          <button className="btn-sm" onClick={() => openCreateForm()} disabled={isSubmitting}>+ Add Service</button>
          <button className="btn-sm outline" onClick={loadData} disabled={loading || isSubmitting}>Refresh</button>
        </div>
      </div>

      {error ? (
        <div className="admin-alert error">
          <span>{error}</span>
          <button className="btn-retry" onClick={loadData}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="admin-kpi-grid">
        <div className="kpi-card"><span>Total Services</span><h3>{stats.total}</h3></div>
        <div className="kpi-card"><span>Active</span><h3>{stats.active}</h3></div>
        <div className="kpi-card"><span>Categories</span><h3>{stats.categories}</h3></div>
        <div className="kpi-card"><span>Subcategories</span><h3>{stats.subcategories}</h3></div>
      </div>

      <div className="services-admin-nav">
        {SECTION_ITEMS.map((section) => (
          <button
            key={section.key}
            className={`services-admin-nav-item ${activeSection === section.key ? "active" : ""}`}
            onClick={() => setActiveSection(section.key)}
            type="button"
          >
            <strong>{section.title}</strong>
            <span>{section.subtitle}</span>
          </button>
        ))}
      </div>

      {activeSection === SECTION_KEYS.CATEGORIES ? (
        <section className="admin-section">
          <div className="services-panel-header">
            <div>
              <h3>Categories ({taxonomy.length})</h3>
              <p className="text-muted">Manage top-level categories and directly create services under each category</p>
            </div>
            <button className="btn-sm outline" onClick={startAddCategory} disabled={isSubmitting}>+ Add Category</button>
          </div>

          {!taxonomy.length ? (
            <div className="admin-empty"><p>No categories yet. Create your first category with Add Category.</p></div>
          ) : (
            <div className="service-taxonomy-grid">
              {taxonomy.map((categoryItem) => (
                <article
                  key={categoryItem.name}
                  className={`service-taxonomy-card ${focusedCategory === categoryItem.name ? "focused" : ""}`}
                >
                  <div className="service-taxonomy-head">
                    <h4>{categoryItem.name}</h4>
                    <span className={`tag ${categoryItem.active ? "success" : "danger"}`}>
                      {categoryItem.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="service-taxonomy-meta">
                    {categoryItem.totalServices} services, {categoryItem.subcategories.length} subcategories
                  </p>
                  <div className="service-taxonomy-actions">
                    <button
                      className="btn-sm outline"
                      onClick={() => {
                        setFocusedCategory(categoryItem.name);
                        setActiveSection(SECTION_KEYS.SUBCATEGORIES);
                      }}
                    >
                      Subcategories
                    </button>
                    <button className="btn-sm outline" onClick={() => renameCategory(categoryItem.name)} disabled={isSubmitting}>Rename</button>
                    <button className={`btn-sm ${categoryItem.active ? "danger" : ""}`} onClick={() => toggleCategory(categoryItem)} disabled={isSubmitting}>
                      {categoryItem.active ? "Disable" : "Enable"}
                    </button>
                    <button className="btn-sm outline" onClick={() => openCreateForm({ category: categoryItem.name })}>Add Service</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeSection === SECTION_KEYS.SUBCATEGORIES ? (
        <section className="admin-section">
          <div className="services-panel-header">
            <div>
              <h3>Subcategories {activeCategory ? `(${activeCategory.name})` : ""}</h3>
              <p className="text-muted">Choose a category and manage its subcategories</p>
            </div>
            <div className="services-panel-actions">
              <select className="filter-select" value={focusedCategory} onChange={(event) => setFocusedCategory(event.target.value)}>
                {!taxonomy.length ? <option value="">No categories</option> : null}
                {categoryNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <button className="btn-sm outline" onClick={startAddSubcategory} disabled={isSubmitting || !activeCategory}>+ Add Subcategory</button>
            </div>
          </div>

          {!activeCategory ? (
            <div className="admin-empty"><p>Select a category to manage subcategories.</p></div>
          ) : !activeCategory.subcategories.length ? (
            <div className="admin-empty"><p>No subcategories under {activeCategory.name}. Add one to continue.</p></div>
          ) : (
            <div className="service-taxonomy-grid">
              {activeCategory.subcategories.map((subcategory) => (
                <article key={`${activeCategory.name}-${subcategory.name}`} className="service-taxonomy-card">
                  <div className="service-taxonomy-head">
                    <h4>{subcategory.name}</h4>
                    <span className={`tag ${subcategory.active ? "success" : "danger"}`}>
                      {subcategory.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="service-taxonomy-meta">{subcategory.totalServices} services</p>
                  <div className="service-taxonomy-actions">
                    <button className="btn-sm outline" onClick={() => renameSubcategory(activeCategory.name, subcategory.name)} disabled={isSubmitting}>Rename</button>
                    <button className={`btn-sm ${subcategory.active ? "danger" : ""}`} onClick={() => toggleSubcategory(activeCategory.name, subcategory)} disabled={isSubmitting}>
                      {subcategory.active ? "Disable" : "Enable"}
                    </button>
                    <button className="btn-sm outline" onClick={() => openCreateForm({ category: activeCategory.name, subcategory: subcategory.name })}>Add Service</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeSection === SECTION_KEYS.SERVICES ? (
        <>
          <div className="admin-filters services-filter-grid">
            <div className="filter-group">
              <label>Search</label>
              <input className="filter-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service/category/subcategory" />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categoryNames.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <button className="btn-reset" onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}>Reset</button>
          </div>

          <div className="admin-section">
            <div className="services-panel-header">
              <div>
                <h3>Service List ({filteredServices.length})</h3>
                <p className="text-muted">Integrated list used for admin moderation and quick updates</p>
              </div>
              <button className="btn-sm outline" onClick={() => openCreateForm()}>+ Add Service</button>
            </div>
            <div className="admin-table card-mobile services-table">
              <div className="table-row head services-table-row">
                <span>Service</span>
                <span>Category</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {loading ? (
                <div className="admin-loading">Loading services...</div>
              ) : !filteredServices.length ? (
                <div className="admin-empty"><p>No services found</p></div>
              ) : (
                filteredServices.map((service) => (
                  <div className="table-row services-table-row" key={getServiceId(service)}>
                    <span data-label="Service">
                      <div className="service-row-main">
                        <div className="service-thumb">
                          {service.image ? <img src={service.image} alt={service.title} loading="lazy" /> : <span>No Image</span>}
                        </div>
                        <div>
                          <strong>{service.title}</strong>
                          <small className="text-muted">{service.subcategory || "No subcategory"}</small>
                        </div>
                      </div>
                    </span>
                    <span data-label="Category"><strong>{service.category}</strong></span>
                    <span data-label="Price">Rs {Number(service.price || 0)}</span>
                    <span data-label="Status"><span className={`tag ${service.active ? "success" : "danger"}`}>{service.active ? "Active" : "Inactive"}</span></span>
                    <span data-label="Actions">
                      <div className="service-actions-wrap">
                        <button className="btn-sm outline" onClick={() => setSelectedService(service)} disabled={isSubmitting}>View</button>
                        <button className="btn-sm outline" onClick={() => openEditForm(service)} disabled={isSubmitting}>Edit</button>
                        <button className={`btn-sm ${service.active ? "danger" : ""}`} onClick={() => toggleService(service)} disabled={isSubmitting}>{service.active ? "Disable" : "Enable"}</button>
                        <button className="btn-sm danger" onClick={() => removeService(service)} disabled={isSubmitting}>Delete</button>
                      </div>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}

      {activeSection === SECTION_KEYS.CREATE ? (
        <section className="admin-section">
          <div className="services-panel-header">
            <div>
              <h3>{form.id ? "Edit Service" : "Add Service"}</h3>
              <p className="text-muted">
                Define category, subcategory, pricing and image. This feeds service listing and checkout references.
              </p>
            </div>
            {form.id ? (
              <button className="btn-sm outline" onClick={() => { setForm(INITIAL_FORM); removeImage(); }} type="button">
                Switch to New Service
              </button>
            ) : null}
          </div>

          <div className="service-form-layout">
            <form className="service-form-card" onSubmit={submitService}>
              <div className="service-form-grid">
                <div className="filter-group">
                  <label>Service title</label>
                  <input className="filter-input" placeholder="Service title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
                </div>
                <div className="filter-group">
                  <label>Category</label>
                  <input className="filter-input" list="service-categories" placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} required />
                </div>
                <div className="filter-group">
                  <label>Subcategory (optional)</label>
                  <input className="filter-input" list="service-subcategories" placeholder="Subcategory" value={form.subcategory} onChange={(e) => setForm((prev) => ({ ...prev, subcategory: e.target.value }))} />
                </div>
                <div className="filter-group">
                  <label>Price</label>
                  <input type="number" className="filter-input" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required />
                </div>
                <div className="filter-group service-form-span-all">
                  <label>Image URL</label>
                  <input className="filter-input" placeholder="https://... or /assets/..." value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} />
                </div>
                <div className="filter-group service-form-span-all">
                  <label>Upload image (max 2MB)</label>
                  <input ref={fileInputRef} type="file" className="filter-input" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="service-form-span-all">
                  <label className="service-active-toggle">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} />
                    Keep service active
                  </label>
                </div>
              </div>

              <div className="service-form-footer">
                <button className="btn-secondary" type="button" onClick={() => { setForm(INITIAL_FORM); removeImage(); }}>
                  Reset
                </button>
                <button className="btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : form.id ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>

            <aside className="service-preview-card">
              <h4>Live Preview</h4>
              <div className="service-preview-media">
                {form.image ? <img src={form.image} alt={form.title || "Service preview"} /> : <span>No image selected</span>}
              </div>
              <div className="service-preview-body">
                <p><strong>{form.title || "Service title"}</strong></p>
                <p className="text-muted">{form.category || "Category"} {form.subcategory ? ` / ${form.subcategory}` : ""}</p>
                <p>Rs {Number(form.price || 0)}</p>
                <span className={`tag ${form.active ? "success" : "danger"}`}>{form.active ? "Active" : "Inactive"}</span>
              </div>
              {form.image ? (
                <button type="button" className="btn-sm outline" onClick={removeImage}>
                  Remove Image
                </button>
              ) : null}
            </aside>
          </div>
        </section>
      ) : null}

      {selectedService ? (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Service Details</h3>
              <button className="btn-close" onClick={() => setSelectedService(null)}>x</button>
            </div>
            <div className="modal-body">
              {selectedService.image ? (
                <div className="service-modal-image">
                  <img src={selectedService.image} alt={selectedService.title} />
                </div>
              ) : null}
              <div className="details-grid">
                <div className="detail-item"><label>Title</label><p>{selectedService.title}</p></div>
                <div className="detail-item"><label>Category</label><p>{selectedService.category}</p></div>
                <div className="detail-item"><label>Subcategory</label><p>{selectedService.subcategory || "-"}</p></div>
                <div className="detail-item"><label>Price</label><p>Rs {Number(selectedService.price || 0)}</p></div>
                <div className="detail-item"><label>Status</label><p>{selectedService.active ? "Active" : "Inactive"}</p></div>
                <div className="detail-item"><label>Image</label><p>{selectedService.image ? "Configured" : "Not configured"}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedService(null)}>Close</button>
              <button className="btn-secondary" onClick={() => openEditForm(selectedService)}>Edit</button>
              <button className="btn-primary" onClick={() => toggleService(selectedService)}>{selectedService.active ? "Disable" : "Enable"}</button>
            </div>
          </div>
        </div>
      ) : null}

      <datalist id="service-categories">
        {categoryNames.map((item) => <option key={item} value={item} />)}
      </datalist>
      <datalist id="service-subcategories">
        {allSubcategoryNames.map((item) => <option key={item} value={item} />)}
      </datalist>
    </div>
  );
}
