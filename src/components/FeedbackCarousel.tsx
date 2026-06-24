import React from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion } from "motion/react";
import { BeforeAfterStory } from "../data/content";

type FeedbackCarouselProps = {
  stories: BeforeAfterStory[];
};

const DESKTOP_VISIBLE = 2;
const MOBILE_VISIBLE = 1;

const getVisibleCount = () => (window.innerWidth >= 1024 ? DESKTOP_VISIBLE : MOBILE_VISIBLE);

export const FeedbackCarousel: React.FC<FeedbackCarouselProps> = ({ stories }) => {
  const [visibleCount, setVisibleCount] = React.useState(() => (typeof window === "undefined" ? MOBILE_VISIBLE : getVisibleCount()));
  const [startIndex, setStartIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const updateVisibleCount = React.useCallback(() => {
    if (typeof window === "undefined") return;
    setVisibleCount(getVisibleCount());
  }, []);

  React.useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  const handleStep = React.useCallback(
    (direction: "prev" | "next") => {
      setStartIndex((prev) => {
        const maxIndex = Math.max(0, stories.length - visibleCount);
        if (direction === "prev") {
          return prev - visibleCount < 0 ? maxIndex : prev - visibleCount;
        }
        return prev + visibleCount > maxIndex ? 0 : prev + visibleCount;
      });
    },
    [stories.length, visibleCount]
  );

  React.useEffect(() => {
    if (!scrollRef.current) return;
    const target = scrollRef.current.children[startIndex] as HTMLElement | undefined;
    if (!target) return;
    scrollRef.current.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, [startIndex, visibleCount]);

  React.useEffect(() => {
    const maxIndex = Math.max(0, stories.length - visibleCount);
    setStartIndex((prev) => Math.min(prev, maxIndex));
  }, [visibleCount, stories.length]);

  React.useEffect(() => {
    const interval = setInterval(() => handleStep("next"), 8000);
    return () => clearInterval(interval);
  }, [handleStep]);

  const cardWidth = React.useMemo(() => {
    if (visibleCount <= 1) return "100%";
    const gap = 32; // Khoảng cách gap-8 đồng bộ sang trọng
    return `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;
  }, [visibleCount]);

  const totalDots = Math.ceil(stories.length / visibleCount);
  const currentDot = Math.floor(startIndex / visibleCount);

  return (
    <div className="relative px-2 py-4">
      {/* Nút bấm Desktop thanh thoát dạng Glassmorphism */}
      <button
        onClick={() => handleStep("prev")}
        className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-brand-100 text-brand-700 hover:bg-brand-900 hover:text-white transition-all duration-300 bg-white/90 backdrop-blur-md shadow-lg absolute -left-6 top-1/2 -translate-y-1/2 z-10 hover:scale-110 active:scale-95"
        aria-label="Phản hồi trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleStep("next")}
        className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-brand-100 text-brand-700 hover:bg-brand-900 hover:text-white transition-all duration-300 bg-white/90 backdrop-blur-md shadow-lg absolute -right-6 top-1/2 -translate-y-1/2 z-10 hover:scale-110 active:scale-95"
        aria-label="Phản hồi tiếp theo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slider Container */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-hidden scroll-smooth pb-4"
      >
        {stories.map((story) => (
          <motion.div
            key={story.id}
            className="shrink-0 bg-white rounded-3xl overflow-hidden shadow-xl shadow-brand-950/5 border border-brand-100/60 flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-950/10 hover:-translate-y-1 transition-all duration-300 group"
            style={{ flex: `0 0 ${cardWidth}` }}
            initial={{ opacity: 0.8, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Khung ảnh đơn (Đã bao gồm ghép Before/After trong file ảnh) */}
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
              <img
                src={story.beAndAf} // Tự động nhận diện trường ảnh đã gộp
                alt={`Kết quả liệu trình của ${story.name}`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-750 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/10 to-transparent pointer-events-none" />
            </div>

            {/* Thông tin feedback chữ */}
            <div className="p-7 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-brand-50/20">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-0.5">
                      {story.service}
                    </span>
                    <h5 className="text-lg font-serif text-brand-950 font-semibold tracking-wide">
                      {story.name}
                    </h5>
                  </div>
                  <span className="shrink-0 inline-flex items-center text-[10px] font-medium bg-brand-100/80 text-brand-800 px-2.5 py-1 rounded-full tracking-wider uppercase">
                    {story.duration}
                  </span>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-brand-100 to-transparent" />

                {/* Đoạn trích dẫn lời cảm nhận */}
                <div className="relative pt-1">
                  <Quote className="w-8 h-8 text-brand-100 absolute -top-2 -left-2 z-0 pointer-events-none transform -rotate-6" />
                  <p className="text-sm text-brand-800 leading-relaxed italic relative z-10 pl-4 border-l-2 border-brand-200">
                    {story.notes}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Thanh hiển thị vị trí (Dots) và nút điều hướng Mobile */}
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="flex gap-2">
          {[...Array(totalDots)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStartIndex(idx * visibleCount)}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentDot === idx ? "w-6 bg-brand-800" : "w-1.5 bg-brand-200 hover:bg-brand-400"
                }`}
              aria-label={`Đến trang ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex lg:hidden gap-2">
          <button
            onClick={() => handleStep("prev")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 active:bg-brand-900 active:text-white transition-colors bg-white shadow-sm"
            aria-label="Phản hồi trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStep("next")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 active:bg-brand-900 active:text-white transition-colors bg-white shadow-sm"
            aria-label="Phản hồi tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};