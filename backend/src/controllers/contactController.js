// src/controllers/contactController.js
import Contact from "../models/Contact.js";

// Initialize email transporter only if credentials are available
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    const nodemailer = await import("nodemailer");
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    console.log("✅ Email transporter configured");
  } catch (err) {
    console.log("⚠️ Nodemailer not available, email notifications disabled");
  }
}

// Submit contact form
export async function submitContact(req, res) {
  try {
    const { name, email, phone, subject, category, message, userType } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters" });
    }

    // Create contact submission
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "General Inquiry",
      category: category || "General Inquiry",
      message: message.trim(),
      userType: userType || "Guest",
      userId: req.user?._id || null,
      priority: category === "Bug Report" || category === "Payment Issue" ? "High" : "Medium"
    });

    await contact.save();

    // Send confirmation email to user (if email is configured)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "We received your message - Home Service99",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Thank you for contacting us!</h2>
              <p>Hi ${name},</p>
              <p>We have received your inquiry and our support team will get back to you within 24 hours.</p>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Ticket ID:</strong> ${contact._id}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Status:</strong> New</p>
              </div>
              
              <p>If you have any urgent concerns, please call us at <strong>+91 99999 88888</strong></p>
              
              <p>Best regards,<br/>Home Service99 Support Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
    }

    // Send notification to admin (if email is configured)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || "admin@homeservice99.com",
          subject: `New Contact Form Submission - ${category}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h3>New Contact Form Submission</h3>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Priority:</strong> ${contact.priority}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
              <hr/>
              <p><a href="${process.env.ADMIN_URL || "http://localhost:5173"}/admin/contacts/${contact._id}">View in Admin Panel</a></p>
            </div>
          `
        });
      } catch (adminEmailError) {
        console.error("Error sending admin notification:", adminEmailError);
      }
    }

    res.status(201).json({
      message: "Thank you for your message! We'll respond within 24 hours.",
      contactId: contact._id,
      data: contact
    });
  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ message: "Failed to submit contact form", error: err.message });
  }
}

// Get all contacts (admin only)
export async function getAllContacts(req, res) {
  try {
    const { status, category, userType, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (userType) filter.userType = userType;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .populate("vendorId", "name email");

    // Return array directly for frontend compatibility
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get contact by ID
export async function getContactById(req, res) {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("vendorId", "name email")
      .populate("respondedBy", "name email");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update contact status
export async function updateContactStatus(req, res) {
  try {
    const { status, response } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        status,
        response: response || contact?.response,
        respondedBy: status !== "New" ? req.user._id : null,
        resolvedAt: status === "Resolved" ? new Date() : null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Send response email if response is provided (and email is configured)
    if (response && transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: contact.email,
          subject: `Response to your inquiry - Home Service99`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>We've responded to your inquiry</h2>
              <p>Hi ${contact.name},</p>
              <p>${response}</p>
              <hr/>
              <p>Best regards,<br/>Home Service99 Support Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Error sending response email:", emailError);
      }
    }

    res.json({ message: "Contact updated successfully", data: contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get contact statistics
export async function getContactStats(req, res) {
  try {
    const total = await Contact.countDocuments();
    const newCount = await Contact.countDocuments({ status: "New" });
    const inProgress = await Contact.countDocuments({ status: "In Progress" });
    const resolved = await Contact.countDocuments({ status: "Resolved" });
    const closed = await Contact.countDocuments({ status: "Closed" });

    const byCategory = await Contact.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byStatus: {
        "New": newCount,
        "In Progress": inProgress,
        "Resolved": resolved,
        "Closed": closed
      },
      byCategory: Object.fromEntries(byCategory.map(item => [item._id, item.count])),
      recentSubmissions: await Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Delete contact
export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get user's own contacts
export async function getUserContacts(req, res) {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
