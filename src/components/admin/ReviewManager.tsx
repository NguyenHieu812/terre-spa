import React, { useState } from "react";
import { CustomerReview, ServiceCategory } from "../../types";
import { compressImageFile } from "../../utils/imageUtils";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  CheckCircle2,
  X,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  User,
  Calendar,
  Layers,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { INITIAL_REVIEWS } from "../../data/store";

interface ReviewManagerProps {
  reviews: CustomerReview[];
  categories: ServiceCategory[];
  onSaveReviews: (reviews: CustomerReview[]) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  reviews,
  categories,
  onSaveReviews,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [toastMessage, setToastMessage] = useState("");

  // Modal State
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    author: "",
    rating: 5,
    date: "1 tuần trước",
    serviceUsed: "",
    content: "",
    avatar: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await compressImageFile(file, 400, 400, 0.8);
      setFormData((prev) => ({
        ...prev,
        avatar: result,
      }));
      showToast("Đã tải ảnh đại diện thành công!");
    } catch (err) {
      alert("Không thể tải ảnh. Vui lòng thử lại!");
    }
  };

  // Flatten all service names for quick selection
  const allServices = categories.flatMap((cat) => cat.services.map((s) => s.name));

  const handleOpenCreate = () => {
    setFormData({
      author: "",
      rating: 5,
      date: "Vừa xong",
      serviceUsed: allServices[0] || "Gội Đầu Dưỡng Sinh (60 phút)",
      content: "",
      avatar: "",
    });
    setIsCreating(true);
    setEditingReview(null);
  };

  const handleOpenEdit = (review: CustomerReview) => {
    setFormData({
      author: review.author,
      rating: review.rating,
      date: review.date,
      serviceUsed: review.serviceUsed || "",
      content: review.content,
      avatar: review.avatar || "",
    });
    setEditingReview(review);
    setIsCreating(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.content.trim()) {
      showToast("Vui lòng điền đầy đủ họ tên và nội dung đánh giá!");
      return;
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.author.trim()
    )}&background=f2e8e5&color=8c6454`;

    if (editingReview) {
      // Update existing
      const updated = reviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              author: formData.author.trim(),
              rating: Number(formData.rating),
              date: formData.date.trim() || "Vừa xong",
              serviceUsed: formData.serviceUsed.trim(),
              content: formData.content.trim(),
              avatar: formData.avatar.trim() || defaultAvatar,
            }
          : r
      );
      onSaveReviews(updated);
      showToast("Đã cập nhật đánh giá thành công!");
    } else {
      // Create new
      const newReview: CustomerReview = {
        id: `rev-${Date.now()}`,
        author: formData.author.trim(),
        rating: Number(formData.rating),
        date: formData.date.trim() || "Vừa xong",
        serviceUsed: formData.serviceUsed.trim(),
        content: formData.content.trim(),
        avatar: formData.avatar.trim() || defaultAvatar,
      };
      onSaveReviews([newReview, ...reviews]);
      showToast("Đã thêm đánh giá mới thành công!");
    }

    setEditingReview(null);
    setIsCreating(false);
  };

  const handleDeleteConfirm = (id: string | number) => {
    const updated = reviews.filter((r) => r.id !== id);
    onSaveReviews(updated);
    setDeletingId(null);
    showToast("Đã xóa đánh giá!");
  };

  const handleResetDefault = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục danh sách đánh giá mẫu ban đầu?")) {
      onSaveReviews(INITIAL_REVIEWS);
      showToast("Đã khôi phục đánh giá mẫu ban đầu!");
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchQuery =
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.serviceUsed && r.serviceUsed.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRating = ratingFilter === "all" || r.rating === ratingFilter;
    return matchQuery && matchRating;
  });

  // Calculate stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPct = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-brand-100 text-brand-800 rounded-xl">
                <MessageSquare className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-950">
                  Quản Lý Đánh Giá &amp; Cảm Nhận Khách Hàng
                </h2>
                <p className="text-xs text-brand-600">
                  Tùy chỉnh các lời nhận xét thực tế hiển thị trên Trang Chủ và Google Maps widget.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canCreate && (
              <>
                <button
                  onClick={handleResetDefault}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold transition-all border border-brand-200"
                  title="Khôi phục đánh giá mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mặc định
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm đánh giá
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                Tổng số đánh giá
              </span>
              <span className="text-2xl font-serif font-bold text-brand-950 mt-1 block">
                {totalReviews}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-800 shadow-xs">
              <MessageSquare className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                Điểm trung bình
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-serif font-bold text-brand-950">{avgRating}</span>
                <div className="flex text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-xs">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                Tỷ lệ hài lòng (5★)
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-700 mt-1 block">
                {fiveStarPct}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, nội dung hoặc gói dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-brand-50/70 border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 shrink-0 mr-1">
            Lọc sao:
          </span>
          <button
            onClick={() => setRatingFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              ratingFilter === "all"
                ? "bg-brand-900 text-white"
                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
            }`}
          >
            Tất cả ({reviews.length})
          </button>
          {[5, 4, 3].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            return (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  ratingFilter === star
                    ? "bg-brand-900 text-white"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current text-amber-400" />
                <span>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List Grid */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-brand-200 space-y-3">
          <MessageSquare className="w-10 h-10 text-brand-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-brand-900">Không tìm thấy đánh giá</h3>
          <p className="text-xs text-brand-500 max-w-sm mx-auto">
            Không có đánh giá nào khớp với từ khóa tìm kiếm hoặc bộ lọc sao của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-5 md:p-6 rounded-2xl border border-brand-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name, Rating, Date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        review.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          review.author
                        )}&background=f2e8e5&color=8c6454`
                      }
                      alt={review.author}
                      className="w-11 h-11 rounded-full object-cover border border-brand-200 shadow-xs"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-brand-950">
                        {review.author}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-current text-amber-400"
                                  : "text-brand-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-brand-500">• {review.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(review)}
                        className="p-2 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Chỉnh sửa đánh giá"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeletingId(review.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="text-[10px] text-brand-400 italic">Chỉ xem</span>
                    )}
                  </div>
                </div>

                {/* Service Used Badge */}
                {review.serviceUsed && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                    <Layers className="w-3 h-3 text-brand-600" />
                    {review.serviceUsed}
                  </div>
                )}

                {/* Content */}
                <p className="text-xs md:text-sm text-brand-800 leading-relaxed italic bg-brand-50/40 p-3.5 rounded-xl border border-brand-100">
                  "{review.content}"
                </p>
              </div>

              <div className="pt-2 border-t border-brand-50 flex items-center justify-between text-[11px] text-brand-400">
                <span>Mã: #{review.id}</span>
                <span className="font-serif italic text-brand-600">Terre Spa Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Create / Edit Review */}
      {(isCreating || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-brand-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-brand-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-100 text-brand-800 rounded-lg">
                  {editingReview ? (
                    <Edit3 className="w-4 h-4 text-brand-700" />
                  ) : (
                    <Plus className="w-4 h-4 text-brand-700" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-lg text-brand-950">
                  {editingReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingReview(null);
                }}
                className="p-1.5 text-brand-400 hover:text-brand-950 rounded-full hover:bg-brand-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Author */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Tên khách hàng *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Vd: Nguyễn Thị Mai"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Đánh giá số sao (1 - 5 Sao) *
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-brand-50 border border-brand-200 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-current text-amber-400"
                            : "text-brand-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-brand-900 ml-2">
                    {formData.rating} Sao
                  </span>
                </div>
              </div>

              {/* Service Used */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Gói dịch vụ đã trải nghiệm
                </label>
                <select
                  value={formData.serviceUsed}
                  onChange={(e) => setFormData({ ...formData, serviceUsed: e.target.value })}
                  className="w-full px-3 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="">-- Chọn gói dịch vụ có sẵn --</option>
                  {allServices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Hoặc nhập tên gói dịch vụ tùy chỉnh..."
                  value={formData.serviceUsed}
                  onChange={(e) => setFormData({ ...formData, serviceUsed: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-50/60 border border-brand-200 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Thời gian hiển thị
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Vd: 1 tuần trước, 2 ngày trước, Hôm qua..."
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Nội dung đánh giá chi tiết *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Khách hàng chia sẻ cảm nhận thực tế về liệu trình, kỹ thuật viên, không gian spa..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
                />
              </div>

              {/* Custom Avatar with Upload & Preview */}
              <div className="space-y-2 pt-2 border-t border-brand-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600" /> Ảnh đại diện khách hàng (Tùy chọn)
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: "" })}
                      className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-100 border border-brand-200 shrink-0 flex items-center justify-center">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            formData.author || "User"
                          )}&background=f2e8e5&color=8c6454`;
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-brand-700">
                        {formData.author ? formData.author.slice(0, 2).toUpperCase() : "AV"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors w-full">
                      <Upload className="w-3.5 h-3.5 text-brand-700" />
                      <span>Tải ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Hoặc dán URL link ảnh..."
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  {editingReview ? "Lưu thay đổi" : "Thêm đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-brand-950">Xóa đánh giá này?</h4>
            <p className="text-xs text-brand-600">
              Đánh giá này sẽ bị xóa khỏi danh sách hiển thị trên trang web. Bạn có chắc chắn không?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
