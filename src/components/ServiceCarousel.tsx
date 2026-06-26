import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export type Service = {
  id: string;
  name: string;
  price: string;
  description: string;
};

export type ServiceCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  image: string;
  services: Service[];
};

type ServiceCarouselProps = {
  category: ServiceCategory;
  onSelect: (service: Service & { category: string; image: string }) => void;
};

const DESKTOP_SLIDES = 3;
const MOBILE_SLIDES = 1;

const getSlidesPerView = () => (window.innerWidth >= 1024 ? DESKTOP_SLIDES : MOBILE_SLIDES);

export const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ category, onSelect }) => {
  const [startIndex, setStartIndex] = React.useState(0);
  const [slidesPerView, setSlidesPerView] = React.useState(() => (typeof window === "undefined" ? MOBILE_SLIDES : getSlidesPerView()));
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const updateSlidesPerView = React.useCallback(() => {
    if (typeof window === "undefined") return;
    setSlidesPerView(getSlidesPerView());
  }, []);

  React.useEffect(() => {
    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, [updateSlidesPerView]);

  const handleControl = React.useCallback(
    (direction: "prev" | "next") => {
      setStartIndex((prev) => {
        const maxIndex = Math.max(0, category.services.length - slidesPerView);
        if (direction === "prev") {
          return prev - slidesPerView < 0 ? maxIndex : prev - slidesPerView;
        }
        return prev + slidesPerView > maxIndex ? 0 : prev + slidesPerView;
      });
    },
    [category.services.length, slidesPerView]
  );

  React.useEffect(() => {
    if (!scrollRef.current) return;
    const child = scrollRef.current.children[startIndex] as HTMLElement | undefined;
    if (!child) return;
    scrollRef.current.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, [startIndex, slidesPerView, category.services.length]);

  React.useEffect(() => {
    const maxIndex = Math.max(0, category.services.length - slidesPerView);
    setStartIndex((prev) => Math.min(prev, maxIndex));
  }, [slidesPerView, category.services.length]);

  React.useEffect(() => {
    setStartIndex(0);
  }, [category.id]);

  const cardWidth = React.useMemo(() => {
    if (slidesPerView <= 1) return "100%";
    const gap = 24; // px, gap-6
    return `calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`;
  }, [slidesPerView]);

  return (
    <div className="space-y-6 cursor-pointer">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-200 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-100 text-brand-800 rounded-full">{category.icon}</div>
          <h4 className="text-2xl font-serif text-brand-900">{category.title}</h4>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleControl("prev")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm"
            aria-label="Dịch vụ trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleControl("next")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-900 transition-colors bg-white shadow-sm"
            aria-label="Dịch vụ tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-6 overflow-hidden scroll-smooth">
          {category.services.map((service) => (
            <motion.div
              key={service.id}
              className="relative shrink-0 bg-white p-6 border border-brand-100 flex flex-col justify-between group rounded-sm"
              style={{ flex: `0 0 ${cardWidth}` }}
              whileHover={{ translateY: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => onSelect({ ...service, category: category.title, image: category.image })}
            >
              <div>
                <div className="mb-4">
                  <span className="font-serif text-xl text-brand-700 group-hover:text-brand-900 transition-colors">
                    {service.price} <span className="text-xs uppercase text-brand-500 font-sans tracking-wider">VNĐ</span>
                  </span>
                </div>
                <h5 className="text-base font-medium text-brand-950 mb-3">{service.name}</h5>
                <p className="text-sm text-brand-600 leading-relaxed mb-4 line-clamp-3">{service.description}</p>
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-brand-600 group-hover:text-brand-900 flex items-center gap-2 mt-auto pt-2">
                <span>Tìm hiểu thêm</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
