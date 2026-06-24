import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, AlertCircle, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "motion/react"; // Lưu ý: Đổi lại thành 'framer-motion' nếu 'motion/react' chưa cài đặt ổn định
import { Link } from "react-router-dom";
import LogoTerre from "./assets/images/logo-terre-removebg.png";
import { experienceSlides, serviceCategories, customerReviews, beforeAfterStories } from "./data/content";
import { ServiceCarousel } from "./components/ServiceCarousel";
import { FeedbackCarousel } from "./components/FeedbackCarousel";
import { Footer } from "./components/Footer";

// Khởi tạo danh sách giờ hẹn khả dụng
const AVAILABLE_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"), // Mặc định là ngày mai
    time: "09:00",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [selectedService, setSelectedService] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto play cho slide trải nghiệm
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % experienceSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll cho khu vực Review của khách hàng
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;

        if (isEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
          const gap = 24;
          scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Điều khiển nút scroll thủ công
  const scrollLeftBtn = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
      const gap = 24;
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
    }
  };

  const scrollRightBtn = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
      const gap = 24;
      scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }
  };

  // Handler xử lý thay đổi input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler xử lý submit form đặt lịch
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập gửi API đặt lịch
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: "success",
        message: `Đặt lịch thành công!\nTerre Spa sẽ liên hệ sớm nhất với bạn qua số ${formData.phone}.`
      });
      // Reset form (giữ lại ngày/giờ mặc định)
      setFormData({
        name: "",
        phone: "",
        service: "",
        date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        time: "09:00",
        notes: ""
      });
    }, 1500);
  };

  return (
    <div className="bg-brand-50 min-h-screen text-brand-950 font-sans">
      {/* Slide Experience Section */}
      <section id="experience" className="py-20 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-serif text-brand-900 leading-tight">
                {experienceSlides[currentSlideIndex]?.title || "Trải nghiệm không gian tại Terre"}
              </h2>
              <p className="text-brand-700 leading-relaxed">
                {experienceSlides[currentSlideIndex]?.desc}
              </p>

              <div className="flex gap-6 items-center pt-4 border-t border-brand-200">
                <div>
                  <span className="block text-3xl font-serif text-brand-800">{experienceSlides[currentSlideIndex]?.tag1}</span>
                  <span className="text-xs uppercase tracking-wider text-brand-600">{experienceSlides[currentSlideIndex]?.tag1Desc}</span>
                </div>
                <div className="w-px h-10 bg-brand-200"></div>
                <div>
                  <span className="block text-3xl font-serif text-brand-800">{experienceSlides[currentSlideIndex]?.tag2}</span>
                  <span className="text-xs uppercase tracking-wider text-brand-600">{experienceSlides[currentSlideIndex]?.tag2Desc}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-[2rem] shadow-2xl relative z-10 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlideIndex}
                src={experienceSlides[currentSlideIndex]?.img}
                alt="Terre Spa Experience"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-200 rounded-full -z-0 blur-2xl opacity-60"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-300 rounded-full -z-0 blur-xl opacity-40"></div>
        </motion.div>
      </section>

      {/* Services List */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl font-serif text-brand-900">Bảng giá Dịch vụ</h3>
            <p className="text-sm text-brand-600 max-w-2xl mx-auto">
              Chọn nhanh liệu trình phù hợp với bạn. Kéo ngang để khám phá và nhấn vào từng gói để xem chi tiết.
            </p>
            <div className="w-16 h-px bg-brand-400 mx-auto"></div>
          </div>

          <div className="space-y-16">
            {serviceCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <ServiceCarousel category={category} onSelect={(service) => setSelectedService(service)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white overflow-hidden border-y border-brand-100">
        <div className="max-w-6xl mx-auto px-4 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 border-b border-brand-200 pb-4">
              <div className="p-3 bg-brand-100 text-brand-800 rounded-full">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h4 className="text-2xl font-serif text-brand-900">Khách Hàng Nói Gì Về Chúng Tôi</h4>
            </div>
            <p className="mt-4 text-brand-600 text-sm">Đánh giá thực tế từ Google Maps</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={scrollLeftBtn} className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollRightBtn} className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <div ref={scrollRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar scroll-smooth -mx-4 px-4 md:mx-0 md:px-0">
            {customerReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-full md:w-[calc(33.333%-16px)] shrink-0 bg-brand-50 p-6 rounded-sm snap-start border border-brand-100 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h5 className="font-medium text-brand-950 font-serif">{review.author}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-500">
                        {[...Array(review.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-brand-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-brand-700 leading-relaxed italic">"{review.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Before/After */}
      <section id="feedback" className="py-20 px-4 bg-brand-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl font-serif text-brand-900">Feedback Trước &amp; Sau Liệu Trình</h3>
            <p className="text-sm text-brand-600 max-w-3xl mx-auto">
              Terre Spa đồng hành cùng bạn trên hành trình chăm sóc làn da. Xem sự thay đổi rõ rệt qua hình ảnh thực tế của khách hàng.
            </p>
            <div className="w-16 h-px bg-brand-400 mx-auto"></div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <FeedbackCarousel stories={beforeAfterStories} />
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="py-20 px-4 bg-brand-900 text-brand-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-3xl font-serif text-white">Đến với Terre.</h3>
            <p className="text-brand-200 text-sm leading-relaxed">
              Vui lòng để lại thông tin đặt lịch, chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất. Bạn cũng có thể gọi trực tiếp qua hotline để được hỗ trợ nhanh chóng.
            </p>
            <div className="space-y-4 pt-4 border-t border-brand-800">
              <div className="flex items-center gap-3 text-brand-300 text-sm">
                <Clock className="w-5 h-5 text-brand-400" />
                Mở cửa: 09:00 - 20:00 hàng ngày
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-white text-brand-950 p-6 md:p-8 rounded-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 text-sm flex items-start gap-3 rounded-sm ${status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                  >
                    {status.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <div className="flex-1 whitespace-pre-wrap">{status.message}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-brand-700">Họ và tên *</label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Vd: Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-brand-700">Số điện thoại *</label>
                  <input
                    required
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="service" className="text-xs font-medium uppercase tracking-wider text-brand-700">Dịch vụ quan tâm</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {serviceCategories.map((cat) => (
                    <optgroup key={cat.id} label={cat.title}>
                      {cat.services.map((s) => (
                        <option key={s.id} value={s.name}>{s.name} - {s.price} VNĐ</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-brand-700">Ngày hẹn *</label>
                  <input
                    required
                    id="date"
                    name="date"
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className="text-xs font-medium uppercase tracking-wider text-brand-700">Giờ hẹn *</label>
                  <select
                    required
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  >
                    {AVAILABLE_TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-brand-700">Ghi chú thêm</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-brand-50 border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                  placeholder="Bạn có yêu cầu đặc biệt nào không?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-800 text-brand-50 hover:bg-brand-900 transition-colors font-medium tracking-wider text-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 outline-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedService(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-md shadow-2xl relative z-10 max-w-2xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 text-brand-950 backdrop-blur-md rounded-full hover:bg-white transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:w-2/5 aspect-video md:aspect-auto shrink-0 relative bg-brand-100">
                <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover absolute inset-0" />
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto">
                <p className="text-xs uppercase tracking-widest text-brand-500 mb-2">{selectedService.category}</p>
                <h3 className="text-2xl font-serif text-brand-900 mb-4">{selectedService.name}</h3>
                <div className="text-xl font-medium text-brand-700 mb-6 pb-6 border-b border-brand-100">
                  {selectedService.price} <span className="text-sm font-normal">VNĐ</span>
                </div>
                <div className="prose prose-sm prose-brand text-brand-700 mb-8 leading-relaxed">
                  <p>{selectedService.description}</p>
                </div>
                <div className="mt-auto pt-4">
                  <a
                    href="#book"
                    onClick={(e) => {
                      setFormData((p) => ({ ...p, service: selectedService.name }));
                      setSelectedService(null);
                    }}
                    className="w-full py-3.5 bg-brand-800 text-brand-50 text-center font-medium uppercase tracking-wider text-sm hover:bg-brand-900 focus:ring-2 ring-brand-400 ring-offset-1 transition-all block rounded-sm shadow-md"
                  >
                    ĐẶT LỊCH GÓI NÀY
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}