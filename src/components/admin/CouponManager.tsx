import React, { useState } from "react";
import { Coupon, Order, AdminUser, CouponDiscountType } from "../../types";
import {
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Copy,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Clock,
  Check,
  X,
  Sliders,
  Filter,
} from "lucide-react";

interface CouponManagerProps {
  coupons: Coupon[];
  orders: Order[];
  onSaveCoupons: (coupons: Coupon[]) => void;
  currentUser?: AdminUser | null;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const CouponManager: React.FC<CouponManagerProps> = ({
  coupons,
  orders,
  onSaveCoupons,
  currentUser,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "inactive">("all");
  const [toastMessage, setToastMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<CouponDiscountType>("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState<string>("");
  const [formMinOrderValue, setFormMinOrderValue] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState<string>("");
  const [formUsageLimit, setFormUsageLimit] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getCouponStatus = (cp: Coupon): { label: string; bg: string; text: string; dot: string } => {
    if (!cp.isActive) {
      return { label: "Tạm khóa", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (cp.startDate && cp.startDate > today) {
      return { label: "Chưa tới ngày", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
    }
    if (cp.endDate && cp.endDate < today) {
      return { label: "Đã hết hạn", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
    }
    if (cp.usageLimit && cp.usedCount >= cp.usageLimit) {
      return { label: "Hết lượt", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" };
    }
    return { label: "Đang kích hoạt", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" };
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((cp) => {
    const today = new Date().toISOString().slice(0, 10);
    const matchesSearch =
      cp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active") {
      return cp.isActive && (!cp.endDate || cp.endDate >= today) && (!cp.usageLimit || cp.usedCount < cp.usageLimit);
    }
    if (statusFilter === "expired") {
      return (cp.endDate && cp.endDate < today) || (cp.usageLimit ? cp.usedCount >= cp.usageLimit : false);
    }
    if (statusFilter === "inactive") {
      return !cp.isActive;
    }
    return true;
  });

  // Calculate Revenue Analytics for Coupons from Orders
  const ordersWithCoupons = orders.filter((o) => o.couponCode);
  const totalCouponOrdersCount = ordersWithCoupons.length;
  const totalDiscountGiven = ordersWithCoupons.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const totalRevenueFromCouponOrders = ordersWithCoupons.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalGrossSalesFromCouponOrders = ordersWithCoupons.reduce(
    (sum, o) => sum + (o.subtotalAmount || o.totalAmount + (o.discountAmount || 0)),
    0
  );

  // Per coupon breakdown
  const couponAnalyticsMap = coupons.map((cp) => {
    const matchingOrders = orders.filter((o) => o.couponCode?.toUpperCase() === cp.code.toUpperCase());
    const count = matchingOrders.length;
    const discount = matchingOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const revenue = matchingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const gross = matchingOrders.reduce(
      (sum, o) => sum + (o.subtotalAmount || o.totalAmount + (o.discountAmount || 0)),
      0
    );
    const share = totalRevenueFromCouponOrders > 0 ? (revenue / totalRevenueFromCouponOrders) * 100 : 0;
    return {
      coupon: cp,
      orderCount: count,
      discountAmount: discount,
      netRevenue: revenue,
      grossSales: gross,
      revenueShare: share,
    };
  });

  // Modal Open Handlers
  const handleOpenCreate = () => {
    if (!canCreate) {
      alert("Bạn không có quyền tạo mã ưu đãi.");
      return;
    }
    setEditingCoupon(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue(10);
    setFormMaxDiscountAmount("");
    setFormMinOrderValue("");
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate("");
    setFormUsageLimit("");
    setFormIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cp: Coupon) => {
    if (!canEdit) {
      alert("Bạn không có quyền chỉnh sửa mã ưu đãi.");
      return;
    }
    setEditingCoupon(cp);
    setFormCode(cp.code);
    setFormDescription(cp.description);
    setFormDiscountType(cp.discountType);
    setFormDiscountValue(cp.discountValue);
    setFormMaxDiscountAmount(cp.maxDiscountAmount ? cp.maxDiscountAmount.toString() : "");
    setFormMinOrderValue(cp.minOrderValue ? cp.minOrderValue.toString() : "");
    setFormStartDate(cp.startDate || "");
    setFormEndDate(cp.endDate || "");
    setFormUsageLimit(cp.usageLimit ? cp.usageLimit.toString() : "");
    setFormIsActive(cp.isActive);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleToggleActive = (cp: Coupon) => {
    if (!canEdit) {
      alert("Bạn không có quyền thay đổi trạng thái mã.");
      return;
    }
    const updated = coupons.map((item) => (item.id === cp.id ? { ...item, isActive: !item.isActive } : item));
    onSaveCoupons(updated);
    showToast(`Đã ${!cp.isActive ? "kích hoạt" : "tạm khóa"} mã [${cp.code}]!`);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();

    if (!cleanCode) {
      setFormError("Vui lòng nhập mã ưu đãi.");
      return;
    }

    if (cleanCode.length < 3) {
      setFormError("Mã ưu đãi phải có ít nhất 3 ký tự.");
      return;
    }

    // Check duplicate code
    const isDuplicate = coupons.some(
      (c) => c.code.toUpperCase() === cleanCode && (!editingCoupon || c.id !== editingCoupon.id)
    );
    if (isDuplicate) {
      setFormError(`Mã ưu đãi "${cleanCode}" đã tồn tại!`);
      return;
    }

    if (formDiscountValue <= 0) {
      setFormError("Mức giảm giá phải lớn hơn 0.");
      return;
    }

    if (formDiscountType === "percentage" && formDiscountValue > 100) {
      setFormError("Mức giảm theo % không được vượt quá 100%.");
      return;
    }

    const maxDiscount = formMaxDiscountAmount ? parseInt(formMaxDiscountAmount, 10) : undefined;
    const minOrder = formMinOrderValue ? parseInt(formMinOrderValue, 10) : undefined;
    const usageLimit = formUsageLimit ? parseInt(formUsageLimit, 10) : undefined;

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: cleanCode,
              description: formDescription.trim(),
              discountType: formDiscountType,
              discountValue: formDiscountValue,
              maxDiscountAmount: maxDiscount,
              minOrderValue: minOrder,
              startDate: formStartDate || undefined,
              endDate: formEndDate || undefined,
              usageLimit,
              isActive: formIsActive,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      onSaveCoupons(updated);
      showToast(`Đã cập nhật mã ưu đãi [${cleanCode}] thành công!`);
    } else {
      const newCoupon: Coupon = {
        id: `cp-${Date.now()}`,
        code: cleanCode,
        description: formDescription.trim(),
        discountType: formDiscountType,
        discountValue: formDiscountValue,
        maxDiscountAmount: maxDiscount,
        minOrderValue: minOrder,
        startDate: formStartDate || undefined,
        endDate: formEndDate || undefined,
        usageLimit,
        usedCount: 0,
        isActive: formIsActive,
        createdAt: new Date().toISOString(),
      };
      onSaveCoupons([newCoupon, ...coupons]);
      showToast(`Đã tạo mã ưu đãi mới [${cleanCode}] thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCoupon) return;
    if (!canDelete) {
      alert("Bạn không có quyền xóa mã ưu đãi.");
      return;
    }
    const filtered = coupons.filter((c) => c.id !== deletingCoupon.id);
    onSaveCoupons(filtered);
    showToast(`Đã xóa mã ưu đãi [${deletingCoupon.code}]!`);
    setDeletingCoupon(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-brand-950 font-serif flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-brand-700" /> Quản Lý Mã Ưu Đãi &amp; Khuyến Mãi
          </h2>
          <p className="text-xs text-brand-600 mt-1">
            Thiết lập mã giảm giá theo %, tiền mặt và theo dõi doanh thu thực tế mang lại
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Tạo Mã Ưu Đãi Mới
          </button>
        )}
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
              Tổng số mã ưu đãi
            </span>
            <div className="text-2xl font-bold text-brand-900 font-serif">{coupons.length}</div>
            <p className="text-[10.5px] text-green-700 font-medium">
              {coupons.filter((c) => c.isActive).length} mã đang hoạt động
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders with Promo */}
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
              Lượt áp dụng mã
            </span>
            <div className="text-2xl font-bold text-brand-900 font-serif">{totalCouponOrdersCount} đơn</div>
            <p className="text-[10.5px] text-brand-500">
              Chiếm {orders.length > 0 ? ((totalCouponOrdersCount / orders.length) * 100).toFixed(0) : 0}% tổng đơn hàng
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Discount Given */}
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
              Tổng tiền đã chiết khấu
            </span>
            <div className="text-2xl font-bold text-red-600 font-serif">
              {formatPrice(totalDiscountGiven)} <span className="text-xs font-normal">đ</span>
            </div>
            <p className="text-[10.5px] text-red-500 font-medium">Ưu đãi trực tiếp cho khách</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Net Revenue from Promo Orders */}
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
              Doanh thu từ mã ưu đãi
            </span>
            <div className="text-2xl font-bold text-emerald-700 font-serif">
              {formatPrice(totalRevenueFromCouponOrders)} <span className="text-xs font-normal">đ</span>
            </div>
            <p className="text-[10.5px] text-emerald-600 font-medium">
              Từ {formatPrice(totalGrossSalesFromCouponOrders)}đ giá niêm yết
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue Performance Breakdown by Coupon */}
      {couponAnalyticsMap.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-700" /> Báo Cáo Hiệu Quả Doanh Thu Theo Từng Mã Ưu Đãi
              </h3>
              <p className="text-[11px] text-brand-600">
                Theo dõi chính xác mã nào mang lại doanh thu và số lượng đơn hàng cao nhất
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50/70 text-brand-800 uppercase font-semibold border-b border-brand-200">
                <tr>
                  <th className="py-3 px-4">Mã Ưu Đãi</th>
                  <th className="py-3 px-4">Mức Giảm</th>
                  <th className="py-3 px-4 text-center">Số Đơn Hàng</th>
                  <th className="py-3 px-4 text-right">Doanh Số Trước Giảm</th>
                  <th className="py-3 px-4 text-right">Tiền Đã Chiết Khấu</th>
                  <th className="py-3 px-4 text-right">Doanh Thu Thực Thu</th>
                  <th className="py-3 px-4 text-center">Tỷ Trọng Doanh Số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 font-medium">
                {couponAnalyticsMap.map(({ coupon, orderCount, discountAmount, netRevenue, grossSales, revenueShare }) => (
                  <tr key={coupon.id} className="hover:bg-brand-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs uppercase text-brand-900 bg-brand-100/60 px-2 py-0.5 rounded border border-brand-200">
                          {coupon.code}
                        </span>
                        <span className="text-[11px] text-brand-500 truncate max-w-[150px]" title={coupon.description}>
                          {coupon.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-700">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `${formatPrice(coupon.discountValue)}đ`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                        {orderCount} đơn
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-brand-600 font-mono">
                      {formatPrice(grossSales)} đ
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-mono font-semibold">
                      -{formatPrice(discountAmount)} đ
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-mono font-bold text-sm">
                      {formatPrice(netRevenue)} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-brand-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-700 rounded-full"
                            style={{ width: `${Math.min(100, revenueShare)}%` }}
                          />
                        </div>
                        <span className="text-[10.5px] font-bold text-brand-700 font-mono">
                          {revenueShare.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupon List Section & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-brand-50 rounded-xl border border-brand-200 self-start md:self-auto text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "all" ? "bg-white text-brand-900 shadow-xs" : "text-brand-600 hover:text-brand-900"
              }`}
            >
              Tất cả ({coupons.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "active" ? "bg-white text-green-800 shadow-xs" : "text-brand-600 hover:text-brand-900"
              }`}
            >
              Đang chạy
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "expired" ? "bg-white text-red-800 shadow-xs" : "text-brand-600 hover:text-brand-900"
              }`}
            >
              Hết hạn
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "inactive" ? "bg-white text-gray-800 shadow-xs" : "text-brand-600 hover:text-brand-900"
              }`}
            >
              Tạm khóa
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-50/70 text-brand-800 uppercase font-semibold border-b border-brand-200">
              <tr>
                <th className="py-3 px-4">Mã Ưu Đãi</th>
                <th className="py-3 px-4">Mô Tả Khuyến Mãi</th>
                <th className="py-3 px-4">Loại &amp; Mức Giảm</th>
                <th className="py-3 px-4">Điều Kiện Áp Dụng</th>
                <th className="py-3 px-4">Thời Gian Hiệu Lực</th>
                <th className="py-3 px-4">Lượt Sử Dụng</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 font-medium">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-brand-500 text-xs">
                    Không tìm thấy mã ưu đãi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((cp) => {
                  const status = getCouponStatus(cp);
                  return (
                    <tr key={cp.id} className="hover:bg-brand-50/30 transition-colors">
                      {/* Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs uppercase text-brand-900 bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200">
                            {cp.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(cp.code)}
                            className="text-brand-400 hover:text-brand-800 p-1"
                            title="Sao chép mã"
                          >
                            {copiedCode === cp.code ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-brand-800 max-w-[200px]">
                        <p className="truncate" title={cp.description}>
                          {cp.description || "—"}
                        </p>
                      </td>

                      {/* Discount Type & Value */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-900">
                          {cp.discountType === "percentage" ? (
                            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Giảm {cp.discountValue}%
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              Giảm {formatPrice(cp.discountValue)}đ
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Conditions */}
                      <td className="py-3 px-4 space-y-0.5 text-[11px] text-brand-600">
                        {cp.minOrderValue && (
                          <div>Đơn tối thiểu: <strong>{formatPrice(cp.minOrderValue)}đ</strong></div>
                        )}
                        {cp.maxDiscountAmount && cp.discountType === "percentage" && (
                          <div>Giảm tối đa: <strong>{formatPrice(cp.maxDiscountAmount)}đ</strong></div>
                        )}
                        {!cp.minOrderValue && !cp.maxDiscountAmount && <div>Mọi đơn hàng</div>}
                      </td>

                      {/* Expiration Dates */}
                      <td className="py-3 px-4 text-[11px] text-brand-600">
                        <div className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-brand-400" />
                          {cp.startDate ? cp.startDate : "Không giới hạn"} ➔ {cp.endDate ? cp.endDate : "Vô thời hạn"}
                        </div>
                      </td>

                      {/* Usage Limit & Count */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-brand-700 font-mono">
                            <span>{cp.usedCount} lượt</span>
                            <span>{cp.usageLimit ? `/ ${cp.usageLimit}` : "(Vô hạn)"}</span>
                          </div>
                          {cp.usageLimit && (
                            <div className="w-20 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cp.usedCount >= cp.usageLimit ? "bg-red-500" : "bg-brand-700"}`}
                                style={{ width: `${Math.min(100, (cp.usedCount / cp.usageLimit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cp)}
                          disabled={!canEdit}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all ${status.bg} ${status.text} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                          title={canEdit ? "Bấm để Bật/Tắt trạng thái" : undefined}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cp)}
                              className="p-1.5 text-brand-600 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa mã"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeletingCoupon(cp)}
                              className="p-1.5 text-brand-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa mã"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo / Chỉnh Sửa Mã Giảm Giá */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-brand-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-brand-50/70 border-b border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-800" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-brand-950">
                  {editingCoupon ? `Chỉnh Sửa Mã [${editingCoupon.code}]` : "Tạo Mã Ưu Đãi / Khuyến Mãi Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-brand-100 flex items-center justify-center text-brand-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Mã Ưu Đãi (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vd: TERRE20, VIP100K..."
                    value={formCode}
                    onChange={(e) => {
                      setFormCode(e.target.value.toUpperCase());
                      if (formError) setFormError("");
                    }}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono uppercase bg-brand-50/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Loại Giảm Giá *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as CouponDiscountType)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-white"
                  >
                    <option value="percentage">Chiết khấu theo % (Phần trăm)</option>
                    <option value="fixed_amount">Giảm trực tiếp số tiền (VNĐ)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                  Mô Tả / Tên Chiến Dịch Khuyến Mãi
                </label>
                <input
                  type="text"
                  placeholder="Vd: Giảm 20% cho khách đặt lịch hẹn lần đầu..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                />
              </div>

              {/* Discount Value & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    {formDiscountType === "percentage" ? "Mức Giảm (%) *" : "Số Tiền Giảm (VNĐ) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formDiscountType === "percentage" ? 100 : 100000000}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono font-bold"
                  />
                </div>

                {formDiscountType === "percentage" ? (
                  <div>
                    <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                      Giảm Tối Đa (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="Vd: 150000 (để trống nếu vô hạn)"
                      value={formMaxDiscountAmount}
                      onChange={(e) => setFormMaxDiscountAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                      Đơn Hàng Tối Thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="Vd: 300000 (để trống nếu mọi đơn)"
                      value={formMinOrderValue}
                      onChange={(e) => setFormMinOrderValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono"
                    />
                  </div>
                )}
              </div>

              {formDiscountType === "percentage" && (
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Đơn Hàng Tối Thiểu Để Áp Dụng (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="Vd: 200000 (để trống nếu áp dụng mọi đơn)"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono"
                  />
                </div>
              )}

              {/* Date Ranges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Ngày Bắt Đầu Áp Dụng
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Ngày Hết Hạn (Kết Thúc)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              {/* Usage Limit & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Tổng Số Lượt Dùng Tối Đa
                  </label>
                  <input
                    type="number"
                    placeholder="Vd: 500 (để trống nếu không giới hạn)"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-800 focus:ring-brand-500"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-semibold text-brand-900 cursor-pointer">
                    Kích hoạt áp dụng ngay
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-brand-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingCoupon ? "Lưu Thay Đổi" : "Tạo Mã Ưu Đãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-brand-200 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-brand-950">Xác nhận xóa mã ưu đãi?</h3>
              <p className="text-xs text-brand-600">
                Bạn có chắc chắn muốn xóa vĩnh viễn mã <strong className="font-mono text-red-700">[{deletingCoupon.code}]</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="flex-1 py-2.5 border border-brand-200 text-brand-800 rounded-xl text-xs font-semibold hover:bg-brand-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
