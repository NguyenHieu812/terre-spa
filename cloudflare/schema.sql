-- Schema SQL cho Cloudflare D1 Relational Database (Terre Spa)

-- 1. Bảng Bài viết (Posts)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array string: ["tag1", "tag2"]
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar TEXT,
  status TEXT DEFAULT 'published', -- 'published' | 'draft'
  published_at TEXT NOT NULL,
  updated_at TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  featured INTEGER DEFAULT 0, -- 1: true, 0: false
  views INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 2. Bảng Sản phẩm (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  thumbnail TEXT NOT NULL,
  images TEXT, -- JSON array of image URLs
  short_desc TEXT,
  full_desc TEXT,
  in_stock INTEGER DEFAULT 1, -- 1: true, 0: false
  featured INTEGER DEFAULT 0, -- 1: true, 0: false
  rating REAL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  volume_or_weight TEXT,
  ingredients TEXT, -- JSON array string
  usage_instructions TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- 3. Bảng Danh mục Dịch vụ (Service Categories)
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Sparkles',
  image TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 4. Bảng Gói Dịch vụ Chi tiết (Services)
CREATE TABLE IF NOT EXISTS services (
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
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured);

-- 5. Bảng Metadata Đồng bộ (App Meta)
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
