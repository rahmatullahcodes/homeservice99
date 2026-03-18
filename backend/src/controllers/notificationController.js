// src/controllers/notificationController.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

// Get all notifications
export async function getAllNotifications(req, res) {
  try {
    const { status, type, audience, sortBy } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (audience) filter.audience = audience;

    let query = Notification.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const notifications = await query.lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single notification
export async function getNotification(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id)
      .populate("createdBy", "name email")
      .populate("targetAudience.users", "name email")
      .populate("targetAudience.vendors", "businessName email");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create notification (draft)
export async function createNotification(req, res) {
  try {
    const {
      title,
      message,
      audience,
      type,
      city,
      priority,
      imageUrl,
      actionUrl,
      actionLabel,
      scheduledFor,
      showAsPopup
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const newNotification = new Notification({
      title,
      message,
      audience: audience || "Users",
      type: type || "Push",
      city: city || "All",
      priority: priority || "Medium",
      imageUrl,
      actionUrl,
      actionLabel: actionLabel || "",
      showAsPopup: Boolean(showAsPopup),
      status: scheduledFor ? "Scheduled" : "Draft",
      scheduledFor,
      deliveryStatus: {
        total: 0,
        sent: 0,
        failed: 0,
        read: 0
      }
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Send notification immediately
export async function sendNotification(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Get target recipients based on audience
    let recipients = [];

    if (notification.audience === "Users") {
      if (notification.city && notification.city !== "All") {
        recipients = await User.find({ city: notification.city });
      } else {
        recipients = await User.find({ role: "customer" });
      }
    } else if (notification.audience === "Vendors") {
      if (notification.city && notification.city !== "All") {
        recipients = await Vendor.find({ city: notification.city });
      } else {
        recipients = await Vendor.find();
      }
    } else if (notification.audience === "Specific") {
      recipients = notification.targetAudience.users.concat(
        notification.targetAudience.vendors
      );
    }

    // Update notification status
    notification.status = "Sent";
    notification.sentAt = new Date();
    notification.deliveryStatus.total = recipients.length;
    notification.deliveryStatus.sent = recipients.length;

    // In production, you would send push notifications via service like Firebase
    // For now, we just update the status
    console.log(`Notification sent to ${recipients.length} recipients`);

    await notification.save();

    res.json({
      message: "Notification sent successfully",
      notification,
      recipientCount: recipients.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update notification
export async function updateNotification(req, res) {
  try {
    const { id } = req.params;
    const { title, message, audience, type, city, priority, imageUrl, actionUrl, actionLabel, showAsPopup } = req.body;
    const updates = { updatedAt: new Date() };

    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (audience !== undefined) updates.audience = audience;
    if (type !== undefined) updates.type = type;
    if (city !== undefined) updates.city = city;
    if (priority !== undefined) updates.priority = priority;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (actionUrl !== undefined) updates.actionUrl = actionUrl;
    if (actionLabel !== undefined) updates.actionLabel = actionLabel;
    if (showAsPopup !== undefined) updates.showAsPopup = Boolean(showAsPopup);

    const notification = await Notification.findByIdAndUpdate(id, updates, { new: true });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Public endpoint: latest active popup broadcast for first-time visitors
export async function getLatestPopupNotification(req, res) {
  try {
    const notification = await Notification.findOne({
      status: "Sent",
      audience: "Users",
      showAsPopup: true
    })
      .sort({ sentAt: -1, createdAt: -1 })
      .lean();

    if (!notification) {
      return res.json(null);
    }

    res.json({
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      imageUrl: notification.imageUrl || "",
      actionUrl: notification.actionUrl || "",
      actionLabel: notification.actionLabel || "",
      priority: notification.priority || "Medium",
      sentAt: notification.sentAt || notification.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get notification statistics
export async function getNotificationStats(req, res) {
  try {
    const total = await Notification.countDocuments();
    const sent = await Notification.countDocuments({ status: "Sent" });
    const draft = await Notification.countDocuments({ status: "Draft" });
    const scheduled = await Notification.countDocuments({ status: "Scheduled" });

    const byType = {
      push: await Notification.countDocuments({ type: "Push" }),
      email: await Notification.countDocuments({ type: "Email" }),
      inApp: await Notification.countDocuments({ type: "In-App" }),
      sms: await Notification.countDocuments({ type: "SMS" })
    };

    const byAudience = {
      users: await Notification.countDocuments({ audience: "Users" }),
      vendors: await Notification.countDocuments({ audience: "Vendors" }),
      specific: await Notification.countDocuments({ audience: "Specific" })
    };

    res.json({
      total,
      status: {
        sent,
        draft,
        scheduled
      },
      byType,
      byAudience
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
