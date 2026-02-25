// src/models/Transaction.js
import mongoose from "mongoose";

const trxSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  type: { type: String, enum: ["Credit", "Debit"] },
  amount: Number,
  source: String,
  status: String
}, { timestamps: true });

export default mongoose.model("Transaction", trxSchema);
