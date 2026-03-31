import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  addUserAddress,
  deleteUserAddress,
  fetchUserAddresses,
  setUserDefaultAddress,
  updateUserAddress
} from "../../utils/accountApi";
import "../../styles/account.css";
import { ACCOUNT_ADDRESS_EMPTY_FORM } from "../../data/accountFormsData";

export default function AccountAddresses() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState(ACCOUNT_ADDRESS_EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const data = await fetchUserAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.message || "Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const nextErrors = {};
    if (!formData.street.trim()) nextErrors.street = "Street is required";
    if (!formData.city.trim()) nextErrors.city = "City is required";
    if (!formData.state.trim()) nextErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      nextErrors.pincode = "Pincode is required";
    } else if (!/^\d{5,6}$/.test(formData.pincode)) {
      nextErrors.pincode = "Invalid pincode";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveAddress() {
    if (!validateForm()) {
      addToast("Please fix the errors", "warning");
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        const result = await updateUserAddress(editId, formData);
        setAddresses(result.addresses || []);
        addToast("Address updated", "success");
      } else {
        const result = await addUserAddress(formData);
        setAddresses(result.addresses || []);
        addToast("Address added", "success");
      }

      resetForm();
    } catch (err) {
      addToast(err.message || "Failed to save address", "error");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditId("");
    setFormData(ACCOUNT_ADDRESS_EMPTY_FORM);
    setErrors({});
  }

  function startEdit(address) {
    setEditId(address._id);
    setFormData({
      type: address.type || "Home",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || ""
    });
    setShowForm(true);
  }

  async function handleDelete(addressId) {
    if (!window.confirm("Delete this address?")) return;

    try {
      const result = await deleteUserAddress(addressId);
      setAddresses(result.addresses || []);
      addToast("Address deleted", "success");
      if (editId === addressId) resetForm();
    } catch (err) {
      addToast(err.message || "Failed to delete address", "error");
    }
  }

  async function handleSetDefault(addressId) {
    try {
      const result = await setUserDefaultAddress(addressId);
      setAddresses(result.addresses || []);
      addToast("Default address updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to set default address", "error");
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Saved Addresses</h2>
      <p className="dashboard-subtitle">Manage your home and work addresses</p>

      {loading ? (
        <div className="account-alert info">Loading addresses...</div>
      ) : (
        <div className="account-grid-2" style={{ marginBottom: "32px" }}>
          {addresses.map((address) => (
            <div key={address._id} className="account-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span className={`account-badge ${address.type === "Home" ? "blue" : address.type === "Work" ? "green" : "purple"}`}>
                  {address.type || "Other"}
                </span>
                {address.isDefault && <span className="account-badge blue">Default</span>}
              </div>
              <p style={{ margin: "8px 0", color: "#6b7280" }}>
                {address.street}<br />
                {address.city}, {address.state} {address.pincode}
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button className="account-btn primary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => startEdit(address)}>
                  Edit
                </button>
                <button className="account-btn secondary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSetDefault(address._id)}>
                  Set Default
                </button>
                <button className="account-btn danger" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleDelete(address._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {addresses.length === 0 && <div className="account-alert info">No addresses saved yet.</div>}
        </div>
      )}

      {showForm && (
        <div className="account-card" style={{ marginBottom: "32px" }}>
          <h3 style={{ marginBottom: "16px" }}>{editId ? "Edit Address" : "Add New Address"}</h3>

          <div className="account-form-group">
            <label>Address Type</label>
            <select
              value={formData.type}
              onChange={(event) => setFormData({ ...formData, type: event.target.value })}
              className="account-form-input"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>

          <div className="account-form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.street}
              onChange={(event) => setFormData({ ...formData, street: event.target.value })}
              placeholder="House no, street name"
              className="account-form-input"
            />
            {errors.street && <span className="form-error">{errors.street}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="account-form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                placeholder="City"
                className="account-form-input"
              />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>

            <div className="account-form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                placeholder="State"
                className="account-form-input"
              />
              {errors.state && <span className="form-error">{errors.state}</span>}
            </div>
          </div>

          <div className="account-form-group">
            <label>Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(event) => setFormData({ ...formData, pincode: event.target.value })}
              placeholder="Postal code"
              className="account-form-input"
            />
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="account-btn primary" onClick={saveAddress} disabled={saving}>
              {saving ? "Saving..." : editId ? "Update Address" : "Add Address"}
            </button>
            <button className="account-btn secondary" onClick={resetForm} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="account-btn primary" onClick={() => setShowForm(true)} style={{ marginBottom: "32px" }}>
          Add New Address
        </button>
      )}
    </div>
  );
}
