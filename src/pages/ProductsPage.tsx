import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Product } from "../types";
import { getStoredProducts, TERRE_DATA_SYNCED_EVENT } from "../data/store";
import {
  Search,
  ShoppingBag,
  Star,
  CheckCircle2,
  X,
  Leaf,
  Sparkles,
  Phone,
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export const ProductsPage: React.FC = () => {
  usePageSEO({
    title: "Sản Phẩm Thảo Dược & Chăm Sóc Sức Khỏe | Terre Spa",
    description: "Bộ sưu tập sản phẩm thảo mộc tinh khiết, dầu gội cô đặc dưỡng sinh, tinh dầu trị liệu và mỹ phẩm chăm sóc phục hồi da chuẩn spa Terre.",
    keywords: "sản phẩm terre spa, dầu gội thảo dược, tinh dầu massage, kem dưỡng phục hồi, mỹ phẩm spa",
    canonicalUrl: "https://terre-spa.vercel.app/products",
  });
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Simple order form in modal
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    const updateProducts = () => {
      setProducts(getStoredProducts());
    };
    updateProducts();

    window.addEventListener(TERRE_DATA_SYNCED_EVENT, updateProducts);
    return () => {
      window.removeEventListener(TERRE_DATA_SYNCED_EVENT, updateProducts);
    };
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ingredients || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedProduct(null);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
    }, 2500);
  };

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
              {categories.map((cat) => (
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
                placeholder="Tìm sản phẩm..."
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
                className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-xl hover:shadow-brand-950/5 transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="aspect-square w-full overflow-hidden bg-brand-100 relative cursor-pointer"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Badge */}
                    {product.featured && (
                      <span className="absolute top-3 left-3 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                      </span>
                    )}

                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-md">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
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
                          <span className="bg-brand-50 px-2 py-0.5 rounded text-brand-600 font-medium">
                            {product.volumeOrWeight}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedProduct(product)}
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
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 bg-brand-800 hover:bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Chi tiết
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-brand-950/60 backdrop-blur-xs cursor-pointer"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-brand-200"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white text-brand-900 rounded-full shadow-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Left Image */}
                <div className="md:w-5/12 bg-brand-100 aspect-square md:aspect-auto relative shrink-0">
                  <img
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedProduct.featured && (
                    <span className="absolute top-4 left-4 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                    </span>
                  )}
                </div>

                {/* Modal Right Info & Order */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest block mb-1">
                        {selectedProduct.category}
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-brand-950 leading-snug">
                        {selectedProduct.name}
                      </h2>
                    </div>

                    <div className="flex items-baseline gap-3 pb-3 border-b border-brand-100">
                      <span className="text-2xl font-bold text-brand-900 font-serif">
                        {formatPrice(selectedProduct.price)} VNĐ
                      </span>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-brand-400 line-through">
                          {formatPrice(selectedProduct.originalPrice)} VNĐ
                        </span>
                      )}
                      {selectedProduct.volumeOrWeight && (
                        <span className="text-xs bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full font-medium ml-auto">
                          {selectedProduct.volumeOrWeight}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="text-xs text-brand-700 space-y-3 leading-relaxed">
                      <p className="font-medium text-brand-900">{selectedProduct.shortDesc}</p>
                      {selectedProduct.fullDesc && (
                        <p className="whitespace-pre-line">{selectedProduct.fullDesc}</p>
                      )}
                    </div>

                    {/* Ingredients */}
                    {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block">
                          Thành phần thiên nhiên:
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

                    {/* Usage */}
                    {selectedProduct.usageInstructions && (
                      <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-xs text-brand-800 space-y-1">
                        <span className="font-bold text-brand-900">Hướng dẫn sử dụng:</span>
                        <p>{selectedProduct.usageInstructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Order / Inquiry Box */}
                  <div className="pt-4 border-t border-brand-100 space-y-3">
                    {orderSuccess ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-center space-y-1 animate-in zoom-in-95">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                        <p className="font-bold text-xs">Đặt mua thành công!</p>
                        <p className="text-[11px] text-green-700">
                          Terre Spa sẽ liên hệ bạn qua số điện thoại để xác nhận đơn hàng ngay.
                        </p>
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
                            className="px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Số điện thoại *"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Địa chỉ nhận hàng (nếu có)"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
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
