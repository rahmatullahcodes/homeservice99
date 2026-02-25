import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

/* ============ PUBLIC / USER ENDPOINTS ============ */

/* Get all services */
export async function getAllServices(req, res) {
  try {
    const { category, subcategory, search } = req.query;
    let filter = { active: true, status: "active" };
    
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    
    const services = await Service.find(filter)
      .populate("vendor", "name email image")
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get service by ID */
export async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.id)
      .populate("vendor", "name email image phone");
    
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get services by category */
export async function getServicesByCategory(req, res) {
  try {
    const services = await Service.find({ 
      category: req.params.category, 
      active: true,
      status: "active"
    })
    .populate("vendor", "name email")
    .sort({ rating: -1 });
    
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get services by subcategory */
export async function getServicesBySubcategory(req, res) {
  try {
    const { category, subcategory } = req.params;
    const services = await Service.find({
      category,
      subcategory,
      active: true,
      status: "active"
    })
    .populate("vendor", "name email image")
    .sort({ rating: -1 });
    
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get all categories */
export async function getAllCategories(req, res) {
  try {
    const categories = await Service.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Get subcategories by category */
export async function getSubcategoriesByCategory(req, res) {
  try {
    const { category } = req.params;
    const subcategories = await Service.distinct("subcategory", { category });
    res.json({ subcategories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* ============ ADMIN ENDPOINTS ============ */

/* Admin: Get all services (including inactive) */
export async function adminGetAllServices(req, res) {
  try {
    const { status, category, vendor } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    
    const services = await Service.find(filter)
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Admin: Create service */
export async function adminCreateService(req, res) {
  try {
    const { title, category, subcategory, price, duration, image, features, vendor } = req.body;
    
    const service = new Service({
      title,
      category,
      subcategory,
      price,
      duration,
      image,
      features,
      vendor,
      status: "pending",
      approvedByAdmin: false
    });
    
    const savedService = await service.save();
    res.status(201).json({ message: "Service created successfully", data: savedService });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Admin: Update service */
export async function adminUpdateService(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const service = await Service.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).populate("vendor", "name email");
    
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service updated successfully", data: service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Admin: Approve service */
export async function adminApproveService(req, res) {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      id,
      { 
        approvedByAdmin: true, 
        status: "active",
        adminNotes,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service approved successfully", data: service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Admin: Reject service */
export async function adminRejectService(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      id,
      { 
        status: "inactive",
        adminNotes: reason,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service rejected", data: service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Admin: Delete service */
export async function adminDeleteService(req, res) {
  try {
    const { id } = req.params;
    
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* ============ VENDOR ENDPOINTS ============ */

/* Vendor: Get their services */
export async function vendorGetServices(req, res) {
  try {
    const vendorId = req.user.id;
    const services = await Service.find({ vendor: vendorId })
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* Vendor: Create service */
export async function vendorCreateService(req, res) {
  try {
    const vendorId = req.user.id;
    const { title, category, subcategory, price, oldPrice, duration, image, features, rating, reviews, badge, options, brand, skinType, ingredient } = req.body;
    
    const service = new Service({
      title,
      category,
      subcategory,
      price,
      oldPrice,
      duration,
      image,
      features,
      rating,
      reviews,
      badge,
      options,
      brand,
      skinType,
      ingredient,
      vendor: vendorId,
      status: "pending",
      approvedByAdmin: false
    });
    
    const savedService = await service.save();
    res.status(201).json({ message: "Service created and awaiting admin approval", data: savedService });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Vendor: Update their service */
export async function vendorUpdateService(req, res) {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    let service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    if (service.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized to update this service" });
    }
    
    service = await Service.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json({ message: "Service updated successfully", data: service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Vendor: Delete their service */
export async function vendorDeleteService(req, res) {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    if (service.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }
    
    await Service.findByIdAndDelete(id);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* Vendor: Get service stats */
export async function vendorGetServiceStats(req, res) {
  try {
    const vendorId = req.user.id;
    
    const totalServices = await Service.countDocuments({ vendor: vendorId });
    const activeServices = await Service.countDocuments({ vendor: vendorId, status: "active" });
    const pendingServices = await Service.countDocuments({ vendor: vendorId, status: "pending" });
    
    const avgRating = await Service.aggregate([
      { $match: { vendor: mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    
    res.json({
      totalServices,
      activeServices,
      pendingServices,
      avgRating: avgRating[0]?.avgRating || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
