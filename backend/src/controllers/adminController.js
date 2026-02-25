import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Transaction from "../models/Transaction.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import bcrypt from "bcrypt";

/* Get dashboard stats */
export async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments();
    
    // Get booking status breakdown
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate total revenue from successful bookings
    const revenue = await Booking.aggregate([
      {
        $match: { status: "Completed" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);
    
    const totalRevenue = revenue[0]?.total || 0;
    
    // Get review statistics
    const totalReviews = await Review.countDocuments();
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" }
        }
      }
    ]);
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("vendor", "businessName email")
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent reviews
    const recentReviews = await Review.find()
      .populate("user", "name email")
      .populate("vendor", "businessName")
      .populate("service", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalVendors,
      totalBookings,
      totalServices,
      totalRevenue,
      bookingStats,
      totalReviews,
      reviewStats,
      avgRating: avgRating[0]?.average?.toFixed(1) || 0,
      recentBookings,
      recentReviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all users */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Create user */
export async function createUser(req, res) {
  try {
    const { name, email, phone, password, city, address } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = new User({
      name,
      email,
      phone,
      password: password || "defaultPassword123", // Default password if not provided
      city: city || "N/A",
      address: address || "N/A",
      role: "user"
    });

    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all vendors */
export async function getAllVendors(req, res) {
  try {
    const vendors = await Vendor.find().select("-password").sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Create vendor */
export async function createVendor(req, res) {
  try {
    const { name, businessName, email, phone, city, service, category, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !city) {
      return res.status(400).json({ message: "Name, email, phone, and city are required" });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor with this email already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password || "defaultPassword123", 10);

    const vendor = new Vendor({
      name,
      businessName: businessName || name,
      email,
      phone,
      city,
      service: service || category,
      category: category || service,
      password: hashedPassword,
      status: "Active"
    });

    await vendor.save();
    const vendorWithoutPassword = vendor.toObject();
    delete vendorWithoutPassword.password;
    res.status(201).json(vendorWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update vendor status */
export async function updateVendorStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Active", "Pending", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { status, verified: status === "Active" },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Delete vendor */
export async function deleteVendor(req, res) {
  try {
    const { id } = req.params;
    
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all bookings */
export async function getAllBookings(req, res) {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = status ? { status } : {};
    
    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("vendor", "businessName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Booking.countDocuments(filter);
    
    res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all payments/transactions */
export async function getAllPayments(req, res) {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = status ? { status } : {};
    
    const payments = await Transaction.find(filter)
      .populate("vendor", "businessName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Transaction.countDocuments(filter);
    
    // Get payment stats
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    res.json({ payments, total, stats, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all services */
export async function getAllServicesAdmin(req, res) {
  try {
    const services = await Service.find()
      .populate("vendor", "businessName email")
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Create service */
export async function createService(req, res) {
  try {
    const { title, category, price } = req.body;

    // Validation
    if (!title || !category || price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "Title, category, and price are required" });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }

    // Create service
    const newService = new Service({
      title: String(title).trim(),
      category: String(category).trim(),
      price: priceNum,
      active: true
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    console.error("Error creating service:", err.message);
    res.status(500).json({ message: err.message || "Failed to create service" });
  }
}

/* Update service */
export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { title, category, price, active } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (title) service.title = title;
    if (category) service.category = category;
    if (price) service.price = Number(price);
    if (active !== undefined) service.active = active;

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Toggle service status */
export async function toggleServiceStatus(req, res) {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.active = !service.active;
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Delete service */
export async function deleteService(req, res) {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update booking status */
export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email phone")
     .populate("vendor", "businessName email");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update payment status */
export async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["Success", "Pending", "Failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const payment = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("vendor", "businessName email");
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json({ message: "Payment status updated", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update user */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, role, blocked } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (blocked !== undefined) user.blocked = blocked;

    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Delete user */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all coupons */
export async function getAllCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Create coupon */
export async function createCoupon(req, res) {
  try {
    const { code, type, value, expiryDate, maxUsage } = req.body;

    // Validate required fields
    if (!code || !type || value === undefined || value === null || value === "") {
      return res.status(400).json({ message: "Code, type, and value are required" });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Validate type
    if (!["Flat", "Percent"].includes(type)) {
      return res.status(400).json({ message: "Type must be Flat or Percent" });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      active: true,
      usage: 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      maxUsage: maxUsage ? Number(maxUsage) : null
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update coupon */
export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const { code, type, value, expiryDate, maxUsage, active } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = Number(value);
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (maxUsage !== undefined) coupon.maxUsage = maxUsage ? Number(maxUsage) : null;
    if (active !== undefined) coupon.active = active;
    coupon.updatedAt = Date.now();

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Toggle coupon status */
export async function toggleCouponStatus(req, res) {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.active = !coupon.active;
    coupon.updatedAt = Date.now();
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Delete coupon */
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Validate coupon code (for users) */
export async function validateCoupon(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: "Coupon is inactive" });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.maxUsage && coupon.usage >= coupon.maxUsage) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all reviews */
export async function getAllReviews(req, res) {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = status ? { status } : {};
    
    const reviews = await Review.find(filter)
      .populate("user", "name email phone")
      .populate("vendor", "businessName email")
      .populate("service", "title")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Review.countDocuments(filter);
    
    res.json({ reviews, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update review status */
export async function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["Approved", "Pending", "Hidden", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const review = await Review.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    )
      .populate("user", "name email")
      .populate("vendor", "businessName")
      .populate("service", "title");
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Delete review */
export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Create review (user) */
export async function createReview(req, res) {
  try {
    const { vendorId, serviceId, bookingId, rating, title, comment, images } = req.body;
    const userId = req.body.userId || req.user?.id;
    
    if (!userId || !vendorId || !serviceId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // Check if user already reviewed this booking
    if (bookingId) {
      const existingReview = await Review.findOne({ booking: bookingId, user: userId });
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this booking" });
      }
    }
    
    const review = new Review({
      user: userId,
      vendor: vendorId,
      service: serviceId,
      booking: bookingId,
      rating,
      title: title || "",
      comment,
      images: images || [],
      status: "Pending"
    });
    
    await review.save();
    await review.populate("user", "name email");
    await review.populate("vendor", "businessName");
    await review.populate("service", "title");
    
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get vendor reviews */
export async function getVendorReviews(req, res) {
  try {
    const { vendorId } = req.params;
    const { status = "Approved" } = req.query;
    
    const reviews = await Review.find({ vendor: vendorId, status })
      .populate("user", "name email phone")
      .populate("service", "title")
      .sort({ createdAt: -1 });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    res.json({
      reviews,
      count: reviews.length,
      avgRating: avgRating.toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get user reviews */
export async function getUserReviews(req, res) {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.find({ user: userId })
      .populate("vendor", "businessName")
      .populate("service", "title")
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get review statistics */
export async function getReviewStats(req, res) {
  try {
    const totalReviews = await Review.countDocuments();
    
    const reviewsBySatus = await Review.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const reviewsByRating = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          totalRating: { $sum: "$rating" }
        }
      }
    ]);
    
    const recentlyApproved = await Review.find({ status: "Approved" })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("service", "title");
    
    const pendingReviews = await Review.countDocuments({ status: "Pending" });
    const approvedReviews = await Review.countDocuments({ status: "Approved" });
    const hiddenReviews = await Review.countDocuments({ status: "Hidden" });
    
    res.json({
      totalReviews,
      averageRating: avgRating[0]?.average?.toFixed(2) || 0,
      reviewsByStatus: reviewsBySatus,
      reviewsByRating,
      pendingReviews,
      approvedReviews,
      hiddenReviews,
      recentlyApproved
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
