import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

// Helper to get date range
function getDateRange(rangeType) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate;

  switch (rangeType) {
    case "today":
      startDate = startOfDay;
      break;
    case "week":
      startDate = new Date(startOfDay);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = startOfDay;
  }

  return { startDate, endDate: now };
}

// Get dashboard stats for selected range
export async function getDashboardStats(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === "completed").length;

    const activeVendors = await Vendor.distinct("_id", {
      "bookings._id": { $in: bookings.map(b => b._id) }
    });

    const newUsers = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const stats = {
      range,
      totalRevenue,
      totalBookings,
      completedBookings,
      activeVendors: activeVendors.length,
      newUsers,
      conversionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(2) : 0,
      dateRange: { startDate, endDate }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get service performance breakdown
export async function getServicePerformance(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const services = await Service.find().select("_id name category");

    const performance = await Promise.all(
      services.map(async (service) => {
        const bookings = await Booking.find({
          serviceId: service._id,
          createdAt: { $gte: startDate, $lte: endDate }
        });

        const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        const completed = bookings.filter(b => b.status === "completed").length;

        const reviews = await Review.find({
          serviceId: service._id,
          createdAt: { $gte: startDate, $lte: endDate }
        });

        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
            : 0;

        return {
          serviceId: service._id,
          serviceName: service.name,
          category: service.category,
          totalBookings: bookings.length,
          completedBookings: completed,
          totalRevenue: revenue,
          averageRating: avgRating,
          totalReviews: reviews.length
        };
      })
    );

    res.json(performance.sort((a, b) => b.totalRevenue - a.totalRevenue));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get top vendors
export async function getTopVendors(req, res) {
  try {
    const { range = "month", limit = 10 } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const vendors = await Vendor.find().select("_id businessName rating totalReviews");

    const topVendors = await Promise.all(
      vendors.map(async (vendor) => {
        const bookings = await Booking.find({
          vendorId: vendor._id,
          createdAt: { $gte: startDate, $lte: endDate }
        });

        const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        const completed = bookings.filter(b => b.status === "completed").length;

        return {
          vendorId: vendor._id,
          vendorName: vendor.businessName,
          totalBookings: bookings.length,
          completedBookings: completed,
          totalRevenue: revenue,
          rating: vendor.rating,
          totalReviews: vendor.totalReviews
        };
      })
    );

    const sorted = topVendors
      .filter(v => v.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get category performance
export async function getCategoryPerformance(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const services = await Service.find().select("category rating");
    const categories = [...new Set(services.map(s => s.category))];

    const performance = await Promise.all(
      categories.map(async (category) => {
        const categoryServices = services
          .filter(s => s.category === category)
          .map(s => s._id);

        const bookings = await Booking.find({
          serviceId: { $in: categoryServices },
          createdAt: { $gte: startDate, $lte: endDate }
        });

        const reviews = await Review.find({
          serviceId: { $in: categoryServices },
          createdAt: { $gte: startDate, $lte: endDate }
        });

        const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        const avgRating = reviews.length > 0 
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;

        return {
          category,
          bookings: bookings.length,
          revenue: revenue,
          rating: avgRating
        };
      })
    );

    res.json(performance.filter(p => p.bookings > 0).sort((a, b) => b.revenue - a.revenue));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get revenue trend over time
export async function getRevenueTrend(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select("amount createdAt");

    const dailyData = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split("T")[0];
      dailyData[date] = (dailyData[date] || 0) + (booking.amount || 0);
    });

    const trend = Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get booking trend over time
export async function getBookingTrend(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select("status createdAt");

    const dailyData = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split("T")[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    const trend = Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get user analytics
export async function getUserAnalytics(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const totalUsers = await User.countDocuments({ role: "customer" });
    const newUsers = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const activeUsers = await Booking.distinct("customerId", {
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const repeatCustomers = await User.countDocuments({
      role: "customer",
      bookings: { $exists: true, $not: { $size: 0 } }
    });

    res.json({
      totalUsers,
      newUsers,
      activeUsers: activeUsers.length,
      repeatCustomers,
      newUserPercentage: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get complete report for export
export async function getCompleteReport(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const stats = await exports.getDashboardStats({ query: { range } }, { json: (d) => d });
    const servicePerf = await Service.find();
    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const report = {
      generatedAt: new Date(),
      dateRange: { startDate, endDate },
      range,
      dashboardStats: stats,
      totalBookings: bookings.length,
      bookingsByStatus: {
        pending: bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        completed: bookings.filter(b => b.status === "completed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length
      },
      totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get booking status breakdown
export async function getBookingStatusBreakdown(req, res) {
  try {
    const { range = "month" } = req.query;
    const { startDate, endDate } = getDateRange(range);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const breakdown = [
      { status: "Completed", count: bookings.filter(b => b.status === "completed").length },
      { status: "Pending", count: bookings.filter(b => b.status === "pending").length },
      { status: "InProgress", count: bookings.filter(b => b.status === "InProgress" || b.status === "confirmed").length },
      { status: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length }
    ];

    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
