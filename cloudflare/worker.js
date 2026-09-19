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
    updatedAt: row.updated_at,
  };
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

        await db.exec(`
          CREATE TABLE IF NOT EXISTS posts (
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
          );

          CREATE TABLE IF NOT EXISTS products (
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
            updated_at TEXT
          );
        `);

        return jsonResponse({ success: true, message: "D1 Database tables 'posts' and 'products' initialized successfully!" });
      }

      // 3. Full Sync (GET & POST)
      if (path === "/api/sync") {
        if (request.method === "GET") {
          let posts = [];
          let products = [];
          let serviceCategories = [];

          if (db) {
            try {
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
            } catch (e) {
              console.warn("D1 query fallback to KV", e);
            }
          } else if (kv) {
            const rawPosts = await kv.get("terre_posts", { type: "json" });
            const rawProducts = await kv.get("terre_products", { type: "json" });
            const rawSvcs = await kv.get("terre_services", { type: "json" });
            if (rawPosts) posts = rawPosts;
            if (rawProducts) products = rawProducts;
            if (rawSvcs) serviceCategories = rawSvcs;
          }

          return jsonResponse({
            success: true,
            posts,
            products,
            serviceCategories,
            databaseType: db ? "Cloudflare D1 (SQL)" : "Cloudflare KV",
            totalPosts: posts.length,
            totalProducts: products.length,
            totalServiceCategories: serviceCategories.length,
            lastUpdated: new Date().toISOString(),
          });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) {
            return jsonResponse({ success: false, error: "Unauthorized: Invalid API Token" }, 401);
          }

          const body = await request.json();
          const { posts, products, serviceCategories } = body;
          const timestamp = new Date().toISOString();

          // Save to Cloudflare D1 (Relational SQL Database)
          if (db) {
            // Save Posts to D1
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

            // Save Products to D1
            if (Array.isArray(products)) {
              for (const prod of products) {
                await db
                  .prepare(
                    `INSERT INTO products (
                      id, name, slug, category, price, original_price,
                      thumbnail, images, short_desc, full_desc, in_stock,
                      featured, rating, review_count, volume_or_weight,
                      ingredients, usage_instructions, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    prod.updatedAt || timestamp
                  )
                  .run();
              }
            }

            // Save Service Categories & Services to D1
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
          }

          // Also backup to KV if KV exists
          if (kv) {
            if (Array.isArray(posts)) await kv.put("terre_posts", JSON.stringify(posts));
            if (Array.isArray(products)) await kv.put("terre_products", JSON.stringify(products));
            if (Array.isArray(serviceCategories)) await kv.put("terre_services", JSON.stringify(serviceCategories));
            await kv.put("terre_meta", JSON.stringify({ lastUpdated: timestamp, countPosts: posts?.length || 0, countProducts: products?.length || 0, countServices: serviceCategories?.length || 0 }));
          }

          return jsonResponse({
            success: true,
            message: `Đã lưu thành công vào Cloudflare ${db ? "D1 SQL Database" : "KV"}!`,
            databaseType: db ? "Cloudflare D1 (Relational SQL)" : "Cloudflare KV",
            savedPosts: posts?.length || 0,
            savedProducts: products?.length || 0,
            savedServiceCategories: serviceCategories?.length || 0,
            lastUpdated: timestamp,
          });
        }
      }

      // 4. SQL Posts Endpoints
      if (path === "/api/posts") {
        if (request.method === "GET") {
          let posts = [];
          if (db) {
            const rows = await db.prepare("SELECT * FROM posts ORDER BY published_at DESC").all();
            posts = (rows.results || []).map(mapDbRowToPost);
          } else if (kv) {
            const raw = await kv.get("terre_posts", { type: "json" });
            if (raw) posts = raw;
          }
          return jsonResponse({ success: true, posts });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          const post = await request.json();
          const timestamp = new Date().toISOString();

          if (db) {
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
      if (path === "/api/products") {
        if (request.method === "GET") {
          let products = [];
          if (db) {
            const rows = await db.prepare("SELECT * FROM products ORDER BY id DESC").all();
            products = (rows.results || []).map(mapDbRowToProduct);
          } else if (kv) {
            const raw = await kv.get("terre_products", { type: "json" });
            if (raw) products = raw;
          }
          return jsonResponse({ success: true, products });
        }

        if (request.method === "POST") {
          if (!verifyAuth(request, env)) return jsonResponse({ error: "Unauthorized" }, 401);
          const prod = await request.json();
          const timestamp = new Date().toISOString();

          if (db) {
            await db
              .prepare(
                `INSERT INTO products (
                  id, name, slug, category, price, original_price,
                  thumbnail, images, short_desc, full_desc, in_stock,
                  featured, rating, review_count, volume_or_weight,
                  ingredients, usage_instructions, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
