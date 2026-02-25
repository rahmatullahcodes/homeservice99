import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  // Banner routes
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
  // Blog routes
  getAllBlogs,
  getPublishedBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  publishBlog,
  deleteBlog,
  // Page routes
  getAllPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  // Stats
  getCMSStats
} from "../controllers/cmsController.js";

const router = express.Router();

console.log("🔍 Building CMS routes...");

// ============ BANNER ROUTES ============

// Public routes FIRST (before parameterized routes)
router.get("/banners/public/active", getActiveBanners);

// Admin routes (require authentication)
router.get("/banners", adminAuth, getAllBanners);
router.get("/banners/admin/stats", adminAuth, getCMSStats);
router.post("/banners", adminAuth, createBanner);
router.get("/banners/:id", adminAuth, getBannerById);
router.patch("/banners/:id", adminAuth, updateBanner);
router.patch("/banners/:id/toggle", adminAuth, toggleBanner);
router.delete("/banners/:id", adminAuth, deleteBanner);

// ============ BLOG ROUTES ============

// Public routes FIRST (before parameterized routes)
router.get("/blogs/public/published", getPublishedBlogs);
router.get("/blogs/public/slug/:slug", getBlogBySlug);

// Admin routes
router.get("/blogs", adminAuth, getAllBlogs);
router.post("/blogs", adminAuth, createBlog);
router.get("/blogs/:id", adminAuth, getBlogById);
router.patch("/blogs/:id", adminAuth, updateBlog);
router.patch("/blogs/:id/publish", adminAuth, publishBlog);
router.delete("/blogs/:id", adminAuth, deleteBlog);

// ============ PAGE ROUTES ============

// Public routes FIRST (before parameterized routes)
router.get("/pages/public/slug/:slug", getPageBySlug);

// Admin routes
router.get("/pages", adminAuth, getAllPages);
router.post("/pages", adminAuth, createPage);
router.get("/pages/:id", adminAuth, getPageById);
router.patch("/pages/:id", adminAuth, updatePage);
router.delete("/pages/:id", adminAuth, deletePage);

// ============ STATS ROUTE ============

router.get("/stats", adminAuth, getCMSStats);

export default router;
