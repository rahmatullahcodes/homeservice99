// src/controllers/supportTicketController.js
import SupportTicket from "../models/SupportTicket.js";

// Get all support tickets with filters
export async function getAllTickets(req, res) {
  try {
    const { status, priority, from, sortBy } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (from) filter.from = from;

    let query = SupportTicket.find(filter)
      .populate("userId", "name email")
      .populate("vendorId", "businessName email");

    // Sort
    if (sortBy === "date-asc") {
      query = query.sort({ createdAt: 1 });
    } else if (sortBy === "priority-high") {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      query = query.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else {
      query = query.sort({ createdAt: -1 }); // Default: newest first
    }

    const tickets = await query.lean();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single ticket
export async function getTicket(req, res) {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id)
      .populate("userId", "name email phone")
      .populate("vendorId", "businessName email");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new ticket
export async function createTicket(req, res) {
  try {
    const { from, userId, vendorId, name, email, issue, description, priority } = req.body;

    // Validation
    if (!from || !name || !email || !issue || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTicket = new SupportTicket({
      from,
      userId: from === "User" ? userId : null,
      vendorId: from === "Vendor" ? vendorId : null,
      name,
      email,
      issue,
      description,
      priority: priority || "Medium",
      status: "Open"
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update ticket
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { name, email, issue, description, priority, resolution } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      {
        name,
        email,
        issue,
        description,
        priority,
        resolution,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update ticket status
export async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Open", "In Progress", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // If closing ticket, set closedAt
    if (status === "Closed") {
      updateData.closedAt = new Date();
    }

    const ticket = await SupportTicket.findByIdAndUpdate(id, updateData, { new: true });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete ticket
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get ticket statistics
export async function getTicketStats(req, res) {
  try {
    const total = await SupportTicket.countDocuments();
    const open = await SupportTicket.countDocuments({ status: "Open" });
    const inProgress = await SupportTicket.countDocuments({ status: "In Progress" });
    const closed = await SupportTicket.countDocuments({ status: "Closed" });

    const byPriority = {
      high: await SupportTicket.countDocuments({ priority: "High" }),
      medium: await SupportTicket.countDocuments({ priority: "Medium" }),
      low: await SupportTicket.countDocuments({ priority: "Low" })
    };

    const byFrom = {
      user: await SupportTicket.countDocuments({ from: "User" }),
      vendor: await SupportTicket.countDocuments({ from: "Vendor" })
    };

    res.json({
      total,
      status: {
        open,
        inProgress,
        closed
      },
      byPriority,
      byFrom,
      averageResolutionTime: "24 hours" // Placeholder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
