import { useState } from "react";

export default function AdminUsers() {

  const [users, setUsers] = useState([
    { id: 1, name: "Rahul", email: "rahul@test.com", joined: "2025-01-10", status: "Active" },
    { id: 2, name: "Pooja", email: "pooja@test.com", joined: "2025-02-04", status: "Blocked" },
    { id: 3, name: "Ankit", email: "ankit@test.com", joined: "2025-03-01", status: "Active" }
  ]);

  function toggleStatus(id) {
    setUsers(users.map(u =>
      u.id === id
        ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" }
        : u
    ));
  }

  return (
    <div className="admin-users">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Users</h2>
        <p className="admin-subtitle">Manage platform users</p>
      </div>

      {/* STATS */}
      <div className="admin-kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <span>Total Users</span>
          <h3>{users.length}</h3>
        </div>
        <div className="kpi-card">
          <span>Active</span>
          <h3>{users.filter(u => u.status === "Active").length}</h3>
        </div>
        <div className="kpi-card">
          <span>Blocked</span>
          <h3>{users.filter(u => u.status === "Blocked").length}</h3>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="admin-table">

        <div className="table-row head">
          <span>Name</span>
          <span>Email</span>
          <span>Joined</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {users.map(u => (
          <div className="table-row" key={u.id}>
            <span>{u.name}</span>
            <span>{u.email}</span>
            <span>{u.joined}</span>
            <span>
              <span className={`tag ${u.status === "Active" ? "success" : "danger"}`}>
                {u.status}
              </span>
            </span>
            <span>
              <button
                className="btn-outline"
                onClick={() => toggleStatus(u.id)}
              >
                {u.status === "Active" ? "Block" : "Unblock"}
              </button>
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}
