import mongoose from "mongoose";

const codGatewaySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    displayName: { type: String, default: "Cash on Delivery" },
    description: { type: String, default: "Pay after the service is completed" }
  },
  { _id: false }
);

const razorpayGatewaySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    displayName: { type: String, default: "Razorpay" },
    description: { type: String, default: "UPI, cards and netbanking via Razorpay Checkout" },
    keyId: { type: String, default: "" },
    keySecret: { type: String, default: "" },
    webhookSecret: { type: String, default: "" }
  },
  { _id: false }
);

const merchantGatewaySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    displayName: { type: String, default: "" },
    description: { type: String, default: "" },
    merchantId: { type: String, default: "" },
    keyId: { type: String, default: "" },
    keySecret: { type: String, default: "" },
    merchantName: { type: String, default: "" },
    merchantUpiId: { type: String, default: "" }
  },
  { _id: false }
);

const bankTransferGatewaySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    displayName: { type: String, default: "Manual Bank Transfer" },
    description: { type: String, default: "Collect payment by sharing bank account details" },
    accountHolderName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    branchName: { type: String, default: "" },
    merchantUpiId: { type: String, default: "" }
  },
  { _id: false }
);

const paytmGatewaySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    displayName: { type: String, default: "Paytm Merchant" },
    description: { type: String, default: "Collect payment using Paytm merchant details or UPI" },
    merchantId: { type: String, default: "" },
    merchantKey: { type: String, default: "" },
    website: { type: String, default: "DEFAULT" },
    industryTypeId: { type: String, default: "Retail" },
    merchantName: { type: String, default: "" },
    merchantUpiId: { type: String, default: "" }
  },
  { _id: false }
);

const paymentGatewaySettingsSchema = new mongoose.Schema(
  {
    defaultGateway: {
      type: String,
      enum: ["cod", "razorpay", "bharatpe", "paytm", "bank_transfer"],
      default: "cod"
    },
    cod: { type: codGatewaySchema, default: () => ({}) },
    razorpay: { type: razorpayGatewaySchema, default: () => ({}) },
    bharatpe: {
      type: merchantGatewaySchema,
      default: () => ({
        displayName: "BharatPe Merchant",
        description: "Collect payment using BharatPe merchant details or UPI"
      })
    },
    bank_transfer: {
      type: bankTransferGatewaySchema,
      default: () => ({})
    },
    paytm: { type: paytmGatewaySchema, default: () => ({}) }
  },
  { _id: false }
);

const homeSectionVisibilitySchema = new mongoose.Schema(
  {
    banners: { type: Boolean, default: true },
    hero: { type: Boolean, default: true },
    promoSlider: { type: Boolean, default: true },
    popularServices: { type: Boolean, default: true },
    getQuote: { type: Boolean, default: true },
    offersDiscounts: { type: Boolean, default: true },
    curatedServices: { type: Boolean, default: true },
    promoBanner1: { type: Boolean, default: true },
    promoBanner2: { type: Boolean, default: true },
    promoBanner3: { type: Boolean, default: true }
  },
  { _id: false }
);

const homeCuratedSectionVisibilitySchema = new mongoose.Schema(
  {
    salonMen: { type: Boolean, default: true },
    massageMen: { type: Boolean, default: true },
    homeRepairInstallation: { type: Boolean, default: true },
    applianceServiceRepair: { type: Boolean, default: true },
    cleaningEssentials: { type: Boolean, default: true },
    spaWomen: { type: Boolean, default: true },
    salonWomen: { type: Boolean, default: true }
  },
  { _id: false }
);

const homeHeroStatsSchema = new mongoose.Schema(
  {
    bookingsCompleted: { type: String, default: "50k+ bookings completed" },
    averageRating: { type: String, default: "4.8 average rating" },
    responseTime: { type: String, default: "30 min avg. response" }
  },
  { _id: false }
);

const homePageSettingsSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Trusted Home Services at Your Doorstep"
    },
    discoveryTitle: {
      type: String,
      default: "What are you looking for?"
    },
    popularServicesTitle: {
      type: String,
      default: "Popular Services"
    },
    getQuoteTitle: {
      type: String,
      default: "Get Quote"
    },
    offersDiscountsTitle: {
      type: String,
      default: "Offers & discounts"
    },
    heroStats: { type: homeHeroStatsSchema, default: () => ({}) },
    sections: { type: homeSectionVisibilitySchema, default: () => ({}) },
    sectionOrder: {
      type: [String],
      default: () => ([
        "banners",
        "hero",
        "promoSlider",
        "popularServices",
        "getQuote",
        "offersDiscounts",
        "curatedServices",
        "promoBanner1",
        "promoBanner2",
        "promoBanner3"
      ])
    },
    curatedSectionVisibility: {
      type: homeCuratedSectionVisibilitySchema,
      default: () => ({})
    }
  },
  { _id: false }
);

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

    // Payment Gateway Settings
    paymentGateways: {
      type: paymentGatewaySettingsSchema,
      default: () => ({})
    },

    // Home Page Content Visibility & Labels
    homePage: {
      type: homePageSettingsSchema,
      default: () => ({})
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
