import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, Leaf, Scissors, Sparkles, User, Droplets, CheckCircle, AlertCircle, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import heroBg from "./assets/images/spa_hero_bg_1781666735594.jpg";
import massageDetail from "./assets/images/spa_massage_detail_1781666753905.jpg";
import hairWashImg from "./assets/images/spa_hair_wash_1781704187306.jpg";
import facialCareImg from "./assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "./assets/images/spa_herbal_compress_1781885390039.jpg";

const serviceCategories = [
  {
    id: "hair-recovery",
    title: "Gội Đầu & Dưỡng Sinh",
    icon: <Scissors className="w-5 h-5" />,
    image: hairWashImg,
    services: [
      { id: "hair-45", name: "Gội Đầu Dưỡng Sinh (45 phút)", price: "149,000", description: "Massage đầu mặt, cổ vai gáy, ủ tóc, đắp mặt nạ, xông thảo dược. Quy trình gội dưỡng sinh thư giãn giúp giải tỏa căng thẳng và nuôi dưỡng mầm tóc khỏe." },
      { id: "hair-60", name: "Gội Đầu Dưỡng Sinh (60 phút)", price: "199,000", description: "Massage đầu mặt, cổ vai gáy, ủ tóc, đắp mặt nạ, xông thảo dược với thời gian dài hơn để bạn tận hưởng trọn vẹn từng khoảnh khắc an yên." },
      { id: "hair-75", name: "Gội Đầu Dưỡng Sinh (75 phút)", price: "299,000", description: "Gội dưỡng sinh kéo dài, kết hợp các động tác ấn huyệt đầu cổ vai gáy sâu, giúp giảm thiểu mệt mỏi hiệu quả nhất." },
      { id: "recovery-90", name: "Dưỡng Sinh Phục Hồi (90 phút)", price: "799,000", description: "Massage toàn thân, chườm bụng, gội đầu dưỡng sinh. Sự kết hợp hoàn hảo giữa gội đầu và chăm sóc body, đem lại sức sống mới cho cơ thể." },
    ]
  },
  {
    id: "massage",
    title: "Massage Thư Giãn",
    icon: <Sparkles className="w-5 h-5" />,
    image: massageDetail,
    services: [
      { id: "neck-45", name: "Massage Vai Gáy (45 phút)", price: "169,000", description: "Thư giãn, đắp & chườm ấm thảo dược, tán phong thải độc vùng đầu cổ vai gáy. Phương pháp trị liệu thiên nhiên an toàn." },
      { id: "neck-60", name: "Massage Vai Gáy (60 phút)", price: "299,000", description: "Liệu trình thư giãn kéo dài hơn cho vùng vai gáy, giúp xua tan sự ê nhức từ làm việc văn phòng, đắp & chườm ấm thảo dược." },
      { id: "neck-90", name: "Massage Vai Gáy (90 phút)", price: "399,000", description: "Gói trị liệu vai gáy chuyên sâu, giúp giải phóng hoàn toàn ách tắc và đau nhức, kết hợp với các tinh chất thảo dược." },
      { id: "body-120", name: "Body & Dưỡng Sinh (120 phút)", price: "699,000", description: "Massage body tinh dầu, massage vòng lưng với đá nóng, kết thúc với chườm ấm thư giãn toàn diện." },
    ]
  },
  {
    id: "skincare",
    title: "Chăm Sóc & Trẻ Hóa Da",
    icon: <Leaf className="w-5 h-5" />,
    image: facialCareImg,
    services: [
      { id: "skin-basic", name: "Chăm sóc da cơ bản (60')", price: "259,000", description: "Làm sạch sâu, hút dầu mụn cám, massage mặt, đi tinh chất, đắp mặt nạ (mask) cấp ẩm. Lấy lại sự rạng rỡ tức thì." },
      { id: "skin-acne", name: "Chăm da mụn chuyên sâu (90')", price: "539,000", description: "Làm sạch lỗ chân lông, lấy nhân mụn chuẩn y khoa, chiếu ánh sáng sinh học và peel mụn đặc trị." },
      { id: "skin-recover", name: "Phục hồi da yếu (75')", price: "719,000", description: "Dành riêng cho da nhạy cảm. Làm dịu da, điện di phục hồi, cooling lạnh bảo vệ và đắp mask chuyên sâu." },
      { id: "skin-terre", name: "Chăm sóc da Terre (90')", price: "799,000", description: "Quy trình chăm sóc chuyên biệt mang dấu ấn Terre Spa, sử dụng các sản phẩm cao cấp cùng kỹ thuật massage độc quyền." },
      { id: "skin-hydrafs", name: "Cấp ẩm chuyên sâu (75')", price: "1,499,000", description: "Cung cấp độ ẩm dồi dào qua điện di HA-B5, cooling lạnh và dưỡng chất cấp ẩm sâu vào tầng hạ bì của da." },
      { id: "skin-lift", name: "Nâng cơ trẻ hóa Terre (90')", price: "2,690,000", description: "Dịch vụ VIP chống lão hóa. Ion nâng cơ, điện di collagen, mask phục hồi giúp làn da căng bóng và thanh xuân trở lại." },
    ]
  },
  {
    id: "hair-removal",
    title: "Triệt Lông (Gói Bảo Hành)",
    icon: <Droplets className="w-5 h-5" />,
    image: heroBg,
    services: [
      { id: "hr-face", name: "Triệt mép / Nách", price: "Từ 1,000,000", description: "Công nghệ tiên tiến bảo hành trọn đời, an toàn, không đau rát, mang lại vùng dưới cánh tay mịn màng." },
      { id: "hr-arm-leg", name: "Triệt Tay / Chân", price: "Từ 2,000,000", description: "Gói bảo hành trọn đời với công nghệ triệt lạnh không gây khô da hay viêm nang lông, vùng da rạng rỡ mịn màng." },
      { id: "hr-bikini", name: "Triệt Bikini / Full Mặt", price: "2,500,000", description: "Bảo hành trọn đời, tiêu diệt hoàn toàn nang lông ở những vùng da nhạy cảm nhẹ nhàng và an toàn tuyệt đối." },
      { id: "hr-back", name: "Triệt Lưng", price: "5,000,000", description: "Liệu trình triệt lưng tận gốc, bảo hành uy tín lâu dài, đánh bay những vết thâm sạm và mang lại tấm lưng thanh tân." },
    ]
  }
];

const customerReviews = [
  {
    id: 1,
    author: "Nguyễn Lê Hằng",
    rating: 5,
    date: "1 tháng trước",
    content: "Spa làm rất chuyên nghiệp. Các bạn nhân viên nhiệt tình, nhẹ nhàng. Massage cổ vai gáy xong thấy người nhẹ rỗng luôn. Không gian thơm mùi thảo mộc rất thư giãn.",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Le+Hang&background=f2e8e5&color=8c6454"
  },
  {
    id: 2,
    author: "Trần Minh Tùng",
    rating: 5,
    date: "3 tuần trước",
    content: "Mình đã trải nghiệm dịch vụ gội đầu dưỡng sinh ở đây, rất tuyệt vời. Giá cả hợp lý so với chất lượng. Chắc chắn sẽ quay lại ủng hộ các bạn.",
    avatar: "https://ui-avatars.com/api/?name=Tran+Minh+Tung&background=f2e8e5&color=8c6454"
  },
  {
    id: 3,
    author: "Bùi Thu Trà",
    rating: 5,
    date: "2 tháng trước",
    content: "Dịch vụ chăm sóc da mụn rất tốt. Các bạn lấy nhân mụn kỹ mà không bị đỏ rát nhiều. Tư vấn cũng rất có tâm, không chèo kéo mua thêm gói.",
    avatar: "https://ui-avatars.com/api/?name=Bui+Thu+Tra&background=f2e8e5&color=8c6454"
  },
  {
    id: 4,
    author: "Linh Doãn",
    rating: 5,
    date: "1 tuần trước",
    content: "Không gian trang trí rất dễ thương, có nhạc thiền êm ái. Nước ngâm chân thảo dược thơm và ấm. Cực kỳ recommend trải nghiệm thư giãn cuối tuần nha mọi người.",
    avatar: "https://ui-avatars.com/api/?name=Linh+Doan&background=f2e8e5&color=8c6454"
  },
  {
    id: 5,
    author: "Hoàng Anh",
    rating: 5,
    date: "2 tháng trước",
    content: "Spa uy tín tại khu vực Kim Giang. Các liệu trình rất rõ ràng và nhân viên ngoan, làm đúng thời gian, không ăn bớt giờ của khách.",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Anh&background=f2e8e5&color=8c6454"
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
  const [selectedService, setSelectedService] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        
        if (isEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
          const gap = 24; // 1.5rem gap-6
          scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollLeftBtn = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
      const gap = 24;
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  const scrollRightBtn = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300;
      const gap = 24;
      scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  };

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
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { img: massageDetail, desc: "Thư giãn toàn thân" },
                { img: hairWashImg, desc: "Gội đầu dưỡng sinh" },
                { img: facialCareImg, desc: "Chăm sóc da mặt" },
                { img: herbalCompressImg, desc: "Chườm ấm thảo dược" },
              ].map((item, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-sm shadow-md">
                  <img src={item.img} alt={item.desc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent flex items-end p-4">
                    <p className="text-brand-50 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-200 rounded-full -z-0 blur-2xl opacity-60"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-300 rounded-full -z-0 blur-xl opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl font-serif text-brand-900">Bảng giá Dịch vụ</h3>
            <div className="w-16 h-px bg-brand-400 mx-auto"></div>
          </div>
          
          <div className="space-y-16">
            {serviceCategories.map((category, i) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-brand-200 pb-4">
                  <div className="p-3 bg-brand-100 text-brand-800 rounded-full">
                    {category.icon}
                  </div>
                  <h4 className="text-2xl font-serif text-brand-900">{category.title}</h4>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.services.map((svc) => (
                    <div 
                      key={svc.id} 
                      onClick={() => setSelectedService({...svc, category: category.title, image: category.image})}
                      className="bg-white p-6 hover:shadow-xl hover:shadow-brand-200/50 transition-all duration-300 border border-brand-100 flex flex-col justify-between group rounded-sm cursor-pointer"
                    >
                      <div>
                        <div className="mb-4">
                          <span className="font-serif text-xl text-brand-700 group-hover:text-brand-900 transition-colors">{svc.price} <span className="text-xs uppercase text-brand-500 font-sans tracking-wider">VNĐ</span></span>
                        </div>
                        <h5 className="text-base font-medium text-brand-950 mb-3">{svc.name}</h5>
                        <p className="text-sm text-brand-600 leading-relaxed mb-4 line-clamp-3">{svc.description}</p>
                      </div>
                      <div className="text-xs font-medium uppercase tracking-wider text-brand-600 group-hover:text-brand-900 flex items-center gap-2 mt-auto pt-2">
                        <span>Tìm hiểu thêm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white overflow-hidden border-y border-brand-100">
        <div className="max-w-6xl mx-auto px-4 mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 border-b border-brand-200 pb-4">
              <div className="p-3 bg-brand-100 text-brand-800 rounded-full">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h4 className="text-2xl font-serif text-brand-900">Khách Hàng Nói Gì Về Chúng Tôi</h4>
            </div>
            <p className="mt-4 text-brand-600 text-sm">Đánh giá thực tế từ Google Maps</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={scrollLeftBtn} className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollRightBtn} className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="max-w-6xl mx-auto px-4 relative">
          <button onClick={scrollLeftBtn} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex md:hidden items-center justify-center bg-white shadow-md rounded-full text-brand-800 border border-brand-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar group scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
          >
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
                  <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full" />
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

          <button onClick={scrollRightBtn} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex md:hidden items-center justify-center bg-white shadow-md rounded-full text-brand-800 border border-brand-100">
            <ChevronRight className="w-5 h-5" />
          </button>
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
                  {serviceCategories.map(cat => (
                    <optgroup key={cat.id} label={cat.title}>
                      {cat.services.map(s => (
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
      <footer className="bg-brand-950 py-16 px-4 border-t border-brand-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-6 text-center md:text-left">
            <div className="text-brand-500 text-3xl font-serif italic font-bold">Terre Spa</div>
            <p className="text-brand-400 text-sm italic">"Chạm vào an yên - Đẹp bền từ tự nhiên"</p>
            
            <div className="pt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-700 mb-1">Địa chỉ</p>
                <p className="text-brand-200 text-sm leading-relaxed">Số 2 ngõ 282/33 Đ. Kim Giang, Kim Văn,<br/> Định Công, TP. Hà Nội, Việt Nam.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-700 mb-1">Hotline</p>
                <p className="text-brand-200 text-sm">0569087777</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-brand-900/50">
              <p className="text-brand-700 text-xs">&copy; {new Date().getFullYear()} Terre Spa. All rights reserved.</p>
            </div>
          </div>
          
          {/* Map */}
          <div className="h-64 md:h-full min-h-[300px] w-full bg-brand-900/50 rounded-sm overflow-hidden relative">
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.3937684003854!2d105.8214203!3d20.9768471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad3f8a928e27%3A0xbc72b41f64bf9636!2zVEVSUkUgU1BBLSBH4buZaSBk4bqndSBkxrDhu6FuZyBzaW5oLCBtYXNzYWdlIHZhaSBnw6F5LCBib2R5LCBDaMSDbSBzw7NjIGRhIG3hu6VuLSBuw6FtIGtow7RuZyB4w6JtIGzhuqVuLCB0cmnhu4d0IGzDtG5nLg!5e0!3m2!1svi!2s!4v1781707829329!5m2!1svi!2s" 
               className="absolute inset-0 w-full h-full border-0 relative z-10"
               allowFullScreen={true}
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title="Terre Spa Map"
            ></iframe>
            {/* Fallback placeholder */}
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none text-brand-700 text-sm z-0">
               Bản đồ đang tải...
            </div>
          </div>
        </div>
      </footer>

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
                      setFormData(p => ({...p, service: selectedService.name}));
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

