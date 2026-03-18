import Settings from "../models/Settings.js";
import {
  getAdminPaymentGatewaySettings,
  getPublicPaymentGatewaySettings,
  normalizePaymentGateways,
  updatePaymentGatewaySettings as savePaymentGatewaySettings
} from "../services/paymentGatewayService.js";

const HOME_PAGE_DEFAULTS = {
  heroTitle: "Trusted Home Services at Your Doorstep",
  discoveryTitle: "What are you looking for?",
  popularServicesTitle: "Popular Services",
  getQuoteTitle: "Get Quote",
  offersDiscountsTitle: "Offers & discounts",
  heroStats: {
    bookingsCompleted: "50k+ bookings completed",
    averageRating: "4.8 average rating",
    responseTime: "30 min avg. response"
  },
  sections: {
    banners: true,
    hero: true,
    promoSlider: true,
    popularServices: true,
    getQuote: true,
    offersDiscounts: true,
    curatedServices: true,
    promoBanner1: true,
    promoBanner2: true,
    promoBanner3: true
  },
  curatedSectionVisibility: {
    salonMen: true,
    massageMen: true,
    homeRepairInstallation: true,
    applianceServiceRepair: true,
    cleaningEssentials: true,
    spaWomen: true,
    salonWomen: true
  }
};

function cleanText(value, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function cleanBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeHomePageSettings(value = {}, base = HOME_PAGE_DEFAULTS) {
  const source = value && typeof value === "object" ? value : {};
  const mergedBase = {
    ...HOME_PAGE_DEFAULTS,
    ...base,
    heroStats: {
      ...HOME_PAGE_DEFAULTS.heroStats,
      ...(base.heroStats || {})
    },
    sections: {
      ...HOME_PAGE_DEFAULTS.sections,
      ...(base.sections || {})
    },
    curatedSectionVisibility: {
      ...HOME_PAGE_DEFAULTS.curatedSectionVisibility,
      ...(base.curatedSectionVisibility || {})
    }
  };

  return {
    heroTitle: cleanText(source.heroTitle, mergedBase.heroTitle),
    discoveryTitle: cleanText(source.discoveryTitle, mergedBase.discoveryTitle),
    popularServicesTitle: cleanText(source.popularServicesTitle, mergedBase.popularServicesTitle),
    getQuoteTitle: cleanText(source.getQuoteTitle, mergedBase.getQuoteTitle),
    offersDiscountsTitle: cleanText(source.offersDiscountsTitle, mergedBase.offersDiscountsTitle),
    heroStats: {
      bookingsCompleted: cleanText(source.heroStats?.bookingsCompleted, mergedBase.heroStats.bookingsCompleted),
      averageRating: cleanText(source.heroStats?.averageRating, mergedBase.heroStats.averageRating),
      responseTime: cleanText(source.heroStats?.responseTime, mergedBase.heroStats.responseTime)
    },
    sections: {
      banners: cleanBoolean(source.sections?.banners, mergedBase.sections.banners),
      hero: cleanBoolean(source.sections?.hero, mergedBase.sections.hero),
      promoSlider: cleanBoolean(source.sections?.promoSlider, mergedBase.sections.promoSlider),
      popularServices: cleanBoolean(source.sections?.popularServices, mergedBase.sections.popularServices),
      getQuote: cleanBoolean(source.sections?.getQuote, mergedBase.sections.getQuote),
      offersDiscounts: cleanBoolean(source.sections?.offersDiscounts, mergedBase.sections.offersDiscounts),
      curatedServices: cleanBoolean(source.sections?.curatedServices, mergedBase.sections.curatedServices),
      promoBanner1: cleanBoolean(source.sections?.promoBanner1, mergedBase.sections.promoBanner1),
      promoBanner2: cleanBoolean(source.sections?.promoBanner2, mergedBase.sections.promoBanner2),
      promoBanner3: cleanBoolean(source.sections?.promoBanner3, mergedBase.sections.promoBanner3)
    },
    curatedSectionVisibility: {
      salonMen: cleanBoolean(source.curatedSectionVisibility?.salonMen, mergedBase.curatedSectionVisibility.salonMen),
      massageMen: cleanBoolean(source.curatedSectionVisibility?.massageMen, mergedBase.curatedSectionVisibility.massageMen),
      homeRepairInstallation: cleanBoolean(
        source.curatedSectionVisibility?.homeRepairInstallation,
        mergedBase.curatedSectionVisibility.homeRepairInstallation
      ),
      applianceServiceRepair: cleanBoolean(
        source.curatedSectionVisibility?.applianceServiceRepair,
        mergedBase.curatedSectionVisibility.applianceServiceRepair
      ),
      cleaningEssentials: cleanBoolean(
        source.curatedSectionVisibility?.cleaningEssentials,
        mergedBase.curatedSectionVisibility.cleaningEssentials
      ),
      spaWomen: cleanBoolean(source.curatedSectionVisibility?.spaWomen, mergedBase.curatedSectionVisibility.spaWomen),
      salonWomen: cleanBoolean(source.curatedSectionVisibility?.salonWomen, mergedBase.curatedSectionVisibility.salonWomen)
    }
  };
}

function getSettingsResponse(settings) {
  return {
    ...settings.toObject(),
    paymentGateways: normalizePaymentGateways(settings.paymentGateways || {})
  };
}

export async function getSettings() {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    return {
      success: true,
      data: getSettingsResponse(settings)
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
      maxActiveListingsPerVendor,
      paymentGateways,
      homePage
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (platformCommission !== undefined) settings.platformCommission = platformCommission;
    if (gstTax !== undefined) settings.gstTax = gstTax;

    if (payoutCycle) settings.payoutCycle = payoutCycle;
    if (minimumPayoutAmount !== undefined) settings.minimumPayoutAmount = minimumPayoutAmount;
    if (maximumPayoutAmount !== undefined) settings.maximumPayoutAmount = maximumPayoutAmount;

    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (vendorSignupEnabled !== undefined) settings.vendorSignupEnabled = vendorSignupEnabled;
    if (userSignupEnabled !== undefined) settings.userSignupEnabled = userSignupEnabled;
    if (bookingsEnabled !== undefined) settings.bookingsEnabled = bookingsEnabled;

    if (emailNotificationsEnabled !== undefined) settings.emailNotificationsEnabled = emailNotificationsEnabled;
    if (smsNotificationsEnabled !== undefined) settings.smsNotificationsEnabled = smsNotificationsEnabled;
    if (pushNotificationsEnabled !== undefined) settings.pushNotificationsEnabled = pushNotificationsEnabled;

    if (emailService) settings.emailService = emailService;
    if (emailFromAddress) settings.emailFromAddress = emailFromAddress;
    if (smsService) settings.smsService = smsService;

    if (minBookingAdvanceHours !== undefined) settings.minBookingAdvanceHours = minBookingAdvanceHours;
    if (maxBookingAdvanceDays !== undefined) settings.maxBookingAdvanceDays = maxBookingAdvanceDays;
    if (cancellationDeadlineHours !== undefined) settings.cancellationDeadlineHours = cancellationDeadlineHours;
    if (cancellationRefundPercentage !== undefined) settings.cancellationRefundPercentage = cancellationRefundPercentage;

    if (reviewAllowedDaysAfter !== undefined) settings.reviewAllowedDaysAfter = reviewAllowedDaysAfter;
    if (minReviewLength !== undefined) settings.minReviewLength = minReviewLength;

    if (maxActiveBookingsPerUser !== undefined) settings.maxActiveBookingsPerUser = maxActiveBookingsPerUser;
    if (maxActiveListingsPerVendor !== undefined) settings.maxActiveListingsPerVendor = maxActiveListingsPerVendor;

    if (paymentGateways !== undefined) {
      settings.paymentGateways = normalizePaymentGateways(paymentGateways);
    }

    if (homePage !== undefined) {
      const currentHomePage = normalizeHomePageSettings(
        settings.homePage?.toObject?.() || settings.homePage || {}
      );

      settings.homePage = normalizeHomePageSettings(homePage, {
        ...HOME_PAGE_DEFAULTS,
        ...currentHomePage,
        heroStats: {
          ...HOME_PAGE_DEFAULTS.heroStats,
          ...(currentHomePage.heroStats || {})
        },
        sections: {
          ...HOME_PAGE_DEFAULTS.sections,
          ...(currentHomePage.sections || {})
        },
        curatedSectionVisibility: {
          ...HOME_PAGE_DEFAULTS.curatedSectionVisibility,
          ...(currentHomePage.curatedSectionVisibility || {})
        }
      });
    }

    settings.updatedBy = req.user?._id || null;

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: getSettingsResponse(settings)
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
      data: getSettingsResponse(newSettings)
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
          },
          paymentGateways: {
            totalEnabled: 1,
            defaultGateway: "cod"
          }
        }
      });
    }

    const paymentGateways = normalizePaymentGateways(settings.paymentGateways || {});
    const totalEnabled = ["cod", "razorpay", "bharatpe", "paytm", "bank_transfer"]
      .filter((code) => {
        if (code === "cod") return paymentGateways.cod.enabled;
        if (code === "razorpay") {
          return paymentGateways.razorpay.enabled &&
            paymentGateways.razorpay.keyId &&
            paymentGateways.razorpay.keySecret;
        }
        if (code === "bharatpe") {
          return paymentGateways.bharatpe.enabled &&
            (paymentGateways.bharatpe.merchantUpiId || paymentGateways.bharatpe.merchantId);
        }
        if (code === "paytm") {
          return paymentGateways.paytm.enabled &&
            (paymentGateways.paytm.merchantUpiId || (paymentGateways.paytm.merchantId && paymentGateways.paytm.merchantKey));
        }
        return paymentGateways.bank_transfer.enabled &&
          (
            (paymentGateways.bank_transfer.accountNumber && paymentGateways.bank_transfer.ifscCode) ||
            paymentGateways.bank_transfer.merchantUpiId
          );
      })
      .length;

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
        },
        paymentGateways: {
          totalEnabled,
          defaultGateway: paymentGateways.defaultGateway
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

export async function getHomePageSettings(req, res) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const homePage = normalizeHomePageSettings(
      settings.homePage?.toObject?.() || settings.homePage || {}
    );

    res.json({
      success: true,
      homePage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function updateHomePageSettings(req, res) {
  try {
    const incoming = req.body?.homePage || req.body || {};

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const current = normalizeHomePageSettings(
      settings.homePage?.toObject?.() || settings.homePage || {}
    );

    const merged = normalizeHomePageSettings(incoming, {
      ...HOME_PAGE_DEFAULTS,
      ...current,
      heroStats: { ...HOME_PAGE_DEFAULTS.heroStats, ...current.heroStats },
      sections: { ...HOME_PAGE_DEFAULTS.sections, ...current.sections },
      curatedSectionVisibility: {
        ...HOME_PAGE_DEFAULTS.curatedSectionVisibility,
        ...current.curatedSectionVisibility
      }
    });

    settings.homePage = merged;
    settings.updatedBy = req.user?._id || null;
    await settings.save();

    res.json({
      success: true,
      message: "Home page settings updated successfully",
      homePage: normalizeHomePageSettings(settings.homePage?.toObject?.() || settings.homePage || {})
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getPaymentGatewaySettings(req, res) {
  try {
    const paymentGateways = await getAdminPaymentGatewaySettings();
    res.json({
      success: true,
      paymentGateways
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function updatePaymentGatewaySettings(req, res) {
  try {
    const paymentGateways = await savePaymentGatewaySettings(
      req.body?.paymentGateways || req.body || {},
      req.user?._id || null
    );

    res.json({
      success: true,
      message: "Payment methods updated successfully",
      paymentGateways
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getPublicPaymentOptions(req, res) {
  try {
    const payload = await getPublicPaymentGatewaySettings();
    res.json({
      success: true,
      ...payload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getPublicHomePageSettings(req, res) {
  try {
    const settings = await Settings.findOne();

    const homePage = normalizeHomePageSettings(
      settings?.homePage?.toObject?.() || settings?.homePage || {}
    );

    res.json({
      success: true,
      homePage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
