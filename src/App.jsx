import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ServiceCategory from "./components/ServiceCategory.jsx";

/* MAIN PAGES */
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Compare from "./pages/Compare.jsx";
import BlogList from "./pages/BlogList.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import Disclaimer from "./pages/Disclaimer.jsx";
import CancellationRefund from "./pages/CancellationRefund.jsx";
import TermsConditions from "./pages/TermsConditions.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

/* USER ACCOUNT MODULE */
import AccountLayout from "./pages/account/AccountLayout.jsx";
import AccountDashboard from "./pages/account/AccountDashboard.jsx";
import AccountBookings from "./pages/account/AccountBookings.jsx";
import AccountProfile from "./pages/account/AccountProfile.jsx";
import AccountAddresses from "./pages/account/AccountAddresses.jsx";
import AccountReviews from "./pages/account/AccountReviews.jsx";
import AccountPayments from "./pages/account/AccountPayments.jsx";
import AccountWallet from "./pages/account/AccountWallet.jsx";
import AccountReferral from "./pages/account/AccountReferral.jsx";
import AccountCoupons from "./pages/account/AccountCoupons.jsx";
import AccountSettings from "./pages/account/AccountSettings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

/* VENDOR MODULE */
import VendorLayout from "./pages/vendor/VendorLayout.jsx";
import VendorDashboard from "./pages/vendor/VendorDashboard.jsx";
import VendorBookings from "./pages/vendor/VendorBookings.jsx";
import VendorServices from "./pages/vendor/VendorServices.jsx";
import VendorEarnings from "./pages/vendor/VendorEarnings.jsx";
import VendorReviews from "./pages/vendor/VendorReviews.jsx";
import VendorProfile from "./pages/vendor/VendorProfile.jsx";
import VendorWallet from "./pages/vendor/VendorWallet.jsx";
import VendorTransactions from "./pages/vendor/VendorTransactions.jsx";
import VendorProtectedRoute from "./components/VendorProtectedRoute.jsx";
import VendorSignup from "./pages/vendor/VendorSignup.jsx";
import VendorLogin from "./pages/vendor/VendorLogin.jsx";

/* ADMIN MODULE */
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminVendors from "./pages/admin/AdminVendors.jsx";
import AdminServices from "./pages/admin/AdminServices.jsx";
import AdminBookings from "./pages/admin/AdminBookings.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminWallet from "./pages/admin/AdminWallet.jsx";
import AdminCoupons from "./pages/admin/AdminCoupons.jsx";
import AdminReviews from "./pages/admin/AdminReviews.jsx";
import AdminCMS from "./pages/admin/AdminCMS.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminSupport from "./pages/admin/AdminSupport.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";

export default function App() {
  return (
    <div className="app-root">
      <Navbar />

      <main className="main-content">
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/services/category/:category" element={<ServiceCategory />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* USER AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* VENDOR AUTH */}
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />

          {/* CART & CHECKOUT */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* USER ACCOUNT PANEL */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountDashboard />} />
            <Route path="dashboard" element={<AccountDashboard />} />
            <Route path="bookings" element={<AccountBookings />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="reviews" element={<AccountReviews />} />
            <Route path="payments" element={<AccountPayments />} />
            <Route path="wallet" element={<AccountWallet />} />
            <Route path="referral" element={<AccountReferral />} />
            <Route path="coupons" element={<AccountCoupons />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          {/* VENDOR PANEL */}
          <Route
            path="/vendor"
            element={
              <VendorProtectedRoute>
                <VendorLayout />
              </VendorProtectedRoute>
            }
          >
            <Route index element={<VendorDashboard />} />
            <Route path="bookings" element={<VendorBookings />} />
            <Route path="services" element={<VendorServices />} />
            <Route path="earnings" element={<VendorEarnings />} />
            <Route path="reviews" element={<VendorReviews />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="wallet" element={<VendorWallet />} />
            <Route path="transactions" element={<VendorTransactions />} />
          </Route>

          {/* ADMIN LOGIN (PUBLIC) */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* ADMIN PANEL (PROTECTED) */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="wallet" element={<AdminWallet />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

        </Routes>
      </main>

      <Footer />
    </div>
  );
}
