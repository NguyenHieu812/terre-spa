import React, { useState } from "react";
import { CloudflareConfig, Post, Product } from "../../types";
import {
  testCloudflareConnection,
  syncToCloudflare,
  fetchFromCloudflare,
  saveCloudflareConfig,
} from "../../services/cloudflareService";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  Database,
  Copy,
  Check,
  Code,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface CloudflareSettingsProps {
  config: CloudflareConfig;
  posts: Post[];
  products: Product[];
  onUpdateConfig: (config: CloudflareConfig) => void;
  onDataImported: (data: { posts: Post[]; products: Product[] }) => void;
}

const SAMPLE_WORKER_CODE = `/**
 * Cloudflare Worker Backend for Terre Spa
 * Binding: KV Namespace -> TERRE_KV
 * Environment Variable -> API_SECRET_TOKEN
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-token",
};

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const kv = env.TERRE_KV;

    // Health
    if (url.pathname === "/api/health") {
      return Response.json({ success: true, hasKV: !!kv, timestamp: new Date().toISOString() }, { headers: CORS });
    }

    // Full Sync
    if (url.pathname === "/api/sync") {
      if (req.method === "GET") {
        const posts = (await kv?.get("terre_posts", { type: "json" })) || [];
        const products = (await kv?.get("terre_products", { type: "json" })) || [];
        return Response.json({ success: true, posts, products }, { headers: CORS });
      }
      if (req.method === "POST") {
        const body = await req.json();
        if (kv) {
          if (body.posts) await kv.put("terre_posts", JSON.stringify(body.posts));
          if (body.products) await kv.put("terre_products", JSON.stringify(body.products));
        }
        return Response.json({ success: true, message: "Synced successfully" }, { headers: CORS });
      }
    }
    return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
  }
};`;

export const CloudflareSettings: React.FC<CloudflareSettingsProps> = ({
  config,
  posts,
  products,
  onUpdateConfig,
  onDataImported,
}) => {
  const [currentConfig, setCurrentConfig] = useState<CloudflareConfig>({ ...config });
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);

  const handleSaveConfig = (newCfg: CloudflareConfig) => {
    setCurrentConfig(newCfg);
    onUpdateConfig(newCfg);
    saveCloudflareConfig(newCfg);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudflareConnection(currentConfig);
      setTestResult(res);
      const updated = {
        ...currentConfig,
        syncStatus: (res.success ? "success" : "error") as "success" | "error",
        syncMessage: res.message,
      };
      handleSaveConfig(updated);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Lỗi kết nối." });
    } finally {
      setTesting(false);
    }
  };

  const handlePushToCloudflare = async () => {
    setSyncing(true);
    try {
      const res = await syncToCloudflare(currentConfig, { posts, products });
      setTestResult(res);
      const updated = {
        ...currentConfig,
        lastSyncTime: res.timestamp || new Date().toISOString(),
        syncStatus: (res.success ? "success" : "error") as "success" | "error",
        syncMessage: res.message,
      };
      handleSaveConfig(updated);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Lỗi đồng bộ." });
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromCloudflare = async () => {
    if (!window.confirm("Thao tác này sẽ tải toàn bộ bài viết & sản phẩm từ Cloudflare về thay thế dữ liệu hiện tại trên trình duyệt. Bạn có muốn tiếp tục?")) {
      return;
    }
    setFetching(true);
    try {
      const res = await fetchFromCloudflare(currentConfig);
      if (res.success && res.data) {
        onDataImported({
          posts: res.data.posts || [],
          products: res.data.products || [],
        });
        setTestResult({
          success: true,
          message: `Đã tải về thành công ${res.data.posts?.length || 0} bài viết & ${res.data.products?.length || 0} sản phẩm từ Cloudflare!`,
        });
      } else {
        setTestResult({ success: false, message: res.message || "Tải dữ liệu thất bại." });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Lỗi tải dữ liệu." });
    } finally {
      setFetching(false);
    }
  };

  const copyWorkerCode = () => {
    navigator.clipboard.writeText(SAMPLE_WORKER_CODE);
    setCopiedWorker(true);
    setTimeout(() => setCopiedWorker(false), 2500);
  };

  const handleExportBackup = () => {
    const data = {
      posts,
      products,
      exportedAt: new Date().toISOString(),
      appName: "Terre Spa Management",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terre_spa_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-900 flex items-center gap-2.5">
            <Cloud className="w-7 h-7 text-amber-600" /> Kết nối &amp; Đồng bộ Cloudflare
          </h2>
          <p className="text-xs text-brand-600">
            Lưu trữ và phân phối bài viết &amp; sản phẩm trên mạng lưới Edge Cloudflare toàn cầu
          </p>
        </div>

        <button
          onClick={() => setShowWorkerModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-brand-300 text-brand-800 hover:bg-brand-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
        >
          <Code className="w-4 h-4 text-brand-600" /> Xem mã nguồn Worker
        </button>
      </div>

      {/* Connection Status Box */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            testResult.success
              ? "bg-green-50/80 border-green-200 text-green-900"
              : "bg-red-50/80 border-red-200 text-red-900"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{testResult.success ? "Thành công" : "Thông báo kết nối"}</p>
            <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-5">
            <h3 className="text-base font-serif font-bold text-brand-900 border-b border-brand-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-600" /> Thông tin Cloudflare Worker API
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Cloudflare Worker Endpoint URL *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    type="url"
                    value={currentConfig.workerUrl}
                    onChange={(e) => {
                      const updated = { ...currentConfig, workerUrl: e.target.value };
                      handleSaveConfig(updated);
                    }}
                    placeholder="https://terre-spa-api.your-account.workers.dev"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-brand-50/20 text-brand-950"
                  />
                </div>
                <p className="text-[11px] text-brand-500 mt-1">
                  Đường dẫn Cloudflare Worker nhận dữ liệu từ ứng dụng Terre Spa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  API Token / Secret Key (Tùy chọn)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    type="password"
                    value={currentConfig.apiToken}
                    onChange={(e) => {
                      const updated = { ...currentConfig, apiToken: e.target.value };
                      handleSaveConfig(updated);
                    }}
                    placeholder="Nhập khóa bí mật API_SECRET_TOKEN nếu có..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-brand-50/20 text-brand-950"
                  />
                </div>
                <p className="text-[11px] text-brand-500 mt-1">
                  Khóa xác thực gửi qua header Authorization Bearer để bảo vệ quyền chỉnh sửa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Tên KV Namespace Binding
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    type="text"
                    value={currentConfig.kvNamespace || "TERRE_KV"}
                    onChange={(e) => {
                      const updated = { ...currentConfig, kvNamespace: e.target.value };
                      handleSaveConfig(updated);
                    }}
                    placeholder="TERRE_KV"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-brand-50/20 text-brand-950"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-900 block">Tự động đồng bộ lên Cloudflare</span>
                  <span className="text-[11px] text-brand-500">
                    Tự động tải dữ liệu lên Cloudflare Worker mỗi khi thêm/sửa bài viết hoặc sản phẩm.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentConfig.autoSync}
                    onChange={(e) => {
                      const updated = { ...currentConfig, autoSync: e.target.checked };
                      handleSaveConfig(updated);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !currentConfig.workerUrl}
                className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
                {testing ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
              </button>
            </div>
          </div>

          {/* 2-Way Sync Actions */}
          <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-brand-900 border-b border-brand-100 pb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-600" /> Thao tác đồng bộ dữ liệu 2 chiều
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Push Box */}
              <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40 space-y-3">
                <div className="flex items-center gap-2 text-brand-900 font-semibold text-xs uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4 text-brand-700" /> Đẩy dữ liệu lên Cloudflare
                </div>
                <p className="text-[11px] text-brand-600 leading-relaxed">
                  Lưu {posts.length} bài viết và {products.length} sản phẩm hiện tại lên Cloudflare KV.
                </p>
                <button
                  type="button"
                  onClick={handlePushToCloudflare}
                  disabled={syncing || !currentConfig.workerUrl}
                  className="w-full py-2 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${syncing ? "animate-bounce" : ""}`} />
                  {syncing ? "Đang tải lên..." : "Đồng bộ lên Cloudflare"}
                </button>
              </div>

              {/* Pull Box */}
              <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40 space-y-3">
                <div className="flex items-center gap-2 text-brand-900 font-semibold text-xs uppercase tracking-wider">
                  <DownloadCloud className="w-4 h-4 text-brand-700" /> Tải về từ Cloudflare
                </div>
                <p className="text-[11px] text-brand-600 leading-relaxed">
                  Lấy toàn bộ dữ liệu bài viết &amp; sản phẩm mới nhất đang lưu trên Cloudflare KV về máy.
                </p>
                <button
                  type="button"
                  onClick={handlePullFromCloudflare}
                  disabled={fetching || !currentConfig.workerUrl}
                  className="w-full py-2 bg-white border border-brand-300 text-brand-900 hover:bg-brand-100 disabled:opacity-50 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 ${fetching ? "animate-bounce" : ""}`} />
                  {fetching ? "Đang tải về..." : "Tải dữ liệu từ Cloudflare"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions & Summary Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Trạng thái đồng bộ
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-500">Bài viết sẵn có:</span>
                <strong className="text-brand-900">{posts.length} bài</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-500">Sản phẩm sẵn có:</span>
                <strong className="text-brand-900">{products.length} sản phẩm</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-500">Đồng bộ gần nhất:</span>
                <strong className="text-brand-900">
                  {currentConfig.lastSyncTime
                    ? new Date(currentConfig.lastSyncTime).toLocaleString("vi-VN")
                    : "Chưa đồng bộ"}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-500">Tự động đồng bộ:</span>
                <span className={`font-semibold ${currentConfig.autoSync ? "text-green-600" : "text-brand-400"}`}>
                  {currentConfig.autoSync ? "Đang bật" : "Tắt"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-linear-to-br from-brand-900 to-brand-950 text-white p-5 rounded-2xl shadow-md space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-brand-100 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Hướng dẫn triển khai 3 bước
            </h4>
            <ol className="space-y-2 text-brand-200 list-decimal pl-4 leading-relaxed text-[11px]">
              <li>
                Đăng nhập Cloudflare Dashboard &gt; <strong>Workers &amp; Pages</strong> &gt; Tạo 1 Worker mới.
              </li>
              <li>
                Tạo 1 <strong>KV Namespace</strong> đặt tên là <code className="bg-brand-800 px-1 rounded text-white">TERRE_KV</code> và liên kết vào Worker.
              </li>
              <li>
                Dán mã nguồn Worker có sẵn vào và nhấn <strong>Deploy</strong>, sau đó copy URL Worker dán vào ô bên trái!
              </li>
            </ol>
          </div>

          {/* Backup JSON Button */}
          <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Sao lưu dự phòng (Offline JSON)
            </h4>
            <p className="text-[11px] text-brand-600 leading-relaxed">
              Tải toàn bộ dữ liệu bài viết &amp; sản phẩm thành file JSON lưu về máy tính của bạn.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <DownloadCloud className="w-3.5 h-3.5" /> Xuất file sao lưu .JSON
            </button>
          </div>
        </div>
      </div>

      {/* Cloudflare Worker Code Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-brand-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100">
              <h3 className="text-base font-serif font-bold text-brand-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-600" /> Mã nguồn Cloudflare Worker (worker.js)
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkerModal(false)}
                className="text-brand-400 hover:text-brand-800 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1 bg-brand-950 p-4 rounded-xl text-brand-100 font-mono text-xs leading-relaxed">
              <pre>{SAMPLE_WORKER_CODE}</pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-brand-100">
              <p className="text-[11px] text-brand-500">
                Tệp đầy đủ cũng đã được lưu tại: <code className="text-brand-800 font-bold">cloudflare/worker.js</code>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 rounded-lg"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={copyWorkerCode}
                  className="px-5 py-2 text-xs font-medium bg-brand-800 hover:bg-brand-900 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {copiedWorker ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedWorker ? "Đã sao chép!" : "Sao chép mã Worker"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
