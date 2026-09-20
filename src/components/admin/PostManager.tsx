import React, { useState } from "react";
import { Post } from "../../types";
import { WysiwygEditor } from "./WysiwygEditor";
import { compressImageFile } from "../../utils/imageUtils";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import hairWashImg from "../../assets/images/spa_hair_wash_1781704187306.jpg";
import massageDetail from "../../assets/images/spa_massage_detail_1781666753905.jpg";
import facialCareImg from "../../assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "../../assets/images/spa_herbal_compress_1781885390039.jpg";

interface PostManagerProps {
  posts: Post[];
  onSavePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const SPA_IMAGE_PRESETS = [
  { label: "Gội đầu thảo dược", url: hairWashImg },
  { label: "Massage trị liệu", url: massageDetail },
  { label: "Chăm sóc da mặt", url: facialCareImg },
  { label: "Chườm ấm thảo dược", url: herbalCompressImg },
];

const CATEGORIES = [
  "Dưỡng Sinh",
  "Chăm Sóc Da",
  "Thư Giãn & Trị Liệu",
  "Cẩm Nang Spa",
  "Khuyến Mãi & Sự Kiện",
];

export const PostManager: React.FC<PostManagerProps> = ({
  posts,
  onSavePost,
  onDeletePost,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tagInput, setTagInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const createSlug = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleStartCreate = () => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "<h2>Giới thiệu bài viết</h2><p>Bắt đầu viết nội dung chất lượng cao cho Terre Spa...</p>",
      coverImage: hairWashImg,
      category: "Dưỡng Sinh",
      tags: ["Terre Spa", "Dưỡng sinh"],
      author: {
        name: "Terre Spa Team",
        role: "Chuyên viên Chăm sóc Sức khỏe",
      },
      status: "published",
      publishedAt: new Date().toISOString(),
      featured: false,
      views: 1,
    };
    setEditingPost(newPost);
    setIsCreating(true);
  };

  const handleStartEdit = (post: Post) => {
    setEditingPost({ ...post });
    setIsCreating(false);
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingPost) return;
    if (!editingPost.tags.includes(tagInput.trim())) {
      setEditingPost({
        ...editingPost,
        tags: [...editingPost.tags, tagInput.trim()],
      });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      tags: editingPost.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;
    try {
      const result = await compressImageFile(file);
      setEditingPost({
        ...editingPost,
        coverImage: result,
      });
      showToast("Đã tải ảnh bài viết thành công!");
    } catch (err) {
      alert("Không thể tải ảnh. Vui lòng thử lại với ảnh khác!");
    }
  };

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!editingPost || !editingPost.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    const postToSave: Post = {
      ...editingPost,
      slug: editingPost.slug || createSlug(editingPost.title),
      updatedAt: new Date().toISOString(),
    };

    onSavePost(postToSave);
    showToast(isCreating ? "Đã thêm bài viết mới thành công!" : "Đã cập nhật bài viết thành công!");
    setEditingPost(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) {
      onDeletePost(id);
      showToast("Đã xóa bài viết.");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === "all" || post.category === filterCategory;
    const matchesStat = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  // If in create or edit mode
  if (editingPost) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="p-2 hover:bg-brand-100 rounded-lg text-brand-800 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">
                {isCreating ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
              </h2>
              <p className="text-xs text-brand-600">
                Soạn thảo nội dung phong phú với trình soạn thảo WYSIWYG chuyên nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 border border-brand-300 text-brand-800 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-brand-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {isCreating ? "Đăng bài viết" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  required
                  value={editingPost.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setEditingPost({
                      ...editingPost,
                      title: newTitle,
                      slug: isCreating || !editingPost.slug ? createSlug(newTitle) : editingPost.slug,
                    });
                  }}
                  placeholder="Vd: 5 Bước Gội Đầu Dưỡng Sinh Tại Nhà Chuẩn Spa..."
                  className="w-full px-4 py-3 text-base md:text-lg font-serif font-semibold border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-brand-950 bg-brand-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1">
                  Đường dẫn tĩnh (Slug URL)
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-brand-500 bg-brand-100/60 px-3 py-2.5 border border-r-0 border-brand-200 rounded-l-lg font-mono">
                    /posts/
                  </span>
                  <input
                    type="text"
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-brand-200 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-brand-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
                  Tóm tắt ngắn (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Mô tả ngắn gọn xuất hiện trên thẻ bài viết và mạng xã hội..."
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-brand-800 bg-white"
                />
              </div>
            </div>

            {/* WYSIWYG Editor */}
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800">
                  Nội dung chi tiết (WYSIWYG Rich Editor) *
                </label>
                <span className="text-[11px] text-brand-500 font-medium">
                  Định dạng bài viết chuẩn SEO &amp; chèn hình ảnh
                </span>
              </div>
              <WysiwygEditor
                value={editingPost.content}
                onChange={(content) => setEditingPost({ ...editingPost, content })}
                minHeight="420px"
              />
            </div>
          </div>

          {/* Sidebar Settings (1 col) */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" /> Trạng thái &amp; Xuất bản
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={editingPost.status}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        status: e.target.value as "published" | "draft",
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600 bg-brand-50/50 text-brand-900 font-medium"
                  >
                    <option value="published">🟢 Đã xuất bản (Công khai)</option>
                    <option value="draft">🟡 Bản nháp (Ẩn)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-brand-800">Đặt làm Bài viết Nổi Bật</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPost.featured || false}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, featured: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-800"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                    Chuyên mục
                  </label>
                  <select
                    value={editingPost.category}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600 bg-brand-50/50 text-brand-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-brand-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-600" /> Ảnh đại diện bài viết
                </h3>
                {editingPost.coverImage && (
                  <button
                    type="button"
                    onClick={() => setEditingPost({ ...editingPost, coverImage: "" })}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Gỡ ảnh
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-brand-100 border border-brand-200 relative group flex items-center justify-center">
                  {editingPost.coverImage ? (
                    <img
                      src={editingPost.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = hairWashImg;
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-brand-400 mx-auto mb-1" />
                      <p className="text-xs text-brand-500">Chưa có ảnh bài viết</p>
                    </div>
                  )}
                </div>

                {/* Upload from device */}
                <div>
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-brand-700" />
                    <span>Tải ảnh từ máy tính / điện thoại</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1">
                    Hoặc nhập link ảnh (URL):
                  </label>
                  <input
                    type="text"
                    value={editingPost.coverImage}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, coverImage: e.target.value })
                    }
                    placeholder="https://... hoặc data:image/..."
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1.5">
                    Hoặc chọn nhanh ảnh mẫu Spa có sẵn:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SPA_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setEditingPost({ ...editingPost, coverImage: preset.url })
                        }
                        className={`text-[11px] p-1.5 text-left border rounded-lg transition-colors truncate ${
                          editingPost.coverImage === preset.url
                            ? "bg-brand-800 text-white border-brand-800 font-medium"
                            : "border-brand-200 hover:border-brand-600 hover:bg-brand-50 text-brand-900"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Author & Tags */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Tác giả &amp; Thẻ
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1">
                    Tên tác giả
                  </label>
                  <input
                    type="text"
                    value={editingPost.author.name}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        author: { ...editingPost.author, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1">
                    Chức danh / Vai trò
                  </label>
                  <input
                    type="text"
                    value={editingPost.author.role || ""}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        author: { ...editingPost.author, role: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1">
                    Thẻ từ khóa (Tags)
                  </label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Nhập tag rồi ấn Enter..."
                      className="flex-1 px-3 py-1.5 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-brand-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Thêm
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {editingPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post List View
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-900">Quản lý Bài viết &amp; Blog</h2>
          <p className="text-xs text-brand-600">
            Tổng cộng: <strong className="text-brand-900">{posts.length} bài viết</strong>
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Viết bài mới (WYSIWYG)
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, từ khóa, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none bg-brand-50/50 text-brand-800 font-medium"
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none bg-brand-50/50 text-brand-800 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Post Table / Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-200 space-y-3">
          <p className="text-brand-600 font-serif text-lg">Không tìm thấy bài viết nào phù hợp.</p>
          {canCreate && (
            <button
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold hover:bg-brand-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tạo bài viết đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-800">
              <thead className="bg-brand-50/80 border-b border-brand-200 text-brand-900 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Bài viết</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Tác giả</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày đăng</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-14 h-14 rounded-lg object-cover border border-brand-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = hairWashImg;
                          }}
                        />
                        <div className="space-y-1">
                          <div className="font-serif font-bold text-sm text-brand-950 line-clamp-1 hover:text-brand-700">
                            {post.title}
                          </div>
                          <p className="text-[11px] text-brand-500 line-clamp-1">{post.excerpt}</p>
                          {post.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                              <Sparkles className="w-3 h-3 text-amber-600" /> Nổi bật
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 text-[10px] font-semibold whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-brand-900">{post.author.name}</div>
                      <div className="text-[10px] text-brand-500">{post.author.role}</div>
                    </td>
                    <td className="p-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold text-[11px] bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold text-[11px] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-brand-600 whitespace-nowrap">
                      {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/posts/${post.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Xem bài viết công khai"
                          className="p-1.5 text-brand-600 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(post)}
                            title="Chỉnh sửa bài viết"
                            className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id, post.title)}
                            title="Xóa bài viết"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-[10px] text-brand-400 italic">Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
