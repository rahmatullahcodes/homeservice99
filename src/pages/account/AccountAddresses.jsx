import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/account.css";

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('userAddresses');
    return saved ? JSON.parse(saved) : [{ id: 1, type: 'Home', street: '123 Main St', city: 'New York', state: 'NY', pincode: '10001', isDefault: true }];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ type: 'Home', street: '', city: '', state: '', pincode: '' });
  const [errors, setErrors] = useState({});
  
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.street.trim()) newErrors.street = 'Street is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!/^\d{5,6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function saveAddress() {
    if (!validateForm()) {
      addToast('Please fix the errors', 'error');
      return;
    }

    let updatedAddresses;
    if (editId) {
      updatedAddresses = addresses.map(a => a.id === editId ? { ...a, ...formData } : a);
      addToast('Address updated', 'success');
    } else {
      updatedAddresses = [...addresses, { id: Date.now(), ...formData }];
      addToast('Address added', 'success');
    }

    setAddresses(updatedAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    resetForm();
  }

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setFormData({ type: 'Home', street: '', city: '', state: '', pincode: '' });
    setErrors({});
  }

  function editAddress(id) {
    const addr = addresses.find(a => a.id === id);
    setFormData(addr);
    setEditId(id);
    setShowForm(true);
  }

  function deleteAddress(id) {
    if (confirm('Delete this address?')) {
      const updated = addresses.filter(a => a.id !== id);
      setAddresses(updated);
      localStorage.setItem('userAddresses', JSON.stringify(updated));
      addToast('Address deleted', 'success');
    }
  }

  function setDefault(id) {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
    addToast('Default address updated', 'success');
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Saved Addresses</h2>
      <p className="dashboard-subtitle">Manage your home and work addresses</p>

      {/* ADDRESS CARDS */}
      <div className="account-grid-2" style={{ marginBottom: "32px" }}>
        {addresses.map(addr => (
          <div key={addr.id} className="account-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className={`account-badge ${addr.type === 'Home' ? 'blue' : addr.type === 'Work' ? 'green' : 'purple'}`}>
                {addr.type}
              </span>
              {addr.isDefault && <span className="account-badge blue">Default</span>}
            </div>
            <p style={{ margin: '8px 0', color: '#6b7280' }}>
              {addr.street}<br/>
              {addr.city}, {addr.state} {addr.pincode}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="account-btn primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => editAddress(addr.id)}>Edit</button>
              <button className="account-btn secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setDefault(addr.id)}>Set Default</button>
              <button className="account-btn danger" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => deleteAddress(addr.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT ADDRESS FORM */}
      {showForm && (
        <div className="account-card" style={{ marginBottom: "32px" }}>
          <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Address' : 'Add New Address'}</h3>
          
          <div className="account-form-group">
            <label>Address Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="account-form-input">
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>

          <div className="account-form-group">
            <label>Street Address <span style={{ color: 'var(--account-danger)' }}>*</span></label>
            <input 
              type="text" 
              value={formData.street} 
              onChange={e => { setFormData({...formData, street: e.target.value}); if (errors.street) setErrors({...errors, street: ''}) }}
              placeholder="House no, street name"
              className="account-form-input"
            />
            {errors.street && <span className="form-error">{errors.street}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="account-form-group">
              <label>City <span style={{ color: 'var(--account-danger)' }}>*</span></label>
              <input 
                type="text" 
                value={formData.city} 
                onChange={e => { setFormData({...formData, city: e.target.value}); if (errors.city) setErrors({...errors, city: ''}) }}
                placeholder="City"
                className="account-form-input"
              />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>

            <div className="account-form-group">
              <label>State <span style={{ color: 'var(--account-danger)' }}>*</span></label>
              <input 
                type="text" 
                value={formData.state} 
                onChange={e => { setFormData({...formData, state: e.target.value}); if (errors.state) setErrors({...errors, state: ''}) }}
                placeholder="State"
                className="account-form-input"
              />
              {errors.state && <span className="form-error">{errors.state}</span>}
            </div>
          </div>

          <div className="account-form-group">
            <label>Pincode <span style={{ color: 'var(--account-danger)' }}>*</span></label>
            <input 
              type="text" 
              value={formData.pincode} 
              onChange={e => { setFormData({...formData, pincode: e.target.value}); if (errors.pincode) setErrors({...errors, pincode: ''}) }}
              placeholder="Postal code"
              className="account-form-input"
            />
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="account-btn primary" onClick={saveAddress}>
              {editId ? '✏️ Update Address' : '➕ Add Address'}
            </button>
            <button className="account-btn secondary" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="account-btn primary" onClick={() => setShowForm(true)} style={{ marginBottom: "32px" }}>
          ➕ Add New Address
        </button>
      )}
    </div>
  );
}
