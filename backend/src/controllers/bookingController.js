import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Service from "../models/Service.js";

/* Create booking (checkout) */
export async function createBooking(req, res) {
  try {
    const { serviceId, scheduledAt } = req.body;
    const userId = req.user.id;

    if (!serviceId || !scheduledAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = await Booking.create({
      user: userId,
      service: service.title,
      price: service.price,
      vendor: service.vendor,
      scheduledAt,
      status: "Pending"
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get user bookings */
export async function getUserBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate("vendor", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get booking by ID */
export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("vendor", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Cancel booking */
export async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Update booking status */
export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
