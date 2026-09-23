export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich text HTML from WYSIWYG
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  status: "published" | "draft";
  publishedAt: string;
  updatedAt?: string;
  readTimeMinutes?: number;
  featured?: boolean;
  views?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number; // in VND
  originalPrice?: number; // in VND
  thumbnail: string;
  images?: string[];
  shortDesc: string;
  fullDesc: string;
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  volumeOrWeight?: string; // e.g. "300ml", "100g"
  ingredients?: string[];
  usageInstructions?: string;
  metaTitle?: string; // SEO Google Title
  metaDescription?: string; // SEO Google Description
  keywords?: string; // SEO Keywords
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productThumbnail?: string;
  price: number;
  quantity: number;
  volumeOrWeight?: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

export interface Order {
  id: string; // e.g. "ORD-1790092106735" or "ORD-2026-001"
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  source?: string; // "website_product_modal" | "website_booking" | "direct"
  adminNotes?: string; // Ghi chú tư vấn, chăm sóc khách hàng
}

export interface CloudflareConfig {
  workerUrl: string;
  apiToken: string;
  kvNamespace?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncMessage?: string;
}

export interface SpaService {
  id: string;
  name: string;
  price: string; // e.g. "149,000" or "Từ 1,000,000"
  description: string;
  categoryId: string;
  categoryTitle?: string;
  durationMinutes?: number;
  image?: string;
  featured?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  iconName?: string; // "Scissors" | "Sparkles" | "Leaf" | "Droplets" | "Heart"
  image: string;
  services: SpaService[];
}

export interface CustomerReview {
  id: string | number;
  author: string;
  rating: number; // 1 to 5
  date: string; // e.g. "1 tuần trước"
  content: string;
  avatar?: string;
  serviceUsed?: string; // e.g. "Massage Vai Gáy 60 phút"
}

export interface AppDataPayload {
  posts: Post[];
  products: Product[];
  serviceCategories?: ServiceCategory[];
  reviews?: CustomerReview[];
  orders?: Order[];
  productCategories?: string[];
  version: string;
  lastUpdated: string;
}

export interface CrudPermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface AdminPermissions {
  posts: CrudPermission;
  products: CrudPermission;
  services: CrudPermission;
  reviews: CrudPermission;
  orders?: CrudPermission;
  cloudflare?: {
    view: boolean;
    sync: boolean;
  };
}

export interface AdminUser {
  id: string;
  username: string; // "admin1" | "admin2" | "admin3"
  name: string; // Tên hiển thị
  password: string;
  role: "super_admin" | "sub_admin";
  avatar?: string;
  permissions: AdminPermissions;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}


