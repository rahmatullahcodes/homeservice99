import Settings from "../models/Settings.js";

export async function getSettings() {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    return {
      success: true,
      data: settings
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function updateSettings(req, res) {
  try {
    const {
      platformCommission,
      gstTax,
      payoutCycle,
      minimumPayoutAmount,
      maximumPayoutAmount,
      maintenanceMode,
      vendorSignupEnabled,
      userSignupEnabled,
      bookingsEnabled,
      emailNotificationsEnabled,
      smsNotificationsEnabled,
      pushNotificationsEnabled,
      emailService,
      emailFromAddress,
      smsService,
      minBookingAdvanceHours,
      maxBookingAdvanceDays,
      cancellationDeadlineHours,
      cancellationRefundPercentage,
      reviewAllowedDaysAfter,
      minReviewLength,
      maxActiveBookingsPerUser,
      maxActiveListingsPerVendor
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Update financial settings
    if (platformCommission !== undefined) settings.platformCommission = platformCommission;
    if (gstTax !== undefined) settings.gstTax = gstTax;
    
    // Update payout settings
    if (payoutCycle) settings.payoutCycle = payoutCycle;
    if (minimumPayoutAmount !== undefined) settings.minimumPayoutAmount = minimumPayoutAmount;
    if (maximumPayoutAmount !== undefined) settings.maximumPayoutAmount = maximumPayoutAmount;
    
    // Update platform controls
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (vendorSignupEnabled !== undefined) settings.vendorSignupEnabled = vendorSignupEnabled;
    if (userSignupEnabled !== undefined) settings.userSignupEnabled = userSignupEnabled;
    if (bookingsEnabled !== undefined) settings.bookingsEnabled = bookingsEnabled;
    
    // Update communication settings
    if (emailNotificationsEnabled !== undefined) settings.emailNotificationsEnabled = emailNotificationsEnabled;
    if (smsNotificationsEnabled !== undefined) settings.smsNotificationsEnabled = smsNotificationsEnabled;
    if (pushNotificationsEnabled !== undefined) settings.pushNotificationsEnabled = pushNotificationsEnabled;
    
    if (emailService) settings.emailService = emailService;
    if (emailFromAddress) settings.emailFromAddress = emailFromAddress;
    if (smsService) settings.smsService = smsService;
    
    // Update booking settings
    if (minBookingAdvanceHours !== undefined) settings.minBookingAdvanceHours = minBookingAdvanceHours;
    if (maxBookingAdvanceDays !== undefined) settings.maxBookingAdvanceDays = maxBookingAdvanceDays;
    if (cancellationDeadlineHours !== undefined) settings.cancellationDeadlineHours = cancellationDeadlineHours;
    if (cancellationRefundPercentage !== undefined) settings.cancellationRefundPercentage = cancellationRefundPercentage;
    
    // Update review settings
    if (reviewAllowedDaysAfter !== undefined) settings.reviewAllowedDaysAfter = reviewAllowedDaysAfter;
    if (minReviewLength !== undefined) settings.minReviewLength = minReviewLength;
    
    // Update system settings
    if (maxActiveBookingsPerUser !== undefined) settings.maxActiveBookingsPerUser = maxActiveBookingsPerUser;
    if (maxActiveListingsPerVendor !== undefined) settings.maxActiveListingsPerVendor = maxActiveListingsPerVendor;

    settings.updatedBy = req.user?._id || null;

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function resetToDefaults(req, res) {
  try {
    const defaults = new Settings();
    await Settings.deleteMany();
    const newSettings = await defaults.save();

    res.json({
      success: true,
      message: "Settings reset to defaults",
      data: newSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getSettingsStats(req, res) {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.json({
        success: true,
        stats: {
          financialSettings: { commission: 0, tax: 0 },
          platformStatus: {
            maintenance: false,
            vendorSignup: true,
            userSignup: true,
            bookings: true
          },
          communicationEnabled: {
            email: true,
            sms: true,
            push: true
          },
          bookingConstraints: {
            minAdvanceHours: 0,
            maxAdvanceDays: 0,
            cancellationDeadline: 0
          }
        }
      });
    }

    res.json({
      success: true,
      stats: {
        financialSettings: {
          commission: settings.platformCommission,
          tax: settings.gstTax,
          payoutCycle: settings.payoutCycle,
          minPayout: settings.minimumPayoutAmount,
          maxPayout: settings.maximumPayoutAmount
        },
        platformStatus: {
          maintenance: settings.maintenanceMode,
          vendorSignup: settings.vendorSignupEnabled,
          userSignup: settings.userSignupEnabled,
          bookings: settings.bookingsEnabled
        },
        communicationEnabled: {
          email: settings.emailNotificationsEnabled,
          sms: settings.smsNotificationsEnabled,
          push: settings.pushNotificationsEnabled
        },
        bookingConstraints: {
          minAdvanceHours: settings.minBookingAdvanceHours,
          maxAdvanceDays: settings.maxBookingAdvanceDays,
          cancellationDeadline: settings.cancellationDeadlineHours,
          refundPercentage: settings.cancellationRefundPercentage
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
