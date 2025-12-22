import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AdminLogin() {
const navigate = useNavigate();
const [email, setEmail] = useState("");
const [pass, setPass] = useState("");
const [error, setError] = useState("");


function login() {
if (!email || !pass) {
setError("All fields required");
return;
}


// Demo credential
if (email === "admin@demo.com" && pass === "admin123") {
localStorage.setItem("admin", "true");
navigate("/admin");
} else {
setError("Invalid admin credentials");
}
}


return (
<div className="container">
<div className="form-card">
<h2>Admin Login</h2>


{error && <p className="form-error">{error}</p>}


<input placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
<input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />


<button className="btn-primary full" onClick={login}>Login</button>


<p className="form-note">Demo: admin@demo.com / admin123</p>
</div>
</div>
);
}