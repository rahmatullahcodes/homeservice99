import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Vendor from "../models/Vendor.js";

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

    const bookings = await Booking.find({ vendor: vendorId })
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
    const bookings = await Booking.find({ vendor: vendorId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    bookings.forEach(booking => {
      if (booking.status === "Completed") {
        activities.push({
          id: booking._id,
          type: "booking_completed",
          icon: "✅",
          title: "Job completed",
          description: booking.service,
          amount: `₹${booking.price}`,
          timestamp: booking.updatedAt,
          user: booking.user?.name || "Unknown"
        });
      } else if (booking.status === "Scheduled") {
        activities.push({
          id: booking._id,
          type: "booking_scheduled",
          icon: "📅",
          title: "New booking",
          description: booking.service,
          amount: `₹${booking.price}`,
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

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only vendor of this booking can update it
    if (booking.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized - Not your booking" });
    }

    // Can't complete if not scheduled
    if (status === "Completed" && booking.status !== "Scheduled" && booking.status !== "InProgress") {
      return res.status(400).json({ message: "Can only complete scheduled or in-progress bookings" });
    }

    // Can't cancel if already completed
    if (status === "Cancelled" && booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    booking.status = status;
    await booking.save();

    // Populate user details before responding
    await booking.populate("user", "name email phone");

    res.json({ message: `Booking status updated to ${status}`, booking });
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

    let filter = { vendor: vendorId };

    if (status && status !== "All") {
      filter.status = status;
    }

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
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({
      balance: vendor.walletBalance || 0,
      totalEarnings: vendor.totalEarnings || 0,
      totalWithdrawn: vendor.totalWithdrawn || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor - Request withdrawal */
export async function requestWithdrawal(req, res) {
  try {
    const { amount } = req.body;
    const vendorId = req.user.id;

    if (!amount || amount <= 0) {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ vendor: vendorId, status: "Completed" })
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ vendor: vendorId, status: "Completed" });

    const transactions = bookings.map(booking => ({
      id: booking._id,
      type: "Credit",
      amount: booking.price || 0,
      source: booking.service || "Service",
      date: booking.updatedAt,
      status: "Success",
      description: `Payment for service from ${booking.user?.name || "Customer"}`
    }));

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
    const period = req.query.period || "month"; // month, year, lifetime

    let startDate = new Date();
    switch (period) {
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "lifetime":
        startDate = new Date(0); // From epoch
        break;
    }

    const completedBookings = await Booking.find({
      vendor: vendorId,
      status: "Completed",
      updatedAt: { $gte: startDate }
    });

    const earnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const pendingBookings = await Booking.countDocuments({
      vendor: vendorId,
      status: "Scheduled"
    });
    const pendingEarnings = await Booking.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: "Scheduled"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    const vendor = await Vendor.findById(vendorId);

    res.json({
      earnings,
      completedJobs: completedBookings.length,
      pendingEarnings: pendingEarnings[0]?.total || 0,
      pendingJobs: pendingBookings,
      walletBalance: vendor?.walletBalance || 0,
      totalEarnings: vendor?.totalEarnings || 0,
      totalWithdrawn: vendor?.totalWithdrawn || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
