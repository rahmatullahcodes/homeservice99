import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";
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
router.get("/banners", adminAuth, requireAdminPermission("cms"), getAllBanners);
router.get("/banners/admin/stats", adminAuth, requireAdminPermission("cms"), getCMSStats);
router.post("/banners", adminAuth, requireAdminPermission("cms"), createBanner);
router.get("/banners/:id", adminAuth, requireAdminPermission("cms"), getBannerById);
router.patch("/banners/:id", adminAuth, requireAdminPermission("cms"), updateBanner);
router.patch("/banners/:id/toggle", adminAuth, requireAdminPermission("cms"), toggleBanner);
router.delete("/banners/:id", adminAuth, requireAdminPermission("cms"), deleteBanner);

// ============ BLOG ROUTES ============

// Public routes FIRST (before parameterized routes)
router.get("/blogs/public/published", getPublishedBlogs);
router.get("/blogs/public/slug/:slug", getBlogBySlug);

// Admin routes
router.get("/blogs", adminAuth, requireAdminPermission("cms"), getAllBlogs);
router.post("/blogs", adminAuth, requireAdminPermission("cms"), createBlog);
router.get("/blogs/:id", adminAuth, requireAdminPermission("cms"), getBlogById);
router.patch("/blogs/:id", adminAuth, requireAdminPermission("cms"), updateBlog);
router.patch("/blogs/:id/publish", adminAuth, requireAdminPermission("cms"), publishBlog);
router.delete("/blogs/:id", adminAuth, requireAdminPermission("cms"), deleteBlog);

// ============ PAGE ROUTES ============

// Public routes FIRST (before parameterized routes)
router.get("/pages/public/slug/:slug", getPageBySlug);

// Admin routes
router.get("/pages", adminAuth, requireAdminPermission("cms"), getAllPages);
router.post("/pages", adminAuth, requireAdminPermission("cms"), createPage);
router.get("/pages/:id", adminAuth, requireAdminPermission("cms"), getPageById);
router.patch("/pages/:id", adminAuth, requireAdminPermission("cms"), updatePage);
router.delete("/pages/:id", adminAuth, requireAdminPermission("cms"), deletePage);

// ============ STATS ROUTE ============

router.get("/stats", adminAuth, requireAdminPermission("cms"), getCMSStats);

export default router;
