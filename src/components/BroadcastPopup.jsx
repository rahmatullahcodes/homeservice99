import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

const SEEN_POPUP_IDS_KEY = "seenBroadcastPopupIds";

function getViewerId() {
  try {
    const raw = localStorage.getItem("user");
    const parsed = raw ? JSON.parse(raw) : null;
    return String(parsed?._id || parsed?.id || parsed?.email || "auth");
  } catch {
    return "auth";
  }
}

function getSeenPopupKey(viewerId) {
  return `${SEEN_POPUP_IDS_KEY}:${viewerId}`;
}

function readSeenPopupIds(viewerId) {
  try {
    const raw = localStorage.getItem(getSeenPopupKey(viewerId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
}

function markPopupAsSeen(viewerId, id) {
  const seen = new Set(readSeenPopupIds(viewerId));
  seen.add(String(id));
  localStorage.setItem(getSeenPopupKey(viewerId), JSON.stringify(Array.from(seen)));
}

async function parseResponseJson(response) {
  return response.json().catch(() => null);
}

export default function BroadcastPopup() {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const viewerId = getViewerId();
  const [popup, setPopup] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;

    async function fetchPopup() {
      try {
        const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.GET_PUBLIC_POPUP);
        if (!response.ok) return;

        const payload = await parseResponseJson(response);
        if (!payload?._id) return;

        const seen = readSeenPopupIds(viewerId);
        if (seen.includes(String(payload._id))) return;
        if (cancelled) return;

        setPopup(payload);
        setOpen(true);
      } catch (error) {
        console.error("Broadcast popup fetch failed:", error);
      }
    }

    fetchPopup();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, viewerId, location.pathname]);

  function closePopup() {
    if (popup?._id) {
      markPopupAsSeen(viewerId, popup._id);
    }
    setOpen(false);
  }

  if (!open || !popup) {
    return null;
  }

  const popupActionLabel = (popup.actionLabel || "View Offer").trim() || "View Offer";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Broadcast message"
      onClick={closePopup}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(2, 6, 23, 0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 1200
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          backgroundColor: "#f3f4f6",
          borderRadius: "10px",
          boxShadow: "0 22px 40px rgba(2, 6, 23, 0.35)",
          overflow: "hidden",
          border: "1px solid #d1d5db"
        }}
      >
        <div style={{ padding: "10px 10px 0 10px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={closePopup}
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid #a3a3a3",
              background: "#e5e7eb",
              cursor: "pointer",
              color: "#737373",
              fontSize: "18px",
              lineHeight: 1,
              padding: 0,
              fontWeight: 700
            }}
            aria-label="Close popup"
          >
            x
          </button>
        </div>

        {popup.imageUrl && (
          <img
            src={popup.imageUrl}
            alt={popup.title || "Broadcast image"}
            style={{ width: "100%", maxHeight: "210px", objectFit: "cover", display: "block", marginTop: "10px" }}
          />
        )}

        <div style={{ padding: "16px 20px 22px 20px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#171717", fontSize: "clamp(30px, 6vw, 44px)", lineHeight: 1.05, fontWeight: 800 }}>
            {popup.title}
          </h3>
          <p style={{ margin: 0, color: "#171717", fontSize: "clamp(20px, 4.4vw, 36px)", lineHeight: 1.25, whiteSpace: "pre-line", fontWeight: 600 }}>
            {popup.message}
          </p>

          <div style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={closePopup}
              style={{
                border: "1px solid #9ca3af",
                backgroundColor: "#f9fafb",
                color: "#111827",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Close
            </button>

            {popup.actionUrl && (
              <a
                href={popup.actionUrl}
                onClick={closePopup}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "2px",
                  border: "2px solid #111827",
                  padding: "10px 16px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  textDecoration: "none",
                  fontSize: "clamp(20px, 5.6vw, 32px)",
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                {popupActionLabel}
              </a>
            )}

            {!popup.actionUrl && (
              <button
                type="button"
                onClick={closePopup}
                style={{
                  borderRadius: "2px",
                  border: "2px solid #111827",
                  padding: "10px 16px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: "clamp(20px, 5.6vw, 32px)",
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: "pointer"
                }}
              >
                {popupActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
