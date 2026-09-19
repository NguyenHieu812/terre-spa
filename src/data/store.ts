import { Post, Product, ServiceCategory, SpaService, CloudflareConfig, CustomerReview } from "../types";
import {
  getDefaultCloudflareConfig,
  saveCloudflareConfig,
  syncToCloudflare,
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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Dầu Gội Thảo Dược Bồ Kết Cô Đặc Terre Spa (500ml)",
    slug: "dau-goi-thao-duoc-bo-ket-co-dac-terre-spa",
    category: "Chăm sóc tóc",
    price: 260000,
    originalPrice: 320000,
    thumbnail: hairWashImg,
    shortDesc: "Nấu cô đặc thủ công từ quả bồ kết nướng, vỏ bưởi, hương nhu, cỏ mần trầu giúp giảm rụng tóc, sạch gàu ngứa và kích mọc tóc con.",
    fullDesc: "Sản phẩm dầu gội thiên nhiên thuần chay với 100% thảo mộc tự nhiên Việt Nam. Công thức cô đặc độc quyền từ Terre Spa không chứa Silicon, không Sulfate, không Paraben, an toàn tuyệt đối cho mẹ bầu và da đầu nhạy cảm.",
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    volumeOrWeight: "500ml",
    ingredients: ["Bồ kết nướng", "Vỏ bưởi da xanh", "Hương nhu trắng", "Cỏ mần trầu", "Hà thủ ô", "Sả chanh"],
    usageInstructions: "Làm ướt tóc, lấy 1 lượng vừa đủ tạo bọt nhẹ và massage đều khắp da đầu trong 3-5 phút, sau đó xả sạch với nước.",
  },
  {
    id: "prod-2",
    name: "Tinh Dầu Bưởi Hồng Kích Mọc & Dưỡng Tóc Terre Herbal (100ml)",
    slug: "tinh-dau-buoi-hong-kich-moc-duong-toc-terre",
    category: "Chăm sóc tóc",
    price: 185000,
    originalPrice: 220000,
    thumbnail: herbalCompressImg,
    shortDesc: "Xịt dưỡng kích thích mọc tóc nhanh, làm dày chân tóc, nuôi dưỡng sợi tóc chắc khỏe từ gốc.",
    fullDesc: "Chiết xuất tinh dầu vỏ bưởi hồng nguyên chất kết hợp tinh chất hoa cam và Vitamin B5. Dạng xịt phun sương siêu mịn, thẩm thấu ngay vào nang tóc mà không gây bết dính.",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 36,
    volumeOrWeight: "100ml",
    ingredients: ["Tinh dầu vỏ bưởi hồng ép lạnh", "Hydrosol hoa bưởi", "D-Panthenol (Vitamin B5)", "Tinh dầu tràm trà"],
    usageInstructions: "Xịt trực tiếp vào chân tóc và da đầu khi tóc sạch (khô hoặc ẩm), massage nhẹ nhàng 2 phút. Dùng 2 lần/ngày sáng và tối.",
  },
  {
    id: "prod-3",
    name: "Serum Thảo Mộc Phục Hồi Da Chuyên Sâu Terre Glow Essence",
    slug: "serum-thao-moc-phuc-hoi-da-chuyen-sau-terre-glow",
    category: "Chăm sóc da",
    price: 490000,
    originalPrice: 650000,
    thumbnail: facialCareImg,
    shortDesc: "Phục hồi làn da mỏng đỏ, làm dịu kích ứng, cấp ẩm sâu và củng cố hàng rào bảo vệ da với chiết xuất rau má lên men.",
    fullDesc: "Serum cao cấp ứng dụng tại các phòng điều trị Terre Spa. Cung cấp phức hợp rau má Madagascar, Hyaluronic Acid đa phân tử và Ceramide NP, giúp làm dịu tức thì tình trạng ửng đỏ, tăng độ đàn hồi và giúp da căng bóng tự nhiên.",
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 29,
    volumeOrWeight: "50ml",
    ingredients: ["Centella Asiatica Extract 65%", "Hyaluronic Acid Multi-weight", "Ceramide NP", "Madecassoside", "Niacinamide 2%"],
    usageInstructions: "Sau bước toner/nước hoa hồng, nhỏ 3-4 giọt thoa đều khắp mặt và vỗ nhẹ cho dưỡng chất thẩm thấu.",
  },
  {
    id: "prod-4",
    name: "Cao Thảo Dược Ngâm Chân Dưỡng Sinh Đông Y Terre Relax (Hộp 30 gói)",
    slug: "cao-thao-duoc-ngam-chan-duong-sinh-terre-relax",
    category: "Dưỡng sinh thư giãn",
    price: 150000,
    thumbnail: SanhChoSangTrong,
    shortDesc: "Thảo dược ngâm chân khử hàn, kích thích huyệt Dũng Tuyền, giải tỏa mệt mỏi và hỗ trợ giấc ngủ sâu.",
    fullDesc: "Gói bột thảo mộc tự nhiên bao gồm gừng gió, quế chi, ngải cứu, ngải diệp, hoa hồi. Khi ngâm trong nước ấm giúp lưu thông khí huyết toàn thân, giảm tê bì chân tay và lạnh chân vào mùa đông.",
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 52,
    volumeOrWeight: "Hộp 30 gói túi lọc",
    ingredients: ["Gừng gió", "Quế chi", "Ngải cứu sao vàng", "Hoa hồi", "Muối khoáng biển hồng"],
    usageInstructions: "Hãm 1-2 túi lọc trong 1-2 lít nước sôi 5 phút, sau đó pha thêm nước ấm ngâm chân 20-30 phút trước khi đi ngủ.",
  },
  {
    id: "prod-5",
    name: "Set Quà Tặng Thư Giãn Cao Cấp Terre Deluxe Spa Giftset",
    slug: "set-qua-tang-thu-gian-cao-cap-terre-deluxe",
    category: "Combo quà tặng",
    price: 890000,
    originalPrice: 1150000,
    thumbnail: massageDetail,
    shortDesc: "Hộp quà sang trọng gồm Dầu gội bồ kết 500ml + Tinh dầu bưởi 100ml + Nến thơm thảo mộc cao cấp + Túi chườm mắt thảo dược.",
    fullDesc: "Món quà tinh tế và ý nghĩa dành tặng người thân, đối tác, bạn bè. Được đóng gói trong hộp quà cao cấp dập nhũ vàng Terre Spa, mang trọn vẹn trải nghiệm thư thái tại spa về nhà.",
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 19,
    volumeOrWeight: "Set 4 món",
    ingredients: ["Trọn bộ sản phẩm organic chăm sóc thân & tâm"],
    usageInstructions: "Bộ sản phẩm có hướng dẫn sử dụng chi tiết đính kèm trong hộp quà.",
  },
  {
    id: "prod-6",
    name: "Kem Chống Nắng Vật Lý Thảo Mộc Dịu Nhẹ SPF50+ PA++++ (60g)",
    slug: "kem-chong-nang-vat-ly-thao-moc-terre-spf50",
    category: "Chăm sóc da",
    price: 380000,
    thumbnail: facialCareImg,
    shortDesc: "Chống nắng phổ rộng bảo vệ da toàn diện, kiềm dầu thoáng mịn, nâng tone tự nhiên không gây vệt trắng.",
    fullDesc: "Kem chống nắng 100% màng lọc khoáng chất vô cơ an toàn cho da mụn và da nhạy cảm sau trị liệu. Tích hợp chiết xuất trà xanh và cúc la mã giúp làm mát da dưới nắng hè.",
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 23,
    volumeOrWeight: "60g",
    ingredients: ["Zinc Oxide 15%", "Titanium Dioxide", "Green Tea Extract", "Chamomile Flower Water"],
    usageInstructions: "Thoa đều trước khi ra ngoài 15-20 phút. Thoa lại sau mỗi 3-4 giờ nếu hoạt động nhiều ngoài trời.",
  },
];

// Helper functions for Services & Categories
export const getStoredServices = (): ServiceCategory[] => {
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load services from LocalStorage", e);
  }
  return INITIAL_SERVICE_CATEGORIES;
};

export const saveStoredServices = (serviceCategories: ServiceCategory[]): void => {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(serviceCategories));
    // Trigger auto-sync to Cloudflare if enabled
    checkAndAutoSync({ posts: getStoredPosts(), products: getStoredProducts(), serviceCategories });
  } catch (e) {
    console.error("Failed to save services to LocalStorage", e);
  }
};

// Helper functions for Posts
export const getStoredPosts = (): Post[] => {
  try {
    const saved = localStorage.getItem(POSTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load posts from LocalStorage", e);
  }
  return INITIAL_POSTS;
};

export const saveStoredPosts = (posts: Post[]): void => {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    // Trigger auto-sync to Cloudflare if enabled
    checkAndAutoSync({ posts, products: getStoredProducts(), serviceCategories: getStoredServices() });
  } catch (e) {
    console.error("Failed to save posts to LocalStorage", e);
  }
};

// Helper functions for Products
export const getStoredProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load products from LocalStorage", e);
  }
  return INITIAL_PRODUCTS;
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    // Trigger auto-sync to Cloudflare if enabled
    checkAndAutoSync({ posts: getStoredPosts(), products, serviceCategories: getStoredServices() });
  } catch (e) {
    console.error("Failed to save products to LocalStorage", e);
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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load reviews from LocalStorage", e);
  }
  return INITIAL_REVIEWS;
};

export const saveStoredReviews = (reviews: CustomerReview[]): void => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error("Failed to save reviews to LocalStorage", e);
  }
};

/**
 * Auto sync helper
 */
async function checkAndAutoSync(payload: { posts: Post[]; products: Product[]; serviceCategories?: ServiceCategory[] }) {
  const config = getDefaultCloudflareConfig();
  if (config.workerUrl && config.autoSync) {
    try {
      await syncToCloudflare(config, payload);
      config.lastSyncTime = new Date().toISOString();
      config.syncStatus = "success";
      config.syncMessage = "Tự động đồng bộ thành công";
      saveCloudflareConfig(config);
    } catch (e: any) {
      config.syncStatus = "error";
      config.syncMessage = `Lỗi tự động đồng bộ: ${e.message}`;
      saveCloudflareConfig(config);
    }
  }
}
