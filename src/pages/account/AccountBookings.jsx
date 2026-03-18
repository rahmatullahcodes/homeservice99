import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  cancelUserBooking,
  fetchBookingInvoice,
  fetchUserBookings
} from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountBookings() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [busyBookingId, setBusyBookingId] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchUserBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.message || "Failed to load bookings";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filter === "All") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const statusCount = useMemo(() => {
    const counts = {
      Pending: 0,
      Scheduled: 0,
      InProgress: 0,
      Completed: 0,
      Cancelled: 0
    };

    bookings.forEach((booking) => {
      const key = booking.status;
      if (counts[key] !== undefined) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [bookings]);

  function getServiceRoute(booking) {
    const id = typeof booking?.serviceId === "string"
      ? booking.serviceId
      : booking?.serviceId?._id;
    return id ? `/services/${id}` : "/services";
  }

  function formatDate(booking) {
    const value = booking.scheduledAt || booking.createdAt;
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  function getPaymentLabel(booking) {
    const gateway = booking.paymentGateway || (booking.paymentMethod === "cod" ? "Cash on Delivery" : "Online");
    const status = booking.paymentStatus || "Pending";
    return `${gateway} - ${status}`;
  }

  async function handleCancelBooking(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      setBusyBookingId(bookingId);
      const response = await cancelUserBooking(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: response.booking?.status || "Cancelled" }
            : booking
        )
      );

      if (activeBooking?._id === bookingId) {
        setActiveBooking((prev) => ({ ...prev, status: "Cancelled" }));
      }

      addToast("Booking cancelled", "success");
    } catch (err) {
      addToast(err.message || "Failed to cancel booking", "error");
    } finally {
      setBusyBookingId("");
    }
  }

  async function handleDownloadInvoice(bookingId) {
    try {
      setBusyBookingId(bookingId);
      const invoice = await fetchBookingInvoice(bookingId);

      const lines = [
        "HOME SERVICE 99 - INVOICE",
        "",
        `Invoice Number: ${invoice.invoiceNumber}`,
        `Booking ID: ${invoice.bookingId}`,
        `Service: ${invoice.service}`,
        `Category: ${invoice.category}`,
        `Amount: Rs ${Number(invoice.amount || 0).toLocaleString()}`,
        `Status: ${invoice.status}`,
        `Scheduled At: ${invoice.scheduledAt ? new Date(invoice.scheduledAt).toLocaleString() : "-"}`,
        `Created At: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : "-"}`,
        "",
        `Customer: ${invoice.customer?.name || "-"}`,
        `Customer Email: ${invoice.customer?.email || "-"}`,
        `Vendor: ${invoice.vendor?.name || "-"}`
      ];

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber || "invoice"}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      addToast("Invoice downloaded", "success");
    } catch (err) {
      addToast(err.message || "Failed to download invoice", "error");
    } finally {
      setBusyBookingId("");
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
        <div>
          <h2 className="dashboard-title">My Bookings</h2>
          <p className="dashboard-subtitle">Manage and track your service history</p>
        </div>
        <button className="account-btn primary" onClick={() => navigate("/services")}>
          Book New Service
        </button>
      </div>

      {error && <div className="account-alert danger">{error}</div>}

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">TT</div>
          <div>
            <p className="dash-label">Total Bookings</p>
            <h3>{bookings.length}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>

        <div className="dash-card green">
          <div className="dash-icon">OK</div>
          <div>
            <p className="dash-label">Scheduled</p>
            <h3>{statusCount.Scheduled + statusCount.InProgress}</h3>
            <span className="dash-trend">Upcoming and running</span>
          </div>
        </div>

        <div className="dash-card purple">
          <div className="dash-icon">CM</div>
          <div>
            <p className="dash-label">Completed</p>
            <h3>{statusCount.Completed}</h3>
            <span className="dash-trend">Service finished</span>
          </div>
        </div>

        <div className="dash-card yellow">
          <div className="dash-icon">CN</div>
          <div>
            <p className="dash-label">Cancelled</p>
            <h3>{statusCount.Cancelled}</h3>
            <span className="dash-trend">Not completed</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["All", "Pending", "Scheduled", "InProgress", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            className={`account-btn ${filter === tab ? "primary" : "secondary"}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="account-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="account-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>No bookings found</p>
          <button
            className="account-btn primary"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/services")}
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="account-card" style={{ overflow: "hidden" }}>
          <table className="account-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date and Time</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td><strong>{booking.service || "Service"}</strong></td>
                  <td>{formatDate(booking)}</td>
                  <td>Rs {Number(booking.price || 0).toLocaleString()}</td>
                  <td>{getPaymentLabel(booking)}</td>
                  <td>
                    <span className={`account-badge ${booking.status === "Completed" ? "green" : booking.status === "Cancelled" ? "red" : "blue"}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        className="account-btn primary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => setActiveBooking(booking)}
                      >
                        View
                      </button>
                      <button
                        className="account-btn secondary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => navigate(getServiceRoute(booking))}
                      >
                        Service
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeBooking && (
        <div className="account-modal-overlay" onClick={() => setActiveBooking(null)}>
          <div className="account-modal" onClick={(event) => event.stopPropagation()}>
            <div className="account-modal-header">
              <h2>{activeBooking.service || "Service"}</h2>
              <button className="account-modal-close" onClick={() => setActiveBooking(null)}>X</button>
            </div>

            <div className="account-modal-body">
              <div className="account-form-group">
                <label><strong>Booking Details</strong></label>
              </div>
              <p><strong>Date and Time:</strong> {formatDate(activeBooking)}</p>
              <p><strong>Amount:</strong> Rs {Number(activeBooking.price || 0).toLocaleString()}</p>
              <p><strong>Category:</strong> {activeBooking.serviceCategory || "General"}</p>
              <p><strong>Payment Method:</strong> {activeBooking.paymentGateway || (activeBooking.paymentMethod === "cod" ? "Cash on Delivery" : "Online")}</p>
              <p><strong>Payment Status:</strong> {activeBooking.paymentStatus || "Pending"}</p>
              {activeBooking.paymentId && (
                <p><strong>Transaction ID:</strong> {activeBooking.paymentId}</p>
              )}
              <p>
                <strong>Status:</strong>{" "}
                <span className={`account-badge ${activeBooking.status === "Completed" ? "green" : activeBooking.status === "Cancelled" ? "red" : "blue"}`}>
                  {activeBooking.status}
                </span>
              </p>
            </div>

            <div className="account-modal-footer">
              {(activeBooking.status === "Pending" || activeBooking.status === "Scheduled") && (
                <button
                  className="account-btn danger"
                  disabled={busyBookingId === activeBooking._id}
                  onClick={() => handleCancelBooking(activeBooking._id)}
                >
                  {busyBookingId === activeBooking._id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}

              <button
                className="account-btn secondary"
                disabled={busyBookingId === activeBooking._id}
                onClick={() => handleDownloadInvoice(activeBooking._id)}
              >
                {busyBookingId === activeBooking._id ? "Please wait..." : "Download Invoice"}
              </button>

              <button className="account-btn primary" onClick={() => navigate(getServiceRoute(activeBooking))}>
                View Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
