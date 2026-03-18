import bcrypt from "bcrypt";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Coupon from "../models/Coupon.js";
import {
  createRazorpayOrder,
  getRazorpayPublicConfig,
  verifyRazorpaySignature
} from "../services/razorpayService.js";
import {
  buildManualGatewayOrder,
  getRuntimeGatewayConfig
} from "../services/paymentGatewayService.js";

function getReferralCodeSeed(user) {
  const nameSeed = (user?.name || "USER")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, "X");

  return `HS99${nameSeed}${String(user._id).slice(-4).toUpperCase()}`;
}

function maskPaymentValue(type, value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (type === "Card") {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `**** **** **** ${digits.slice(-4)}`;
    }
  }

  if (type === "UPI") {
    const parts = raw.split("@");
    if (parts.length === 2 && parts[0].length > 2) {
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
  }

  return raw;
}

function syncPrimaryAddress(user) {
  if (!Array.isArray(user.addresses) || user.addresses.length === 0) {
    user.address = "";
    return;
  }

  const primary = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
  const parts = [primary.street, primary.city, primary.state, primary.pincode]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  user.address = parts.join(", ");
  user.city = primary.city || user.city || "";
}

function formatWalletSummary(user) {
  const txns = [...(user.walletTransactions || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const successfulCredits = txns
    .filter((txn) => txn.type === "Credit" && txn.status === "Success")
    .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  const successfulDebits = txns
    .filter((txn) => txn.type === "Debit" && txn.status === "Success")
    .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  const pendingAmount = txns
    .filter((txn) => txn.status === "Pending")
    .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  return {
    balance: Number(user.walletBalance || 0),
    totalCredits: successfulCredits,
    totalDebits: successfulDebits,
    pendingAmount,
    transactions: txns
  };
}

function parsePositiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function normalizeGatewayCode(value) {
  return String(value || "").trim().toLowerCase();
}

function buildWalletReceipt(userId) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `wall_${String(userId).slice(-6)}_${Date.now()}_${random}`.slice(0, 40);
}

async function resolveUser(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return null;
  }
  return user;
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDashboard(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const [bookings, reviewsCount] = await Promise.all([
      Booking.find({ user: user._id })
        .populate("vendor", "businessName name email phone")
        .sort({ createdAt: -1 })
        .limit(5),
      Review.countDocuments({ user: user._id })
    ]);

    const totalBookings = await Booking.countDocuments({ user: user._id });
    const completedBookings = await Booking.countDocuments({ user: user._id, status: "Completed" });
    const pendingBookings = await Booking.countDocuments({ user: user._id, status: "Pending" });
    const cancelledBookings = await Booking.countDocuments({ user: user._id, status: "Cancelled" });

    const spendAgg = await Booking.aggregate([
      {
        $match: {
          user: user._id,
          status: { $in: ["Scheduled", "InProgress", "Completed"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    res.json({
      stats: {
        totalBookings,
        totalSpent: spendAgg[0]?.total || 0,
        walletBalance: user.walletBalance || 0,
        completedBookings,
        reviews: reviewsCount,
        pendingBookings,
        cancelledBookings
      },
      recentBookings: bookings,
      profile: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUserBookings(req, res) {
  try {
    const userId = req.user.id;
    const status = String(req.query.status || "All");
    const query = { user: userId };

    if (status !== "All") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("vendor", "businessName name email phone")
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((booking) => booking._id);
    const reviews = await Review.find({
      user: userId,
      booking: { $in: bookingIds }
    }).select("booking");

    const reviewedBookingSet = new Set(reviews.map((review) => String(review.booking)));

    const formatted = bookings.map((booking) => ({
      ...booking.toObject(),
      hasReview: reviewedBookingSet.has(String(booking._id))
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function cancelUserBooking(req, res) {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Completed booking cannot be cancelled" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBookingInvoice(req, res) {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.user.id
    })
      .populate("vendor", "businessName name email phone")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const invoice = {
      invoiceNumber: `INV-${String(booking._id).slice(-8).toUpperCase()}`,
      bookingId: booking._id,
      service: booking.service,
      category: booking.serviceCategory || "General",
      amount: Number(booking.price || 0),
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      createdAt: booking.createdAt,
      customer: {
        name: booking.user?.name || "",
        email: booking.user?.email || "",
        phone: booking.user?.phone || ""
      },
      vendor: {
        name: booking.vendor?.businessName || booking.vendor?.name || "Not assigned",
        email: booking.vendor?.email || "",
        phone: booking.vendor?.phone || ""
      }
    };

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const {
      name,
      email,
      phone,
      city,
      address,
      bio,
      avatar,
      preferences
    } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = String(email).trim().toLowerCase();
    }

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (city !== undefined) user.city = String(city).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (bio !== undefined) user.bio = String(bio).trim().slice(0, 500);
    if (avatar !== undefined) user.avatar = String(avatar).trim();

    if (preferences && typeof preferences === "object") {
      user.preferences = {
        emailNotifications: preferences.emailNotifications ?? user.preferences?.emailNotifications ?? true,
        smsNotifications: preferences.smsNotifications ?? user.preferences?.smsNotifications ?? true
      };
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: "Profile updated successfully", user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(String(currentPassword), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;

    await Promise.all([
      Review.deleteMany({ user: userId }),
      Booking.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const addresses = [...(user.addresses || [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addAddress(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { type = "Home", street = "", city = "", state = "", pincode = "", isDefault = false } = req.body;

    if (!String(street).trim() || !String(city).trim() || !String(state).trim() || !String(pincode).trim()) {
      return res.status(400).json({ message: "Street, city, state and pincode are required" });
    }

    const shouldSetDefault = Boolean(isDefault) || (user.addresses || []).length === 0;
    if (shouldSetDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      type,
      street: String(street).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      isDefault: shouldSetDefault
    });

    syncPrimaryAddress(user);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAddress(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { addressId } = req.params;
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const { type, street, city, state, pincode, isDefault } = req.body;

    if (type !== undefined) address.type = type;
    if (street !== undefined) address.street = String(street).trim();
    if (city !== undefined) address.city = String(city).trim();
    if (state !== undefined) address.state = String(state).trim();
    if (pincode !== undefined) address.pincode = String(pincode).trim();

    if (isDefault === true) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    syncPrimaryAddress(user);
    await user.save();

    res.json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function setDefaultAddress(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { addressId } = req.params;
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;

    syncPrimaryAddress(user);
    await user.save();

    res.json({ message: "Default address updated", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAddress(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { addressId } = req.params;
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    syncPrimaryAddress(user);
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPaymentMethods(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const methods = [...(user.paymentMethods || [])]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map((method) => ({
        ...method.toObject(),
        maskedValue: maskPaymentValue(method.type, method.value)
      }));

    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addPaymentMethod(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { type = "UPI", value = "", label = "", provider = "", isDefault = false } = req.body;

    if (!String(value).trim()) {
      return res.status(400).json({ message: "Payment detail is required" });
    }

    const shouldSetDefault = Boolean(isDefault) || (user.paymentMethods || []).length === 0;
    if (shouldSetDefault) {
      user.paymentMethods.forEach((method) => {
        method.isDefault = false;
      });
    }

    user.paymentMethods.push({
      type,
      value: String(value).trim(),
      label: String(label || value).trim(),
      provider: String(provider || "").trim(),
      isDefault: shouldSetDefault,
      active: true
    });

    await user.save();

    const methods = user.paymentMethods.map((method) => ({
      ...method.toObject(),
      maskedValue: maskPaymentValue(method.type, method.value)
    }));

    res.status(201).json({ message: "Payment method added", paymentMethods: methods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function setDefaultPaymentMethod(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { methodId } = req.params;
    const method = user.paymentMethods.id(methodId);
    if (!method) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    user.paymentMethods.forEach((entry) => {
      entry.isDefault = false;
    });
    method.isDefault = true;

    await user.save();

    res.json({ message: "Default payment method updated", paymentMethods: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deletePaymentMethod(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const { methodId } = req.params;
    const method = user.paymentMethods.id(methodId);
    if (!method) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    const wasDefault = method.isDefault;
    user.paymentMethods.pull(methodId);

    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    res.json({ message: "Payment method removed", paymentMethods: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getWallet(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const summary = formatWalletSummary(user);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createWalletTopupOrder(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const amount = parsePositiveAmount(req.body.amount);
    const methodId = req.body.methodId ? String(req.body.methodId) : "";
    const requestedGateway = normalizeGatewayCode(req.body.gateway || req.body.paymentGateway || "razorpay");
    const note = String(req.body.note || "").trim();

    if (!amount) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const { code: gatewayCode, config } = await getRuntimeGatewayConfig(requestedGateway);

    let source = "Wallet top-up";
    if (methodId) {
      const method = user.paymentMethods.id(methodId);
      if (!method) {
        return res.status(404).json({ message: "Selected payment method not found" });
      }
      source = `${method.type}: ${maskPaymentValue(method.type, method.value) || method.label}`;
    }

    if (gatewayCode !== "razorpay") {
      const orderId = buildWalletReceipt(user._id);

      user.walletTransactions.push({
        type: "Credit",
        amount,
        note: note || `${config.displayName || gatewayCode} top-up initiated`,
        source,
        gateway: config.displayName || gatewayCode,
        gatewayOrderId: orderId,
        status: "Pending"
      });

      await user.save();
      const transaction = user.walletTransactions[user.walletTransactions.length - 1];
      const manualOrder = buildManualGatewayOrder({
        gatewayCode,
        config,
        amount,
        referenceId: orderId,
        userId: user._id,
        purpose: "wallet_topup"
      });

      return res.status(201).json({
        message: "Wallet top-up request created",
        ...manualOrder,
        source,
        transactionId: transaction?._id
      });
    }

    const order = await createRazorpayOrder({
      amountInPaise: toPaise(amount),
      currency: "INR",
      receipt: buildWalletReceipt(user._id),
      notes: {
        purpose: "wallet_topup",
        userId: String(user._id),
        methodId
      }
    });

    user.walletTransactions.push({
      type: "Credit",
      amount,
      note: note || "Wallet top-up initiated",
      source,
      gateway: "Razorpay",
      gatewayOrderId: order.id,
      status: "Pending"
    });

    await user.save();
    const transaction = user.walletTransactions[user.walletTransactions.length - 1];
    const { keyId } = await getRazorpayPublicConfig();

    res.status(201).json({
      message: "Wallet top-up order created",
      gateway: "razorpay",
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      source,
      transactionId: transaction?._id
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

export async function verifyWalletTopup(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    const gatewayCode = normalizeGatewayCode(req.body.gateway || req.body.paymentGateway || "razorpay");

    if (gatewayCode !== "razorpay") {
      const { code, config } = await getRuntimeGatewayConfig(gatewayCode);
      const orderReference = String(req.body.orderReference || req.body.paymentOrderId || "").trim();
      const paymentReference = String(
        req.body.paymentReference ||
        req.body.transactionId ||
        req.body.gatewayPaymentId ||
        req.body.paymentId ||
        ""
      ).trim();

      if (!orderReference || !paymentReference) {
        return res.status(400).json({
          message: "Order reference and transaction ID are required for merchant top-up submission"
        });
      }

      const pendingTransaction = user.walletTransactions.find(
        (txn) => txn.gatewayOrderId === orderReference && txn.status === "Pending"
      );

      if (!pendingTransaction) {
        return res.status(404).json({ message: "Pending wallet top-up not found for this order" });
      }

      if (pendingTransaction.gatewayPaymentId) {
        return res.status(409).json({ message: "This wallet top-up has already been submitted" });
      }

      const duplicateReference = user.walletTransactions.find(
        (txn) =>
          txn.gateway === (config.displayName || code) &&
          txn.gatewayPaymentId === paymentReference
      );

      if (duplicateReference) {
        return res.status(409).json({ message: "This transaction ID has already been submitted" });
      }

      pendingTransaction.gateway = config.displayName || code;
      pendingTransaction.gatewayPaymentId = paymentReference;
      pendingTransaction.note = pendingTransaction.note || `${config.displayName || code} top-up awaiting verification`;

      await user.save();
      const wallet = formatWalletSummary(user);
      const transaction = wallet.transactions.find(
        (txn) => String(txn._id) === String(pendingTransaction._id)
      ) || wallet.transactions[0] || null;

      return res.json({
        message: `${config.displayName || code} payment submitted. Wallet top-up is pending verification.`,
        balance: user.walletBalance,
        transaction,
        wallet
      });
    }

    const razorpayOrderId = String(req.body.razorpayOrderId || "");
    const razorpayPaymentId = String(req.body.razorpayPaymentId || "");
    const razorpaySignature = String(req.body.razorpaySignature || "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay verification payload" });
    }

    const signatureValid = await verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!signatureValid) {
      return res.status(400).json({ message: "Invalid Razorpay payment signature" });
    }

    const pendingTransaction = user.walletTransactions.find(
      (txn) => txn.gatewayOrderId === razorpayOrderId && txn.status === "Pending"
    );

    if (!pendingTransaction) {
      const alreadyProcessed = user.walletTransactions.find(
        (txn) =>
          txn.gatewayOrderId === razorpayOrderId &&
          txn.gatewayPaymentId === razorpayPaymentId &&
          txn.status === "Success"
      );
      if (alreadyProcessed) {
        return res.status(409).json({ message: "Wallet top-up is already processed for this payment" });
      }
      return res.status(404).json({ message: "Pending wallet top-up not found for this order" });
    }

    pendingTransaction.gateway = "Razorpay";
    pendingTransaction.gatewayPaymentId = razorpayPaymentId;
    pendingTransaction.gatewaySignature = razorpaySignature;
    pendingTransaction.status = "Success";
    pendingTransaction.note = pendingTransaction.note || "Wallet top-up successful";

    user.walletBalance = Number(user.walletBalance || 0) + Number(pendingTransaction.amount || 0);
    await user.save();

    const summary = formatWalletSummary(user);
    const transaction = summary.transactions.find(
      (txn) => String(txn._id) === String(pendingTransaction._id)
    ) || summary.transactions[0] || null;

    res.json({
      message: "Money added successfully",
      balance: user.walletBalance,
      transaction,
      wallet: summary
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

export async function topupWallet(req, res) {
  try {
    const directTopupAllowed = String(process.env.ALLOW_DIRECT_WALLET_TOPUP || "").toLowerCase() === "true";
    if (!directTopupAllowed) {
      return res.status(400).json({
        message: "Direct wallet top-up is disabled. Please use the configured payment gateway flow."
      });
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    const amount = parsePositiveAmount(req.body.amount);
    const methodId = req.body.methodId ? String(req.body.methodId) : "";
    const note = String(req.body.note || "").trim();

    if (!amount) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    let source = "Wallet top-up";
    if (methodId) {
      const method = user.paymentMethods.id(methodId);
      if (!method) {
        return res.status(404).json({ message: "Selected payment method not found" });
      }
      source = `${method.type}: ${maskPaymentValue(method.type, method.value) || method.label}`;
    }

    user.walletBalance = Number(user.walletBalance || 0) + amount;
    user.walletTransactions.push({
      type: "Credit",
      amount,
      note: note || "Added money to wallet",
      source,
      status: "Success"
    });

    await user.save();

    const summary = formatWalletSummary(user);
    const transaction = summary.transactions[0] || null;

    res.status(201).json({
      message: "Money added successfully",
      balance: user.walletBalance,
      transaction,
      wallet: summary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const now = new Date();
    const formatted = coupons.map((coupon) => {
      const isExpired = coupon.expiryDate ? now > new Date(coupon.expiryDate) : false;
      const limitReached = coupon.maxUsage ? coupon.usage >= coupon.maxUsage : false;
      const isUsable = Boolean(coupon.active) && !isExpired && !limitReached;

      return {
        ...coupon.toObject(),
        status: isUsable ? "Active" : "Expired",
        isUsable,
        description:
          coupon.type === "Flat"
            ? `Flat Rs ${coupon.value} off`
            : `${coupon.value}% off on services`
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUserReviews(req, res) {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("vendor", "businessName name")
      .populate("service", "title")
      .populate("booking", "service status")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReviewableBookings(req, res) {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
      status: "Completed"
    })
      .populate("vendor", "businessName name")
      .populate("serviceId", "title")
      .sort({ updatedAt: -1, createdAt: -1 });

    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      user: req.user.id,
      booking: { $in: bookingIds }
    }).select("booking");

    const reviewedSet = new Set(existingReviews.map((review) => String(review.booking)));

    const reviewable = bookings.filter((booking) => !reviewedSet.has(String(booking._id)));
    res.json(reviewable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createReview(req, res) {
  try {
    const { bookingId, rating, title = "", comment = "" } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ message: "Booking, rating and comment are required" });
    }

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }

    if (!booking.vendor || !booking.serviceId) {
      return res.status(400).json({
        message: "Booking is missing vendor/service details, cannot submit review"
      });
    }

    const existing = await Review.findOne({ booking: booking._id, user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    const review = await Review.create({
      user: req.user.id,
      vendor: booking.vendor,
      service: booking.serviceId,
      booking: booking._id,
      rating: ratingNum,
      title: String(title).trim(),
      comment: String(comment).trim(),
      status: "Pending"
    });

    await review.populate("vendor", "businessName name");
    await review.populate("service", "title");
    await review.populate("booking", "service status");

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReferral(req, res) {
  try {
    const user = await resolveUser(req, res);
    if (!user) return;

    if (!user.referralCode) {
      user.referralCode = getReferralCodeSeed(user);
      await user.save();
    }

    const invites = [...(user.referrals || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const walletReward = invites.reduce((sum, invite) => sum + Number(invite.reward || 0), 0);
    const joinedCount = invites.filter((invite) => invite.status === "Joined").length;

    res.json({
      referralCode: user.referralCode,
      referralLink: `https://homeservice99.com/ref/${String(user.referralCode).toLowerCase()}`,
      invites,
      walletReward,
      totalInvites: invites.length,
      joinedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
