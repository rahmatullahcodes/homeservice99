import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { VendorProvider } from "./context/VendorContext";
import "./index.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <ToastProvider>
        <VendorProvider>
          <App />
        </VendorProvider>
      </ToastProvider>
    </CartProvider>
  </BrowserRouter>
);
