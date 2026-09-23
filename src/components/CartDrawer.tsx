import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { CartItem, Coupon, Order } from "../types";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartSubtotal,
  TERRE_CART_UPDATED_EVENT,
} from "../utils/cartStore";
import { validateAndApplyCoupon, createOrder } from "../data/store";
import { isValidVietnamesePhone, isValidCustomerName, formatPhoneNumber } from "../utils/validationUtils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart());
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Listen for external cart changes
  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      setCartItems(e.detail?.cart || getCart());
    };
    window.addEventListener(TERRE_CART_UPDATED_EVENT, handleCartUpdate);
    return () => {
      window.removeEventListener(TERRE_CART_UPDATED_EVENT, handleCartUpdate);
    };
  }, []);

  // Recalculate discount if cart changes and coupon is active
  useEffect(() => {
    const subtotal = getCartSubtotal();
    if (appliedCoupon && subtotal > 0) {
      const res = validateAndApplyCoupon(appliedCoupon.code, subtotal);
      if (res.valid) {
        setDiscountAmount(res.discountAmount);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponMessage({ type: "error", text: res.message });
      }
    } else if (subtotal === 0) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMessage(null);
    }
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const res = validateAndApplyCoupon(couponCodeInput, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discountAmount);
      setCouponMessage({ type: "success", text: res.message });
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMessage({ type: "error", text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput("");
    setCouponMessage(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    let hasError = false;
    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim();

    if (!cleanName) {
      setNameError("Vui lòng nhập họ và tên.");
      hasError = true;
    } else if (!isValidCustomerName(cleanName)) {
      setNameError("Họ và tên không hợp lệ (tối thiểu 2 ký tự).");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!cleanPhone) {
      setPhoneError("Vui lòng nhập số điện thoại.");
      hasError = true;
    } else if (!isValidVietnamesePhone(cleanPhone)) {
      setPhoneError("Số điện thoại không hợp lệ (Ví dụ: 0912 345 678).");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productThumbnail: item.product.thumbnail,
        price: item.product.price,
        quantity: item.quantity,
        volumeOrWeight: item.product.volumeOrWeight,
      }));

      const newOrder = createOrder({
        customerName: cleanName,
        customerPhone: formatPhoneNumber(cleanPhone),
        customerAddress: customerAddress.trim(),
        customerNotes: customerNotes.trim(),
        items: orderItems,
        subtotalAmount: subtotal,
        couponCode: appliedCoupon?.code,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        source: "website_cart",
        adminNotes: appliedCoupon
          ? `Đơn áp dụng mã giảm giá [${appliedCoupon.code}] giảm ${formatPrice(discountAmount)}đ.`
          : undefined,
      });

      setSuccessOrder(newOrder);
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerNotes("");
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCodeInput("");
      setCouponMessage(null);
    } catch (err) {
      alert("Không thể gửi đơn hàng. Quý khách vui lòng gọi hotline 0569 08 7777 để được hỗ trợ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-brand-100 flex items-center justify-between bg-brand-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-800 text-brand-50 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-brand-950 uppercase tracking-wider">
                      Giỏ Hàng Của Bạn
                    </h2>
                    <p className="text-[11px] text-brand-600">
                      {cartItems.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm đã chọn
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-brand-500 hover:text-brand-900 hover:bg-brand-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {successOrder ? (
                  /* Order Success Screen */
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-green-700 block">
                        Đặt hàng thành công!
                      </span>
                      <h3 className="text-base font-serif font-bold text-brand-950 mt-1">
                        Mã đơn: #{successOrder.id}
                      </h3>
                      <p className="text-xs text-brand-600 mt-2 max-w-xs mx-auto leading-relaxed">
                        Cảm ơn bạn đã tin chọn Terre Spa! Chuyên viên tư vấn sẽ liên hệ xác nhận đơn và giao hàng trong thời gian sớm nhất.
                      </p>
                    </div>

                    <div className="bg-brand-50/70 p-4 rounded-xl border border-brand-100 text-left text-xs space-y-2 max-w-xs mx-auto">
                      <div className="flex justify-between text-brand-700">
                        <span>Người nhận:</span>
                        <span className="font-semibold text-brand-900">{successOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between text-brand-700">
                        <span>Số điện thoại:</span>
                        <span className="font-mono font-semibold text-brand-900">{successOrder.customerPhone}</span>
                      </div>
                      {successOrder.couponCode && (
                        <div className="flex justify-between text-green-700 font-medium">
                          <span>Mã ưu đãi:</span>
                          <span>{successOrder.couponCode} (-{formatPrice(successOrder.discountAmount || 0)}đ)</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-brand-200/60 pt-2 font-bold text-brand-900 text-sm">
                        <span>Tổng thanh toán:</span>
                        <span className="text-brand-700">{formatPrice(successOrder.totalAmount)} VNĐ</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href="tel:0569087777"
                        className="py-2.5 px-4 bg-brand-100 text-brand-900 hover:bg-brand-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Hotline hỗ trợ: 0569 08 7777
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessOrder(null);
                          onClose();
                        }}
                        className="py-3 px-4 bg-brand-800 text-white hover:bg-brand-900 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        Tiếp tục mua sắm
                      </button>
                    </div>
                  </div>
                ) : cartItems.length === 0 ? (
                  /* Empty Cart Screen */
                  <div className="py-14 text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-50 text-brand-400 rounded-full flex items-center justify-center mx-auto border border-brand-100">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">
                        Giỏ hàng đang trống
                      </h3>
                      <p className="text-xs text-brand-500 max-w-xs mx-auto">
                        Hãy chọn các sản phẩm chăm sóc da & dưỡng sinh thảo mộc từ Terre Spa bạn nhé!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-900 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      Khám phá sản phẩm <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Active Cart Items & Checkout Form */
                  <div className="space-y-5">
                    {/* Item list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-brand-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                          Sản phẩm ({cartItems.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => clearCart()}
                          className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa tất cả
                        </button>
                      </div>

                      {cartItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-3 bg-brand-50/40 rounded-xl border border-brand-100 flex gap-3 items-center group transition-all hover:bg-brand-50"
                        >
                          {/* Image */}
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg border border-brand-200 bg-white shrink-0"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-xs font-bold text-brand-900 truncate" title={item.product.name}>
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="font-semibold text-brand-700">
                                {formatPrice(item.product.price)}đ
                              </span>
                              {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                <span className="line-through text-brand-400 text-[10px]">
                                  {formatPrice(item.product.originalPrice)}đ
                                </span>
                              )}
                              {item.product.volumeOrWeight && (
                                <span className="text-brand-500 bg-white px-1.5 py-0.5 rounded text-[9.5px] border border-brand-200">
                                  {item.product.volumeOrWeight}
                                </span>
                              )}
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-2 pt-1">
                              <div className="flex items-center border border-brand-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-brand-600 hover:bg-brand-100 hover:text-brand-900"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-7 text-center text-xs font-semibold text-brand-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-brand-600 hover:bg-brand-100 hover:text-brand-900"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <span className="text-[11px] font-bold text-brand-900 ml-auto">
                                {formatPrice(item.product.price * item.quantity)}đ
                              </span>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-brand-400 hover:text-red-600 p-1 transition-colors"
                                title="Xóa món này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo / Coupon Box */}
                    <div className="p-3.5 bg-brand-50/60 rounded-xl border border-brand-200/80 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5 text-brand-600" /> Mã Ưu Đãi / Giảm Giá:
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            <div>
                              <span className="font-bold uppercase tracking-wider font-mono">
                                {appliedCoupon.code}
                              </span>
                              <p className="text-[10.5px] text-green-700">
                                Đã giảm {formatPrice(discountAmount)} VNĐ
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs text-red-600 hover:underline font-medium px-2 py-1"
                          >
                            Bỏ mã
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập mã (vd: TERRE20, SPA50K...)"
                            value={couponCodeInput}
                            onChange={(e) => {
                              setCouponCodeInput(e.target.value.toUpperCase());
                              if (couponMessage) setCouponMessage(null);
                            }}
                            className="flex-1 px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-mono uppercase bg-white"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-900 transition-colors shadow-2xs"
                          >
                            Áp Dụng
                          </button>
                        </form>
                      )}

                      {couponMessage && (
                        <p
                          className={`text-[11px] font-medium flex items-center gap-1.5 ${
                            couponMessage.type === "success" ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {couponMessage.type === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-3.5 bg-brand-100/40 rounded-xl border border-brand-200 text-xs space-y-2">
                      <div className="flex justify-between text-brand-700">
                        <span>Tạm tính ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} món):</span>
                        <span className="font-semibold text-brand-900">{formatPrice(subtotal)} VNĐ</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-700 font-medium">
                          <span>Giảm giá ưu đãi ({appliedCoupon?.code}):</span>
                          <span>-{formatPrice(discountAmount)} VNĐ</span>
                        </div>
                      )}

                      <div className="flex justify-between text-brand-700">
                        <span>Phí vận chuyển:</span>
                        <span className="text-green-700 font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Miễn phí giao hàng
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-brand-200/80 pt-2 text-sm font-bold text-brand-950">
                        <span>Tổng thanh toán:</span>
                        <span className="text-brand-800 text-base">{formatPrice(totalAmount)} VNĐ</span>
                      </div>
                    </div>

                    {/* Customer Shipping Form */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Thông Tin Nhận Hàng:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Name */}
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Họ và tên *"
                            value={customerName}
                            onChange={(e) => {
                              setCustomerName(e.target.value);
                              if (nameError) setNameError("");
                            }}
                            onBlur={() => {
                              if (customerName.trim() && !isValidCustomerName(customerName)) {
                                setNameError("Họ tên tối thiểu 2 ký tự");
                              }
                            }}
                            className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none bg-white transition-colors ${
                              nameError ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/10" : "border-brand-200 focus:border-brand-600"
                            }`}
                          />
                          {nameError && (
                            <p className="text-[10.5px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" /> {nameError}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <input
                            type="tel"
                            required
                            placeholder="Số điện thoại *"
                            value={customerPhone}
                            onChange={(e) => {
                              setCustomerPhone(e.target.value);
                              if (phoneError) setPhoneError("");
                            }}
                            onBlur={() => {
                              if (customerPhone.trim() && !isValidVietnamesePhone(customerPhone)) {
                                setPhoneError("Số điện thoại không hợp lệ (10 số)");
                              }
                            }}
                            className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none font-mono bg-white transition-colors ${
                              phoneError ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/10" : "border-brand-200 focus:border-brand-600"
                            }`}
                          />
                          {phoneError && (
                            <p className="text-[10.5px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" /> {phoneError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <input
                        type="text"
                        placeholder="Địa chỉ nhận hàng (Số nhà, ngõ, phường, quận...)"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-white"
                      />

                      {/* Notes */}
                      <input
                        type="text"
                        placeholder="Ghi chú giao hàng (vd: Giao giờ hành chính...)"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-white"
                      />

                      {/* Submit Order Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || cartItems.length === 0}
                        className="w-full py-3.5 bg-brand-800 text-white hover:bg-brand-900 transition-all font-bold uppercase tracking-wider text-xs rounded-xl shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ĐANG GỬI ĐƠN HÀNG...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-brand-300" />
                            XÁC NHẬN ĐẶT HÀNG ({formatPrice(totalAmount)} VNĐ)
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-brand-50 border-t border-brand-100 text-[11px] text-brand-600 text-center flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-700" /> 100% Chính Hãng
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-brand-700" /> Đổi trả trong 7 ngày
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
