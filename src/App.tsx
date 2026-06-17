import React, { useState } from "react";
import { Calendar, Clock, Leaf, Scissors, Sparkles, User, Droplets, CheckCircle, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import heroBg from "./assets/images/spa_hero_bg_1781666735594.jpg";
import massageDetail from "./assets/images/spa_massage_detail_1781666753905.jpg";

const services = [
  {
    id: "massage-body",
    name: "Massage Body Aroma",
    duration: "60 phút",
    price: "450,000 VNĐ",
    description: "Thư giãn toàn thân với tinh dầu tự nhiên, giảm căng thẳng mệt mỏi.",
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: "facial-basic",
    name: "Chăm sóc da mặt cơ bản",
    duration: "60 phút",
    price: "350,000 VNĐ",
    description: "Làm sạch sâu, tẩy tế bào chết và đắp mặt nạ thảo dược.",
    icon: <Leaf className="w-5 h-5" />
  },
  {
    id: "facial-intensive",
    name: "Trẻ hóa da chuyên sâu",
    duration: "90 phút",
    price: "850,000 VNĐ",
    description: "Nâng cơ, xóa nhăn bằng công nghệ cao kết hợp tinh chất collagen.",
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: "hair-wash",
    name: "Gội đầu dưỡng sinh",
    duration: "45 phút",
    price: "200,000 VNĐ",
    description: "Làm sạch tóc bồng bềnh, massage ấn huyệt đầu cổ vai gáy.",
    icon: <Scissors className="w-5 h-5" />
  }
];

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"), // Default to tomorrow
    time: "09:00",
    notes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error", message: string }>({ type: "idle", message: "" });

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || "Có lỗi xảy ra.");
      }
      
      setStatus({ type: "success", message: "Cảm ơn bạn! Lịch hẹn đã được xác nhận thành công." });
      setFormData(prev => ({ ...prev, name: "", phone: "", notes: "" }));
    } catch (error: any) {
      console.error(error);
      setStatus({ 
        type: "error", 
        message: error.message || "Không thể kết nối lưu dữ liệu. Vui lòng thử lại sau."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-brand-50/90 backdrop-blur-md z-50 border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-serif text-xl italic font-bold">
              T
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-brand-900 tracking-wider">TERRE SPA</h1>
              <p className="text-[10px] uppercase tracking-widest text-brand-600">Chạm vào an yên</p>
            </div>
          </div>
          <a href="#book" className="hidden md:flex px-6 py-2 bg-brand-800 text-white text-sm font-medium hover:bg-brand-900 transition-colors rounded-none">
            ĐẶT LỊCH NGAY
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-40 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Terre Spa - Không gian thư giãn" className="w-full h-full object-cover opacity-[0.25]" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-brand-50/50 to-brand-50" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-950 font-medium leading-tight"
          >
            Đẹp bền từ <br className="md:hidden" /><span className="italic text-brand-600">tự nhiên</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-700 max-w-2xl mx-auto md:text-lg"
          >
            Nơi bạn tìm thấy sự cân bằng hoàn hảo giữa thể chất và tinh thần. 
            Terre Spa mang đến các liệu pháp chăm sóc sức khỏe và sắc đẹp từ thảo dược thiên nhiên cao cấp.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a href="#book" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-900 text-brand-50 text-sm tracking-wider uppercase font-medium hover:bg-brand-950 transition-colors">
              <Calendar className="w-4 h-4" />
              Đặt lịch hẹn
            </a>
          </motion.div>
        </div>
      </header>

      {/* Experience Section */}
      <section className="py-20 px-4 bg-brand-50 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:pr-10"
          >
            <h3 className="text-3xl md:text-4xl font-serif text-brand-900 leading-tight">
              Tái tạo năng lượng <br className="hidden md:block"/>
              <span className="italic text-brand-600">từ sâu bên trong</span>
            </h3>
            <p className="text-brand-700 leading-relaxed text-sm md:text-base">
              Tại Terre Spa, mỗi liệu trình không chỉ là chăm sóc bên ngoài mà còn là chìa khóa mở ra sự bình yên trong tâm hồn. Với bàn tay điêu luyện của các chuyên viên, không gian tĩnh lặng và hương thơm thảo dược hòa quyện, bạn sẽ hoàn toàn được thả lỏng và phục hồi sinh lực.
            </p>
            <div className="flex gap-6 pt-4">
              <div className="text-brand-800">
                <span className="block text-3xl font-serif">100%</span>
                <span className="text-xs uppercase tracking-wider text-brand-600">Thảo dược tự nhiên</span>
              </div>
              <div className="w-px bg-brand-200"></div>
              <div className="text-brand-800">
                <span className="block text-3xl font-serif">KTV</span>
                <span className="text-xs uppercase tracking-wider text-brand-600">Giàu kinh nghiệm</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-tr-[4rem] rounded-bl-[4rem] shadow-2xl relative z-10">
              <img src={massageDetail} alt="Massage dưỡng sinh Terre Spa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-200 rounded-full -z-0 blur-2xl opacity-60"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-300 rounded-full -z-0 blur-xl opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl font-serif text-brand-900">Bảng giá Dịch vụ</h3>
            <div className="w-16 h-px bg-brand-400 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((svc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={svc.id} 
                className="bg-white p-6 md:p-8 hover:shadow-xl hover:shadow-brand-200/50 transition-shadow duration-300 border border-brand-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-full">
                      {svc.icon}
                    </div>
                    <span className="font-serif text-xl text-brand-900">{svc.price}</span>
                  </div>
                  <h4 className="text-lg font-medium text-brand-950 mb-2">{svc.name}</h4>
                  <p className="text-sm text-brand-600 mb-6">{svc.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-500">
                  <Clock className="w-4 h-4" />
                  {svc.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="py-20 px-4 bg-brand-900 text-brand-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-3xl font-serif text-white">Đến với Terre.</h3>
            <p className="text-brand-200 text-sm leading-relaxed">
              Vui lòng để lại thông tin đặt lịch, chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất. 
              Bạn cũng có thể gọi trực tiếp qua hotline để được hỗ trợ nhanh chóng.
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
                    className={`p-4 text-sm flex items-start gap-3 rounded-sm ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                  >
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
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
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name} - {s.price}</option>
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
                    {availableTimes.map(t => (
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
      <footer className="bg-brand-950 py-12 px-4 text-center border-t border-brand-900">
        <div className="text-brand-500 text-2xl font-serif italic font-bold mb-4">Terre Spa</div>
        <p className="text-brand-400 text-sm">Chạm vào an yên - Đẹp bền từ tự nhiên</p>
        <p className="text-brand-700 mt-8 text-xs">&copy; {new Date().getFullYear()} Terre Spa. All rights reserved.</p>
      </footer>
    </div>
  );
}

