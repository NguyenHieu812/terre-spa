import { CloudflareConfig, Post, Product, AppDataPayload, ServiceCategory, CustomerReview } from "../types";

export const CLOUDFLARE_STORAGE_KEY = "terre_spa_cloudflare_config";

const DEFAULT_WORKER_URL =
  ((import.meta as any)?.env?.VITE_CLOUDFLARE_WORKER_URL) ||
  "https://terre-spa-api.terrespa.workers.dev";

export const getDefaultCloudflareConfig = (): CloudflareConfig => {
  try {
    const saved = localStorage.getItem(CLOUDFLARE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // If saved workerUrl is empty, use default
      if (!parsed.workerUrl || !parsed.workerUrl.trim()) {
        parsed.workerUrl = DEFAULT_WORKER_URL;
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Could not read Cloudflare config from LocalStorage", e);
  }

  return {
    workerUrl: DEFAULT_WORKER_URL,
    apiToken: "",
    kvNamespace: "TERRE_KV",
    autoSync: true,
    syncStatus: "idle",
    syncMessage: "",
  };
};

export const saveCloudflareConfig = (config: CloudflareConfig): void => {
  try {
    localStorage.setItem(CLOUDFLARE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save Cloudflare config", e);
  }
};

/**
 * Test connection to Cloudflare Worker API
 */
export async function testCloudflareConnection(config: CloudflareConfig): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!config.workerUrl || !config.workerUrl.trim()) {
    return {
      success: false,
      message: "Vui lòng nhập Cloudflare Worker URL (ví dụ: https://terre-api.workers.dev)",
    };
  }

  const cleanUrl = config.workerUrl.trim().replace(/\/+$/, "");
  const testEndpoint = `${cleanUrl}/api/health`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiToken && config.apiToken.trim()) {
      headers["Authorization"] = `Bearer ${config.apiToken.trim()}`;
      headers["x-api-token"] = config.apiToken.trim();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(testEndpoint, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        success: true,
        message: `Kết nối Cloudflare Worker thành công! (${data.databaseType || (data.hasKV ? "KV Storage" : "Cloudflare")})`,
        details: data,
      };
    } else {
      return {
        success: false,
        message: data.error || `Lỗi HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Kết nối quá thời gian chờ (8s). Vui lòng kiểm tra lại URL Cloudflare Worker.",
      };
    }
    return {
      success: false,
      message: `Không thể kết nối đến Worker (${error.message || "Lỗi mạng hoặc CORS"}). Hãy chắc chắn Worker đã bật CORS.`,
    };
  }
}

/**
 * Sync all local posts, products, services, and reviews to Cloudflare KV/Worker
 */
export async function syncToCloudflare(
  config: CloudflareConfig,
  payload: {
    posts: Post[];
    products: Product[];
    serviceCategories?: ServiceCategory[];
    reviews?: CustomerReview[];
    deletedPostIds?: string[];
    deletedProductIds?: string[];
    deletedServiceIds?: string[];
  }
): Promise<{ success: boolean; message: string; timestamp?: string }> {
  if (!config.workerUrl || !config.workerUrl.trim()) {
    return {
      success: false,
      message: "Chưa cấu hình Cloudflare Worker URL trong cài đặt.",
    };
  }

  const cleanUrl = config.workerUrl.trim().replace(/\/+$/, "");
  const syncEndpoint = `${cleanUrl}/api/sync`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiToken && config.apiToken.trim()) {
      headers["Authorization"] = `Bearer ${config.apiToken.trim()}`;
      headers["x-api-token"] = config.apiToken.trim();
    }

    const response = await fetch(syncEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        posts: payload.posts,
        products: payload.products,
        serviceCategories: payload.serviceCategories || [],
        reviews: payload.reviews || [],
        deletedPostIds: payload.deletedPostIds || [],
        deletedProductIds: payload.deletedProductIds || [],
        deletedServiceIds: payload.deletedServiceIds || [],
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success !== false) {
      const ts = data.lastUpdated || new Date().toISOString();
      return {
        success: true,
        message: `Đã đồng bộ thành công ${payload.posts.length} bài viết, ${payload.products.length} sản phẩm, ${payload.serviceCategories?.length || 0} danh mục dịch vụ & ${payload.reviews?.length || 0} đánh giá lên Cloudflare!`,
        timestamp: ts,
      };
    } else {
      return {
        success: false,
        message: data.error || `Đồng bộ thất bại (Mã lỗi: ${response.status})`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Lỗi kết nối khi đồng bộ: ${error.message}`,
    };
  }
}

/**
 * Fetch all posts, products, services, and reviews from Cloudflare Worker
 */
export async function fetchFromCloudflare(
  config: CloudflareConfig
): Promise<{ success: boolean; data?: AppDataPayload; message?: string }> {
  if (!config.workerUrl || !config.workerUrl.trim()) {
    return {
      success: false,
      message: "Chưa cấu hình Cloudflare Worker URL.",
    };
  }

  const cleanUrl = config.workerUrl.trim().replace(/\/+$/, "");
  const syncEndpoint = `${cleanUrl}/api/sync`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiToken && config.apiToken.trim()) {
      headers["Authorization"] = `Bearer ${config.apiToken.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(syncEndpoint, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success) {
      return {
        success: true,
        data: {
          posts: Array.isArray(data.posts) ? data.posts : [],
          products: Array.isArray(data.products) ? data.products : [],
          serviceCategories: Array.isArray(data.serviceCategories) ? data.serviceCategories : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          version: data.version || "1.0.0",
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        },
        message: `Đã tải về ${data.posts?.length || 0} bài viết, ${data.products?.length || 0} sản phẩm, ${data.serviceCategories?.length || 0} danh mục dịch vụ & ${data.reviews?.length || 0} đánh giá từ Cloudflare.`,
      };
    } else {
      return {
        success: false,
        message: data.error || `Không thể tải dữ liệu (Mã lỗi: ${response.status})`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Lỗi kết nối tải dữ liệu: ${error.message}`,
    };
  }
}

/**
 * Silently fetch latest app data from Cloudflare Worker without throwing
 */
export async function fetchLatestAppDataSilently(
  customConfig?: CloudflareConfig
): Promise<AppDataPayload | null> {
  try {
    const config = customConfig || getDefaultCloudflareConfig();
    if (!config.workerUrl) return null;
    const res = await fetchFromCloudflare(config);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (e) {
    console.debug("Silent Cloudflare fetch skipped or failed", e);
  }
  return null;
}
