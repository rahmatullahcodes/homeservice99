import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Vendor from "../models/Vendor.js";
import Transaction from "../models/Transaction.js";
import Review from "../models/Review.js";

const BOOKING_ACCEPT_COINS = Math.max(1, Number(process.env.BOOKING_ACCEPT_COINS || 5));

function getPeriodStartDate(period) {
  const now = new Date();

  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week":
      return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    case "month":
      return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    case "year":
      return new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
    case "lifetime":
      return new Date(0);
    default:
      return null;
  }
}

function sumAmounts(items, getAmount) {
  return items.reduce((sum, item) => sum + (Number(getAmount(item)) || 0), 0);
}

function getVendorBookingsFilter(vendorId, status = "All") {
  if (status && status !== "All") {
    if (status === "Pending") {
      return { vendor: null, status: "Pending" };
    }
    return { vendor: vendorId, status };
  }

  return {
    $or: [
      { vendor: vendorId },
      { vendor: null, status: "Pending" }
    ]
  };
}

/* Vendor - Get their services */
export async function getVendorServices(req, res) {
  try {
    const vendorId = req.user.id;
    const services = await Service.find({ vendor: vendorId });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Create service */
export async function createService(req, res) {
  try {
    const { title, category, price, description, subcategory } = req.body;
    const vendorId = req.user.id;

    if (!title || !category || !price) {
      return res.status(400).json({ message: "Missing required fields: title, category, price" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const service = await Service.create({
      title: title.trim(),
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : category.trim(), // Use category as subcategory if not provided
      price: Number(price),
      description: description ? description.trim() : null,
      vendor: vendorId,
      active: true
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Update service */
export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const { title, category, price, active, description, subcategory } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own services" });
    }

    if (title) service.title = title.trim();
    if (category) {
      service.category = category.trim();
      // Update subcategory if category changes and subcategory is not explicitly provided
      if (!subcategory) {
        service.subcategory = category.trim();
      }
    }
    if (subcategory) service.subcategory = subcategory.trim();
    if (price) {
      if (price <= 0) {
        return res.status(400).json({ message: "Price must be greater than 0" });
      }
      service.price = Number(price);
    }
    if (description !== undefined) service.description = description ? description.trim() : null;
    if (active !== undefined) service.active = Boolean(active);

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Delete service */
export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Service.findByIdAndDelete(id);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get dashboard statistics */
export async function getVendorDashboardStats(req, res) {
  try {
    const vendorId = req.user.id;

    // Get all vendor bookings
    const bookings = await Booking.find({ vendor: vendorId });
    
    // Calculate stats
    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.scheduledAt || b.createdAt);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString() && 
             (b.status === "Scheduled" || b.status === "InProgress");
    }).length;

    const completedBookings = bookings.filter(b => b.status === "Completed").length;
    const totalEarnings = bookings
      .filter(b => b.status === "Completed")
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const completionRate = bookings.length > 0 
      ? Math.round((completedBookings / bookings.length) * 100)
      : 0;

    // Get vendor info
    const vendor = await Vendor.findById(vendorId).select("-password");

    // Calculate month's earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEarnings = bookings
      .filter(b => b.status === "Completed" && new Date(b.createdAt) >= thirtyDaysAgo)
      .reduce((sum, b) => sum + (b.price || 0), 0);

    res.json({
      todayBookings,
      monthlyEarnings,
      totalEarnings,
      completionRate,
      rating: vendor?.rating || 0,
      walletBalance: vendor?.walletBalance || 0,
      totalBookings: bookings.length,
      completedBookings,
      scheduledBookings: bookings.filter(b => b.status === "Scheduled").length,
      cancelledBookings: bookings.filter(b => b.status === "Cancelled").length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get recent bookings */
export async function getVendorBookings(req, res) {
  try {
    const vendorId = req.user.id;
    const limit = req.query.limit || 10;
    const status = req.query.status || "All";
    const filter = getVendorBookingsFilter(vendorId, status);

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get recent activity */
export async function getVendorActivity(req, res) {
  try {
    const vendorId = req.user.id;
    const activities = [];

    // Get recent bookings for activity
    const bookings = await Booking.find(getVendorBookingsFilter(vendorId, "All"))
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    bookings.forEach((booking) => {
      if (booking.status === "Completed") {
        activities.push({
          id: booking._id,
          type: "booking_completed",
          icon: "COMPLETED",
          title: "Job completed",
          description: booking.service,
          amount: `Rs ${booking.price}`,
          timestamp: booking.updatedAt,
          user: booking.user?.name || "Unknown"
        });
      } else if (booking.status === "Scheduled") {
        activities.push({
          id: booking._id,
          type: "booking_scheduled",
          icon: "SCHEDULED",
          title: "Booking accepted",
          description: booking.service,
          amount: `Rs ${booking.price}`,
          timestamp: booking.createdAt,
          user: booking.user?.name || "Unknown"
        });
      } else if (booking.status === "Pending" && !booking.vendor) {
        activities.push({
          id: booking._id,
          type: "booking_lead",
          icon: "NEW",
          title: "New lead available",
          description: booking.service,
          amount: `Rs ${booking.price}`,
          timestamp: booking.createdAt,
          user: booking.user?.name || "Unknown"
        });
      }
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Update booking status */
export async function updateVendorBookingStatus(req, res) {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;

    const validStatuses = ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (status === "Pending") {
      return res.status(400).json({ message: "Vendors cannot set booking back to Pending" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Accept flow: first vendor to accept wins, coins are deducted on acceptance
    if (status === "Scheduled" && booking.status === "Pending" && !booking.vendor) {
      const vendor = await Vendor.findOneAndUpdate(
        { _id: vendorId, walletBalance: { $gte: BOOKING_ACCEPT_COINS } },
        { $inc: { walletBalance: -BOOKING_ACCEPT_COINS, totalBookings: 1 } },
        { new: true }
      );

      if (!vendor) {
        return res.status(400).json({
          message: `Insufficient wallet balance. ${BOOKING_ACCEPT_COINS} coins required to accept this booking.`
        });
      }

      const acceptedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId, status: "Pending", vendor: null },
        {
          $set: {
            vendor: vendorId,
            status: "Scheduled",
            acceptedAt: new Date(),
            acceptanceChargeCoins: BOOKING_ACCEPT_COINS
          }
        },
        { new: true }
      ).populate("user", "name email phone");

      // Another vendor accepted first; refund immediately
      if (!acceptedBooking) {
        await Vendor.findByIdAndUpdate(vendorId, {
          $inc: { walletBalance: BOOKING_ACCEPT_COINS, totalBookings: -1 }
        });
        return res.status(409).json({
          message: "This booking has already been accepted by another vendor."
        });
      }

      try {
        await Transaction.create({
          vendor: vendorId,
          type: "Debit",
          amount: BOOKING_ACCEPT_COINS,
          source: `Booking acceptance #${bookingId}`,
          status: "Success"
        });
      } catch (transactionError) {
        console.error("Failed to save booking acceptance transaction:", transactionError);
      }

      return res.json({
        message: `Booking accepted successfully. ${BOOKING_ACCEPT_COINS} coins deducted.`,
        booking: acceptedBooking,
        walletBalance: vendor.walletBalance
      });
    }

    if (booking.status === "Pending" && !booking.vendor) {
      return res.status(400).json({
        message: "This booking is open for acceptance. Accept it first before updating status."
      });
    }

    // Only assigned vendor can update it after acceptance
    if (!booking.vendor || booking.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized - Not your booking" });
    }

    if (status === "InProgress" && booking.status !== "Scheduled") {
      return res.status(400).json({ message: "Can only start a scheduled booking" });
    }
    if (status === "Completed" && booking.status !== "Scheduled" && booking.status !== "InProgress") {
      return res.status(400).json({ message: "Can only complete scheduled or in-progress bookings" });
    }

    if (status === "Cancelled" && booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    let walletBalance;
    if (status === "Completed" && previousStatus !== "Completed") {
      const payoutAmount = Number(booking.price) || 0;
      if (payoutAmount > 0) {
        const updatedVendor = await Vendor.findByIdAndUpdate(
          vendorId,
          {
            $inc: {
              walletBalance: payoutAmount,
              totalEarnings: payoutAmount
            }
          },
          { new: true }
        );

        walletBalance = updatedVendor?.walletBalance;

        try {
          await Transaction.create({
            vendor: vendorId,
            type: "Credit",
            amount: payoutAmount,
            source: `Booking payment #${booking._id}`,
            status: "Success"
          });
        } catch (transactionError) {
          console.error("Failed to save booking completion transaction:", transactionError);
        }
      }
    }

    // Populate user details before responding
    await booking.populate("user", "name email phone");

    res.json({ message: `Booking status updated to ${status}`, booking, walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get all bookings (paginated) */
export async function getAllVendorBookings(req, res) {
  try {
    const vendorId = req.user.id;
    const {
      status = "All",
      page = 1,
      limit = 10,
      sort = "-createdAt"
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = getVendorBookingsFilter(vendorId, status);

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get wallet balance */
export async function getWalletBalance(req, res) {
  try {
    const vendorId = req.user.id;
    const [vendor, completedBookings, withdrawalTransactions] = await Promise.all([
      Vendor.findById(vendorId),
      Booking.find({ vendor: vendorId, status: "Completed" }).select("price"),
      Transaction.find({
        vendor: vendorId,
        type: "Debit",
        source: /withdrawal/i,
        status: { $ne: "Failed" }
      }).select("amount")
    ]);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const totalEarnings = sumAmounts(completedBookings, (booking) => booking.price);
    const totalWithdrawn = sumAmounts(withdrawalTransactions, (transaction) => transaction.amount);

    if (vendor.totalEarnings !== totalEarnings || vendor.totalWithdrawn !== totalWithdrawn) {
      vendor.totalEarnings = totalEarnings;
      vendor.totalWithdrawn = totalWithdrawn;
      await vendor.save();
    }

    res.json({
      balance: vendor.walletBalance || 0,
      totalEarnings,
      totalWithdrawn
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Request wallet top-up (admin approval required) */
export async function requestWalletTopUp(req, res) {
  try {
    const vendorId = req.user.id;
    const amount = Number(req.body.amount);
    const note = String(req.body.note || "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid top-up amount" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const source = note
      ? `Wallet top-up request: ${note}`
      : "Wallet top-up request";

    const transaction = await Transaction.create({
      vendor: vendorId,
      type: "Credit",
      amount,
      source,
      status: "Pending"
    });

    res.status(201).json({
      message: "Top-up request submitted. Admin approval pending.",
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Request withdrawal */
export async function requestWithdrawal(req, res) {
  try {
    const amount = Number(req.body.amount);
    const vendorId = req.user.id;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Create withdrawal record
    vendor.walletBalance -= amount;
    vendor.totalWithdrawn = (vendor.totalWithdrawn || 0) + amount;
    await vendor.save();

    try {
      await Transaction.create({
        vendor: vendorId,
        type: "Debit",
        amount,
        source: "Withdrawal request",
        status: "Pending"
      });
    } catch (transactionError) {
      console.error("Failed to save withdrawal transaction:", transactionError);
    }

    res.json({
      message: "Withdrawal request submitted successfully",
      newBalance: vendor.walletBalance,
      withdrawalAmount: amount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get transactions / earnings */
export async function getVendorTransactions(req, res) {
  try {
    const vendorId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const type = String(req.query.type || "All");
    const status = String(req.query.status || "All");
    const sort = String(req.query.sort || "latest");
    const skip = (page - 1) * limit;

    const [walletTransactions, completedBookings] = await Promise.all([
      Transaction.find({ vendor: vendorId }).sort({ createdAt: -1 }),
      Booking.find({ vendor: vendorId, status: "Completed" })
        .populate("user", "name email")
        .sort({ updatedAt: -1 })
    ]);

    const creditedBookingIds = new Set();
    for (const txn of walletTransactions) {
      const source = String(txn.source || "");
      const match = source.match(/^Booking payment #(.+)$/i);
      if (match?.[1]) {
        creditedBookingIds.add(match[1]);
      }
    }

    const bookingTransactions = completedBookings.map((booking) => ({
      id: `booking-${booking._id}`,
      type: "Credit",
      amount: booking.price || 0,
      source: booking.service || "Completed booking",
      date: booking.updatedAt,
      status: "Success",
      description: `Payment for service from ${booking.user?.name || "Customer"}`
    })).filter((transaction) => !creditedBookingIds.has(transaction.id.replace("booking-", "")));

    const manualTransactions = walletTransactions.map((txn) => ({
      id: txn._id,
      type: txn.type,
      amount: txn.amount || 0,
      source: txn.source || "Wallet transaction",
      date: txn.createdAt,
      status: txn.status || "Pending",
      description: txn.source || "Wallet transaction"
    }));

    let allTransactions = [...manualTransactions, ...bookingTransactions];

    if (type !== "All") {
      allTransactions = allTransactions.filter((transaction) => transaction.type === type);
    }

    if (status !== "All") {
      allTransactions = allTransactions.filter((transaction) => transaction.status === status);
    }

    if (sort === "oldest") {
      allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "highest") {
      allTransactions.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sort === "lowest") {
      allTransactions.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    } else {
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const total = allTransactions.length;
    const transactions = allTransactions.slice(skip, skip + limit);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get earnings report */
export async function getEarningsReport(req, res) {
  try {
    const vendorId = req.user.id;
    const period = String(req.query.period || "month");
    const periodStart = getPeriodStartDate(period);

    if (!periodStart) {
      return res.status(400).json({ message: "Invalid period. Allowed: today, week, month, year, lifetime" });
    }

    const thirtyDaysAgo = getPeriodStartDate("month");
    const sixtyDaysAgo = new Date(Date.now() - (60 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = getPeriodStartDate("week");
    const todayStart = getPeriodStartDate("today");

    const [completedBookings, scheduledBookings, vendor, withdrawalTransactions] = await Promise.all([
      Booking.find({
        vendor: vendorId,
        status: "Completed"
      }).select("price updatedAt"),
      Booking.find({
        vendor: vendorId,
        status: "Scheduled"
      }).select("price"),
      Vendor.findById(vendorId),
      Transaction.find({
        vendor: vendorId,
        type: "Debit",
        source: /withdrawal/i,
        status: { $ne: "Failed" }
      }).select("amount")
    ]);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const withinRange = (dateValue, startDate, endDate = null) => {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      if (endDate) {
        return date >= startDate && date < endDate;
      }
      return date >= startDate;
    };

    const lifetimeEarnings = sumAmounts(completedBookings, (booking) => booking.price);
    const earnings = sumAmounts(
      completedBookings.filter((booking) => withinRange(booking.updatedAt, periodStart)),
      (booking) => booking.price
    );
    const thisMonthEarnings = sumAmounts(
      completedBookings.filter((booking) => withinRange(booking.updatedAt, thirtyDaysAgo)),
      (booking) => booking.price
    );
    const lastMonthEarnings = sumAmounts(
      completedBookings.filter((booking) => withinRange(booking.updatedAt, sixtyDaysAgo, thirtyDaysAgo)),
      (booking) => booking.price
    );
    const weeklyEarnings = sumAmounts(
      completedBookings.filter((booking) => withinRange(booking.updatedAt, sevenDaysAgo)),
      (booking) => booking.price
    );
    const todayEarnings = sumAmounts(
      completedBookings.filter((booking) => withinRange(booking.updatedAt, todayStart)),
      (booking) => booking.price
    );

    const completedJobs = completedBookings.filter((booking) => withinRange(booking.updatedAt, periodStart)).length;
    const pendingEarnings = sumAmounts(scheduledBookings, (booking) => booking.price);
    const pendingJobs = scheduledBookings.length;
    const totalWithdrawn = sumAmounts(withdrawalTransactions, (transaction) => transaction.amount);

    if (vendor.totalEarnings !== lifetimeEarnings || vendor.totalWithdrawn !== totalWithdrawn) {
      vendor.totalEarnings = lifetimeEarnings;
      vendor.totalWithdrawn = totalWithdrawn;
      await vendor.save();
    }

    res.json({
      period,
      earnings,
      completedJobs,
      pendingEarnings,
      pendingJobs,
      walletBalance: vendor.walletBalance || 0,
      lifetimeEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      weeklyEarnings,
      todayEarnings,
      totalEarnings: lifetimeEarnings,
      totalWithdrawn
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Get own reviews */
export async function getVendorReviews(req, res) {
  try {
    const vendorId = req.user.id;
    const status = String(req.query.status || "All");

    const filter = { vendor: vendorId };
    if (status !== "All") {
      filter.status = status;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name email phone")
      .populate("service", "title")
      .populate("booking", "service status")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length)
      : 0;

    res.json({
      reviews,
      count: reviews.length,
      avgRating: Number(avgRating.toFixed(1))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Reply to a review */
export async function replyToReview(req, res) {
  try {
    const vendorId = req.user.id;
    const reviewId = req.params.id;
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Reply cannot exceed 1000 characters" });
    }

    const review = await Review.findOne({ _id: reviewId, vendor: vendorId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.vendorReply = {
      message,
      repliedAt: new Date()
    };
    review.updatedAt = new Date();

    await review.save();
    await review.populate("user", "name email phone");
    await review.populate("service", "title");
    await review.populate("booking", "service status");

    res.json({
      message: "Reply saved successfully",
      review
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

