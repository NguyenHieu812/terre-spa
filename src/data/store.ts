import { Post, Product, ServiceCategory, SpaService, CloudflareConfig, CustomerReview, Order, OrderStatus, Coupon } from "../types";
import {
  getDefaultCloudflareConfig,
  saveCloudflareConfig,
  syncToCloudflare,
  fetchFromCloudflare,
} from "../services/cloudflareService";

import heroBg from "../assets/images/spa_hero_bg_1781666735594.jpg";
import hairWashImg from "../assets/images/spa_hair_wash_1781704187306.jpg";
import massageDetail from "../assets/images/spa_massage_detail_1781666753905.jpg";
import facialCareImg from "../assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "../assets/images/spa_herbal_compress_1781885390039.jpg";
import SanhChoSangTrong from "../assets/images/sanhchosangtrong.jpg";

export const POSTS_STORAGE_KEY = "terre_spa_posts_data";
export const PRODUCTS_STORAGE_KEY = "terre_spa_products_data";
export const SERVICES_STORAGE_KEY = "terre_spa_services_data";
export const REVIEWS_STORAGE_KEY = "terre_spa_reviews_data";
export const ORDERS_STORAGE_KEY = "terre_spa_orders_data";
export const COUPONS_STORAGE_KEY = "terre_spa_coupons_data";
export const PRODUCT_CATEGORIES_STORAGE_KEY = "terre_spa_product_categories_data";

export const INITIAL_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "hair-recovery",
    title: "Gội Đầu & Dưỡng Sinh",
    iconName: "Scissors",
    image: hairWashImg,
    services: [
      { id: "hair-45", name: "Gội Đầu Dưỡng Sinh (45 phút)", price: "149,000", categoryId: "hair-recovery", description: "Massage đầu mặt, cổ vai gáy, ủ tóc, đắp mặt nạ, xông thảo dược. Quy trình gội dưỡng sinh thư giãn giúp giải tỏa căng thẳng và nuôi dưỡng mầm tóc khỏe." },
      { id: "hair-60", name: "Gội Đầu Dưỡng Sinh (60 phút)", price: "199,000", categoryId: "hair-recovery", description: "Massage đầu mặt, cổ vai gáy, ủ tóc, đắp mặt nạ, xông thảo dược với thời gian dài hơn để bạn tận hưởng trọn vẹn từng khoảnh khắc an yên." },
      { id: "hair-75", name: "Gội Đầu Dưỡng Sinh (75 phút)", price: "299,000", categoryId: "hair-recovery", description: "Gội dưỡng sinh kéo dài, kết hợp các động tác ấn huyệt đầu cổ vai gáy sâu, giúp giảm thiểu mệt mỏi hiệu quả nhất." },
      { id: "recovery-90", name: "Dưỡng Sinh Phục Hồi (90 phút)", price: "799,000", categoryId: "hair-recovery", description: "Massage toàn thân, chườm bụng, gội đầu dưỡng sinh. Sự kết hợp hoàn hảo giữa gội đầu và chăm sóc body, đem lại sức sống mới cho cơ thể." },
    ],
  },
  {
    id: "massage",
    title: "Massage Thư Giãn",
    iconName: "Sparkles",
    image: massageDetail,
    services: [
      { id: "neck-45", name: "Massage Vai Gáy (45 phút)", price: "169,000", categoryId: "massage", description: "Thư giãn, đắp & chườm ấm thảo dược, tán phong thải độc vùng đầu cổ vai gáy. Phương pháp trị liệu thiên nhiên an toàn." },
      { id: "neck-60", name: "Massage Vai Gáy (60 phút)", price: "299,000", categoryId: "massage", description: "Liệu trình thư giãn kéo dài hơn cho vùng vai gáy, giúp xua tan sự ê nhức từ làm việc văn phòng, đắp & chườm ấm thảo dược." },
      { id: "neck-90", name: "Massage Vai Gáy (90 phút)", price: "399,000", categoryId: "massage", description: "Gói trị liệu vai gáy chuyên sâu, giúp giải phóng hoàn toàn ách tắc và đau nhức, kết hợp với các tinh chất thảo dược." },
      { id: "body-120", name: "Body & Dưỡng Sinh (120 phút)", price: "699,000", categoryId: "massage", description: "Massage body tinh dầu, massage vòng lưng với đá nóng, kết thúc với chườm ấm thư giãn toàn diện." },
    ],
  },
  {
    id: "skincare",
    title: "Chăm Sóc & Trẻ Hóa Da",
    iconName: "Leaf",
    image: facialCareImg,
    services: [
      { id: "skin-basic", name: "Chăm sóc da cơ bản (60')", price: "259,000", categoryId: "skincare", description: "Làm sạch sâu, hút dầu mụn cám, massage mặt, đi tinh chất, đắp mặt nạ (mask) cấp ẩm. Lấy lại sự rạng rỡ tức thì." },
      { id: "skin-acne", name: "Chăm da mụn chuyên sâu (90')", price: "539,000", categoryId: "skincare", description: "Làm sạch lỗ chân lông, lấy nhân mụn chuyên nghiệp, chiếu ánh sáng sinh học và peel mụn đặc trị." },
      { id: "skin-recover", name: "Phục hồi da yếu (75')", price: "719,000", categoryId: "skincare", description: "Dành riêng cho da nhạy cảm. Làm dịu da, điện di phục hồi, cooling lạnh bảo vệ và đắp mask chuyên sâu." },
      { id: "skin-terre", name: "Chăm sóc da Terre (90')", price: "799,000", categoryId: "skincare", description: "Quy trình chăm sóc chuyên biệt mang dấu ấn Terre Spa, sử dụng các sản phẩm cao cấp cùng kỹ thuật massage độc quyền." },
      { id: "skin-hydrafs", name: "Cấp ẩm chuyên sâu (75')", price: "1,499,000", categoryId: "skincare", description: "Cung cấp độ ẩm dồi dào qua điện di HA-B5, cooling lạnh và dưỡng chất cấp ẩm sâu vào tầng hạ bì của da." },
      { id: "skin-lift", name: "Nâng cơ trẻ hóa Terre (90')", price: "2,690,000", categoryId: "skincare", description: "Dịch vụ VIP chống lão hóa. Ion nâng cơ, điện di collagen, mask phục hồi giúp làn da căng bóng và thanh xuân trở lại." },
    ],
  },
  {
    id: "hair-removal",
    title: "Triệt Lông (Gói Bảo Hành)",
    iconName: "Droplets",
    image: heroBg,
    services: [
      { id: "hr-face", name: "Triệt mép / Nách", price: "Từ 1,000,000", categoryId: "hair-removal", description: "Công nghệ tiên tiến bảo hành lâu dài, an toàn, không đau rát, mang lại vùng dưới cánh tay mịn màng." },
      { id: "hr-arm-leg", name: "Triệt Tay / Chân", price: "Từ 2,000,000", categoryId: "hair-removal", description: "Gói bảo hành uy tín với công nghệ triệt lạnh không gây khô da hay viêm nang lông, vùng da rạng rỡ mịn màng." },
      { id: "hr-bikini", name: "Triệt Bikini / Full Mặt", price: "2,500,000", categoryId: "hair-removal", description: "Bảo hành lâu dài, hỗ trợ làm sạch nang lông ở những vùng da nhạy cảm nhẹ nhàng và an toàn." },
      { id: "hr-back", name: "Triệt Lưng", price: "5,000,000", categoryId: "hair-removal", description: "Liệu trình triệt lưng chuyên sâu, bảo hành uy tín lâu dài, đánh bay những vết thâm sạm và mang lại tấm lưng thanh tân." },
    ],
  },
  {
    id: "other-services",
    title: "Dịch Vụ Khác",
    iconName: "Sparkles",
    image: heroBg,
    services: [
      { id: "other-1", name: "Dịch Vụ Khác 1", price: "Từ 149,000", categoryId: "other-services", description: "Liên hệ nhân viên hỗ trợ để được tư vấn thêm." },
    ],
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    title: "5 Bước Gội Đầu Dưỡng Sinh Tại Nhà Chuẩn Spa Giúp Giải Tỏa Căng Thẳng & Phục Hồi Tóc",
    slug: "5-buoc-goi-dau-duong-sinh-tai-nha-chuan-spa",
    excerpt: "Gội đầu dưỡng sinh không đơn thuần là làm sạch tóc mà còn là liệu pháp giải tỏa stress, đã thông kinh lạc vùng đầu và nuôi dưỡng mái tóc suôn mượt từ gốc thảo mộc.",
    category: "Dưỡng Sinh",
    tags: ["Gội đầu dưỡng sinh", "Thảo dược", "Thư giãn", "Chăm sóc tóc"],
    coverImage: hairWashImg,
    author: {
      name: "Chuyên viên Dưỡng sinh Terre",
      role: "Trưởng nhóm Trị liệu Đông Y",
    },
    status: "published",
    publishedAt: "2026-03-15T08:30:00Z",
    readTimeMinutes: 5,
    featured: true,
    views: 1240,
    content: `
      <h2>Tại sao gội đầu dưỡng sinh lại được ưa chuộng?</h2>
      <p>Trong nhịp sống bận rộn hiện đại, chứng đau đầu, mất ngủ, căng cứng cơ cổ vai gáy đang trở thành nỗi ám ảnh của nhiều người. Liệu pháp <strong>Gội đầu dưỡng sinh Đông y</strong> tại Terre Spa kết hợp giữa thảo dược tự nhiên và kỹ thuật ấn huyệt chuẩn xác, giúp lưu thông khí huyết và tái tạo năng lượng hiệu quả.</p>
      
      <blockquote>
        "Gội đầu dưỡng sinh là hành trình tìm về sự an yên nguyên bản, nơi mỗi động tác xoa bóp nhẹ nhàng xua tan đi muộn phiền thường nhật."
      </blockquote>

      <h3>Quy trình 5 bước tự thực hiện tại nhà:</h3>
      <ol>
        <li><strong>Chải tóc thông kinh lạc:</strong> Dùng lược gỗ răng thưa hoặc lược sừng chải nhẹ nhàng từ chân tóc đến ngọn, tác động vào các huyệt Bách Hội, Phong Trì.</li>
        <li><strong>Xông ấm thảo dược:</strong> Sử dụng nước lá xả, vỏ bưởi, hương nhu đun sôi để xông hơi mặt và da đầu giúp giãn nở nang tóc và lỗ chân lông.</li>
        <li><strong>Làm sạch với dầu gội cô đặc:</strong> Thoa dầu gội bồ kết thiên nhiên, tạo bọt nhẹ và massage theo vòng tròn bằng đầu ngón tay (không cào bằng móng).</li>
        <li><strong>Bấm huyệt giải tỏa ách tắc:</strong> Dùng ngón cái day nhẹ vùng thái dương, sau gáy và hai bên đường chân tóc trong 5-7 phút.</li>
        <li><strong>Ủ tóc thảo mộc & tráng nước ấm:</strong> Khóa ẩm bằng tinh chất dưỡng thảo mộc, tráng sạch lại bằng nước mát vừa phải để se khít biểu bì tóc.</li>
      </ol>

      <p>Nếu bạn muốn trải nghiệm trọn vẹn quy trình chuyên sâu với giường gội thảo dược cao cấp và kỹ thuật viên lành nghề, hãy ghé ngay <strong>Terre Spa</strong> để được tận hưởng nhé!</p>
    `,
  },
  {
    id: "post-2",
    title: "Bí Quyết Phục Hồi Làn Da Mỏng Yếu & Nhạy Cảm Sau Treatment Hiệu Quả",
    slug: "bi-quyet-phuc-hoi-da-mong-yeu-sau-treatment",
    excerpt: "Làn da sau peel, laser hoặc dùng treatment nồng độ cao thường bị đỏ rát và suy giảm hàng rào bảo vệ. Cùng khám phá phác đồ phục hồi da dịu lành từ Terre Spa.",
    category: "Chăm Sóc Da",
    tags: ["Phục hồi da", "Skincare", "Treatment", "Da nhạy cảm"],
    coverImage: facialCareImg,
    author: {
      name: "Bác sĩ Da liễu Cố vấn",
      role: "Terre Dermatology Specialist",
    },
    status: "published",
    publishedAt: "2026-03-10T14:20:00Z",
    readTimeMinutes: 6,
    featured: true,
    views: 980,
    content: `
      <h2>Hiểu đúng về tổn thương hàng rào bảo vệ da</h2>
      <p>Sau các liệu trình can thiệp mạnh, lớp màng lipid sinh học tự nhiên của da bị suy yếu, khiến da mất nước xuyên biểu bì (TEWL) nhanh chóng và dễ bị kích ứng bởi các tác nhân môi trường.</p>

      <h3>Các nguyên tắc vàng khi dưỡng phục hồi:</h3>
      <ul>
        <li><strong>Tối giản chu trình:</strong> Tạm ngừng tất cả các hoạt chất tẩy tế bào chết hóa học (AHA, BHA, Retinoids).</li>
        <li><strong>Cấp ẩm đa tầng:</strong> Sử dụng Hyaluronic Acid (HA) trọng lượng phân tử thấp và Vitamin B5 để tăng tốc độ làm lành tế bào.</li>
        <li><strong>Tái tạo màng ẩm:</strong> Bổ sung Ceramide, Squalane, chiết xuất rau má tự nhiên giúp vá lành lớp màng lipid.</li>
        <li><strong>Chống nắng vật lý dịu nhẹ:</strong> Bắt buộc bảo vệ da bằng kem chống nắng phổ rộng có kẽm Oxit (Zinc Oxide).</li>
      </ul>

      <p>Tại Terre Spa, gói trị liệu <em>Phục Hồi Da Yếu (75 phút)</em> ứng dụng công nghệ điện di lạnh làm dịu tức thì và cấp dưỡng chất sâu, mang lại làn da căng mọng, khỏe khoắn chỉ sau 1 buổi.</p>
    `,
  },
  {
    id: "post-3",
    title: "Tác Dụng Kỳ Diệu Của Massage Bấm Huyệt Cổ Vai Gáy Dành Cho Dân Văn Phòng",
    slug: "tac-dung-massage-bam-huyet-co-vai-gay-van-phong",
    excerpt: "Ngồi làm việc sai tư thế trong nhiều giờ liền khiến vùng cổ vai gáy xơ cứng, đau nhức. Tìm hiểu phương pháp đả thông kinh lạc và xoa dịu các bó cơ.",
    category: "Thư Giãn & Trị Liệu",
    tags: ["Massage", "Vai gáy", "Trị liệu đông y", "Văn phòng"],
    coverImage: massageDetail,
    author: {
      name: "Terre Healing Team",
      role: "Chuyên viên trị liệu",
    },
    status: "published",
    publishedAt: "2026-03-05T09:15:00Z",
    readTimeMinutes: 4,
    featured: false,
    views: 745,
    content: `
      <h2>Hội chứng cổ vai gáy dân văn phòng - Đừng chủ quan!</h2>
      <p>Đau mỏi vai gáy kéo dài không chỉ gây khó chịu mà còn cản trở máu lưu thông lên não, dẫn đến hoa mắt, chóng mặt và mất ngủ triền miên.</p>
      
      <h3>Lợi ích vượt trội từ liệu pháp chườm ấm thảo dược:</h3>
      <p>Sự kết hợp giữa <strong>nhiệt trị liệu từ túi thảo dược</strong> và kỹ thuật xoa bóp, day ấn huyệt Đốc Mạch, Kiên Tỉnh giúp làm mềm tức thì các điểm nút thắt cơ (trigger points), kích thích tuần hoàn máu và đem lại cảm giác nhẹ bẫng cho vùng cổ lưng.</p>
    `,
  },
  {
    id: "post-4",
    title: "Cẩm Nang Chọn Mùi Hương Tinh Dầu Trị Liệu Phù Hợp Với Cung Cảm Xúc Của Bạn",
    slug: "cam-nang-chon-mui-huong-tinh-dau-tri-lieu",
    excerpt: "Mùi hương không chỉ tác động vào khứu giác mà còn điều hòa sóng não và cảm xúc. Khám phá các nốt hương thảo mộc nguyên bản tại Terre.",
    category: "Cẩm Nang Spa",
    tags: ["Aromatherapy", "Tinh dầu", "Thư giãn"],
    coverImage: herbalCompressImg,
    author: {
      name: "Thảo Dược Terre",
      role: "Chuyên gia Mùi hương",
    },
    status: "published",
    publishedAt: "2026-02-28T16:00:00Z",
    readTimeMinutes: 4,
    featured: false,
    views: 520,
    content: `
      <h2>Năng lượng từ thảo mộc thiên nhiên</h2>
      <p>Liệu pháp Aromatherapy sử dụng các tinh dầu nguyên chất chiết xuất từ hoa cỏ, vỏ cây và rễ thảo mộc giúp kích hoạt hệ thần kinh phó giao cảm, mang lại giấc ngủ ngon và giải tỏa âu lo.</p>
    `,
  },
];

export const DEFAULT_PRODUCT_CATEGORIES: string[] = [
  "Chăm sóc tóc",
  "Chăm sóc da",
  "Dưỡng sinh thư giãn",
  "Combo quà tặng",
  "Tinh dầu & Nến thơm",
  "Sản phẩm phục hồi",
];

export const getStoredProductCategories = (): string[] => {
  try {
    const saved = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_PRODUCT_CATEGORIES;
};

export const saveProductCategories = (categories: string[]): void => {
  try {
    const clean = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
    localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(clean));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e) {}
};

export const addProductCategory = (newCat: string): string[] => {
  const trimmed = newCat.trim();
  if (!trimmed) return getStoredProductCategories();
  const current = getStoredProductCategories();
  if (!current.includes(trimmed)) {
    const updated = [...current, trimmed];
    saveProductCategories(updated);
    return updated;
  }
  return current;
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1790092106735",
    name: "BISA DERMA HamadLAB 25g – Kem Phục Hồi, Làm Dịu & Dưỡng Ẩm Da",
    slug: "bisa-derma-hamadlab-25g-kem-phuc-hoi-lam-diu-duong-am-da",
    category: "Chăm sóc da",
    price: 189000,
    originalPrice: 250000,
    thumbnail: facialCareImg,
    images: [facialCareImg, SanhChoSangTrong, massageDetail],
    shortDesc: "Kem dưỡng phục hồi da yếu, làm dịu tức thì kích ứng, mẩn đỏ sau treatment hoặc nặn mụn với phức hợp rau má & B5.",
    fullDesc: "<h2>BISA DERMA HamadLAB 25g – Công Thức Phục Hồi Sinh Học & Giảm Kích Ứng Da</h2><p>BISA DERMA HamadLAB là giải pháp chăm sóc và làm lành chuyên sâu cho làn da nhạy cảm, da sau nặn mụn hoặc sau liệu trình peel/laser.</p><h3>Thành phần nổi bật:</h3><ul><li><strong>BIO-PLACENTA (5 Growth Factors):</strong> Kích thích tái tạo tế bào, phục hồi mô tổn thương và tăng độ đàn hồi cho da.</li><li><strong>TECA 95% + C-PEP:</strong> Làm dịu nhanh tình trạng ửng đỏ, tăng sinh collagen và củng cố hàng rào bảo vệ.</li><li><strong>Palmitoyl Tetrapeptide-7:</strong> Kháng viêm, bảo vệ da trước ánh sáng xanh và tia UVB.</li><li><strong>Collagen thủy phân &amp; Sữa ong chúa:</strong> Nuôi dưỡng da ẩm mịn, ngậm nước dài lâu.</li></ul>",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 42,
    volumeOrWeight: "25g",
    ingredients: ["Chiết xuất rau má Centella", "D-Panthenol (Vitamin B5)", "Hyaluronic Acid đa phân tử", "Ceramide NP", "Madecassoside"],
    usageInstructions: "Sau khi làm sạch da, lấy một lượng kem vừa đủ thoa đều lên vùng da cần làm dịu và phục hồi. Dùng 2 lần/ngày vào buổi sáng và tối.",
    metaTitle: "Kem Phục Hồi Da BISA DERMA HamadLAB 25g Chính Hãng | Terre Spa",
    metaDescription: "Kem phục hồi da yếu, làm dịu kích ứng và phục hồi hàng rào màng ẩm tự nhiên sau liệu trình spa với chiết xuất thảo mộc dịu lành.",
  },
  {
    id: "prod-1",
    name: "Dầu Gội Thảo Dược Bồ Kết Cô Đặc Terre Spa (500ml)",
    slug: "dau-goi-thao-duoc-bo-ket-co-dac-terre-spa",
    category: "Chăm sóc tóc",
    price: 260000,
    originalPrice: 320000,
    thumbnail: hairWashImg,
    images: [hairWashImg, herbalCompressImg, SanhChoSangTrong],
    shortDesc: "Nấu cô đặc thủ công từ quả bồ kết nướng, vỏ bưởi, hương nhu, cỏ mần trầu giúp giảm rụng tóc, sạch gàu ngứa và kích mọc tóc con.",
    fullDesc: "<h2>Dầu Gội Thảo Dược Nấu Thủ Công Chuẩn Đông Y</h2><p>Sản phẩm dầu gội thiên nhiên thuần chay với 100% thảo mộc bản địa Việt Nam. Công thức cô đặc độc quyền từ Terre Spa không chứa Silicon, không Sulfate, không Paraben, an toàn tuyệt đối cho mẹ bầu và da đầu nhạy cảm.</p>",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    volumeOrWeight: "500ml",
    ingredients: ["Bồ kết nướng", "Vỏ bưởi da xanh", "Hương nhu trắng", "Cỏ mần trầu", "Hà thủ ô", "Sả chanh"],
    usageInstructions: "Làm ướt tóc, lấy 1 lượng vừa đủ tạo bọt nhẹ và massage đều khắp da đầu trong 3-5 phút, sau đó xả sạch với nước.",
    metaTitle: "Dầu Gội Thảo Dược Bồ Kết Cô Đặc 500ml | Terre Spa",
    metaDescription: "Dầu gội bồ kết nấu cô đặc thủ công chuẩn dưỡng sinh Đông Y, giảm gãy rụng và kích mọc tóc chắc khỏe tự nhiên.",
  },
  {
    id: "prod-2",
    name: "Tinh Dầu Bưởi Hồng Kích Mọc & Dưỡng Tóc Terre Herbal (100ml)",
    slug: "tinh-dau-buoi-hong-kich-moc-duong-toc-terre",
    category: "Chăm sóc tóc",
    price: 185000,
    originalPrice: 220000,
    thumbnail: herbalCompressImg,
    images: [herbalCompressImg, hairWashImg],
    shortDesc: "Xịt dưỡng kích thích mọc tóc nhanh, làm dày chân tóc, nuôi dưỡng sợi tóc chắc khỏe từ gốc.",
    fullDesc: "<h2>Tinh Dầu Bưởi Hồng Ép Lạnh Nguyên Chất</h2><p>Chiết xuất tinh dầu vỏ bưởi hồng nguyên chất kết hợp tinh chất hoa cam và Vitamin B5. Dạng xịt phun sương siêu mịn, thẩm thấu ngay vào nang tóc mà không gây bết dính.</p>",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 36,
    volumeOrWeight: "100ml",
    ingredients: ["Tinh dầu vỏ bưởi hồng ép lạnh", "Hydrosol hoa bưởi", "D-Panthenol (Vitamin B5)", "Tinh dầu tràm trà"],
    usageInstructions: "Xịt trực tiếp vào chân tóc và da đầu khi tóc sạch (khô hoặc ẩm), massage nhẹ nhàng 2 phút. Dùng 2 lần/ngày sáng và tối.",
    metaTitle: "Tinh Dầu Bưởi Hồng Kích Mọc Tóc 100ml | Terre Herbal",
    metaDescription: "Tinh dầu vỏ bưởi hồng ép lạnh kích thích mọc tóc con, làm dày nang tóc và nuôi dưỡng mái tóc bóng mượt bồng bềnh.",
  },
  {
    id: "prod-5",
    name: "Set Quà Tặng Thư Giãn Cao Cấp Terre Deluxe Spa Giftset",
    slug: "set-qua-tang-thu-gian-cao-cap-terre-deluxe",
    category: "Combo quà tặng",
    price: 890000,
    originalPrice: 1150000,
    thumbnail: massageDetail,
    images: [massageDetail, SanhChoSangTrong, hairWashImg],
    shortDesc: "Hộp quà sang trọng gồm Dầu gội bồ kết 500ml + Tinh dầu bưởi 100ml + Nến thơm thảo mộc cao cấp + Túi chườm mắt thảo dược.",
    fullDesc: "<h2>Món Quà Tinh Tế Cho Sức Khỏe &amp; Thư Thái Thân Tâm</h2><p>Món quà tinh tế và ý nghĩa dành tặng người thân, đối tác, bạn bè. Được đóng gói trong hộp quà cao cấp dập nhũ vàng Terre Spa, mang trọn vẹn trải nghiệm thư thái tại spa về nhà.</p>",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 19,
    volumeOrWeight: "Set 4 món",
    ingredients: ["Trọn bộ sản phẩm organic chăm sóc thân & tâm"],
    usageInstructions: "Bộ sản phẩm có hướng dẫn sử dụng chi tiết đính kèm trong hộp quà.",
    metaTitle: "Set Quà Tặng Thảo Dược Cao Cấp Terre Deluxe Spa Giftset",
    metaDescription: "Hộp quà tặng chăm sóc sức khỏe và thư giãn cao cấp từ Terre Spa, món quà hoàn hảo gửi trọn yêu thương.",
  },
];

export const TERRE_DATA_SYNCED_EVENT = "terre_data_synced";
export const LAST_MUTATION_STORAGE_KEY = "terre_spa_last_local_mutation";
export const DELETED_POST_IDS_KEY = "terre_spa_deleted_post_ids";
export const DELETED_PRODUCT_IDS_KEY = "terre_spa_deleted_product_ids";
export const DELETED_SERVICE_IDS_KEY = "terre_spa_deleted_service_ids";
export const DELETED_ORDER_IDS_KEY = "terre_spa_deleted_order_ids";

// Tombstone tracking helpers
export const getDeletedPostIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_POST_IDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

export const addDeletedPostId = (id: string): void => {
  try {
    const current = getDeletedPostIds();
    current.add(id);
    localStorage.setItem(DELETED_POST_IDS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {}
};

export const clearDeletedPostId = (id: string): void => {
  try {
    const current = getDeletedPostIds();
    if (current.delete(id)) {
      localStorage.setItem(DELETED_POST_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (e) {}
};

export const getDeletedProductIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_PRODUCT_IDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

export const addDeletedProductId = (id: string): void => {
  try {
    const current = getDeletedProductIds();
    current.add(id);
    localStorage.setItem(DELETED_PRODUCT_IDS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {}
};

export const clearDeletedProductId = (id: string): void => {
  try {
    const current = getDeletedProductIds();
    if (current.delete(id)) {
      localStorage.setItem(DELETED_PRODUCT_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (e) {}
};

export const getDeletedServiceIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_SERVICE_IDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

export const addDeletedServiceId = (id: string): void => {
  try {
    const current = getDeletedServiceIds();
    current.add(id);
    localStorage.setItem(DELETED_SERVICE_IDS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {}
};

export const clearDeletedServiceId = (id: string): void => {
  try {
    const current = getDeletedServiceIds();
    if (current.delete(id)) {
      localStorage.setItem(DELETED_SERVICE_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (e) {}
};

const recordLocalMutation = () => {
  try {
    localStorage.setItem(LAST_MUTATION_STORAGE_KEY, Date.now().toString());
  } catch (e) {}
};

// Helper functions for Services & Categories
export const getStoredServices = (): ServiceCategory[] => {
  const deletedCatIds = getDeletedServiceIds();
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((cat) => !deletedCatIds.has(cat.id))
          .map((cat) => ({
            ...cat,
            services: Array.isArray(cat.services)
              ? cat.services.filter((s: any) => !deletedCatIds.has(s.id))
              : [],
          }));
      }
    }
  } catch (e) {
    console.warn("Failed to load services from LocalStorage", e);
  }
  return INITIAL_SERVICE_CATEGORIES.filter((cat) => !deletedCatIds.has(cat.id)).map((cat) => ({
    ...cat,
    services: cat.services.filter((s) => !deletedCatIds.has(s.id)),
  }));
};

export const saveStoredServices = (serviceCategories: ServiceCategory[]): void => {
  try {
    // Detect any deleted categories or services
    const prevCats = getStoredServices();
    const currentCatIds = new Set(serviceCategories.map((c) => c.id));
    const currentSvcIds = new Set(serviceCategories.flatMap((c) => (c.services || []).map((s) => s.id)));

    prevCats.forEach((c) => {
      if (!currentCatIds.has(c.id)) addDeletedServiceId(c.id);
      (c.services || []).forEach((s) => {
        if (!currentSvcIds.has(s.id)) addDeletedServiceId(s.id);
      });
    });

    serviceCategories.forEach((c) => {
      clearDeletedServiceId(c.id);
      (c.services || []).forEach((s) => clearDeletedServiceId(s.id));
    });

    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(serviceCategories));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e: any) {
    console.error("Failed to save services to LocalStorage", e);
    if (e.name === "QuotaExceededError" || e.code === 22) {
      alert("Bộ nhớ trình duyệt đã đầy do kích thước ảnh quá lớn. Vui lòng giảm dung lượng ảnh!");
    }
  }
};

// Helper functions for Posts
export const getStoredPosts = (): Post[] => {
  const deletedIds = getDeletedPostIds();
  try {
    const saved = localStorage.getItem(POSTS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => !deletedIds.has(p.id));
      }
    }
  } catch (e) {
    console.warn("Failed to load posts from LocalStorage", e);
  }
  return INITIAL_POSTS.filter((p) => !deletedIds.has(p.id));
};

export const saveStoredPosts = (posts: Post[]): void => {
  try {
    // Detect any deleted post IDs
    const prevPosts = getStoredPosts();
    const currentIds = new Set(posts.map((p) => p.id));
    prevPosts.forEach((p) => {
      if (!currentIds.has(p.id)) {
        addDeletedPostId(p.id);
      }
    });

    // Clear deleted status for any present posts
    posts.forEach((p) => clearDeletedPostId(p.id));

    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e: any) {
    console.error("Failed to save posts to LocalStorage", e);
    if (e.name === "QuotaExceededError" || e.code === 22) {
      alert("Bộ nhớ trình duyệt đã đầy do ảnh bài viết quá lớn. Vui lòng nén ảnh hoặc chọn ảnh nhẹ hơn!");
    }
  }
};

// Helper functions for Products
export const getStoredProducts = (): Product[] => {
  const deletedIds = getDeletedProductIds();
  try {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => !deletedIds.has(p.id));
      }
    }
  } catch (e) {
    console.warn("Failed to load products from LocalStorage", e);
  }
  return INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id));
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    // Detect any deleted product IDs
    const prevProds = getStoredProducts();
    const currentIds = new Set(products.map((p) => p.id));
    prevProds.forEach((p) => {
      if (!currentIds.has(p.id)) {
        addDeletedProductId(p.id);
      }
    });

    // Clear deleted status for any present products
    products.forEach((p) => clearDeletedProductId(p.id));

    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e: any) {
    console.error("Failed to save products to LocalStorage", e);
    if (e.name === "QuotaExceededError" || e.code === 22) {
      alert("Bộ nhớ trình duyệt đã đầy do ảnh sản phẩm quá lớn. Vui lòng nén ảnh hoặc chọn ảnh nhẹ hơn!");
    }
  }
};

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    author: "Nguyễn Lê Hằng",
    rating: 5,
    date: "1 tuần trước",
    serviceUsed: "Massage Vai Gáy (60 phút)",
    content: "Mình làm văn phòng ngồi máy tính nhiều nên vai gáy cứng đơ. Đến Terre trải nghiệm gói Massage Vai Gáy 60 phút có đắp và chườm ấm thảo dược, bạn kỹ thuật viên ấn huyệt cực kỳ đúng điểm tắc. Làm xong cảm giác nhẹ bẫng cả người, tối về ngủ ngon một mạch.",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Le+Hang&background=f2e8e5&color=8c6454",
  },
  {
    id: "rev-2",
    author: "Trần Minh Tùng",
    rating: 5,
    date: "2 tuần trước",
    serviceUsed: "Dưỡng Sinh Phục Hồi (90 phút)",
    content: "Rất ấn tượng với gói Dưỡng Sinh Phục Hồi 90 phút. Kết hợp trọn vẹn từ massage body tinh dầu, chườm ấm bụng đến gội đầu thảo dược xông hơi. Không gian yên tĩnh, mùi thảo mộc dễ chịu, nhân viên phục vụ tận tâm không chèo kéo.",
    avatar: "https://ui-avatars.com/api/?name=Tran+Minh+Tung&background=f2e8e5&color=8c6454",
  },
  {
    id: "rev-3",
    author: "Bùi Thu Trà",
    rating: 5,
    date: "3 tuần trước",
    serviceUsed: "Chăm da mụn chuyên sâu (90')",
    content: "Gói chăm da mụn chuyên sâu làm rất kỹ. Kỹ thuật viên lấy nhân mụn êm tay, không làm trầy xước hay sưng đỏ mặt. Các bước chiếu ánh sáng sinh học và đắp mặt nạ làm dịu rất hiệu quả, sau 3 buổi da mình sạch mụn ẩn rõ rệt.",
    avatar: "https://ui-avatars.com/api/?name=Bui+Thu+Tra&background=f2e8e5&color=8c6454",
  },
  {
    id: "rev-4",
    author: "Linh Doãn",
    rating: 5,
    date: "1 tháng trước",
    serviceUsed: "Gội Đầu Dưỡng Sinh (75 phút)",
    content: "Gội đầu dưỡng sinh ở đây đúng chuẩn thảo mộc truyền thống, nấu từ bồ kết, sả chanh thơm tự nhiên chứ không dùng dầu gội hóa chất. Vừa được gội sạch sâu vừa được massage bấm huyệt đầu cổ vai gáy siêu thư giãn.",
    avatar: "https://ui-avatars.com/api/?name=Linh+Doan&background=f2e8e5&color=8c6454",
  },
  {
    id: "rev-5",
    author: "Hoàng Anh",
    rating: 5,
    date: "1 tháng trước",
    serviceUsed: "Nâng cơ trẻ hóa Terre (90')",
    content: "Đưa mẹ đến làm gói Nâng cơ trẻ hóa Terre và Cấp ẩm chuyên sâu, mẹ khen nức nở. Da căng bóng, mịn màng và rãnh cười mờ hẳn. Spa làm đúng thời gian cam kết, quy trình bài bản và phòng ốc sạch sẽ tinh tế.",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Anh&background=f2e8e5&color=8c6454",
  },
  {
    id: "rev-6",
    author: "Đặng Thùy Dương",
    rating: 5,
    date: "2 tháng trước",
    serviceUsed: "Triệt Bikini / Full Mặt",
    content: "Mình mua gói Triệt lông bảo hành tại Terre. Đầu máy triệt lạnh mát rượi, không hề bị châm chích hay bỏng rát da. Sau 3 buổi lông tơ mọc lại cực kỳ mảnh và thưa, vùng da dưới cánh tay sáng mịn hơn trông thấy.",
    avatar: "https://ui-avatars.com/api/?name=Dang+Thuy+Duong&background=f2e8e5&color=8c6454",
  },
];

// Helper functions for Customer Reviews
export const getStoredReviews = (): CustomerReview[] => {
  try {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load reviews from LocalStorage", e);
  }
  return INITIAL_REVIEWS;
};

export const saveStoredReviews = (reviews: CustomerReview[]): void => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e: any) {
    console.error("Failed to save reviews to LocalStorage", e);
    if (e.name === "QuotaExceededError" || e.code === 22) {
      alert("Bộ nhớ trình duyệt đã đầy. Vui lòng giảm bớt dung lượng ảnh đánh giá!");
    }
  }
};

// Tombstone tracking for Orders
export const getDeletedOrderIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_ORDER_IDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

export const addDeletedOrderId = (id: string): void => {
  try {
    const current = getDeletedOrderIds();
    current.add(id);
    localStorage.setItem(DELETED_ORDER_IDS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {}
};

export const clearDeletedOrderId = (id: string): void => {
  try {
    const current = getDeletedOrderIds();
    if (current.delete(id)) {
      localStorage.setItem(DELETED_ORDER_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (e) {}
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "cp-terre20",
    code: "TERRE20",
    description: "Giảm 20% tổng hóa đơn (tối đa 150.000đ)",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 150000,
    minOrderValue: 200000,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    usageLimit: 500,
    usedCount: 28,
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "cp-chaospa50k",
    code: "SPA50K",
    description: "Giảm 50.000đ cho đơn hàng từ 300.000đ",
    discountType: "fixed_amount",
    discountValue: 50000,
    minOrderValue: 300000,
    startDate: "2026-09-15",
    endDate: "2026-11-30",
    usageLimit: 200,
    usedCount: 45,
    isActive: true,
    createdAt: "2026-09-15T00:00:00.000Z",
  },
  {
    id: "cp-vip100k",
    code: "VIP100K",
    description: "Giảm 100.000đ cho hóa đơn mua sắm từ 600.000đ",
    discountType: "fixed_amount",
    discountValue: 100000,
    minOrderValue: 600000,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    usageLimit: 100,
    usedCount: 12,
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2026-0901",
    customerName: "Nguyễn Thu Hà",
    customerPhone: "0912 345 678",
    customerAddress: "P.502 Chung cư Eco Green, 286 Nguyễn Xiển, Thanh Xuân, Hà Nội",
    customerNotes: "Giao giờ hành chính, gọi trước khi giao giúp mình.",
    items: [
      {
        productId: "prod-1790092106735",
        productName: "BISA DERMA HamadLAB 25g – Kem Phục Hồi, Làm Dịu & Dưỡng Ẩm Da",
        productThumbnail: facialCareImg,
        price: 189000,
        quantity: 2,
        volumeOrWeight: "25g",
      },
    ],
    subtotalAmount: 378000,
    couponCode: "SPA50K",
    discountAmount: 50000,
    totalAmount: 328000,
    status: "confirmed",
    createdAt: "2026-09-21T14:30:00.000Z",
    source: "website_cart",
    adminNotes: "Đã gọi điện xác nhận đơn. Khách hẹn ship trước 17h chiều nay.",
  },
  {
    id: "ORD-2026-0902",
    customerName: "Trần Minh Quang",
    customerPhone: "0988 765 432",
    customerAddress: "Số 15 Ngõ 282 Kim Giang, Hoàng Mai, Hà Nội",
    customerNotes: "Mang giúp mình set quà đóng hộp đẹp để biếu mẹ.",
    items: [
      {
        productId: "prod-5",
        productName: "Set Quà Tặng Thư Giãn Cao Cấp Terre Deluxe Spa Giftset",
        productThumbnail: massageDetail,
        price: 890000,
        quantity: 1,
        volumeOrWeight: "Set 4 món",
      },
    ],
    subtotalAmount: 890000,
    couponCode: "TERRE20",
    discountAmount: 150000,
    totalAmount: 740000,
    status: "pending",
    createdAt: "2026-09-22T08:15:00.000Z",
    source: "website_cart",
    adminNotes: "Khách mới đặt sáng nay, cần nhân viên gọi tư vấn thêm về thiệp chúc mừng.",
  },
];

// Helper functions for Coupons
export const getStoredCoupons = (): Coupon[] => {
  try {
    const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load coupons from LocalStorage", e);
  }
  return INITIAL_COUPONS;
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e) {
    console.error("Failed to save coupons to LocalStorage", e);
  }
};

export const validateAndApplyCoupon = (
  rawCode: string,
  subtotal: number
): {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  finalTotal: number;
  message: string;
} => {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: "Vui lòng nhập mã giảm giá." };
  }

  const coupons = getStoredCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code);

  if (!coupon) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Mã ưu đãi "${code}" không tồn tại.` };
  }

  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Mã ưu đãi "${code}" hiện đang tạm khóa.` };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (coupon.startDate && coupon.startDate > todayStr) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Mã ưu đãi "${code}" chưa đến ngày áp dụng.` };
  }

  if (coupon.endDate && coupon.endDate < todayStr) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Mã ưu đãi "${code}" đã hết hạn sử dụng.` };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Mã ưu đãi "${code}" đã hết số lượt sử dụng.` };
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    const formattedMin = new Intl.NumberFormat("vi-VN").format(coupon.minOrderValue);
    return {
      valid: false,
      discountAmount: 0,
      finalTotal: subtotal,
      message: `Đơn hàng tối thiểu ${formattedMin}đ để áp dụng mã này (hiện tại: ${new Intl.NumberFormat("vi-VN").format(subtotal)}đ).`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);
  const finalTotal = Math.max(0, subtotal - discount);

  return {
    valid: true,
    coupon,
    discountAmount: discount,
    finalTotal,
    message: `Áp dụng thành công: Giảm ${new Intl.NumberFormat("vi-VN").format(discount)}đ!`,
  };
};

export const incrementCouponUsage = (code: string): void => {
  const coupons = getStoredCoupons();
  const idx = coupons.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (idx >= 0) {
    coupons[idx] = {
      ...coupons[idx],
      usedCount: (coupons[idx].usedCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    saveStoredCoupons(coupons);
  }
};

// Helper functions for Orders
export const getStoredOrders = (): Order[] => {
  const deletedIds = getDeletedOrderIds();
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((o) => !deletedIds.has(o.id));
      }
    }
  } catch (e) {
    console.warn("Failed to load orders from LocalStorage", e);
  }
  return INITIAL_ORDERS.filter((o) => !deletedIds.has(o.id));
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    const prevOrders = getStoredOrders();
    const currentIds = new Set(orders.map((o) => o.id));
    prevOrders.forEach((o) => {
      if (!currentIds.has(o.id)) addDeletedOrderId(o.id);
    });
    orders.forEach((o) => clearDeletedOrderId(o.id));

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    recordLocalMutation();
    triggerFullAutoSync();
  } catch (e) {
    console.error("Failed to save orders to LocalStorage", e);
  }
};

export const createOrder = (orderData: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  items: Order["items"];
  subtotalAmount?: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount: number;
  source?: string;
  adminNotes?: string;
}): Order => {
  const newOrder: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: orderData.customerName.trim(),
    customerPhone: orderData.customerPhone.trim(),
    customerAddress: orderData.customerAddress?.trim(),
    customerNotes: orderData.customerNotes?.trim(),
    items: orderData.items,
    subtotalAmount: orderData.subtotalAmount || orderData.totalAmount,
    couponCode: orderData.couponCode,
    discountAmount: orderData.discountAmount || 0,
    totalAmount: orderData.totalAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: orderData.source || "website_product_modal",
    adminNotes: orderData.adminNotes,
  };

  if (orderData.couponCode) {
    incrementCouponUsage(orderData.couponCode);
  }

  const currentOrders = getStoredOrders();
  const updatedOrders = [newOrder, ...currentOrders];
  saveStoredOrders(updatedOrders);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus, adminNotes?: string): void => {
  const orders = getStoredOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : orders[idx].adminNotes,
      updatedAt: new Date().toISOString(),
    };
    saveStoredOrders(orders);
  }
};

export const deleteOrder = (orderId: string): void => {
  const orders = getStoredOrders().filter((o) => o.id !== orderId);
  addDeletedOrderId(orderId);
  saveStoredOrders(orders);
};

/**
 * Trigger full debounced auto-sync to Cloudflare with all data tables & tombstones
 */
let autoSyncTimeout: any = null;

export const triggerFullAutoSync = (immediate = false) => {
  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = null;
  }

  const execute = () => {
    checkAndAutoSync({
      posts: getStoredPosts(),
      products: getStoredProducts(),
      serviceCategories: getStoredServices(),
      reviews: getStoredReviews(),
      orders: getStoredOrders(),
      coupons: getStoredCoupons(),
      productCategories: getStoredProductCategories(),
      deletedPostIds: Array.from(getDeletedPostIds()),
      deletedProductIds: Array.from(getDeletedProductIds()),
      deletedServiceIds: Array.from(getDeletedServiceIds()),
      deletedOrderIds: Array.from(getDeletedOrderIds()),
    });
  };

  if (immediate) {
    execute();
  } else {
    autoSyncTimeout = setTimeout(execute, 300);
  }
};

/**
 * Auto sync helper - Pushes local changes up to Cloudflare
 */
export async function checkAndAutoSync(payload?: {
  posts?: Post[];
  products?: Product[];
  serviceCategories?: ServiceCategory[];
  reviews?: CustomerReview[];
  orders?: Order[];
  coupons?: Coupon[];
  productCategories?: string[];
  deletedPostIds?: string[];
  deletedProductIds?: string[];
  deletedServiceIds?: string[];
  deletedOrderIds?: string[];
}) {
  const config = getDefaultCloudflareConfig();
  if (config.workerUrl && config.autoSync !== false) {
    try {
      const fullPayload = {
        posts: payload?.posts ?? getStoredPosts(),
        products: payload?.products ?? getStoredProducts(),
        serviceCategories: payload?.serviceCategories ?? getStoredServices(),
        reviews: payload?.reviews ?? getStoredReviews(),
        orders: payload?.orders ?? getStoredOrders(),
        coupons: payload?.coupons ?? getStoredCoupons(),
        productCategories: payload?.productCategories ?? getStoredProductCategories(),
        deletedPostIds: payload?.deletedPostIds ?? Array.from(getDeletedPostIds()),
        deletedProductIds: payload?.deletedProductIds ?? Array.from(getDeletedProductIds()),
        deletedServiceIds: payload?.deletedServiceIds ?? Array.from(getDeletedServiceIds()),
        deletedOrderIds: payload?.deletedOrderIds ?? Array.from(getDeletedOrderIds()),
      };

      const res = await syncToCloudflare(config, fullPayload);
      config.lastSyncTime = new Date().toISOString();
      config.syncStatus = res.success ? "success" : "error";
      config.syncMessage = res.message;
      saveCloudflareConfig(config);
      if (res.success && res.timestamp) {
        try {
          localStorage.setItem(LAST_MUTATION_STORAGE_KEY, new Date(res.timestamp).getTime().toString());
        } catch (e) {}
      }
    } catch (e: any) {
      config.syncStatus = "error";
      config.syncMessage = `Lỗi tự động đồng bộ: ${e.message}`;
      saveCloudflareConfig(config);
    }
  }
}

/**
 * Background silent fetcher & synchronizer
 * Pulls latest published data from Cloudflare Worker and updates LocalStorage + active views
 */
let isSyncInProgress = false;

export const syncWithCloudflareSilently = async (): Promise<boolean> => {
  if (isSyncInProgress) return false;
  try {
    isSyncInProgress = true;
    const config = getDefaultCloudflareConfig();
    if (!config.workerUrl || !config.workerUrl.trim()) return false;

    const res = await fetchFromCloudflare(config);
    if (res.success && res.data) {
      const { posts, products, serviceCategories, reviews, orders, coupons, productCategories, lastUpdated } = res.data;

      // If server is completely empty (e.g. fresh DB), auto-seed server with local data!
      const isServerEmpty = (!posts || posts.length === 0) && (!products || products.length === 0);
      if (isServerEmpty) {
        console.debug("Cloudflare database is unseeded. Seeding with local baseline data...");
        triggerFullAutoSync(true);
        return true;
      }

      const lastLocalMutation = parseInt(localStorage.getItem(LAST_MUTATION_STORAGE_KEY) || "0", 10);
      const serverTimestamp = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      // Filter out any items that have been deleted locally
      const deletedPostIds = getDeletedPostIds();
      const deletedProductIds = getDeletedProductIds();
      const deletedServiceIds = getDeletedServiceIds();
      const deletedOrderIds = getDeletedOrderIds();

      const filteredPosts = Array.isArray(posts) ? posts.filter((p) => !deletedPostIds.has(p.id)) : [];
      const filteredProducts = Array.isArray(products) ? products.filter((p) => !deletedProductIds.has(p.id)) : [];
      const filteredServices = Array.isArray(serviceCategories)
        ? serviceCategories
            .filter((c) => !deletedServiceIds.has(c.id))
            .map((c) => ({
              ...c,
              services: Array.isArray(c.services)
                ? c.services.filter((s: any) => !deletedServiceIds.has(s.id))
                : [],
            }))
        : [];
      const filteredReviews = Array.isArray(reviews) ? reviews : [];
      const filteredOrders = Array.isArray(orders) ? orders.filter((o) => !deletedOrderIds.has(o.id)) : [];
      const filteredCoupons = Array.isArray(coupons) ? coupons : [];
      const filteredCategories = Array.isArray(productCategories) && productCategories.length > 0
        ? productCategories
        : getStoredProductCategories();

      // Check if server returned any zombie items that should be deleted
      const hadZombiePost = Array.isArray(posts) && posts.some((p) => deletedPostIds.has(p.id));
      const hadZombieProduct = Array.isArray(products) && products.some((p) => deletedProductIds.has(p.id));
      const hadZombieOrder = Array.isArray(orders) && orders.some((o) => deletedOrderIds.has(o.id));

      if (hadZombiePost || hadZombieProduct || hadZombieOrder) {
        console.debug("Server had deleted items. Pushing local cleanup to Cloudflare...");
        triggerFullAutoSync(true);
      }

      // Smart Union & Merge: Ensure local items created by the user are never overwritten or lost!
      const currentLocalProducts = getStoredProducts();
      const serverProductMap = new Map((filteredProducts || []).map((p) => [p.id, p]));
      const finalProducts = [...(filteredProducts || [])];
      let hasLocalOnlyProducts = false;

      for (const lp of currentLocalProducts) {
        if (!deletedProductIds.has(lp.id) && !serverProductMap.has(lp.id)) {
          finalProducts.push(lp);
          hasLocalOnlyProducts = true;
        }
      }

      const currentLocalPosts = getStoredPosts();
      const serverPostMap = new Map((filteredPosts || []).map((p) => [p.id, p]));
      const finalPosts = [...(filteredPosts || [])];
      let hasLocalOnlyPosts = false;

      for (const lp of currentLocalPosts) {
        if (!deletedPostIds.has(lp.id) && !serverPostMap.has(lp.id)) {
          finalPosts.push(lp);
          hasLocalOnlyPosts = true;
        }
      }

      // Deep Service Categories & Services Merge
      const currentLocalServices = getStoredServices();
      const serverCatMap = new Map((filteredServices || []).map((c) => [c.id, c]));
      const finalServices: ServiceCategory[] = [];
      let hasLocalOnlyServices = false;

      // 1. Process server categories and merge their services with local services
      for (const sCat of (filteredServices || [])) {
        const localCat = currentLocalServices.find((lc) => lc.id === sCat.id);
        if (!localCat) {
          finalServices.push(sCat);
        } else {
          const serverSvcMap = new Map((sCat.services || []).map((s) => [s.id, s]));
          const mergedSvcs = [...(sCat.services || [])];

          for (const localSvc of (localCat.services || [])) {
            if (!deletedServiceIds.has(localSvc.id) && !serverSvcMap.has(localSvc.id)) {
              mergedSvcs.push(localSvc);
              hasLocalOnlyServices = true;
            }
          }

          finalServices.push({
            ...sCat,
            title: localCat.title || sCat.title,
            image: localCat.image || sCat.image,
            iconName: localCat.iconName || sCat.iconName,
            services: mergedSvcs,
          });
        }
      }

      // 2. Add local-only categories that don't exist on server
      for (const lc of currentLocalServices) {
        if (!deletedServiceIds.has(lc.id) && !serverCatMap.has(lc.id)) {
          finalServices.push(lc);
          hasLocalOnlyServices = true;
        }
      }

      const currentLocalOrders = getStoredOrders();
      const serverOrderMap = new Map((filteredOrders || []).map((o) => [o.id, o]));
      const finalOrders = [...(filteredOrders || [])];
      let hasLocalOnlyOrders = false;

      for (const lo of currentLocalOrders) {
        if (!deletedOrderIds.has(lo.id) && !serverOrderMap.has(lo.id)) {
          finalOrders.push(lo);
          hasLocalOnlyOrders = true;
        }
      }

      const currentLocalCoupons = getStoredCoupons();
      const serverCouponMap = new Map((filteredCoupons || []).map((c) => [c.id, c]));
      const finalCoupons = [...(filteredCoupons || [])];
      let hasLocalOnlyCoupons = false;

      for (const lc of currentLocalCoupons) {
        if (!serverCouponMap.has(lc.id)) {
          finalCoupons.push(lc);
          hasLocalOnlyCoupons = true;
        }
      }

      const currentLocalCategories = getStoredProductCategories();
      const finalCategories = Array.from(new Set([...(filteredCategories || []), ...currentLocalCategories]));

      // Save merged collections to localStorage
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(finalPosts));
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(finalProducts));
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(finalServices));
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filteredReviews));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(finalOrders));
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(finalCoupons));
      localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(finalCategories));

      // If local had unsynced items, immediately push the complete merged state up to Cloudflare!
      if (hasLocalOnlyProducts || hasLocalOnlyPosts || hasLocalOnlyServices || hasLocalOnlyOrders || hasLocalOnlyCoupons) {
        console.debug("Found local unsynced items. Pushing complete merge to Cloudflare...");
        triggerFullAutoSync(true);
      }

      window.dispatchEvent(
        new CustomEvent(TERRE_DATA_SYNCED_EVENT, {
          detail: {
            posts: finalPosts,
            products: finalProducts,
            serviceCategories: finalServices,
            reviews: filteredReviews,
            orders: finalOrders,
            coupons: finalCoupons,
            productCategories: finalCategories,
            timestamp: lastUpdated || new Date().toISOString(),
          },
        })
      );
      return true;
    }
  } catch (e) {
    console.debug("Silent background sync from Cloudflare skipped/offline", e);
  } finally {
    isSyncInProgress = false;
  }
  return false;
};

