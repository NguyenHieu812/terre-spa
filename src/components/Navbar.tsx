import LogoTerre from "../assets/images/logo-terre-removebg.png";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
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
              <h1 className="text-xl font-serif font-semibold text-brand-900 tracking-wider">TERRE SPA</h1>
              <p className="text-[10px] uppercase tracking-widest text-brand-600 font-medium">Chạm vào an yên</p>
            </div>
          </a>

          {/* Desktop Navigation (Hiện từ màn hình md trở lên) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-brand-800">
            <a href="/" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Trang chủ</a>
            <a href="#experience" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Trải nghiệm</a>
            <a href="#services" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Dịch vụ</a>
            <a href="#reviews" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Đánh giá</a>
            <Link to="/feedback" className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all">Feedback</Link>
            <a href="https://www.terrespa.vn/#book" className="px-6 py-3 bg-brand-800 text-white hover:bg-brand-950 transition-all shadow-sm tracking-widest hover:-translate-y-0.5 active:translate-y-0 duration-300 rounded-sm">
              Đặt lịch ngay
            </a>
          </div>

          {/* Mobile Hamburger Button (Chỉ hiện trên Mobile) */}
          <button
            onClick={toggleMenu}
            className="flex md:hidden p-2 text-brand-800 hover:text-brand-950 transition-colors focus:outline-none z-50"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
            className="fixed inset-0 top-20 bg-white/95 backdrop-blur-lg z-40 md:hidden flex flex-col border-b border-brand-100 h-fit"
          >
            <div className="flex flex-col items-center justify-center px-6 py-12 space-y-6 text-sm font-medium uppercase tracking-widest text-brand-800">
              <a
                href="/"
                onClick={closeMenu}
                className="w-full text-center py-3 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Trang chủ
              </a>
              <a
                href="#experience"
                onClick={closeMenu}
                className="w-full text-center py-3 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Trải nghiệm
              </a>
              <a
                href="#services"
                onClick={closeMenu}
                className="w-full text-center py-3 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Dịch vụ
              </a>
              <a
                href="#reviews"
                onClick={closeMenu}
                className="w-full text-center py-3 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Đánh giá
              </a>
              <Link
                to="/feedback"
                onClick={closeMenu}
                className="w-full text-center py-3 border-b border-brand-50 hover:text-brand-600 transition-colors"
              >
                Feedback
              </Link>

              {/* Nút Đặt lịch nổi bật trên Mobile */}
              <a
                href="#book"
                onClick={closeMenu}
                className="w-full text-center mt-4 py-4 bg-brand-800 text-white font-semibold shadow-md tracking-widest active:bg-brand-950 transition-colors rounded-sm"
              >
                Đặt lịch ngay
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar;
