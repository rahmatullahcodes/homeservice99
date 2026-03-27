import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import {
  ADMIN_PERMISSION_GROUPS,
  getAdminUser,
  hasAdminPermission,
  normalizeAdminPermissions,
  setAdminUser
} from "../../utils/adminAccess";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  permissions: []
};

export default function AdminAdmins() {
  const adminUser = getAdminUser();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const permissionKeys = useMemo(
    () => ADMIN_PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.key)),
    []
  );
  const permissionLabelMap = useMemo(() => {
    const map = {};
    ADMIN_PERMISSION_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        map[item.key] = item.label;
      });
    });
    return map;
  }, []);

  useEffect(() => {
    if (hasAdminPermission(adminUser, "adminTeam")) {
      fetchAdmins();
    }
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.ADMINS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ([]));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load admins");
      }

      const list = Array.isArray(payload) ? payload : [];
      setAdmins(list.map((item) => ({ ...item, permissions: normalizeAdminPermissions(item.permissions) })));
    } catch (requestError) {
      setError(requestError.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAdmin(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEditModal(admin) {
    const normalizedPermissions = normalizeAdminPermissions(admin?.permissions);

    setEditingAdmin(admin);
    setFormData({
      name: admin?.name || "",
      email: admin?.email || "",
      password: "",
      permissions: normalizedPermissions
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setIsModalOpen(false);
    setEditingAdmin(null);
    setFormData(EMPTY_FORM);
  }

  function togglePermission(key) {
    setFormData((prev) => {
      const next = new Set(prev.permissions || []);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { ...prev, permissions: Array.from(next) };
    });
  }

  function selectAllPermissions() {
    setFormData((prev) => ({ ...prev, permissions: [...permissionKeys] }));
  }

  function clearPermissions() {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  }

  async function submitForm() {
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!editingAdmin && !formData.password) {
      setError("Password is required for new sub admin.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      const isEditing = Boolean(editingAdmin?._id);
      const url = isEditing
        ? API_ENDPOINTS.ADMIN.UPDATE_ADMIN(editingAdmin._id)
        : API_ENDPOINTS.ADMIN.ADMINS;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          permissions: formData.permissions
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save admin");
      }

      const normalizedPayload = {
        ...payload,
        permissions: normalizeAdminPermissions(payload?.permissions)
      };

      if (isEditing) {
        setAdmins((prev) =>
          prev.map((item) => (item._id === editingAdmin._id ? normalizedPayload : item))
        );

        if (
          editingAdmin?._id &&
          (editingAdmin._id === adminUser?._id || editingAdmin.email === adminUser?.email)
        ) {
          setAdminUser(normalizedPayload);
        }
      } else {
        setAdmins((prev) => [normalizedPayload, ...prev]);
      }

      closeModal();
    } catch (requestError) {
      setError(requestError.message || "Failed to save admin");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAdmin(adminId) {
    if (!window.confirm("Are you sure you want to delete this sub admin?")) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.ADMIN.DELETE_ADMIN(adminId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete admin");
      }

      setAdmins((prev) => prev.filter((item) => item._id !== adminId));
    } catch (requestError) {
      setError(requestError.message || "Failed to delete admin");
    } finally {
      setSaving(false);
    }
  }

  if (!hasAdminPermission(adminUser, "adminTeam")) {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <h2>Sub Admins</h2>
          <p className="admin-subtitle">You do not have access to manage admin accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div className="admin-page-toolbar">
          <div>
            <h2>Sub Admins</h2>
            <p className="admin-subtitle">Create and manage permission-based admin accounts</p>
          </div>
          <button className="btn-sm" onClick={openCreateModal}>
            + Create Sub Admin
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-section">
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Permissions</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="admin-loading">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="admin-empty">
              <p>No admin accounts found</p>
            </div>
          ) : (
            admins.map((admin) => {
              const isSuper = admin.role === "admin";
              const permissions = Array.isArray(admin.permissions) ? admin.permissions : [];
              const permissionSummary = permissions
                .map((item) => permissionLabelMap[item] || item)
                .join(", ");
              const permissionLabel = isSuper
                ? "All modules"
                : permissions.length > 0
                ? `${permissions.length} modules`
                : "None";
              const permissionTitle = isSuper ? "All modules" : permissionSummary || "No permissions";

              return (
                <div className="table-row" key={admin._id}>
                  <span data-label="Name" style={{ fontWeight: 600 }}>{admin.name || "N/A"}</span>
                  <span data-label="Email">{admin.email || "N/A"}</span>
                  <span data-label="Role">
                    <span className={`tag ${isSuper ? "success" : "pending"}`}>
                      {isSuper ? "Super Admin" : "Sub Admin"}
                    </span>
                  </span>
                  <span data-label="Permissions" title={permissionTitle}>
                    {permissionLabel}
                  </span>
                  <span data-label="Actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {!isSuper && (
                      <>
                        <button className="btn-sm outline" onClick={() => openEditModal(admin)} disabled={saving}>
                          Edit
                        </button>
                        <button className="btn-sm danger" onClick={() => deleteAdmin(admin._id)} disabled={saving}>
                          Delete
                        </button>
                      </>
                    )}
                    {isSuper && <span style={{ color: "var(--admin-muted)" }}>Locked</span>}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAdmin ? "Edit Sub Admin" : "Create Sub Admin"}</h3>
              <button className="btn-close" onClick={closeModal} disabled={saving}>x</button>
            </div>

            <div className="modal-body">
              <div className="filter-group">
                <label>Name</label>
                <input
                  className="filter-input"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Full name"
                />
              </div>

              <div className="filter-group mt-12">
                <label>Email</label>
                <input
                  className="filter-input"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="admin@company.com"
                />
              </div>

              <div className="filter-group mt-12">
                <label>{editingAdmin ? "New Password (optional)" : "Password"}</label>
                <input
                  className="filter-input"
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="filter-group mt-16">
                <label>Module Permissions</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <button type="button" className="btn-sm outline" onClick={selectAllPermissions} disabled={saving}>
                    Select All
                  </button>
                  <button type="button" className="btn-sm outline" onClick={clearPermissions} disabled={saving}>
                    Clear
                  </button>
                </div>
              </div>

              {ADMIN_PERMISSION_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: "12px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>{group.label}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {group.items.map((item) => (
                      <label key={item.key} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={(formData.permissions || []).includes(item.key)}
                          onChange={() => togglePermission(item.key)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn-sm" onClick={submitForm} disabled={saving}>
                {saving ? "Saving..." : editingAdmin ? "Save Changes" : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
