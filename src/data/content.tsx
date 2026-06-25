import React from "react";
import { Droplets, Leaf, Scissors, Sparkles } from "lucide-react";

import heroBg from "../assets/images/spa_hero_bg_1781666735594.jpg";
import massageDetail from "../assets/images/spa_massage_detail_1781666753905.jpg";
import hairWashImg from "../assets/images/spa_hair_wash_1781704187306.jpg";
import facialCareImg from "../assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "../assets/images/spa_herbal_compress_1781885390039.jpg";
import SanhChoSangTrong from "../assets/images/sanhchosangtrong.jpg";
import GiauKinhNghiem from "../assets/images/giaukinhnghiem.jpg";
import KhongGianHienDai from "../assets/images/khonggianhiendai.jpg";
import ThuGian from "../assets/images/thugian.jpg";
import BeforeAfter1 from "../assets/images/BA-1.jpg";
import BeforeAfter2 from "../assets/images/BA-2.jpg";
import BeforeAfter3 from "../assets/images/BA-3.jpg";
import BeforeAfter4 from "../assets/images/BA-4.jpg";
import BeforeAfter5 from "../assets/images/BA-5.jpg";
import BeforeAfter6 from "../assets/images/BA-6.jpg";
import BeforeAfter7 from "../assets/images/BA-7.jpg";
import BeforeAfter8 from "../assets/images/BA-8.jpg";
export const serviceCategories = [
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
    ],
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
    ],
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
    ],
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
    ],
  },
  {
    id: "other-services",
    title: "Dịch Vụ Khác",
    icon: <Droplets className="w-5 h-5" />,
    image: heroBg,
    services: [
      { id: "other-1", name: "Dịch Vụ Khác 1", price: "Từ 149,000", description: "Liên hệ nhân viên hỗ trợ để được tư vấn thêm." },
    ],
  }
];

export const customerReviews = [
  {
    id: 1,
    author: "Nguyễn Lê Hằng",
    rating: 5,
    date: "1 tháng trước",
    content: "Spa làm rất chuyên nghiệp. Các bạn nhân viên nhiệt tình, nhẹ nhàng. Massage cổ vai gáy xong thấy người nhẹ rỗng luôn. Không gian thơm mùi thảo mộc rất thư giãn.",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Le+Hang&background=f2e8e5&color=8c6454",
  },
  {
    id: 2,
    author: "Trần Minh Tùng",
    rating: 5,
    date: "3 tuần trước",
    content: "Mình đã trải nghiệm dịch vụ gội đầu dưỡng sinh ở đây, rất tuyệt vời. Giá cả hợp lý so với chất lượng. Chắc chắn sẽ quay lại ủng hộ các bạn.",
    avatar: "https://ui-avatars.com/api/?name=Tran+Minh+Tung&background=f2e8e5&color=8c6454",
  },
  {
    id: 3,
    author: "Bùi Thu Trà",
    rating: 5,
    date: "2 tháng trước",
    content: "Dịch vụ chăm sóc da mụn rất tốt. Các bạn lấy nhân mụn kỹ mà không bị đỏ rát nhiều. Tư vấn cũng rất có tâm, không chèo kéo mua thêm gói.",
    avatar: "https://ui-avatars.com/api/?name=Bui+Thu+Tra&background=f2e8e5&color=8c6454",
  },
  {
    id: 4,
    author: "Linh Doãn",
    rating: 5,
    date: "1 tuần trước",
    content: "Không gian trang trí rất dễ thương, có nhạc thiền êm ái. Nước ngâm chân thảo dược thơm và ấm. Cực kỳ recommend trải nghiệm thư giãn cuối tuần nha mọi người.",
    avatar: "https://ui-avatars.com/api/?name=Linh+Doan&background=f2e8e5&color=8c6454",
  },
  {
    id: 5,
    author: "Hoàng Anh",
    rating: 5,
    date: "2 tháng trước",
    content: "Spa uy tín tại khu vực Kim Giang. Các liệu trình rất rõ ràng và nhân viên ngoan, làm đúng thời gian, không ăn bớt giờ của khách.",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Anh&background=f2e8e5&color=8c6454",
  },
];

export const experienceSlides = [
  {
    img: SanhChoSangTrong,
    title: "Sảnh chờ sang trọng",
    desc: "Tại Terre Spa, mỗi liệu trình không chỉ là chăm sóc bên ngoài mà còn là chìa khóa mở ra sự bình yên trong tâm hồn. Không gian tĩnh lặng và hương thơm thảo dược hòa quyện giúp bạn thả lỏng hoàn toàn.",
    tag1: "Terre Spa",
    tag1Desc: "Phục vụ từ trái tim",
    tag2: "Dịch vụ",
    tag2Desc: "Đa dạng, chuyên nghiệp",
  },
  {
    img: GiauKinhNghiem,
    title: "Đội ngũ giàu kinh nghiệm",
    desc: "Đội ngũ chuyên gia của Terre Spa được đào tạo bài bản, có kinh nghiệm lâu năm trong lĩnh vực chăm sóc sức khỏe và sắc đẹp. Họ luôn tận tâm, chuyên nghiệp và mang đến cho khách hàng những trải nghiệm tuyệt vời nhất.",
    tag1: "Đào tạo",
    tag1Desc: "Chuyên sâu, bài bản",
    tag2: "Kinh nghiệm",
    tag2Desc: "Nhiều năm trong nghề",
  },
  {
    img: KhongGianHienDai,
    title: "Không gian hiện đại",
    desc: "Terre Spa sở hữu không gian thiết kế hiện đại, tinh tế với sự kết hợp hài hòa giữa thiên nhiên và kiến trúc. Mỗi góc nhỏ đều được chăm chút tỉ mỉ để mang đến cảm giác thư giãn và đẳng cấp cho khách hàng.",
    tag1: "Bố cục",
    tag1Desc: "Tinh tế, hài hòa",
    tag2: "Cảm giác",
    tag2Desc: "Thư giãn, đẳng cấp",
  },
  {
    img: ThuGian,
    title: "Thư giãn toàn diện",
    desc: "Massage tại Terre Spa không chỉ giúp thư giãn cơ thể mà còn là liệu pháp tinh thần, giúp giải tỏa căng thẳng và mang lại sự cân bằng cho cuộc sống hiện đại đầy áp lực.",
    tag1: "Nhiệt",
    tag1Desc: "Xoa dịu cơ bắp",
    tag2: "Sức khỏe",
    tag2Desc: "Phục hồi sinh lực",
  },
];

export const beforeAfterStories = [
  {
    id: "story-1",
    name: "Chị Thanh Hằng",
    service: "Chăm da mụn chuyên sâu",
    duration: "Sau 4 buổi",
    beAndAf: BeforeAfter1,
    notes: "Tình trạng viêm đỏ giảm rõ rệt, lỗ chân lông se khít, da sáng và đều màu hơn.",
  },
  {
    id: "story-2",
    name: "Bạn Minh Châu",
    service: "Phục hồi da yếu",
    duration: "Sau 3 tuần",
    beAndAf: BeforeAfter2,
    notes: "Độ ẩm cải thiện, da đều màu, không còn bong tróc và ửng đỏ."
  },
  {
    id: "story-3",
    name: "Anh Bảo",
    service: "Nâng cơ trẻ hóa Terre",
    duration: "Sau 6 tuần",
    beAndAf: BeforeAfter3,
    notes: "Da nâng cơ thấy rõ, đường nét gương mặt thon gọn, sắc tố đồng đều."
  },
  {
    id: "story-4",
    name: "Chị Hoa",
    service: "Cấp ẩm chuyên sâu",
    duration: "Sau 2 liệu trình",
    beAndAf: BeforeAfter4,
    notes: "Làn da căng bóng, nếp nhăn nhỏ mờ hẳn, bề mặt da mềm và đàn hồi tốt."
  },
  {
    id: "story-5",
    name: "Chị Hồng",
    service: "Cấp ẩm chuyên sâu",
    duration: "Sau 2 liệu trình",
    beAndAf: BeforeAfter5,
    notes: "Làn da căng bóng, nếp nhăn nhỏ mờ hẳn, bề mặt da mềm và đàn hồi tốt."
  },
  {
    id: "story-6",
    name: "Chị Liễu",
    service: "Cấp ẩm chuyên sâu",
    duration: "Sau 2 liệu trình",
    beAndAf: BeforeAfter6,
    notes: "Làn da căng bóng, nếp nhăn nhỏ mờ hẳn, bề mặt da mềm và đàn hồi tốt."
  },
  {
    id: "story-7",
    name: "Chị Đào",
    service: "Cấp ẩm chuyên sâu",
    duration: "Sau 2 liệu trình",
    beAndAf: BeforeAfter7,
    notes: "Làn da căng bóng, nếp nhăn nhỏ mờ hẳn, bề mặt da mềm và đàn hồi tốt."
  },
  {
    id: "story-8",
    name: "Chị Nụ",
    service: "Cấp ẩm chuyên sâu",
    duration: "Sau 2 liệu trình",
    beAndAf: BeforeAfter8,
    notes: "Làn da căng bóng, nếp nhăn nhỏ mờ hẳn, bề mặt da mềm và đàn hồi tốt."
  },
];

export type BeforeAfterStory = (typeof beforeAfterStories)[number];
