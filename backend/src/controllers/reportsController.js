import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

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
      break;
  }

  return { startDate, endDate: now };
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function getBookingAmount(booking) {
  const value = booking?.price ?? booking?.amount ?? 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function getBookingStatusBreakdownData(bookings) {
  const counts = {
    Completed: 0,
    Pending: 0,
    InProgress: 0,
    Cancelled: 0
  };

  for (const booking of bookings) {
    const normalized = normalizeStatus(booking?.status);
    if (normalized === "completed") {
      counts.Completed += 1;
      continue;
    }
    if (normalized === "pending" || normalized === "scheduled") {
      counts.Pending += 1;
      continue;
    }
    if (normalized === "inprogress" || normalized === "confirmed") {
      counts.InProgress += 1;
      continue;
    }
    if (normalized === "cancelled" || normalized === "canceled") {
      counts.Cancelled += 1;
    }
  }

  return [
    { status: "Completed", count: counts.Completed },
    { status: "Pending", count: counts.Pending },
    { status: "InProgress", count: counts.InProgress },
    { status: "Cancelled", count: counts.Cancelled }
  ];
}

async function getBookingsForRange(range) {
  const { startDate, endDate } = getDateRange(range);
  const bookings = await Booking.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .select("status price amount serviceId service vendor vendorId user customerId createdAt")
    .lean();

  return { bookings, startDate, endDate };
}

async function buildReportData(range) {
  const { bookings, startDate, endDate } = await getBookingsForRange(range);
  const totalRevenue = bookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  ).length;

  const activeVendorIds = new Set(
    bookings
      .map((booking) => booking.vendor || booking.vendorId)
      .filter(Boolean)
      .map((id) => String(id))
  );

  const [totalUsers, newUsers, allServices, allVendors] = await Promise.all([
    User.countDocuments({ role: { $nin: ["admin"] } }),
    User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: { $nin: ["admin"] }
    }),
    Service.find().select("_id title category").lean(),
    Vendor.find().select("_id businessName rating totalReviews").lean()
  ]);

  const serviceIds = allServices.map((service) => service._id);
  const reviews = serviceIds.length
    ? await Review.find({
        service: { $in: serviceIds },
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .select("service rating")
        .lean()
    : [];

  const bookingsByService = new Map();
  for (const booking of bookings) {
    const serviceId = booking.serviceId ? String(booking.serviceId) : null;
    if (!serviceId) {
      continue;
    }
    const current = bookingsByService.get(serviceId) || { count: 0, revenue: 0, completed: 0 };
    current.count += 1;
    current.revenue += getBookingAmount(booking);
    if (normalizeStatus(booking.status) === "completed") {
      current.completed += 1;
    }
    bookingsByService.set(serviceId, current);
  }

  const reviewsByService = new Map();
  for (const review of reviews) {
    const serviceId = review.service ? String(review.service) : null;
    if (!serviceId) {
      continue;
    }
    const current = reviewsByService.get(serviceId) || { totalRating: 0, count: 0 };
    current.totalRating += Number(review.rating || 0);
    current.count += 1;
    reviewsByService.set(serviceId, current);
  }

  const services = allServices
    .map((service) => {
      const serviceId = String(service._id);
      const bookingStat = bookingsByService.get(serviceId) || { count: 0, revenue: 0, completed: 0 };
      const reviewStat = reviewsByService.get(serviceId) || { totalRating: 0, count: 0 };
      const avgRating =
        reviewStat.count > 0 ? Number((reviewStat.totalRating / reviewStat.count).toFixed(2)) : 0;

      return {
        serviceId: service._id,
        serviceName: service.title,
        category: service.category,
        totalBookings: bookingStat.count,
        completedBookings: bookingStat.completed,
        totalRevenue: bookingStat.revenue,
        averageRating: avgRating,
        totalReviews: reviewStat.count
      };
    })
    .filter((item) => item.totalBookings > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const bookingsByVendor = new Map();
  for (const booking of bookings) {
    const vendorId = booking.vendor || booking.vendorId;
    if (!vendorId) {
      continue;
    }
    const key = String(vendorId);
    const current = bookingsByVendor.get(key) || { count: 0, revenue: 0, completed: 0 };
    current.count += 1;
    current.revenue += getBookingAmount(booking);
    if (normalizeStatus(booking.status) === "completed") {
      current.completed += 1;
    }
    bookingsByVendor.set(key, current);
  }

  const vendors = allVendors
    .map((vendor) => {
      const stats = bookingsByVendor.get(String(vendor._id)) || {
        count: 0,
        revenue: 0,
        completed: 0
      };
      return {
        vendorId: vendor._id,
        vendorName: vendor.businessName,
        totalBookings: stats.count,
        completedBookings: stats.completed,
        totalRevenue: stats.revenue,
        rating: Number(vendor.rating || 0),
        totalReviews: Number(vendor.totalReviews || 0)
      };
    })
    .filter((vendor) => vendor.totalBookings > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const categoryMap = new Map();
  for (const service of services) {
    const key = service.category || "Other";
    const current = categoryMap.get(key) || {
      category: key,
      bookings: 0,
      revenue: 0,
      weightedRating: 0,
      reviewCount: 0
    };

    current.bookings += service.totalBookings;
    current.revenue += service.totalRevenue;
    current.weightedRating += service.averageRating * service.totalReviews;
    current.reviewCount += service.totalReviews;
    categoryMap.set(key, current);
  }

  const categories = Array.from(categoryMap.values())
    .map((category) => ({
      category: category.category,
      bookings: category.bookings,
      revenue: category.revenue,
      rating:
        category.reviewCount > 0
          ? Number((category.weightedRating / category.reviewCount).toFixed(1))
          : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueTrendMap = new Map();
  const bookingTrendMap = new Map();
  for (const booking of bookings) {
    const date = new Date(booking.createdAt).toISOString().split("T")[0];
    revenueTrendMap.set(date, (revenueTrendMap.get(date) || 0) + getBookingAmount(booking));
    bookingTrendMap.set(date, (bookingTrendMap.get(date) || 0) + 1);
  }

  const revenueTrend = Array.from(revenueTrendMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const bookingTrend = Array.from(bookingTrendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const activeUsers = new Set(
    bookings
      .map((booking) => booking.user || booking.customerId)
      .filter(Boolean)
      .map((id) => String(id))
  ).size;

  const repeatCustomerAggregate = await Booking.aggregate([
    { $match: { user: { $ne: null } } },
    { $group: { _id: "$user", bookings: { $sum: 1 } } },
    { $match: { bookings: { $gt: 1 } } },
    { $count: "total" }
  ]);

  const repeatCustomers = repeatCustomerAggregate[0]?.total || 0;
  const bookingStatus = getBookingStatusBreakdownData(bookings);

  const stats = {
    range,
    totalRevenue,
    totalBookings,
    completedBookings,
    activeVendors: activeVendorIds.size,
    newUsers,
    conversionRate: totalBookings > 0 ? Number(((completedBookings / totalBookings) * 100).toFixed(2)) : 0,
    dateRange: { startDate, endDate }
  };

  const userAnalytics = {
    totalUsers,
    newUsers,
    activeUsers,
    repeatCustomers,
    newUserPercentage: totalUsers > 0 ? Number(((newUsers / totalUsers) * 100).toFixed(2)) : 0
  };

  return {
    range,
    startDate,
    endDate,
    stats,
    services,
    vendors,
    categories,
    bookingStatus,
    userAnalytics,
    revenueTrend,
    bookingTrend
  };
}

export async function getDashboardStats(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getServicePerformance(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTopVendors(req, res) {
  try {
    const { range = "month", limit = 10 } = req.query;
    const report = await buildReportData(range);
    res.json(report.vendors.slice(0, Number(limit) || 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategoryPerformance(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRevenueTrend(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.revenueTrend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBookingTrend(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.bookingTrend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUserAnalytics(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.userAnalytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCompleteReport(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json({
      generatedAt: new Date(),
      range,
      dateRange: { startDate: report.startDate, endDate: report.endDate },
      stats: report.stats,
      services: report.services,
      vendors: report.vendors,
      categories: report.categories,
      bookingStatus: report.bookingStatus,
      userAnalytics: report.userAnalytics,
      revenueTrend: report.revenueTrend,
      bookingTrend: report.bookingTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBookingStatusBreakdown(req, res) {
  try {
    const { range = "month" } = req.query;
    const report = await buildReportData(range);
    res.json(report.bookingStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
