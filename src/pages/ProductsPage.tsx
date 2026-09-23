import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Product, Order } from "../types";
import {
  getStoredProducts,
  getStoredProductCategories,
  createOrder,
  TERRE_DATA_SYNCED_EVENT,
} from "../data/store";
import {
  Search,
  ShoppingBag,
  Star,
  CheckCircle2,
  X,
  Leaf,
  Sparkles,
  Phone,
  Share2,
  Check,
  Percent,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";
import facialCareImg from "../assets/images/spa_facial_care_1781704209004.jpg";

export const ProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [categories, setCategories] = useState<string[]>(() => getStoredProductCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Order form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // SEO
  usePageSEO({
    title: selectedProduct
      ? selectedProduct.metaTitle || `${selectedProduct.name} Chính Hãng | Terre Spa`
      : "Sản Phẩm Thảo Dược & Chăm Sóc Sức Khỏe | Terre Spa",
    description: selectedProduct
      ? selectedProduct.metaDescription || selectedProduct.shortDesc
      : "Bộ sưu tập sản phẩm thảo mộc tinh khiết, dầu gội cô đặc dưỡng sinh, tinh dầu trị liệu và mỹ phẩm chăm sóc phục hồi da chuẩn spa Terre.",
    keywords: selectedProduct
      ? `${selectedProduct.name}, ${selectedProduct.category}, sản phẩm terre spa, mỹ phẩm phục hồi da`
      : "sản phẩm terre spa, dầu gội thảo dược, tinh dầu massage, kem dưỡng phục hồi, mỹ phẩm spa",
    canonicalUrl: selectedProduct
      ? `https://terre-spa.vercel.app/products/${selectedProduct.slug || selectedProduct.id}`
      : "https://terre-spa.vercel.app/products",
    ogImage: selectedProduct?.thumbnail || undefined,
  });

  useEffect(() => {
    const updateData = () => {
      const prods = getStoredProducts();
      setProducts(prods);
      setCategories(getStoredProductCategories());
    };
    updateData();

    window.addEventListener(TERRE_DATA_SYNCED_EVENT, updateData);
    return () => {
      window.removeEventListener(TERRE_DATA_SYNCED_EVENT, updateData);
    };
  }, []);

  // Sync modal with URL slug param on direct page load or URL change
  useEffect(() => {
    if (slug) {
      const found = products.find((p) => p.slug === slug || p.id === slug);
      if (found) {
        setSelectedProduct(found);
      }
    } else {
      if (location.pathname === "/products") {
        setSelectedProduct(null);
      }
    }
  }, [slug, products, location.pathname]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setCreatedOrder(null);
    navigate(`/products/${product.slug || product.id}`, { replace: false });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setCreatedOrder(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerNotes("");
    if (location.pathname.startsWith("/products/")) {
      navigate("/products", { replace: false });
    }
  };

  const handleShareLink = () => {
    if (!selectedProduct) return;
    const url = `${window.location.origin}/products/${selectedProduct.slug || selectedProduct.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const newOrd = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNotes: customerNotes.trim(),
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productThumbnail: selectedProduct.thumbnail,
            price: selectedProduct.price,
            quantity: 1,
            volumeOrWeight: selectedProduct.volumeOrWeight,
          },
        ],
        totalAmount: selectedProduct.price,
        source: "website_product_modal",
      });

      setCreatedOrder(newOrd);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerNotes("");
    } catch (err) {
      alert("Không thể gửi đơn hàng. Quý khách vui lòng gọi hotline 0569 08 7777 để được hỗ trợ!");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const calcDiscountPercent = (orig?: number, curr?: number) => {
    if (!orig || !curr || orig <= curr) return 0;
    return Math.round(((orig - curr) / orig) * 100);
  };

  // Category filter tabs list
  const categoryTabs = [
    "all",
    ...Array.from(new Set([...categories, ...products.map((p) => p.category)])),
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ingredients || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans text-brand-950">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-16">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 relative overflow-hidden text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-200/35 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-brand-200 text-brand-800 text-[10px] uppercase tracking-widest rounded-full font-semibold shadow-xs"
            >
              <Leaf className="w-3 h-3 text-brand-600" /> Thảo Mộc Tinh Khiết &amp; Dưỡng Sinh
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-brand-900 font-medium leading-tight tracking-wide"
            >
              Sản Phẩm Thảo Dược Terre
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-brand-700 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              Chiết xuất thủ công từ thảo dược bản địa Việt Nam, nuôi dưỡng mái tóc, làn da và nâng niu từng giác quan mỗi ngày.
            </motion.p>
            <div className="w-12 h-px bg-brand-400 mx-auto pt-2" />
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-brand-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-brand-900 text-white shadow-sm"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {cat === "all" ? "Tất cả sản phẩm" : cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm thảo mộc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/30"
              />
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-6xl mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-brand-200 space-y-4 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-brand-300 mx-auto" />
              <p className="font-serif text-lg text-brand-900">Không tìm thấy sản phẩm phù hợp</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900 transition-colors"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => {
                const discount = calcDiscountPercent(product.originalPrice, product.price);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-xl hover:shadow-brand-950/5 transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Card */}
                    <div
                      onClick={() => handleOpenProduct(product)}
                      className="aspect-square w-full overflow-hidden bg-brand-100 relative cursor-pointer"
                    >
                      <img
                        src={product.thumbnail || facialCareImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = facialCareImg;
                        }}
                      />

                      {/* Featured Badge */}
                      {product.featured && (
                        <span className="absolute top-3 left-3 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                        </span>
                      )}

                      {/* % SALE Tag */}
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-0.5">
                          <Percent className="w-2.5 h-2.5" /> -{discount}% SALE
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-brand-500">
                          <span className="uppercase font-semibold tracking-wider text-brand-600">
                            {product.category}
                          </span>
                          {product.volumeOrWeight && (
                            <span className="bg-brand-50 px-2 py-0.5 rounded-md text-brand-700 font-medium">
                              {product.volumeOrWeight}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => handleOpenProduct(product)}
                          className="font-serif font-semibold text-lg text-brand-950 hover:text-brand-700 cursor-pointer transition-colors line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs text-brand-600 line-clamp-2 leading-relaxed">
                          {product.shortDesc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold text-brand-900 font-serif">
                            {formatPrice(product.price)} <span className="text-xs font-normal">VNĐ</span>
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-[11px] text-brand-400 line-through">
                              {formatPrice(product.originalPrice)} VNĐ
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenProduct(product)}
                          className="px-4 py-2 bg-brand-800 hover:bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Chi tiết
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Product Detail Modal (Fixed Responsive 2-column layout on Desktop) */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-brand-950/60 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-brand-200"
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-brand-900 rounded-full shadow-md transition-colors"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Left Image (Proper Desktop Ratio & Sizing) */}
                <div className="md:w-5/12 bg-brand-100 aspect-square md:aspect-auto relative shrink-0 min-h-[280px] md:min-h-[500px]">
                  <img
                    src={selectedProduct.thumbnail || facialCareImg}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = facialCareImg;
                    }}
                  />

                  {/* Badges */}
                  {selectedProduct.featured && (
                    <span className="absolute top-4 left-4 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                    </span>
                  )}

                  {calcDiscountPercent(selectedProduct.originalPrice, selectedProduct.price) > 0 && (
                    <span className="absolute top-4 right-14 md:right-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      -{calcDiscountPercent(selectedProduct.originalPrice, selectedProduct.price)}% SALE
                    </span>
                  )}
                </div>

                {/* Modal Right Info & Order */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Header info */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest block">
                          {selectedProduct.category}
                        </span>
                        <button
                          type="button"
                          onClick={handleShareLink}
                          className="text-[11px] text-brand-600 hover:text-brand-900 flex items-center gap-1 font-medium bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
                          title="Sao chép liên kết sản phẩm"
                        >
                          {linkCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" /> Đã sao chép link
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                            </>
                          )}
                        </button>
                      </div>

                      <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-950 leading-snug">
                        {selectedProduct.name}
                      </h2>
                    </div>

                    {/* Price & Weight */}
                    <div className="flex items-baseline gap-3 pb-3 border-b border-brand-100 flex-wrap">
                      <span className="text-2xl font-bold text-brand-900 font-serif">
                        {formatPrice(selectedProduct.price)} VNĐ
                      </span>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-brand-400 line-through">
                          {formatPrice(selectedProduct.originalPrice)} VNĐ
                        </span>
                      )}
                      {selectedProduct.volumeOrWeight && (
                        <span className="text-xs bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full font-semibold ml-auto">
                          {selectedProduct.volumeOrWeight}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="text-xs text-brand-700 space-y-2.5 leading-relaxed">
                      <p className="font-semibold text-brand-900">{selectedProduct.shortDesc}</p>
                      {selectedProduct.fullDesc && (
                        <p className="whitespace-pre-line text-brand-800">{selectedProduct.fullDesc}</p>
                      )}
                    </div>

                    {/* Ingredients chips */}
                    {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block">
                          Thành phần thảo mộc:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.ingredients.map((ing) => (
                            <span
                              key={ing}
                              className="text-[11px] bg-brand-100 text-brand-900 px-2.5 py-0.5 rounded-md font-medium"
                            >
                              🌿 {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Usage Guide */}
                    {selectedProduct.usageInstructions && (
                      <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-xs text-brand-800 space-y-1">
                        <span className="font-bold text-brand-900">Hướng dẫn sử dụng:</span>
                        <p>{selectedProduct.usageInstructions}</p>
                      </div>
                    )}

                    {/* Guarantee tags */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-700 bg-brand-50/50 p-2 rounded-lg border border-brand-100">
                        <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>100% Thảo mộc tự nhiên</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-700 bg-brand-50/50 p-2 rounded-lg border border-brand-100">
                        <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>Giao hàng toàn quốc</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Box / Form */}
                  <div className="pt-4 border-t border-brand-100 space-y-3">
                    {createdOrder ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-900 space-y-2 animate-in zoom-in-95">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="font-bold text-xs">Đặt mua thành công! Mã đơn: #{createdOrder.id}</p>
                        </div>
                        <p className="text-[11px] text-green-800 leading-relaxed">
                          Cảm ơn bạn! Chuyên viên tư vấn Terre Spa sẽ liên hệ bạn qua số điện thoại để xác nhận đơn và hẹn lịch giao hàng nhanh nhất.
                        </p>
                        <div className="pt-1 flex gap-2">
                          <a
                            href="tel:0569087777"
                            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> Gọi hotline 0569 08 7777
                          </a>
                          <button
                            type="button"
                            onClick={() => setCreatedOrder(null)}
                            className="px-3 py-1.5 bg-white border border-green-300 text-green-900 rounded-lg text-xs font-semibold"
                          >
                            Đặt thêm sản phẩm khác
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleOrderSubmit} className="space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-900 block">
                          Đặt mua nhanh / Tư vấn trực tiếp:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Họ và tên *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Số điện thoại *"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20 font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Địa chỉ nhận hàng (nếu cần giao tận nơi)"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                        />
                        <input
                          type="text"
                          placeholder="Ghi chú thêm (vd: giao sau giờ hành chính...)"
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={isSubmittingOrder}
                            className="flex-1 py-3 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <ShoppingBag className="w-4 h-4" /> Đặt mua ngay
                          </button>
                          <a
                            href="tel:0569087777"
                            className="px-4 py-3 border border-brand-300 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" /> Gọi tư vấn
                          </a>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
