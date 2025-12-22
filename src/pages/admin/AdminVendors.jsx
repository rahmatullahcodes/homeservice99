import { useState } from "react";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([
    { id: 1, name: "AC Experts", city: "Delhi", status: "Active", service: "AC Repair" },
    { id: 2, name: "CleanPro", city: "Kanpur", status: "Pending", service: "Cleaning" }
  ]);

  const [selected, setSelected] = useState(null);

  function updateStatus(id, status) {
    setVendors(vendors.map(v =>
      v.id === id ? { ...v, status } : v
    ));
  }

  return (
    <div className="admin-page">

      <h2>Vendors</h2>
      <p className="admin-subtitle">Manage partner approvals and status</p>

      <div className="admin-list">
        {vendors.map(v => (
          <div className="detail-box" key={v.id}>

            <div className="vendor-row">
              <div>
                <strong>{v.name}</strong>
                <p>{v.city} • {v.service}</p>
                <span className={`tag ${v.status.toLowerCase()}`}>
                  {v.status}
                </span>
              </div>

              <div className="vendor-actions">
                <button
                  className="btn-outline"
                  onClick={() => setSelected(v)}
                >
                  View
                </button>

                {v.status === "Pending" && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => updateStatus(v.id, "Active")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => updateStatus(v.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Vendor Details</h3>

            <p><strong>Name:</strong> {selected.name}</p>
            <p><strong>City:</strong> {selected.city}</p>
            <p><strong>Service:</strong> {selected.service}</p>
            <p><strong>Status:</strong> {selected.status}</p>

            <button className="btn-outline" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
