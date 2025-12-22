import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AccountAddresses() {
  const [address, setAddress] = useState("");

  const { addToast } = useToast();

  function save() {
    addToast("Address saved (demo)", 'success');
  }

  return (
    <div className="detail-box">
      <h2>Saved Address</h2>
      <textarea
        rows="3"
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="House no, street, city, pincode"
      />
      <button className="btn-primary" style={{ marginTop: 10 }} onClick={save}>
        Save address
      </button>
    </div>
  );
}
