import Banner from "../models/Banner.js";
import Blog from "../models/Blog.js";
import Page from "../models/Page.js";

// ============ BANNER OPERATIONS ============

export async function getAllBanners(req, res) {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getActiveBanners(req, res) {
  try {
    const banners = await Banner.find({ 
      active: true,
      $or: [
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    }).sort({ displayOrder: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBannerById(req, res) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createBanner(req, res) {
  try {
    const { title, description, image, link, displayOrder } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const banner = new Banner({
      title,
      description: description || "",
      image: image || "",
      link: link || "",
      displayOrder: displayOrder || 0
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateBanner(req, res) {
  try {
    const { id } = req.params;
    const { title, description, image, link, active, displayOrder, endDate } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (title) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (image) banner.image = image;
    if (link) banner.link = link;
    if (active !== undefined) banner.active = active;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;
    if (endDate) banner.endDate = endDate;
    banner.updatedAt = Date.now();

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleBanner(req, res) {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.active = !banner.active;
    banner.updatedAt = Date.now();
    await banner.save();

    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteBanner(req, res) {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ============ BLOG OPERATIONS ============

export async function getAllBlogs(req, res) {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPublishedBlogs(req, res) {
  try {
    const blogs = await Blog.find({ status: "Published" }).sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBlogBySlug(req, res) {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createBlog(req, res) {
  try {
    const { title, content, summary, author, category, image, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const blog = new Blog({
      title,
      slug,
      content,
      summary: summary || content.substring(0, 200),
      author: author || "Admin",
      category: category || "Tips",
      image: image || "",
      tags: tags || [],
      status: "Draft"
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, content, summary, author, category, image, tags, status } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (title) {
      blog.title = title;
      blog.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    if (content) blog.content = content;
    if (summary) blog.summary = summary;
    if (author) blog.author = author;
    if (category) blog.category = category;
    if (image) blog.image = image;
    if (tags) blog.tags = tags;
    if (status) {
      blog.status = status;
      if (status === "Published" && !blog.publishedAt) {
        blog.publishedAt = Date.now();
      }
    }
    blog.updatedAt = Date.now();

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function publishBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.status = "Published";
    blog.publishedAt = Date.now();
    blog.updatedAt = Date.now();
    await blog.save();

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ============ PAGE OPERATIONS ============

export async function getAllPages(req, res) {
  try {
    const pages = await Page.find().sort({ title: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPageBySlug(req, res) {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug, active: true });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPageById(req, res) {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createPage(req, res) {
  try {
    const { title, content, metaTitle, metaDescription, metaKeywords, template } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const page = new Page({
      title,
      slug,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || "",
      metaKeywords: metaKeywords || "",
      template: template || "Standard"
    });

    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePage(req, res) {
  try {
    const { id } = req.params;
    const { title, content, metaTitle, metaDescription, metaKeywords, active, template } = req.body;

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (title) {
      page.title = title;
      page.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    if (content) page.content = content;
    if (metaTitle) page.metaTitle = metaTitle;
    if (metaDescription) page.metaDescription = metaDescription;
    if (metaKeywords) page.metaKeywords = metaKeywords;
    if (active !== undefined) page.active = active;
    if (template) page.template = template;
    page.updatedAt = Date.now();

    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deletePage(req, res) {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ message: "Page deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ============ STATISTICS ============

export async function getCMSStats(req, res) {
  try {
    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ active: true });
    
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: "Published" });
    const draftBlogs = await Blog.countDocuments({ status: "Draft" });
    
    const totalPages = await Page.countDocuments();
    const activePages = await Page.countDocuments({ active: true });

    res.json({
      banners: { total: totalBanners, active: activeBanners },
      blogs: { total: totalBlogs, published: publishedBlogs, draft: draftBlogs },
      pages: { total: totalPages, active: activePages }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
