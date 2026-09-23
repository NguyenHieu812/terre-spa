import React, { useState } from "react";
import { Order, OrderStatus, OrderItem, Product } from "../../types";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  ShoppingBag,
  FileText,
  Printer,
  ChevronDown,
} from "lucide-react";
import facialCareImg from "../../assets/images/spa_facial_care_1781704209004.jpg";

interface OrderManagerProps {
  orders: Order[];
  products: Product[];
  onSaveOrders: (orders: Order[]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  pending: {
    label: "Chờ xác nhận",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  shipping: {
    label: "Đang giao hàng",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    icon: Truck,
  },
  completed: {
    label: "Hoàn thành",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    icon: XCircle,
  },
};

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  products,
  onSaveOrders,
  onUpdateOrderStatus,
  onDeleteOrder,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isCreatingManualOrder, setIsCreatingManualOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Manual Order Form State
  const [manualCustomerName, setManualCustomerName] = useState("");
  const [manualCustomerPhone, setManualCustomerPhone] = useState("");
  const [manualCustomerAddress, setManualCustomerAddress] = useState("");
  const [manualCustomerNotes, setManualCustomerNotes] = useState("");
  const [manualSelectedProductId, setManualSelectedProductId] = useState<string>(
    products[0]?.id || ""
  );
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [manualAdminNotes, setManualAdminNotes] = useState("");

  // Customer Care Notes in Modal
  const [careNotesInput, setCareNotesInput] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN")}`;
    } catch {
      return dateStr;
    }
  };

  // Status counters
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippingCount = orders.filter((o) => o.status === "shipping").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "confirmed" || o.status === "shipping")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = filterStatus === "all" || ord.status === filterStatus;
    const matchQuery =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.includes(searchQuery) ||
      (ord.customerAddress && ord.customerAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  const handleOpenDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setCareNotesInput(ord.adminNotes || "");
  };

  const handleSaveCareNotes = () => {
    if (!selectedOrder) return;
    onUpdateOrderStatus(selectedOrder.id, selectedOrder.status, careNotesInput);
    setSelectedOrder({ ...selectedOrder, adminNotes: careNotesInput });
    showToast("Đã lưu ghi chú chăm sóc khách hàng!");
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    showToast(`Đã chuyển trạng thái đơn sang: ${STATUS_CONFIG[newStatus].label}`);
  };

  const handleCreateManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName.trim() || !manualCustomerPhone.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại khách hàng.");
      return;
    }

    const prod = products.find((p) => p.id === manualSelectedProductId) || products[0];
    const unitPrice = prod ? prod.price : 189000;
    const qty = Math.max(1, manualQuantity);

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: manualCustomerName.trim(),
      customerPhone: manualCustomerPhone.trim(),
      customerAddress: manualCustomerAddress.trim(),
      customerNotes: manualCustomerNotes.trim(),
      items: [
        {
          productId: prod?.id || "manual-prod",
          productName: prod?.name || "Sản phẩm tư vấn trực tiếp",
          productThumbnail: prod?.thumbnail || facialCareImg,
          price: unitPrice,
          quantity: qty,
          volumeOrWeight: prod?.volumeOrWeight,
        },
      ],
      totalAmount: unitPrice * qty,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "direct",
      adminNotes: manualAdminNotes.trim() || "Đơn tạo trực tiếp bởi nhân viên tư vấn.",
    };

    onSaveOrders([newOrder, ...orders]);
    setIsCreatingManualOrder(false);
    setManualCustomerName("");
    setManualCustomerPhone("");
    setManualCustomerAddress("");
    setManualCustomerNotes("");
    setManualAdminNotes("");
    showToast(`Đã tạo đơn hàng mới #${newOrder.id} thành công!`);
  };

  const cleanPhone = (phone: string) => {
    return phone.replace(/[^0-9+]/g, "");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-900">Quản lý Đơn Hàng &amp; Chăm Sóc Khách Hàng</h2>
          <p className="text-xs text-brand-600">
            Theo dõi đơn đặt hàng từ website, cập nhật trạng thái giao hàng và ghi chú tư vấn
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreatingManualOrder(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Tạo đơn hàng mới
          </button>
        )}
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-brand-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-brand-500 uppercase tracking-wider">Tổng đơn hàng</span>
          <div className="text-2xl font-bold font-serif text-brand-950">{totalOrders}</div>
          <span className="text-[10px] text-brand-400">Tất cả thời gian</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1 bg-amber-50/20">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Chờ xác nhận
          </span>
          <div className="text-2xl font-bold font-serif text-amber-900">{pendingCount}</div>
          <span className="text-[10px] text-amber-600">Cần gọi điện tư vấn</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-2xs space-y-1 bg-indigo-50/20">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3 h-3 text-indigo-600" /> Đang giao hàng
          </span>
          <div className="text-2xl font-bold font-serif text-indigo-900">{shippingCount}</div>
          <span className="text-[10px] text-indigo-600">Đơn đang trên đường giao</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1 bg-emerald-50/20">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-emerald-600" /> Đã hoàn thành
          </span>
          <div className="text-2xl font-bold font-serif text-emerald-900">{completedCount}</div>
          <span className="text-[10px] text-emerald-600">Giao hàng thành công</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-brand-300 shadow-2xs space-y-1 bg-brand-50/40">
          <span className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-brand-700" /> Doanh thu dự kiến
          </span>
          <div className="text-xl font-bold font-serif text-brand-950">{formatPrice(totalRevenue)} đ</div>
          <span className="text-[10px] text-brand-500">Từ các đơn hợp lệ</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên khách, SĐT, Mã đơn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
          />
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === "all"
                ? "bg-brand-900 text-white shadow-xs"
                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
            }`}
          >
            Tất cả ({totalOrders})
          </button>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? "bg-brand-900 text-white shadow-xs"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                {STATUS_CONFIG[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-brand-300 mx-auto" />
          <p className="text-brand-600 font-serif text-lg">Không tìm thấy đơn hàng nào.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
            className="px-4 py-2 bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold hover:bg-brand-200 transition-colors"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-800">
              <thead className="bg-brand-50/80 border-b border-brand-200 text-brand-900 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Mã đơn &amp; Ngày</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Sản phẩm đặt mua</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredOrders.map((ord) => {
                  const st = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending;
                  const StatusIcon = st.icon;

                  return (
                    <tr key={ord.id} className="hover:bg-brand-50/50 transition-colors">
                      {/* Order ID & Date */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-brand-950 text-xs">#{ord.id}</div>
                        <div className="text-[11px] text-brand-500">{formatDate(ord.createdAt)}</div>
                        <span className="text-[10px] text-brand-400 bg-brand-100/60 px-1.5 py-0.5 rounded">
                          {ord.source === "direct" ? "Trực tiếp" : "Website"}
                        </span>
                      </td>

                      {/* Customer info */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-brand-950 text-sm">{ord.customerName}</div>
                          <div className="flex items-center gap-1.5 text-xs text-brand-700">
                            <Phone className="w-3 h-3 text-brand-500" />
                            <a
                              href={`tel:${cleanPhone(ord.customerPhone)}`}
                              className="hover:underline hover:text-brand-900 font-mono"
                            >
                              {ord.customerPhone}
                            </a>
                          </div>
                          {ord.customerAddress && (
                            <div className="text-[11px] text-brand-500 line-clamp-1 max-w-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                              {ord.customerAddress}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img
                                src={item.productThumbnail || facialCareImg}
                                alt={item.productName}
                                className="w-8 h-8 rounded-lg object-cover border border-brand-100 shrink-0"
                              />
                              <div className="text-xs truncate font-medium text-brand-900">
                                {item.productName}{" "}
                                <span className="font-bold text-brand-600">×{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-brand-950 text-sm font-serif">
                          {formatPrice(ord.totalAmount)} đ
                        </div>
                      </td>

                      {/* Status Dropdown on row */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${st.bg} ${st.text} ${st.border}`}
                          >
                            <option value="pending">⏳ Chờ xác nhận</option>
                            <option value="confirmed">✓ Đã xác nhận</option>
                            <option value="shipping">🚚 Đang giao hàng</option>
                            <option value="completed">🎉 Hoàn thành</option>
                            <option value="cancelled">✕ Đã hủy</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast Call shortcut */}
                          <a
                            href={`tel:${cleanPhone(ord.customerPhone)}`}
                            title="Gọi điện cho khách"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* Detail / Care Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ord)}
                            title="Xem chi tiết & Chăm sóc khách"
                            className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setOrderToDelete(ord)}
                              title="Xóa đơn hàng"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Customer Care Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col border border-brand-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-brand-100 flex items-center justify-between bg-brand-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold font-serif text-sm">
                  #{selectedOrder.id.slice(-4)}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-brand-950">
                    Chi tiết đơn hàng #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-brand-500">Đặt lúc: {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-brand-100 flex items-center justify-center text-brand-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-brand-800">
              {/* Customer Contact Card */}
              <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-900 uppercase tracking-wider text-[11px]">
                    Thông tin người mua:
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${cleanPhone(selectedOrder.customerPhone)}`}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px] shadow-2xs"
                    >
                      <Phone className="w-3 h-3" /> Gọi ngay
                    </a>
                    <a
                      href={`https://zalo.me/${cleanPhone(selectedOrder.customerPhone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px] shadow-2xs"
                    >
                      <MessageCircle className="w-3 h-3" /> Chat Zalo
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-brand-500 text-[11px] block">Họ và tên:</span>
                    <strong className="text-brand-950 text-sm">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-brand-500 text-[11px] block">Số điện thoại:</span>
                    <strong className="text-brand-950 font-mono text-sm">{selectedOrder.customerPhone}</strong>
                  </div>
                  {selectedOrder.customerAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-brand-500 text-[11px] block">Địa chỉ nhận hàng:</span>
                      <p className="text-brand-900 font-medium">{selectedOrder.customerAddress}</p>
                    </div>
                  )}
                  {selectedOrder.customerNotes && (
                    <div className="sm:col-span-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                      <span className="font-bold block text-[10px] uppercase">Ghi chú của khách:</span>
                      <p>{selectedOrder.customerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-brand-900 uppercase tracking-wider text-[11px] block">
                  Sản phẩm đã đặt:
                </span>
                <div className="divide-y divide-brand-100 border border-brand-200 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productThumbnail || facialCareImg}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover border border-brand-100"
                        />
                        <div>
                          <div className="font-bold text-brand-950 text-xs line-clamp-1">
                            {item.productName}
                          </div>
                          <div className="text-brand-500 text-[11px]">
                            {formatPrice(item.price)} đ {item.volumeOrWeight ? `(${item.volumeOrWeight})` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-brand-500">Số lượng: <strong>{item.quantity}</strong></div>
                        <div className="font-bold font-serif text-brand-950 text-sm">
                          {formatPrice(item.price * item.quantity)} đ
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-3.5 bg-brand-50/60 flex items-center justify-between font-bold text-sm text-brand-950">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-base font-serif text-brand-900">
                      {formatPrice(selectedOrder.totalAmount)} VNĐ
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <span className="font-bold text-brand-900 uppercase tracking-wider text-[11px] block">
                  Trạng thái đơn hàng:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
                    const cfg = STATUS_CONFIG[st];
                    const isSelected = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-semibold ${
                          isSelected
                            ? "bg-brand-900 text-white border-brand-900 shadow-md font-bold"
                            : `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Care Notes */}
              <div className="space-y-2">
                <span className="font-bold text-brand-900 uppercase tracking-wider text-[11px] block">
                  Ghi chú chăm sóc khách hàng (Nhân viên tư vấn):
                </span>
                <textarea
                  rows={3}
                  value={careNotesInput}
                  onChange={(e) => setCareNotesInput(e.target.value)}
                  placeholder="Vd: Khách hẹn giao sau 18h, đã tư vấn dùng thêm kem chống nắng, khách hài lòng..."
                  className="w-full px-3.5 py-2.5 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                />
                <button
                  type="button"
                  onClick={handleSaveCareNotes}
                  className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold"
                >
                  Lưu ghi chú tư vấn
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-100 flex items-center justify-between bg-brand-50/40">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-brand-300 text-brand-800 rounded-xl text-xs font-semibold hover:bg-brand-100 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> In phiếu đơn
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {isCreatingManualOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col border border-brand-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-brand-100 flex items-center justify-between bg-brand-50/60">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-800" />
                <h3 className="text-base font-serif font-bold text-brand-950">
                  Tạo đơn hàng trực tiếp (Khách gọi điện / Mua tại chỗ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingManualOrder(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-brand-100 flex items-center justify-center text-brand-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrderSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="Vd: Chị Mai, Anh Hùng..."
                    className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                  Địa chỉ nhận hàng (nếu có ship)
                </label>
                <input
                  type="text"
                  value={manualCustomerAddress}
                  onChange={(e) => setManualCustomerAddress(e.target.value)}
                  placeholder="Vd: Số 20 ngõ 282 Kim Giang, Hoàng Mai..."
                  className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Chọn sản phẩm
                  </label>
                  <select
                    value={manualSelectedProductId}
                    onChange={(e) => setManualSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none bg-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatPrice(p.price)} đ)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                  Ghi chú của khách
                </label>
                <input
                  type="text"
                  value={manualCustomerNotes}
                  onChange={(e) => setManualCustomerNotes(e.target.value)}
                  placeholder="Yêu cầu giao giờ nào, đóng gói..."
                  className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase mb-1">
                  Ghi chú tư vấn nội bộ
                </label>
                <textarea
                  rows={2}
                  value={manualAdminNotes}
                  onChange={(e) => setManualAdminNotes(e.target.value)}
                  placeholder="Nhân viên nào tư vấn, dặn dò..."
                  className="w-full px-3.5 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="pt-3 border-t border-brand-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreatingManualOrder(false)}
                  className="px-4 py-2 border border-brand-300 text-brand-800 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase shadow-md"
                >
                  Xác nhận tạo đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-brand-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-900">Xác nhận xóa đơn hàng</h3>
                <p className="text-xs text-brand-500">Mã đơn: #{orderToDelete.id}</p>
              </div>
            </div>

            <p className="text-sm text-brand-700 leading-relaxed">
              Bạn có chắc chắn muốn xóa đơn hàng của khách{" "}
              <strong className="text-brand-950 font-bold">"{orderToDelete.customerName}"</strong> ({orderToDelete.customerPhone})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  showToast(`Đã xóa đơn hàng #${orderToDelete.id}`);
                  setOrderToDelete(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
