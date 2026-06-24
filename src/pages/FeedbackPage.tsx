import React from "react";
import { motion } from "motion/react";
import { beforeAfterStories } from "../data/content";
import { Footer } from "../components/Footer";
import LogoTerre from "../assets/images/logo-terre-removebg.png";
import { Quote, Phone, Calendar, Sparkles } from "lucide-react";

const FeedbackPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans selection:bg-brand-200 text-brand-950">

      {/* 1. FIXED PREMIUM HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-brand-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="overflow-hidden rounded-full w-10 h-10 border border-brand-200">
              <img src={LogoTerre} alt="Terre Spa Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-brand-900 tracking-widest">TERRE SPA</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-brand-500 font-medium">Chạm vào an yên</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase font-medium tracking-widest text-brand-700">
            <a href="/" className="hover:text-brand-950 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-900 hover:after:w-full after:transition-all">Trang chủ</a>
            <a href="#gallery" className="text-brand-950 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-brand-900">Feedback</a>
            <a href="#contact" className="hover:text-brand-950 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-900 hover:after:w-full after:transition-all">Liên hệ</a>
            <a href="/#book" className="px-6 py-3 bg-brand-900 text-white font-medium hover:bg-brand-800 transition-all shadow-md shadow-brand-950/10 hover:shadow-lg active:scale-95 tracking-widest">
              Đặt lịch ngay
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-24 md:pt-32 pb-12">

        {/* 2. EDITORIAL HERO SECTION */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-200 text-brand-700 text-[10px] uppercase tracking-widest rounded-full font-medium shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-brand-500" /> Nhật ký trị liệu thực tế
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-brand-900 font-light leading-tight tracking-wide"
            >
              Hành Trình Tái Sinh Làn Da
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-brand-600 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed"
            >
              Minh chứng chân thực về sự thay đổi của làn da và tinh thần khách hàng sau những liệu trình nuôi dưỡng chuyên sâu tại Terre Spa.
            </motion.p>
            <div className="w-12 h-px bg-brand-300 mx-auto pt-2" />
          </div>
        </section>

        {/* 3. ASYMMETRICAL STORY GALLERY */}
        <section id="gallery" className="py-6 px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
            {beforeAfterStories.map((story, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-brand-950/5 border border-brand-100/70 grid md:grid-cols-12 gap-0 group hover:shadow-2xl hover:shadow-brand-950/10 transition-all duration-500"
                >
                  {/* Cột chứa Ảnh gộp (Chiếm 7/12 cột trên PC, tự động đổi vế trái/phải dựa trên Index) */}
                  <div className={`md:col-span-7 overflow-hidden relative aspect-[16/10] md:aspect-auto min-h-[300px] ${isEven ? "md:order-1" : "md:order-2"}`}>
                    <img
                      src={story.beAndAf} // Gọi trực tiếp thuộc tính chứa ảnh đã ghép của bạn ở đây
                      alt={`Kết quả liệu trình của ${story.name}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Cột chứa Nội dung (Chiếm 5/12 cột trên PC) */}
                  <div className={`md:col-span-5 p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-white to-brand-50/20 ${isEven ? "md:order-2" : "md:order-1"}`}>
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4 border-b border-brand-100 pb-5">
                        <div>
                          <span className="block text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">
                            {story.service}
                          </span>
                          <h3 className="text-2xl font-serif text-brand-950 font-medium tracking-wide">
                            {story.name}
                          </h3>
                        </div>
                        <span className="shrink-0 inline-block text-[10px] font-medium bg-brand-100 text-brand-800 px-3 py-1.5 rounded-full tracking-wider uppercase">
                          {story.duration}
                        </span>
                      </div>

                      {/* Khối lời thoại cảm nhận từ khách hàng */}
                      <div className="relative pt-2">
                        <Quote className="w-10 h-10 text-brand-200/50 absolute -top-3 -left-3 pointer-events-none" />
                        <p className="text-sm text-brand-800 leading-relaxed italic relative z-10 pl-5 border-l-2 border-brand-200 font-light">
                          {story.notes}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-brand-50 flex items-center text-xs text-brand-400 font-serif italic">
                      Terre Spa — Trao gửi sự tin tưởng
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 4. LUXURY CALL-TO-ACTION */}
        <section id="contact" className="py-24 px-6 mt-12 relative">
          <div className="max-w-3xl mx-auto text-center bg-white border border-brand-100/80 rounded-3xl p-10 md:p-16 shadow-xl shadow-brand-950/5 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-brand-100 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-48 h-48 bg-brand-200/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl md:text-3xl font-serif text-brand-900 font-light tracking-wide">Khởi đầu hành trình mới của làn da</h3>
              <p className="text-brand-600 text-sm max-w-md mx-auto leading-relaxed font-light">
                Hãy để các chuyên gia tại Terre lắng nghe và thiết kế riêng cho bạn một liệu trình cá nhân hóa hoàn hảo.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                <a
                  href="tel:0569087777"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-brand-900 text-white text-xs font-medium uppercase tracking-widest hover:bg-brand-800 transition-all shadow-md shadow-brand-950/10 active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi tư vấn ngay
                </a>
                <a
                  href="/#book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 border border-brand-300 text-brand-900 text-xs font-medium uppercase tracking-widest bg-white hover:bg-brand-50 hover:border-brand-400 transition-all active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" /> Đặt lịch online
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FeedbackPage;