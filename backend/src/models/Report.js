const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ["daily", "weekly", "monthly", "custom"],
    default: "daily"
  },
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  revenue: {
    total: Number,
    byService: Map,
    byCategory: Map,
    byVendor: Map
  },
  bookings: {
    total: Number,
    byService: Map,
    byCategory: Map,
    byStatus: Map
  },
  users: {
    totalUsers: Number,
    newUsers: Number,
    activeUsers: Number
  },
  vendors: {
    totalVendors: Number,
    activeVendors: Number,
    topPerformers: [
      {
        vendorId: mongoose.Schema.Types.ObjectId,
        vendorName: String,
        bookings: Number,
        revenue: Number,
        rating: Number
      }
    ]
  },
  services: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,
      serviceName: String,
      category: String,
      bookings: Number,
      revenue: Number,
      averageRating: Number
    }
  ],
  trends: {
    bookingsTrend: [{ date: Date, count: Number }],
    revenueTrend: [{ date: Date, amount: Number }],
    topHours: [{ hour: Number, bookings: Number }],
    topDays: [{ day: String, bookings: Number }]
  },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
