/**
 * Cloudflare Worker Backend for Terre Spa
 * Supports Cloudflare D1 (Relational SQL Database) + KV Storage Fallback
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-token",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

function verifyAuth(request, env) {
  const secretToken = env?.API_SECRET_TOKEN;
  if (!secretToken) return true;
  const authHeader = request.headers.get("Authorization") || "";
  const customHeader = request.headers.get("x-api-token") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || customHeader;
  return token === secretToken;
}

// Helper to parse SQL Post row back to Post object
function mapDbRowToPost(row) {
  if (!row) return null;
  let tags = [];
  try {
    tags = typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [];
  } catch (e) {
    tags = [];
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    category: row.category,
    tags,
    author: {
      name: row.author_name,
      role: row.author_role,
      avatar: row.author_avatar,
    },
    status: row.status || "published",
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readTimeMinutes: row.read_time_minutes || 5,
    featured: Boolean(row.featured),
    views: row.views || 0,
  };
}

// Helper to parse SQL Product row back to Product object
function mapDbRowToProduct(row) {
  if (!row) return null;
  let ingredients = [];
  let images = [];
  try {
    ingredients = typeof row.ingredients === "string" ? JSON.parse(row.ingredients) : row.ingredients || [];
  } catch (e) {}
  try {
    images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
  } catch (e) {}

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price || undefined,
    thumbnail: row.thumbnail,
    images,
    shortDesc: row.short_desc,
    fullDesc: row.full_desc,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    rating: row.rating || 5.0,
    reviewCount: row.review_count || 0,
    volumeOrWeight: row.volume_or_weight,
    ingredients,
    usageInstructions: row.usage_instructions,
    metaTitle: row.meta_title || undefined,
    metaDescription: row.meta_description || undefined,
    updatedAt: row.updated_at,
  };
}

// Helper to parse SQL Order row back to Order object
function mapDbRowToOrder(row) {
  if (!row) return null;
  let items = [];
  try {
    items = typeof row.items === "string" ? JSON.parse(row.items) : row.items || [];
  } catch (e) {}

  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address || "",
    customerNotes: row.customer_notes || "",
    items,
    totalAmount: row.total_amount,
    status: row.status || "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: row.source || "website_product_modal",
    adminNotes: row.admin_notes || "",
  };
}

// Helper to parse SQL Coupon row back to Coupon object
function mapDbRowToCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    description: row.description || "",
    discountType: row.discount_type || "percentage",
    discountValue: row.discount_value,
    minOrderValue: row.min_order_value || undefined,
    maxDiscountAmount: row.max_discount_amount || undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    usageLimit: row.usage_limit || undefined,
    usedCount: row.used_count || 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to parse SQL Review row back to Review object
function mapDbRowToReview(row) {
  if (!row) return null;
  return {
    id: row.id,
    author: row.author,
    rating: row.rating || 5,
    comment: row.comment,
    serviceName: row.service_name || undefined,
    date: row.date || undefined,
    avatar: row.avatar || undefined,
    featured: Boolean(row.featured),
  };
}

/**
 * Migration runner: ensures all D1 tables and columns exist
 */
async function ensureSchema(db) {
  if (!db) return;
  const initSqls = [
    `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      category TEXT NOT NULL,
      tags TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT,
      author_avatar TEXT,
      status TEXT DEFAULT 'published',
      published_at TEXT NOT NULL,
      updated_at TEXT,
      read_time_minutes INTEGER DEFAULT 5,
      featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      thumbnail TEXT NOT NULL,
      images TEXT,
      short_desc TEXT,
      full_desc TEXT,
      in_stock INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      volume_or_weight TEXT,
      ingredients TEXT,
      usage_instructions TEXT,
      meta_title TEXT,
      meta_description TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT,
      customer_notes TEXT,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      source TEXT DEFAULT 'website_product_modal',
      admin_notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount_amount REAL,
      start_date TEXT,
      end_date TEXT,
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      comment TEXT NOT NULL,
      service_name TEXT,
      date TEXT,
      avatar TEXT,
      featured INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      icon_name TEXT DEFAULT 'Sparkles',
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INTEGER,
      image TEXT,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ];

  for (const sql of initSqls) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      console.warn("Init table error (non-fatal):", e.message);
    }
  }

  // Column alter migrations for older tables
  const alterMigrations = [
    "ALTER TABLE products ADD COLUMN meta_title TEXT",
    "ALTER TABLE products ADD COLUMN meta_description TEXT",
    "ALTER TABLE products ADD COLUMN images TEXT",
    "ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0",
    "ALTER TABLE posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5",
    "ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'website_product_modal'",
    "ALTER TABLE orders ADD COLUMN admin_notes TEXT",
  ];

  for (const sql of alterMigrations) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      // Column already exists - expected
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env?.DB; // Cloudflare D1 SQL Database binding
    const kv = env?.TERRE_KV; // Cloudflare KV binding

    try {
      // 1. Health & Database status check
      if (path === "/" || path === "/api/health") {
        let dbTables = [];
        if (db) {
          try {
            const tableQuery = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            dbTables = tableQuery.results ? tableQuery.results.map((r) => r.name) : [];
          } catch (e) {
            console.error("D1 test query error:", e);
          }
        }

        return jsonResponse({
          success: true,
          service: "Terre Spa Cloudflare API",
          databaseType: db ? "Cloudflare D1 (Relational SQL Database)" : "Cloudflare KV",
          hasD1: !!db,
          hasKV: !!kv,
          d1Tables: dbTables,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Initialize SQL Database Tables (Auto-migration endpoint)
      if (path === "/api/init-db" && (request.method === "POST" || request.method === "GET")) {
        if (!db) {
          return jsonResponse({ success: false, error: "D1 database (env.DB) is not bound to this Worker" }, 400);
        }

        await ensureSchema(db);

        return jsonResponse({ success: true, message: "D1 Database tables initialized and migrated successfully!" });
      }

      // 3. Full Sync (GET & POST)
      if (path === "/api/sync") {
        if (request.method === "GET") {
          let posts = [];
          let products = [];
          let serviceCategories = [];
          let reviews = [];
          let orders = [];
          let coupons = [];
          let productCategories = [];
          let dbLastUpdated = null;

          if (db) {
            try {
              await ensureSchema(db);

              const pRows = await db.prepare("SELECT * FROM posts ORDER BY published_at DESC").all();
              posts = (pRows.results || []).map(mapDbRowToPost);

              const prRows = await db.prepare("SELECT * FROM products ORDER BY id DESC").all();
              products = (prRows.results || []).map(mapDbRowToProduct);

              const catRows = await db.prepare("SELECT * FROM service_categories ORDER BY sort_order ASC, id ASC").all();
              const svcRows = await db.prepare("SELECT * FROM services ORDER BY sort_order ASC, id ASC").all();
              
              const rawCats = catRows.results || [];
              const rawSvcs = svcRows.results || [];

              serviceCategories = rawCats.map((cat) => ({
                id: cat.id,
                title: cat.title,
                iconName: cat.icon_name || "Sparkles",
                image: cat.image,
                services: rawSvcs
                  .filter((s) => s.category_id === cat.id)
                  .map((s) => ({
                    id: s.id,
                    name: s.name,
                    price: s.price,
                    description: s.description,
                    categoryId: s.category_id,
                    durationMinutes: s.duration_minutes,
                    image: s.image,
                    featured: Boolean(s.featured),
                  })),
              }));

              try {
                const ordRows = await db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
                orders = (ordRows.results || []).map(mapDbRowToOrder);
              } catch (e) {}

              try {
                const coupRows = await db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all();
                coupons = (coupRows.results || []).map(mapDbRowToCoupon);
              } catch (e) {}

              try {
                const revRows = await db.prepare("SELECT * FROM reviews ORDER BY id DESC").all();
                reviews = (revRows.results || []).map(mapDbRowToReview);
              } catch (e) {}

              try {
                const metaRow = await db.prepare("SELECT value FROM app_meta WHERE key = 'last_updated'").first();
                if (metaRow && metaRow.value) {
                  dbLastUpdated = metaRow.value;
                }
              } catch (e) {}

              try {
                const catMeta = await db.prepare("SELECT value FROM app_meta WHERE key = 'product_categories'").first();
                if (catMeta && catMeta.value) {
                  productCategories = JSON.parse(catMeta.value);
                }
              } catch (e) {}
            } catch (e) {
              console.warn("D1 query fallback to KV", e);
            }
          }

          if (kv) {
            const rawPosts = await kv.get("terre_posts", { type: "json" });
            const rawProducts = await kv.get("terre_products", { type: "json" });
            const rawSvcs = await kv.get("terre_services", { type: "json" });
            const rawReviews = await kv.get("terre_reviews", { type: "json" });
            const rawOrders = await kv.get("terre_orders", { type: "json" });
            const rawCoupons = await kv.get("terre_coupons", { type: "json" });
            const rawCategories = await kv.get("terre_product_categories", { type: "json" });
            const rawMeta = await kv.get("terre_meta", { type: "json" });

            if (rawPosts && (!posts || posts.length === 0)) posts = rawPosts;
            if (rawProducts && (!products || products.length === 0)) products = rawProducts;
            if (rawSvcs && (!serviceCategories || serviceCategories.length === 0)) serviceCategories = rawSvcs;
            if (rawReviews && (!reviews || reviews.length === 0)) reviews = rawReviews;
            if (rawOrders && (!orders || orders.length === 0)) orders = rawOrders;
            if (rawCoupons && (!coupons || coupons.length === 0)) coupons = rawCoupons;
            if (rawCategories && (!productCategories || productCategories.length === 0)) productCategories = rawCategories;
            if (!dbLastUpdated && rawMeta?.lastUpdated) {
              dbLastUpdated = rawMeta.lastUpdated;
            }
          }

          return jsonResponse({
            success: true,
            posts,
            products,
            serviceCategories,
            reviews,
            orders,
            coupons,
            productCategories,
            databaseType: db ? "Cloudflare D1 (SQL)" : "Cloudflare KV",
            totalPosts: posts.length,
            totalProducts: products.length,
            totalServiceCategories: serviceCategories.length,
            totalReviews: reviews.length,
            totalOrders: orders.length,
            totalCoupons: coupons.length,
            lastUpdated: dbLastUpdated || new Date().toISOString(),
          });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) {
            return jsonResponse({ success: false, error: "Unauthorized: Invalid API Token" }, 401);
          }

          const body = await request.json();
          const {
            posts,
            products,
            serviceCategories,
            reviews,
            orders,
            coupons,
            productCategories,
            deletedPostIds,
            deletedProductIds,
            deletedServiceIds,
            deletedOrderIds,
          } = body;
          const timestamp = body.timestamp || new Date().toISOString();

          // Save to Cloudflare D1 (Relational SQL Database)
          if (db) {
            await ensureSchema(db);

            // 1. Handle Explicit Deletions first
            if (Array.isArray(deletedPostIds) && deletedPostIds.length > 0) {
              const dPlaceholders = deletedPostIds.map(() => "?").join(",");
              await db.prepare(`DELETE FROM posts WHERE id IN (${dPlaceholders})`).bind(...deletedPostIds).run();
            }
            if (Array.isArray(deletedProductIds) && deletedProductIds.length > 0) {
              const dPlaceholders = deletedProductIds.map(() => "?").join(",");
              await db.prepare(`DELETE FROM products WHERE id IN (${dPlaceholders})`).bind(...deletedProductIds).run();
            }
            if (Array.isArray(deletedServiceIds) && deletedServiceIds.length > 0) {
              const dPlaceholders = deletedServiceIds.map(() => "?").join(",");
              await db.prepare(`DELETE FROM service_categories WHERE id IN (${dPlaceholders})`).bind(...deletedServiceIds).run();
              await db.prepare(`DELETE FROM services WHERE id IN (${dPlaceholders})`).bind(...deletedServiceIds).run();
              await db.prepare(`DELETE FROM services WHERE category_id IN (${dPlaceholders})`).bind(...deletedServiceIds).run();
            }
            if (Array.isArray(deletedOrderIds) && deletedOrderIds.length > 0) {
              const dPlaceholders = deletedOrderIds.map(() => "?").join(",");
              await db.prepare(`DELETE FROM orders WHERE id IN (${dPlaceholders})`).bind(...deletedOrderIds).run();
            }

            // 2. Save Posts to D1
            if (Array.isArray(posts)) {
              for (const post of posts) {
                await db
                  .prepare(
                    `INSERT INTO posts (
                      id, title, slug, excerpt, content, cover_image, category,
                      tags, author_name, author_role, author_avatar, status,
                      published_at, updated_at, read_time_minutes, featured, views
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      title = excluded.title,
                      slug = excluded.slug,
                      excerpt = excluded.excerpt,
                      content = excluded.content,
                      cover_image = excluded.cover_image,
                      category = excluded.category,
                      tags = excluded.tags,
                      author_name = excluded.author_name,
                      author_role = excluded.author_role,
                      author_avatar = excluded.author_avatar,
                      status = excluded.status,
                      published_at = excluded.published_at,
                      updated_at = excluded.updated_at,
                      read_time_minutes = excluded.read_time_minutes,
                      featured = excluded.featured,
                      views = excluded.views`
                  )
                  .bind(
                    post.id,
                    post.title || "",
                    post.slug || post.id,
                    post.excerpt || "",
                    post.content || "",
                    post.coverImage || "",
                    post.category || "General",
                    JSON.stringify(post.tags || []),
                    post.author?.name || "Terre Spa",
                    post.author?.role || "",
                    post.author?.avatar || "",
                    post.status || "published",
                    post.publishedAt || timestamp,
                    post.updatedAt || timestamp,
                    post.readTimeMinutes || 5,
                    post.featured ? 1 : 0,
                    post.views || 0
                  )
                  .run();
              }
            }

            // 3. Save Products to D1
            if (Array.isArray(products)) {
              for (const prod of products) {
                await db
                  .prepare(
                    `INSERT INTO products (
                      id, name, slug, category, price, original_price,
                      thumbnail, images, short_desc, full_desc, in_stock,
                      featured, rating, review_count, volume_or_weight,
                      ingredients, usage_instructions, meta_title, meta_description, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      name = excluded.name,
                      slug = excluded.slug,
                      category = excluded.category,
                      price = excluded.price,
                      original_price = excluded.original_price,
                      thumbnail = excluded.thumbnail,
                      images = excluded.images,
                      short_desc = excluded.short_desc,
                      full_desc = excluded.full_desc,
                      in_stock = excluded.in_stock,
                      featured = excluded.featured,
                      rating = excluded.rating,
                      review_count = excluded.review_count,
                      volume_or_weight = excluded.volume_or_weight,
                      ingredients = excluded.ingredients,
                      usage_instructions = excluded.usage_instructions,
                      meta_title = excluded.meta_title,
                      meta_description = excluded.meta_description,
                      updated_at = excluded.updated_at`
                  )
                  .bind(
                    prod.id,
                    prod.name || "",
                    prod.slug || prod.id,
                    prod.category || "General",
                    prod.price || 0,
                    prod.originalPrice || null,
                    prod.thumbnail || "",
                    JSON.stringify(prod.images || []),
                    prod.shortDesc || "",
                    prod.fullDesc || "",
                    prod.inStock ? 1 : 0,
                    prod.featured ? 1 : 0,
                    prod.rating || 5.0,
                    prod.reviewCount || 0,
                    prod.volumeOrWeight || "",
                    JSON.stringify(prod.ingredients || []),
                    prod.usageInstructions || "",
                    prod.metaTitle || null,
                    prod.metaDescription || null,
                    prod.updatedAt || timestamp
                  )
                  .run();
              }
            }

            // 3.5 Save Orders to D1
            if (Array.isArray(orders)) {
              for (const ord of orders) {
                await db
                  .prepare(
                    `INSERT INTO orders (
                      id, customer_name, customer_phone, customer_address,
                      customer_notes, items, total_amount, status, created_at,
                      updated_at, source, admin_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      customer_name = excluded.customer_name,
                      customer_phone = excluded.customer_phone,
                      customer_address = excluded.customer_address,
                      customer_notes = excluded.customer_notes,
                      items = excluded.items,
                      total_amount = excluded.total_amount,
                      status = excluded.status,
                      updated_at = excluded.updated_at,
                      admin_notes = excluded.admin_notes`
                  )
                  .bind(
                    ord.id,
                    ord.customerName || "",
                    ord.customerPhone || "",
                    ord.customerAddress || "",
                    ord.customerNotes || "",
                    JSON.stringify(ord.items || []),
                    ord.totalAmount || 0,
                    ord.status || "pending",
                    ord.createdAt || timestamp,
                    ord.updatedAt || timestamp,
                    ord.source || "website_product_modal",
                    ord.adminNotes || ""
                  )
                  .run();
              }
            }

            // 3.6 Save Coupons to D1
            if (Array.isArray(coupons)) {
              for (const c of coupons) {
                await db
                  .prepare(
                    `INSERT INTO coupons (
                      id, code, description, discount_type, discount_value,
                      min_order_value, max_discount_amount, start_date, end_date,
                      usage_limit, used_count, is_active, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      code = excluded.code,
                      description = excluded.description,
                      discount_type = excluded.discount_type,
                      discount_value = excluded.discount_value,
                      min_order_value = excluded.min_order_value,
                      max_discount_amount = excluded.max_discount_amount,
                      start_date = excluded.start_date,
                      end_date = excluded.end_date,
                      usage_limit = excluded.usage_limit,
                      used_count = excluded.used_count,
                      is_active = excluded.is_active,
                      updated_at = excluded.updated_at`
                  )
                  .bind(
                    c.id,
                    (c.code || "").toUpperCase(),
                    c.description || "",
                    c.discountType || "percentage",
                    c.discountValue || 0,
                    c.minOrderValue || null,
                    c.maxDiscountAmount || null,
                    c.startDate || null,
                    c.endDate || null,
                    c.usageLimit || null,
                    c.usedCount || 0,
                    c.isActive !== false ? 1 : 0,
                    c.createdAt || timestamp,
                    c.updatedAt || timestamp
                  )
                  .run();
              }
            }

            // 3.7 Save Reviews to D1
            if (Array.isArray(reviews)) {
              for (const rev of reviews) {
                await db
                  .prepare(
                    `INSERT INTO reviews (
                      id, author, rating, comment, service_name, date, avatar, featured
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      author = excluded.author,
                      rating = excluded.rating,
                      comment = excluded.comment,
                      service_name = excluded.service_name,
                      date = excluded.date,
                      avatar = excluded.avatar,
                      featured = excluded.featured`
                  )
                  .bind(
                    rev.id,
                    rev.author || "Khách hàng",
                    rev.rating || 5,
                    rev.comment || "",
                    rev.serviceName || "",
                    rev.date || "",
                    rev.avatar || "",
                    rev.featured ? 1 : 0
                  )
                  .run();
              }
            }

            // 4. Save Service Categories & Services to D1
            if (Array.isArray(serviceCategories)) {
              for (let i = 0; i < serviceCategories.length; i++) {
                const cat = serviceCategories[i];
                await db
                  .prepare(
                    `INSERT INTO service_categories (id, title, icon_name, image, sort_order)
                     VALUES (?, ?, ?, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET
                       title = excluded.title,
                       icon_name = excluded.icon_name,
                       image = excluded.image,
                       sort_order = excluded.sort_order`
                  )
                  .bind(cat.id, cat.title || "", cat.iconName || "Sparkles", cat.image || "", i)
                  .run();

                if (Array.isArray(cat.services)) {
                  for (let j = 0; j < cat.services.length; j++) {
                    const svc = cat.services[j];
                    await db
                      .prepare(
                        `INSERT INTO services (
                           id, category_id, name, price, description, duration_minutes,
                           image, featured, sort_order, updated_at
                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(id) DO UPDATE SET
                           category_id = excluded.category_id,
                           name = excluded.name,
                           price = excluded.price,
                           description = excluded.description,
                           duration_minutes = excluded.duration_minutes,
                           image = excluded.image,
                           featured = excluded.featured,
                           sort_order = excluded.sort_order,
                           updated_at = excluded.updated_at`
                      )
                      .bind(
                        svc.id,
                        cat.id,
                        svc.name || "",
                        svc.price || "",
                        svc.description || "",
                        svc.durationMinutes || null,
                        svc.image || "",
                        svc.featured ? 1 : 0,
                        j,
                        timestamp
                      )
                      .run();
                  }
                }
              }
            }

            // Save Product Categories metadata to D1
            if (Array.isArray(productCategories)) {
              try {
                await db
                  .prepare(
                    `INSERT INTO app_meta (key, value, updated_at) VALUES ('product_categories', ?, ?)
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
                  )
                  .bind(JSON.stringify(productCategories), timestamp)
                  .run();
              } catch (e) {}
            }

            // Record lastUpdated in D1 meta
            try {
              await db
                .prepare(
                  `INSERT INTO app_meta (key, value, updated_at) VALUES ('last_updated', ?, ?)
                   ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
                )
                .bind(timestamp, timestamp)
                .run();
            } catch (e) {}
          }

          // Also backup to KV if KV exists
          if (kv) {
            if (Array.isArray(posts)) await kv.put("terre_posts", JSON.stringify(posts));
            if (Array.isArray(products)) await kv.put("terre_products", JSON.stringify(products));
            if (Array.isArray(serviceCategories)) await kv.put("terre_services", JSON.stringify(serviceCategories));
            if (Array.isArray(reviews)) await kv.put("terre_reviews", JSON.stringify(reviews));
            if (Array.isArray(orders)) await kv.put("terre_orders", JSON.stringify(orders));
            if (Array.isArray(coupons)) await kv.put("terre_coupons", JSON.stringify(coupons));
            if (Array.isArray(productCategories)) await kv.put("terre_product_categories", JSON.stringify(productCategories));
            await kv.put("terre_meta", JSON.stringify({
              lastUpdated: timestamp,
              countPosts: posts?.length || 0,
              countProducts: products?.length || 0,
              countServices: serviceCategories?.length || 0,
              countReviews: reviews?.length || 0,
              countOrders: orders?.length || 0,
              countCoupons: coupons?.length || 0
            }));
          }

          return jsonResponse({
            success: true,
            message: `Đã lưu thành công vào Cloudflare ${db ? "D1 SQL Database" : "KV"}!`,
            databaseType: db ? "Cloudflare D1 (Relational SQL)" : "Cloudflare KV",
            savedPosts: posts?.length || 0,
            savedProducts: products?.length || 0,
            savedServiceCategories: serviceCategories?.length || 0,
            savedReviews: reviews?.length || 0,
            savedOrders: orders?.length || 0,
            savedCoupons: coupons?.length || 0,
            lastUpdated: timestamp,
          });
        }
      }

      // 4. SQL Posts Endpoints
      if (path === "/api/posts" || path.startsWith("/api/posts/")) {
        const postIdFromPath = path.startsWith("/api/posts/") ? path.replace("/api/posts/", "") : url.searchParams.get("id");

        if (request.method === "GET") {
          let posts = [];
          if (db) {
            await ensureSchema(db);
            const rows = await db.prepare("SELECT * FROM posts ORDER BY published_at DESC").all();
            posts = (rows.results || []).map(mapDbRowToPost);
          } else if (kv) {
            const raw = await kv.get("terre_posts", { type: "json" });
            if (raw) posts = raw;
          }
          return jsonResponse({ success: true, posts });
        }

        if (request.method === "DELETE") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          if (!postIdFromPath) return jsonResponse({ error: "Missing post ID" }, 400);

          if (db) {
            await ensureSchema(db);
            await db.prepare("DELETE FROM posts WHERE id = ?").bind(postIdFromPath).run();
          }
          if (kv) {
            const raw = await kv.get("terre_posts", { type: "json" });
            if (Array.isArray(raw)) {
              const filtered = raw.filter((p) => p.id !== postIdFromPath);
              await kv.put("terre_posts", JSON.stringify(filtered));
            }
          }
          return jsonResponse({ success: true, message: `Deleted post ${postIdFromPath}` });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          const post = await request.json();
          const timestamp = new Date().toISOString();

          if (db) {
            await ensureSchema(db);
            await db
              .prepare(
                `INSERT INTO posts (
                  id, title, slug, excerpt, content, cover_image, category,
                  tags, author_name, author_role, author_avatar, status,
                  published_at, updated_at, read_time_minutes, featured, views
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title,
                  slug = excluded.slug,
                  excerpt = excluded.excerpt,
                  content = excluded.content,
                  cover_image = excluded.cover_image,
                  category = excluded.category,
                  tags = excluded.tags,
                  author_name = excluded.author_name,
                  author_role = excluded.author_role,
                  author_avatar = excluded.author_avatar,
                  status = excluded.status,
                  published_at = excluded.published_at,
                  updated_at = excluded.updated_at,
                  read_time_minutes = excluded.read_time_minutes,
                  featured = excluded.featured,
                  views = excluded.views`
              )
              .bind(
                post.id,
                post.title || "",
                post.slug || post.id,
                post.excerpt || "",
                post.content || "",
                post.coverImage || "",
                post.category || "General",
                JSON.stringify(post.tags || []),
                post.author?.name || "Terre Spa",
                post.author?.role || "",
                post.author?.avatar || "",
                post.status || "published",
                post.publishedAt || timestamp,
                timestamp,
                post.readTimeMinutes || 5,
                post.featured ? 1 : 0,
                post.views || 0
              )
              .run();
          }

          return jsonResponse({ success: true, post });
        }
      }

      // 5. SQL Products Endpoints
      if (path === "/api/products" || path.startsWith("/api/products/")) {
        const prodIdFromPath = path.startsWith("/api/products/") ? path.replace("/api/products/", "") : url.searchParams.get("id");

        if (request.method === "GET") {
          let products = [];
          if (db) {
            await ensureSchema(db);
            const rows = await db.prepare("SELECT * FROM products ORDER BY id DESC").all();
            products = (rows.results || []).map(mapDbRowToProduct);
          } else if (kv) {
            const raw = await kv.get("terre_products", { type: "json" });
            if (raw) products = raw;
          }
          return jsonResponse({ success: true, products });
        }

        if (request.method === "DELETE") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          if (!prodIdFromPath) return jsonResponse({ error: "Missing product ID" }, 400);

          if (db) {
            await ensureSchema(db);
            await db.prepare("DELETE FROM products WHERE id = ?").bind(prodIdFromPath).run();
          }
          if (kv) {
            const raw = await kv.get("terre_products", { type: "json" });
            if (Array.isArray(raw)) {
              const filtered = raw.filter((p) => p.id !== prodIdFromPath);
              await kv.put("terre_products", JSON.stringify(filtered));
            }
          }
          return jsonResponse({ success: true, message: `Deleted product ${prodIdFromPath}` });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          const prod = await request.json();
          const timestamp = new Date().toISOString();

          if (db) {
            await ensureSchema(db);
            await db
              .prepare(
                `INSERT INTO products (
                  id, name, slug, category, price, original_price,
                  thumbnail, images, short_desc, full_desc, in_stock,
                  featured, rating, review_count, volume_or_weight,
                  ingredients, usage_instructions, meta_title, meta_description, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  slug = excluded.slug,
                  category = excluded.category,
                  price = excluded.price,
                  original_price = excluded.original_price,
                  thumbnail = excluded.thumbnail,
                  images = excluded.images,
                  short_desc = excluded.short_desc,
                  full_desc = excluded.full_desc,
                  in_stock = excluded.in_stock,
                  featured = excluded.featured,
                  rating = excluded.rating,
                  review_count = excluded.review_count,
                  volume_or_weight = excluded.volume_or_weight,
                  ingredients = excluded.ingredients,
                  usage_instructions = excluded.usage_instructions,
                  meta_title = excluded.meta_title,
                  meta_description = excluded.meta_description,
                  updated_at = excluded.updated_at`
              )
              .bind(
                prod.id,
                prod.name || "",
                prod.slug || prod.id,
                prod.category || "General",
                prod.price || 0,
                prod.originalPrice || null,
                prod.thumbnail || "",
                JSON.stringify(prod.images || []),
                prod.shortDesc || "",
                prod.fullDesc || "",
                prod.inStock ? 1 : 0,
                prod.featured ? 1 : 0,
                prod.rating || 5.0,
                prod.reviewCount || 0,
                prod.volumeOrWeight || "",
                JSON.stringify(prod.ingredients || []),
                prod.usageInstructions || "",
                prod.metaTitle || null,
                prod.metaDescription || null,
                timestamp
              )
              .run();
          }

          return jsonResponse({ success: true, product: prod });
        }
      }

      // 6. SQL Services Endpoints
      if (path === "/api/services") {
        if (request.method === "GET") {
          let serviceCategories = [];
          if (db) {
            await ensureSchema(db);
            const catRows = await db.prepare("SELECT * FROM service_categories ORDER BY sort_order ASC, id ASC").all();
            const svcRows = await db.prepare("SELECT * FROM services ORDER BY sort_order ASC, id ASC").all();
            const rawCats = catRows.results || [];
            const rawSvcs = svcRows.results || [];

            serviceCategories = rawCats.map((cat) => ({
              id: cat.id,
              title: cat.title,
              iconName: cat.icon_name || "Sparkles",
              image: cat.image,
              services: rawSvcs
                .filter((s) => s.category_id === cat.id)
                .map((s) => ({
                  id: s.id,
                  name: s.name,
                  price: s.price,
                  description: s.description,
                  categoryId: s.category_id,
                  durationMinutes: s.duration_minutes,
                  image: s.image,
                  featured: Boolean(s.featured),
                })),
            }));
          } else if (kv) {
            const raw = await kv.get("terre_services", { type: "json" });
            if (raw) serviceCategories = raw;
          }
          return jsonResponse({ success: true, serviceCategories });
        }
      }

      return jsonResponse({ success: false, error: "Endpoint not found" }, 404);
    } catch (error) {
      console.error("Worker Error:", error);
      return jsonResponse({ success: false, error: error.message || "Internal server error" }, 500);
    }
  },
};
