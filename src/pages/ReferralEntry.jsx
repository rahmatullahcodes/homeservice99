import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const REFERRAL_STORAGE_KEY = "pendingReferralCode";

function normalizeReferralCode(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

export default function ReferralEntry() {
  const navigate = useNavigate();
  const { code } = useParams();

  useEffect(() => {
    const normalizedCode = normalizeReferralCode(code);

    if (!normalizedCode) {
      navigate("/signup", { replace: true });
      return;
    }

    localStorage.setItem(REFERRAL_STORAGE_KEY, normalizedCode);
    navigate(`/signup?ref=${encodeURIComponent(normalizedCode)}`, { replace: true });
  }, [code, navigate]);

  return (
    <div className="container" style={{ paddingTop: "48px", textAlign: "center" }}>
      <p>Redirecting to signup...</p>
    </div>
  );
}
