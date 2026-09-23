import LogoTerre from "../assets/images/logo-terre-removebg.png";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { getCartCount, TERRE_CART_UPDATED_EVENT } from "../utils/cartStore";
import { CartDrawer } from "./CartDrawer";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(() => getCartCount());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      setCartCount(e.detail?.count !== undefined ? e.detail.count : getCartCount());
    };
    window.addEventListener(TERRE_CART_UPDATED_EVENT, handleCartUpdate);
    return () => {
      window.removeEventListener(TERRE_CART_UPDATED_EVENT, handleCartUpdate);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <a href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <img
              src={LogoTerre}
              alt="Terre Spa Logo"
              className="w-10 h-10 rounded-full object-cover border border-brand-200 group-hover:rotate-12 transition-transform duration-500"
            />
            <div>
              <span className="text-xl font-serif font-semibold text-brand-900 tracking-wider block">TERRE SPA</span>
              <p className="text-[10px] uppercase tracking-widest text-brand-600 font-medium">Chạm vào an yên</p>
            </div>
          </a>

          {/* Desktop Navigation (Hiện từ màn hình md trở lên) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold uppercase tracking-widest text-brand-800">
            <Link to="/" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Trang chủ</Link>
            <a href="/#services" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Dịch vụ</a>
            <Link to="/products" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all text-brand-900 font-bold">Sản phẩm</Link>
            <Link to="/posts" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all text-brand-900 font-bold">Bài viết</Link>
            <a href="/#reviews" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Đánh giá</a>
            <Link to="/feedback" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Feedback</Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-brand-800 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all flex items-center justify-center cursor-pointer"
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 bg-brand-800 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <a href="/#book" className="px-5 py-2.5 bg-brand-800 text-white hover:bg-brand-950 transition-all shadow-sm tracking-widest hover:-translate-y-0.5 active:translate-y-0 duration-300 rounded-sm">
              Đặt lịch ngay
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-brand-800 hover:text-brand-600 rounded-full transition-colors flex items-center justify-center"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-brand-800 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-brand-800 hover:text-brand-950 transition-colors focus:outline-none z-50"
              aria-label={isOpen ? "Đóng menu" : "Mở menu"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "linear" }}
            className="fixed inset-0 top-20 bg-white/95 backdrop-blur-lg z-40 lg:hidden flex flex-col border-b border-brand-100 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="flex flex-col items-center justify-center px-6 py-8 space-y-4 text-sm font-medium uppercase tracking-widest text-brand-800">
              <Link
                to="/"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Trang chủ
              </Link>
              <a
                href="/#services"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Dịch vụ
              </a>
              <Link
                to="/products"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors font-bold text-brand-900"
              >
                Sản phẩm
              </Link>
              <Link
                to="/posts"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors font-bold text-brand-900"
              >
                Bài viết &amp; Blog
              </Link>
              <a
                href="/#reviews"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Đánh giá
              </a>
              <Link
                to="/feedback"
                onClick={closeMenu}
                className="w-full text-center py-2.5 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Feedback
              </Link>

              {/* Nút Đặt lịch nổi bật trên Mobile */}
              <a
                href="/#book"
                onClick={closeMenu}
                className="w-full text-center mt-2 py-3.5 bg-brand-800 text-white font-semibold shadow-md tracking-widest active:bg-brand-950 transition-colors rounded-sm"
              >
                Đặt lịch ngay
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
