import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";
import {
  createRazorpayOrder,
  getRazorpayPublicConfig,
  verifyRazorpaySignature
} from "../services/razorpayService.js";
import {
  buildManualGatewayOrder,
  getRuntimeGatewayConfig
} from "../services/paymentGatewayService.js";

const BOOKING_ACCEPT_COINS = Math.max(1, Number(process.env.BOOKING_ACCEPT_COINS || 5));

function parsePositiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function buildReceipt(prefix, userId) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}_${String(userId).slice(-6)}_${Date.now()}_${random}`.slice(0, 40);
}

function normalizePaymentMethod(value) {
  const method = String(value || "cod").toLowerCase();
  if (["upi", "card", "online", "razorpay"].includes(method)) return "online";
  return "cod";
}

function normalizeGatewayCode(value) {
  return String(value || "").trim().toLowerCase();
}

async function resolveService(serviceId) {
  if (!serviceId) return null;

  let service = null;
  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    service = await Service.findById(serviceId);
  }
  if (!service) {
    service = await Service.findOne({ id: serviceId });
  }
  return service;
}

async function buildBookingPayload(rawPayload, userId, paymentDetails = {}) {
  const payload = rawPayload || {};
  const {
    serviceId,
    serviceTitle,
    serviceCategory,
    price,
    scheduledAt,
    customerName = "",
    customerPhone = "",
    customerAddress = ""
  } = payload;

  if (!scheduledAt) {
    const error = new Error("Missing required field: scheduledAt");
    error.statusCode = 400;
    throw error;
  }

  const service = await resolveService(serviceId);
  const bookingData = {
    user: userId,
    vendor: null,
    scheduledAt,
    status: "Pending",
    acceptanceChargeCoins: BOOKING_ACCEPT_COINS,
    customerName: String(customerName || "").trim(),
    customerPhone: String(customerPhone || "").trim(),
    customerAddress: String(customerAddress || "").trim(),
    paymentMethod: paymentDetails.paymentMethod || "cod",
    paymentGateway: paymentDetails.paymentGateway || "",
    paymentStatus: paymentDetails.paymentStatus || "Pending",
    paymentOrderId: paymentDetails.paymentOrderId || "",
    paymentId: paymentDetails.paymentId || "",
    paymentSignature: paymentDetails.paymentSignature || ""
  };

  if (service) {
    bookingData.serviceId = service._id;
    bookingData.service = service.title;
    bookingData.serviceCategory = service.category;
    bookingData.price = Number(service.price) || 0;
  } else {
    const fallbackPrice = parsePositiveAmount(price);
    if (!serviceTitle || !fallbackPrice) {
      const error = new Error("Provide a valid serviceId, or send serviceTitle with a valid price");
      error.statusCode = 400;
      throw error;
    }
    bookingData.service = String(serviceTitle).trim();
    bookingData.serviceCategory = serviceCategory || "General";
    bookingData.price = fallbackPrice;
  }

  return bookingData;
}

/* Create booking (checkout) */
export async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const method = normalizePaymentMethod(req.body.paymentMethod);
    if (method === "online") {
      return res.status(400).json({
        message: "Online payment booking requires Razorpay verification endpoint"
      });
    }

    const bookingData = await buildBookingPayload(
      {
        ...req.body,
        customerName: req.body.name || req.body.customerName,
        customerPhone: req.body.phone || req.body.customerPhone,
        customerAddress: req.body.address || req.body.customerAddress
      },
      userId,
      {
        paymentMethod: "cod",
        paymentStatus: "Pending"
      }
    );
    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

/* Create Razorpay order for booking payment */
export async function createBookingPaymentOrder(req, res) {
  try {
    const amount = parsePositiveAmount(req.body.amount);
    const requestedGateway = normalizeGatewayCode(req.body.gateway || req.body.paymentGateway || "razorpay");
    if (!amount) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const { code: gatewayCode, config } = await getRuntimeGatewayConfig(requestedGateway);

    if (gatewayCode !== "razorpay") {
      const manualOrder = buildManualGatewayOrder({
        gatewayCode,
        config,
        amount,
        referenceId: buildReceipt(gatewayCode.slice(0, 4), req.user.id),
        userId: req.user.id,
        purpose: "booking_payment"
      });

      return res.status(201).json(manualOrder);
    }

    const amountInPaise = toPaise(amount);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ message: "Invalid amount for Razorpay order" });
    }

    const order = await createRazorpayOrder({
      amountInPaise,
      currency: "INR",
      receipt: buildReceipt("book", req.user.id),
      notes: {
        purpose: "booking_payment",
        userId: String(req.user.id)
      }
    });

    const { keyId } = await getRazorpayPublicConfig();
    res.status(201).json({
      gateway: "razorpay",
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

/* Verify Razorpay payment and create all bookings */
export async function verifyBookingPayment(req, res) {
  try {
    const {
      bookings,
      customer
    } = req.body;

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ message: "At least one booking is required" });
    }

    if (bookings.length > 50) {
      return res.status(400).json({ message: "Too many bookings in a single request" });
    }

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
          message: "Order reference and transaction ID are required for merchant payment submission"
        });
      }

      const duplicatePayment = await Booking.findOne({
        paymentGateway: config.displayName || code,
        paymentId: paymentReference
      });

      if (duplicatePayment) {
        return res.status(409).json({ message: "This transaction ID has already been submitted" });
      }

      const paymentDetails = {
        paymentMethod: "online",
        paymentGateway: config.displayName || code,
        paymentStatus: "Pending",
        paymentOrderId: orderReference,
        paymentId: paymentReference,
        paymentSignature: ""
      };

      const bookingPayloads = await Promise.all(
        bookings.map((item) =>
          buildBookingPayload(
            {
              ...item,
              customerName: item?.name || item?.customerName || customer?.name,
              customerPhone: item?.phone || item?.customerPhone || customer?.phone,
              customerAddress: item?.address || item?.customerAddress || customer?.address
            },
            req.user.id,
            paymentDetails
          )
        )
      );

      const created = await Booking.insertMany(bookingPayloads);
      return res.status(201).json({
        message: `${config.displayName || code} payment submitted. Booking is awaiting verification.`,
        bookings: created,
        paymentStatus: "Pending"
      });
    }

    const razorpayOrderId = String(req.body.razorpayOrderId || "");
    const razorpayPaymentId = String(req.body.razorpayPaymentId || "");
    const razorpaySignature = String(req.body.razorpaySignature || "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay payment verification fields" });
    }

    const existingBooking = await Booking.findOne({ paymentId: String(razorpayPaymentId) });
    if (existingBooking) {
      return res.status(409).json({ message: "This Razorpay payment has already been used for booking" });
    }

    const signatureValid = await verifyRazorpaySignature({
      razorpayOrderId: String(razorpayOrderId),
      razorpayPaymentId: String(razorpayPaymentId),
      razorpaySignature: String(razorpaySignature)
    });

    if (!signatureValid) {
      return res.status(400).json({ message: "Invalid Razorpay payment signature" });
    }

    const paymentDetails = {
      paymentMethod: "online",
      paymentGateway: "Razorpay",
      paymentStatus: "Paid",
      paymentOrderId: String(razorpayOrderId),
      paymentId: String(razorpayPaymentId),
      paymentSignature: String(razorpaySignature)
    };

    const bookingPayloads = await Promise.all(
      bookings.map((item) =>
        buildBookingPayload(
          {
            ...item,
            customerName: item?.name || item?.customerName || customer?.name,
            customerPhone: item?.phone || item?.customerPhone || customer?.phone,
            customerAddress: item?.address || item?.customerAddress || customer?.address
          },
          req.user.id,
          paymentDetails
        )
      )
    );

    const created = await Booking.insertMany(bookingPayloads);
    res.status(201).json({
      message: "Order placed successfully",
      bookings: created
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

/* Get user bookings */
export async function getUserBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate("vendor", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get booking by ID */
export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("vendor", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Cancel booking */
export async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update booking status */
export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
