import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // Financial Settings
    platformCommission: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
      description: "Platform commission percentage on each booking"
    },
    gstTax: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
      description: "GST/Tax percentage"
    },
    
    // Payout Settings
    payoutCycle: {
      type: String,
      enum: ["Daily", "Weekly", "BiWeekly", "Monthly"],
      default: "Weekly"
    },
    minimumPayoutAmount: {
      type: Number,
      default: 500,
      min: 0,
      description: "Minimum amount required for vendor payout"
    },
    maximumPayoutAmount: {
      type: Number,
      default: 100000,
      min: 0,
      description: "Maximum amount per payout transaction"
    },
    
    // Platform Controls
    maintenanceMode: {
      type: Boolean,
      default: false,
      description: "Enable maintenance mode to restrict access"
    },
    vendorSignupEnabled: {
      type: Boolean,
      default: true,
      description: "Allow new vendor registrations"
    },
    userSignupEnabled: {
      type: Boolean,
      default: true,
      description: "Allow new user registrations"
    },
    bookingsEnabled: {
      type: Boolean,
      default: true,
      description: "Allow users to create new bookings"
    },
    
    // Communication Settings
    emailNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    smsNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    pushNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    
    // Email Service
    emailService: {
      type: String,
      enum: ["SendGrid", "Mailgun", "AWS_SES", "SMTP"],
      default: "SendGrid"
    },
    emailFromAddress: {
      type: String,
      default: "noreply@homeservice99.com"
    },
    
    // SMS Service
    smsService: {
      type: String,
      enum: ["Twilio", "AWS_SNS", "MSG91", "Exotel"],
      default: "Twilio"
    },
    
    // Booking Settings
    minBookingAdvanceHours: {
      type: Number,
      default: 2,
      description: "Minimum hours in advance to book a service"
    },
    maxBookingAdvanceDays: {
      type: Number,
      default: 90,
      description: "Maximum days in advance to book"
    },
    cancellationDeadlineHours: {
      type: Number,
      default: 2,
      description: "Hours before booking to allow cancellation with full refund"
    },
    cancellationRefundPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
      description: "Refund percentage for cancellations"
    },
    
    // Review Settings
    reviewAllowedDaysAfter: {
      type: Number,
      default: 1,
      description: "Days after booking completion to allow review"
    },
    minReviewLength: {
      type: Number,
      default: 10,
      description: "Minimum characters for a review"
    },
    
    // System Settings
    maxActiveBookingsPerUser: {
      type: Number,
      default: 10,
      description: "Maximum concurrent active bookings per user"
    },
    maxActiveListingsPerVendor: {
      type: Number,
      default: 50,
      description: "Maximum active service listings per vendor"
    },
    
    // Updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description: "Admin who last updated settings"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);
