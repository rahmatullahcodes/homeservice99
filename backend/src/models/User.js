// src/models/User.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Home", "Work", "Other"],
    default: "Home"
  },
  street: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  pincode: { type: String, default: "" },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["UPI", "Card", "NetBanking", "Wallet"],
    default: "UPI"
  },
  value: { type: String, default: "" },
  label: { type: String, default: "" },
  provider: { type: String, default: "" },
  isDefault: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const walletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Credit", "Debit"],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, default: "" },
  source: { type: String, default: "Wallet" },
  gateway: { type: String, default: "" },
  gatewayOrderId: { type: String, default: "" },
  gatewayPaymentId: { type: String, default: "" },
  gatewaySignature: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Success", "Pending", "Failed"],
    default: "Success"
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const referralSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Joined", "Installed App", "Pending"],
    default: "Pending"
  },
  reward: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: "user" },
  city: String,
  address: String,
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  blocked: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [walletTransactionSchema],
  paymentMethods: [paymentMethodSchema],
  addresses: [addressSchema],
  referralCode: { type: String, unique: true, sparse: true },
  referrals: [referralSchema],
  referralEarnings: { type: Number, default: 0 },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
