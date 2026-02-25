import User from "../models/User.js";
import Booking from "../models/Booking.js";

// Get Dashboard Data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const bookings = await Booking.find({ userId }).limit(3).sort({ createdAt: -1 });

    const stats = {
      totalBookings: await Booking.countDocuments({ userId }),
      totalSpent: (await Booking.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]))[0]?.total || 0,
      walletBalance: user?.walletBalance || 0,
      completedBookings: await Booking.countDocuments({ userId, status: "Completed" }),
      reviews: await Booking.countDocuments({ userId, hasReview: true })
    };

    res.render('account/dashboard', {
      user: user || {},
      stats,
      recentBookings: bookings,
      title: 'Dashboard',
      currentPage: 'dashboard',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get All Bookings
export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const filter = req.query.filter || 'All';

    let query = { userId };
    if (filter !== 'All') {
      query.status = filter;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.render('account/bookings', {
      bookings,
      filter,
      title: 'My Bookings',
      currentPage: 'bookings',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Reviews Page
export const getReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const bookings = await Booking.find({ userId, hasReview: true }).sort({ createdAt: -1 });

    res.render('account/reviews', {
      bookings,
      title: 'My Reviews',
      currentPage: 'reviews',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Profile Page
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/profile', {
      user,
      title: 'My Profile',
      currentPage: 'profile',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, address },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Addresses
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/addresses', {
      addresses: user?.addresses || [],
      title: 'My Addresses',
      currentPage: 'addresses',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Payments
export const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/payments', {
      paymentMethods: user?.paymentMethods || [],
      title: 'Payment Methods',
      currentPage: 'payments',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Coupons
export const getCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/coupons', {
      coupons: user?.coupons || [],
      title: 'My Coupons',
      currentPage: 'coupons',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Wallet
export const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/wallet', {
      walletBalance: user?.walletBalance || 0,
      title: 'My Wallet',
      currentPage: 'wallet',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Referral
export const getReferral = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/referral', {
      referralCode: user?.referralCode || 'REF' + userId,
      referrals: user?.referrals || [],
      title: 'Referral Program',
      currentPage: 'referral',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Get Settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('account/settings', {
      user,
      title: 'Settings',
      currentPage: 'settings',
      userName: user?.name || 'User',
      userEmail: user?.email || ''
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'Cancelled' },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download Invoice
export const downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    // Generate simple text invoice
    const invoice = `
INVOICE
Booking ID: ${booking._id}
Service: ${booking.serviceName}
Date: ${booking.date}
Price: ₹${booking.price}
Status: ${booking.status}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.txt');
    res.send(invoice);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
