import { useState, useEffect } from "react";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorTransactions() {
  const { loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  const token = localStorage.getItem('vendorToken');
  
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Load transactions on mount
  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [page, token, filter, sort]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");

      const url = new URL(API_ENDPOINTS.VENDOR.GET_TRANSACTIONS);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 10);
      url.searchParams.append('sort', sort);
      if (filter !== "All") {
        url.searchParams.append('type', filter);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = transactions;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (vendorLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div className="vendor-loading-spinner" />
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading vendor profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Transaction History</h2>
        <p>View all your earnings and withdrawal transactions</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px"
        }}>
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>
            All Transactions
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px"
              }}
            >
              <option value="All">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px"
              }}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div className="vendor-loading-spinner" />
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#f9fafb",
            borderRadius: "8px"
          }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0" }}>
              📭 No transactions yet
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${transaction.type === "Credit" ? "#16a34a" : "#dc2626"}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {transaction.description || transaction.source}
                  </p>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {formatDate(transaction.date)}
                    </p>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: transaction.status === "Success" ? "#dcfce7" : "#fef3c7",
                      color: transaction.status === "Success" ? "#15803d" : "#92400e"
                    }}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: transaction.type === "Credit" ? "#16a34a" : "#dc2626",
                  whiteSpace: "nowrap",
                  marginLeft: "16px"
                }}>
                  {transaction.type === "Credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "24px",
            flexWrap: "wrap"
          }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`vendor-btn ${page === p ? "primary" : "outline"} small`}
                style={{ cursor: "pointer" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
