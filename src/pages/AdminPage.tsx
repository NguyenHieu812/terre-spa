import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Post, Product, ServiceCategory, CloudflareConfig, CustomerReview, AdminUser } from "../types";
import {
  getStoredPosts,
  saveStoredPosts,
  getStoredProducts,
  saveStoredProducts,
  getStoredServices,
  saveStoredServices,
  getStoredReviews,
  saveStoredReviews,
} from "../data/store";
import {
  getDefaultCloudflareConfig,
  saveCloudflareConfig,
} from "../services/cloudflareService";
import {
  getCurrentAdminUser,
  getStoredAdminUsers,
  loginAdmin,
  logoutAdmin,
  changeUserPassword,
} from "../services/authStore";
import { PostManager } from "../components/admin/PostManager";
import { ProductManager } from "../components/admin/ProductManager";
import { ServiceManager } from "../components/admin/ServiceManager";
import { ReviewManager } from "../components/admin/ReviewManager";
import { UserManager } from "../components/admin/UserManager";
import { CloudflareSettings } from "../components/admin/CloudflareSettings";
import LogoTerre from "../assets/images/logo-terre-removebg.png";
import {
  LayoutDashboard,
  FileText,
  Package,
  Sparkles,
  Cloud,
  ExternalLink,
  Plus,
  Eye,
  EyeOff,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle,
  Scissors,
  MessageSquare,
  Star,
  Users,
  LogOut,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

type AdminTab = "dashboard" | "posts" | "products" | "services" | "reviews" | "users" | "cloudflare";

const AdminPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getCurrentAdminUser());
  const [allUsers, setAllUsers] = useState<AdminUser[]>(() => getStoredAdminUsers());
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [cloudflareConfig, setCloudflareConfig] = useState<CloudflareConfig>(
    getDefaultCloudflareConfig()
  );

  // Login Form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Change Password Modal state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load initial data
  useEffect(() => {
    setPosts(getStoredPosts());
    setProducts(getStoredProducts());
    setServices(getStoredServices());
    setReviews(getStoredReviews());
    setCloudflareConfig(getDefaultCloudflareConfig());
  }, []);

  const refreshUsers = () => {
    const updatedUsers = getStoredAdminUsers();
    setAllUsers(updatedUsers);
    const updatedCurrent = getCurrentAdminUser();
    setCurrentUser(updatedCurrent);
  };

  const handleSaveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    saveStoredReviews(updated);
  };

  const handleSavePost = (updatedPost: Post) => {
    let newPosts: Post[];
    const idx = posts.findIndex((p) => p.id === updatedPost.id);
    if (idx >= 0) {
      newPosts = [...posts];
      newPosts[idx] = updatedPost;
    } else {
      newPosts = [updatedPost, ...posts];
    }
    setPosts(newPosts);
    saveStoredPosts(newPosts);
  };

  const handleDeletePost = (id: string) => {
    const newPosts = posts.filter((p) => p.id !== id);
    setPosts(newPosts);
    saveStoredPosts(newPosts);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    let newProducts: Product[];
    const idx = products.findIndex((p) => p.id === updatedProduct.id);
    if (idx >= 0) {
      newProducts = [...products];
      newProducts[idx] = updatedProduct;
    } else {
      newProducts = [updatedProduct, ...products];
    }
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleDeleteProduct = (id: string) => {
    const newProducts = products.filter((p) => p.id !== id);
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleSaveServices = (updated: ServiceCategory[]) => {
    setServices(updated);
    saveStoredServices(updated);
  };

  const handleUpdateCloudflareConfig = (config: CloudflareConfig) => {
    setCloudflareConfig(config);
    saveCloudflareConfig(config);
  };

  const handleDataImported = (data: {
    posts: Post[];
    products: Product[];
    serviceCategories?: ServiceCategory[];
  }) => {
    setPosts(data.posts);
    setProducts(data.products);
    saveStoredPosts(data.posts);
    saveStoredProducts(data.products);
    if (data.serviceCategories && data.serviceCategories.length > 0) {
      setServices(data.serviceCategories);
      saveStoredServices(data.serviceCategories);
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAdmin(usernameInput, passwordInput);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthError("");
      setUsernameInput("");
      setPasswordInput("");
      setActiveTab("dashboard");
    } else {
      setAuthError(res.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutAdmin();
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // Change Password Submit
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    const res = changeUserPassword(currentUser.id, newPasswordInput);
    if (res.success) {
      setPasswordChangeMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setIsChangingPassword(false);
        setNewPasswordInput("");
        setConfirmPasswordInput("");
        setPasswordChangeMsg(null);
        refreshUsers();
      }, 1500);
    } else {
      setPasswordChangeMsg({ type: "error", text: res.message });
    }
  };

  // IF NOT AUTHENTICATED -> SHOW LUXURY LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl border border-brand-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <img src={LogoTerre} alt="Terre Logo" className="w-10 h-10 rounded-full" />
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-950">Terre Spa Quản Trị</h2>
            <p className="text-xs text-brand-600 mt-1">Đăng nhập tài khoản quản lý hệ thống</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-left flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin1, admin2 hoặc admin3"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-semibold border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-brand-50/40 text-brand-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 text-sm font-mono border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-brand-50/40 text-brand-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-800"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 mt-2"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          {/* Quick Account Reference */}
          <div className="p-3 bg-brand-50/80 rounded-2xl border border-brand-100 text-left text-[11px] text-brand-700 space-y-1">
            <p className="font-bold text-brand-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Tài khoản mặc định hệ thống:
            </p>
            <div className="grid grid-cols-1 gap-0.5 text-brand-600 font-mono text-[10.5px]">
              <div>• <strong>admin1</strong> (Super Admin Toàn Quyền)</div>
              <div>• <strong>admin2</strong> (Admin phụ 1 - Sản phẩm &amp; Bài viết)</div>
              <div>• <strong>admin3</strong> (Admin phụ 2 - Dịch vụ &amp; Đánh giá)</div>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-xs text-brand-500">
            <Link to="/" className="hover:text-brand-800 transition-colors flex items-center gap-1">
              ← Về trang chủ
            </Link>
            <span>Terre Spa Security</span>
          </div>
        </div>
      </div>
    );
  }

  const isSuper = currentUser.role === "super_admin" || currentUser.username === "admin1";
  const perms = currentUser.permissions;

  // Stats calculations
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="min-h-screen bg-brand-50/60 flex flex-col font-sans text-brand-950">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={LogoTerre}
                alt="Terre Logo"
                className="w-8 h-8 rounded-full border border-brand-200 group-hover:rotate-12 transition-transform duration-300"
              />
              <div>
                <span className="font-serif font-bold text-base text-brand-900 tracking-wider">
                  TERRE SPA
                </span>
                <span className="text-[10px] ml-2 uppercase font-mono px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-bold">
                  {isSuper ? "Super Admin" : "Admin Phụ"}
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-800 hover:bg-brand-50 rounded-lg text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Xem Website
            </Link>

            {/* Current user badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-xl border border-brand-200">
              <img
                src={
                  currentUser.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}`
                }
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-brand-300"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-brand-900 leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-brand-500 font-mono mt-0.5">
                  @{currentUser.username}
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="p-2 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              title="Đổi mật khẩu tài khoản"
            >
              <KeyRound className="w-4 h-4" />
              <span className="hidden lg:inline">Đổi MK</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              title="Đăng xuất khỏi trang quản trị"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Thoát</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Filtered by Permissions) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto hide-scrollbar border-t border-brand-100/60 pt-1">
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-brand-800 text-brand-900 bg-brand-100/40"
                : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Tổng quan
          </button>

          {/* Posts Tab */}
          {(isSuper || perms.posts?.view) && (
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "posts"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <FileText className="w-4 h-4" /> Bài viết ({posts.length})
            </button>
          )}

          {/* Products Tab */}
          {(isSuper || perms.products?.view) && (
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "products"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <Package className="w-4 h-4" /> Sản phẩm ({products.length})
            </button>
          )}

          {/* Services Tab */}
          {(isSuper || perms.services?.view) && (
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "services"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <Scissors className="w-4 h-4" /> Gói Dịch Vụ ({services.length})
            </button>
          )}

          {/* Reviews Tab */}
          {(isSuper || perms.reviews?.view) && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-brand-600" /> Đánh Giá ({reviews.length})
            </button>
          )}

          {/* User Management & RBAC Tab (SUPER ADMIN ONLY) */}
          {isSuper && (
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "users"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40 font-bold"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-brand-700" /> Phân Quyền &amp; Tài Khoản ({allUsers.length})
            </button>
          )}

          {/* Cloudflare Settings Tab */}
          {(isSuper || perms.cloudflare?.view) && (
            <button
              onClick={() => setActiveTab("cloudflare")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "cloudflare"
                  ? "border-brand-800 text-brand-900 bg-brand-100/40"
                  : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-50"
              }`}
            >
              <Cloud className="w-4 h-4 text-amber-600" /> Đồng bộ Cloudflare
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Greeting */}
            <div className="bg-linear-to-r from-brand-900 via-brand-800 to-brand-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium text-brand-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Xin chào, {currentUser.name}! ({isSuper ? "Super Admin" : "Admin Phụ"})
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                  Terre Spa Hub Quản Trị
                </h1>
                <p className="text-brand-200 text-sm leading-relaxed">
                  Hệ thống quản lý bài viết, sản phẩm thảo dược, gói dịch vụ dưỡng sinh và đánh giá khách hàng chuẩn hóa.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  {(isSuper || perms.posts?.create) && (
                    <button
                      onClick={() => setActiveTab("posts")}
                      className="px-5 py-2.5 bg-white text-brand-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-brand-50 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Viết bài mới
                    </button>
                  )}
                  {(isSuper || perms.products?.create) && (
                    <button
                      onClick={() => setActiveTab("products")}
                      className="px-5 py-2.5 bg-brand-700 hover:bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Thêm sản phẩm
                    </button>
                  )}
                  {isSuper && (
                    <button
                      onClick={() => setActiveTab("users")}
                      className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Quản lý Admin &amp; Phân quyền
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1 */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-brand-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Tổng bài viết</span>
                  <div className="p-2.5 bg-brand-100 rounded-xl text-brand-800">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-brand-950">{posts.length}</div>
                <p className="text-xs text-brand-500">
                  {publishedCount} bài đã xuất bản · {posts.length - publishedCount} bản nháp
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-brand-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Tổng sản phẩm</span>
                  <div className="p-2.5 bg-brand-100 rounded-xl text-brand-800">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-brand-950">{products.length}</div>
                <p className="text-xs text-brand-500">
                  {inStockCount} sản phẩm còn hàng · {products.length - inStockCount} hết hàng
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-brand-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Gói Dịch Vụ</span>
                  <div className="p-2.5 bg-brand-100 rounded-xl text-brand-800">
                    <Scissors className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-brand-950">{services.length} Danh mục</div>
                <p className="text-xs text-brand-500">Gội đầu, massage, dưỡng sinh thảo dược</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-brand-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Đánh giá khách hàng</span>
                  <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-brand-950">{reviews.length}</div>
                <p className="text-xs text-brand-500">Đánh giá và feedback xác thực</p>
              </div>
            </div>

            {/* Two Column Section: Recent Posts & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <h3 className="font-serif font-bold text-base text-brand-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" /> Bài viết mới nhất
                  </h3>
                  <button
                    onClick={() => setActiveTab("posts")}
                    className="text-xs text-brand-700 hover:text-brand-950 font-semibold flex items-center gap-1"
                  >
                    Xem tất cả ({posts.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {posts.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/70 border border-brand-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-brand-950 line-clamp-1">{post.title}</p>
                          <span className="text-[10px] text-brand-500 font-medium">
                            {post.category} · {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/posts/${post.id}`}
                        target="_blank"
                        className="p-1.5 text-brand-600 hover:text-brand-900 rounded-lg hover:bg-brand-100"
                        title="Xem bài"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <h3 className="font-serif font-bold text-base text-brand-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-600" /> Sản phẩm đặc trưng
                  </h3>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="text-xs text-brand-700 hover:text-brand-950 font-semibold flex items-center gap-1"
                  >
                    Xem tất cả ({products.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {products.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/70 border border-brand-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-brand-950 line-clamp-1">{prod.name}</p>
                          <span className="text-[10px] text-brand-600 font-semibold">
                            {new Intl.NumberFormat("vi-VN").format(prod.price)} đ · {prod.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                        {prod.inStock ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Posts */}
        {activeTab === "posts" && (isSuper || perms.posts?.view) && (
          <PostManager
            posts={posts}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            canCreate={isSuper || perms.posts?.create}
            canEdit={isSuper || perms.posts?.edit}
            canDelete={isSuper || perms.posts?.delete}
          />
        )}

        {/* Tab 3: Products */}
        {activeTab === "products" && (isSuper || perms.products?.view) && (
          <ProductManager
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            canCreate={isSuper || perms.products?.create}
            canEdit={isSuper || perms.products?.edit}
            canDelete={isSuper || perms.products?.delete}
          />
        )}

        {/* Tab 4: Services */}
        {activeTab === "services" && (isSuper || perms.services?.view) && (
          <ServiceManager
            categories={services}
            onSaveCategories={handleSaveServices}
            canCreate={isSuper || perms.services?.create}
            canEdit={isSuper || perms.services?.edit}
            canDelete={isSuper || perms.services?.delete}
          />
        )}

        {/* Tab 5: Reviews */}
        {activeTab === "reviews" && (isSuper || perms.reviews?.view) && (
          <ReviewManager
            reviews={reviews}
            categories={services}
            onSaveReviews={handleSaveReviews}
            canCreate={isSuper || perms.reviews?.create}
            canEdit={isSuper || perms.reviews?.edit}
            canDelete={isSuper || perms.reviews?.delete}
          />
        )}

        {/* Tab 6: User Management & Permissions (SUPER ADMIN ONLY) */}
        {activeTab === "users" && isSuper && (
          <UserManager
            users={allUsers}
            currentUser={currentUser}
            onRefreshUsers={refreshUsers}
          />
        )}

        {/* Tab 7: Cloudflare Settings */}
        {activeTab === "cloudflare" && (isSuper || perms.cloudflare?.view) && (
          <CloudflareSettings
            config={cloudflareConfig}
            posts={posts}
            products={products}
            onUpdateConfig={handleUpdateCloudflareConfig}
            onDataImported={handleDataImported}
          />
        )}
      </main>

      {/* CHANGE PASSWORD MODAL */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100">
              <h3 className="font-serif font-bold text-base text-brand-950 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-600" /> Đổi Mật Khẩu Cá Nhân
              </h3>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordChangeMsg(null);
                }}
                className="text-brand-400 hover:text-brand-900 font-bold"
              >
                ✕
              </button>
            </div>

            {passwordChangeMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordChangeMsg.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {passwordChangeMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Tài khoản đang đăng nhập
                </label>
                <input
                  type="text"
                  disabled
                  value={`@${currentUser.username} (${currentUser.name})`}
                  className="w-full px-3.5 py-2.5 text-xs bg-brand-100/60 font-semibold border border-brand-200 rounded-xl text-brand-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Xác nhận lại mật khẩu mới *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại chính xác mật khẩu mới..."
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordChangeMsg(null);
                  }}
                  className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
