import React, { useState } from "react";
import { ServiceCategory, SpaService } from "../../types";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Scissors,
  Sparkles,
  Leaf,
  Droplets,
  Heart,
  Image as ImageIcon,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";
import hairWashImg from "../../assets/images/spa_hair_wash_1781704187306.jpg";
import massageDetail from "../../assets/images/spa_massage_detail_1781666753905.jpg";
import facialCareImg from "../../assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "../../assets/images/spa_herbal_compress_1781885390039.jpg";
import heroBg from "../../assets/images/spa_hero_bg_1781666735594.jpg";

interface ServiceManagerProps {
  categories: ServiceCategory[];
  onSaveCategories: (categories: ServiceCategory[]) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Scissors: <Scissors className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Leaf: <Leaf className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
};

const SPA_IMAGE_PRESETS = [
  { label: "Gội đầu & Dưỡng sinh", url: hairWashImg },
  { label: "Massage & Bấm huyệt", url: massageDetail },
  { label: "Chăm sóc da mặt", url: facialCareImg },
  { label: "Thảo dược & Chườm ấm", url: herbalCompressImg },
  { label: "Không gian Spa tổng thể", url: heroBg },
];

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  categories,
  onSaveCategories,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Edit/Create Service State
  const [editingService, setEditingService] = useState<SpaService | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");

  // Edit/Create Category State
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 5MB. Vui lòng chọn file nhẹ hơn!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditingCategory({
          ...editingCategory,
          image: result,
        });
        showToast("Đã tải ảnh danh mục thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleServiceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 5MB. Vui lòng chọn file nhẹ hơn!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditingService({
          ...editingService,
          image: result,
        });
        showToast("Đã tải ảnh dịch vụ thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Service Handlers
  const handleStartCreateService = (categoryId: string) => {
    setTargetCategoryId(categoryId);
    setEditingService({
      id: `svc-${Date.now()}`,
      name: "",
      price: "199,000",
      description: "",
      categoryId: categoryId,
      durationMinutes: 60,
    });
    setIsCreatingService(true);
  };

  const handleStartEditService = (service: SpaService, categoryId: string) => {
    setTargetCategoryId(categoryId);
    setEditingService({ ...service, categoryId });
    setIsCreatingService(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name.trim()) {
      alert("Vui lòng nhập tên gói dịch vụ.");
      return;
    }

    const updatedCategories = categories.map((cat) => {
      // Remove from old category if moved
      const filteredServices = cat.services.filter((s) => s.id !== editingService.id);

      if (cat.id === targetCategoryId) {
        return {
          ...cat,
          services: isCreatingService
            ? [...filteredServices, editingService]
            : [...filteredServices, editingService],
        };
      }
      return { ...cat, services: filteredServices };
    });

    onSaveCategories(updatedCategories);
    showToast(isCreatingService ? "Đã thêm gói dịch vụ mới!" : "Đã cập nhật gói dịch vụ!");
    setEditingService(null);
    setIsCreatingService(false);
  };

  const handleDeleteService = (serviceId: string, serviceName: string, categoryId: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa gói dịch vụ "${serviceName}"?`)) {
      const updatedCategories = categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            services: cat.services.filter((s) => s.id !== serviceId),
          };
        }
        return cat;
      });
      onSaveCategories(updatedCategories);
      showToast("Đã xóa gói dịch vụ.");
    }
  };

  // Category Handlers
  const handleStartCreateCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      title: "",
      iconName: "Sparkles",
      image: hairWashImg,
      services: [],
    });
    setIsCreatingCategory(true);
  };

  const handleStartEditCategory = (category: ServiceCategory) => {
    setEditingCategory({ ...category });
    setIsCreatingCategory(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.title.trim()) {
      alert("Vui lòng nhập tên danh mục dịch vụ.");
      return;
    }

    let updated: ServiceCategory[];
    if (isCreatingCategory) {
      updated = [...categories, editingCategory];
    } else {
      updated = categories.map((c) => (c.id === editingCategory.id ? editingCategory : c));
    }

    onSaveCategories(updated);
    showToast(isCreatingCategory ? "Đã thêm danh mục mới!" : "Đã cập nhật danh mục!");
    setEditingCategory(null);
    setIsCreatingCategory(false);
  };

  const handleDeleteCategory = (categoryId: string, categoryTitle: string) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa danh mục "${categoryTitle}" và toàn bộ các gói dịch vụ bên trong không?`
      )
    ) {
      const updated = categories.filter((c) => c.id !== categoryId);
      onSaveCategories(updated);
      showToast("Đã xóa danh mục dịch vụ.");
    }
  };

  // Filter services by search query
  const totalServiceCount = categories.reduce((acc, cat) => acc + cat.services.length, 0);

  // If in Edit/Create Service Mode
  if (editingService) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingService(null)}
              className="p-2 hover:bg-brand-100 rounded-lg text-brand-800 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <h2 className="text-xl font-serif font-bold text-brand-900">
              {isCreatingService ? "Thêm gói dịch vụ mới" : "Chỉnh sửa gói dịch vụ"}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="px-4 py-2 border border-brand-300 text-brand-800 rounded-lg text-xs font-semibold uppercase tracking-wider"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveService}
              className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Lưu gói dịch vụ
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveService} className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
              Tên gói dịch vụ *
            </label>
            <input
              type="text"
              required
              value={editingService.name}
              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
              placeholder="Vd: Gội Đầu Dưỡng Sinh (60 phút) hoặc Chăm sóc da mụn chuyên sâu..."
              className="w-full px-4 py-2.5 text-sm font-semibold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                Giá dịch vụ (Hiển thị) *
              </label>
              <input
                type="text"
                required
                value={editingService.price}
                onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                placeholder="Vd: 199,000 hoặc Từ 1,000,000"
                className="w-full px-4 py-2.5 text-sm font-bold text-brand-900 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                Danh mục dịch vụ *
              </label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/50 text-brand-900 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
              Mô tả chi tiết liệu trình *
            </label>
            <textarea
              rows={3}
              required
              value={editingService.description}
              onChange={(e) =>
                setEditingService({ ...editingService, description: e.target.value })
              }
              placeholder="Mô tả các bước thực hiện, công dụng và thảo dược sử dụng trong gói dịch vụ..."
              className="w-full px-4 py-2.5 text-xs leading-relaxed border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
            />
          </div>

          {/* Optional Service Image */}
          <div className="pt-2 border-t border-brand-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" /> Hình ảnh minh họa gói dịch vụ (Tùy chọn)
              </label>
              {editingService.image && (
                <button
                  type="button"
                  onClick={() => setEditingService({ ...editingService, image: undefined })}
                  className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" /> Gỡ ảnh
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <div className="aspect-16/10 w-full rounded-xl overflow-hidden bg-brand-100 border border-brand-200 flex items-center justify-center">
                  {editingService.image ? (
                    <img
                      src={editingService.image}
                      alt={editingService.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = hairWashImg;
                      }}
                    />
                  ) : (
                    <div className="text-center p-3">
                      <ImageIcon className="w-6 h-6 text-brand-400 mx-auto mb-1" />
                      <p className="text-[11px] text-brand-500">Chưa có ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2.5">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-brand-700" />
                  <span>Tải ảnh từ máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleServiceFileUpload}
                  />
                </label>

                <input
                  type="text"
                  value={editingService.image || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, image: e.target.value })
                  }
                  placeholder="Hoặc dán URL link ảnh..."
                  className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                />

                <div className="flex flex-wrap gap-1">
                  {SPA_IMAGE_PRESETS.slice(0, 3).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingService({ ...editingService, image: p.url })}
                      className="text-[10px] px-2 py-1 border border-brand-200 rounded-md hover:bg-brand-50 text-brand-800"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // If in Edit/Create Category Mode
  if (editingCategory) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingCategory(null)}
              className="p-2 hover:bg-brand-100 rounded-lg text-brand-800 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <h2 className="text-xl font-serif font-bold text-brand-900">
              {isCreatingCategory ? "Thêm danh mục dịch vụ mới" : "Chỉnh sửa danh mục"}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="px-4 py-2 border border-brand-300 text-brand-800 rounded-lg text-xs font-semibold uppercase tracking-wider"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveCategory}
              className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Lưu danh mục
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveCategory} className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
              Tên danh mục dịch vụ *
            </label>
            <input
              type="text"
              required
              value={editingCategory.title}
              onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
              placeholder="Vd: Gội Đầu & Dưỡng Sinh, Massage Thư Giãn, Chăm Sóc Da..."
              className="w-full px-4 py-2.5 text-sm font-semibold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
              Biểu tượng (Icon)
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ICON_MAP).map((iconKey) => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setEditingCategory({ ...editingCategory, iconName: iconKey })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    editingCategory.iconName === iconKey
                      ? "bg-brand-800 text-white border-brand-800 shadow-sm"
                      : "bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100"
                  }`}
                >
                  {ICON_MAP[iconKey]}
                  <span>{iconKey}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" /> Hình ảnh đại diện danh mục
              </label>
              {editingCategory.image && (
                <button
                  type="button"
                  onClick={() => setEditingCategory({ ...editingCategory, image: "" })}
                  className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" /> Gỡ ảnh
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="aspect-16/9 w-full rounded-xl overflow-hidden bg-brand-100 border border-brand-200 flex items-center justify-center">
                {editingCategory.image ? (
                  <img
                    src={editingCategory.image}
                    alt={editingCategory.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroBg;
                    }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-8 h-8 text-brand-400 mx-auto mb-1" />
                    <p className="text-xs text-brand-500">Chưa có ảnh danh mục</p>
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div>
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-brand-700" />
                  <span>Tải ảnh từ máy tính / điện thoại</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCategoryFileUpload}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1">
                  Hoặc nhập link ảnh (URL):
                </label>
                <input
                  type="text"
                  value={editingCategory.image}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  placeholder="https://... hoặc data:image/..."
                  className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1.5">
                  Hoặc chọn ảnh mẫu Spa có sẵn:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SPA_IMAGE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, image: p.url })}
                      className={`text-[11px] p-2 text-left border rounded-lg transition-colors truncate ${
                        editingCategory.image === p.url
                          ? "bg-brand-800 text-white border-brand-800 font-medium"
                          : "border-brand-200 hover:border-brand-600 hover:bg-brand-50 text-brand-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Main List View
  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-900">Quản lý Gói Dịch Vụ Spa</h2>
          <p className="text-xs text-brand-600">
            Tổng cộng: <strong className="text-brand-900">{categories.length} danh mục</strong> ·{" "}
            <strong className="text-brand-900">{totalServiceCount} gói dịch vụ</strong>
          </p>
        </div>

        {canCreate && (
          <div className="flex gap-2">
            <button
              onClick={handleStartCreateCategory}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-brand-300 hover:bg-brand-100 text-brand-900 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm Danh Mục
            </button>
          </div>
        )}
      </div>

      {/* Category & Services List */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl border border-brand-200 shadow-xs overflow-hidden"
          >
            {/* Category Header */}
            <div className="bg-brand-50/80 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-brand-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white border border-brand-200 text-brand-800 rounded-xl shadow-2xs">
                  {ICON_MAP[category.iconName || "Sparkles"] || <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-brand-950">{category.title}</h3>
                  <span className="text-[11px] text-brand-500 font-medium">
                    {category.services.length} gói dịch vụ
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => handleStartCreateService(category.id)}
                    className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm gói
                  </button>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEditCategory(category)}
                    title="Chỉnh sửa danh mục"
                    className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id, category.title)}
                    title="Xóa danh mục"
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Services Table inside Category */}
            {category.services.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-500">
                Chưa có gói dịch vụ nào trong danh mục này. {canCreate && 'Nhấn "+ Thêm gói" để tạo mới.'}
              </div>
            ) : (
              <div className="divide-y divide-brand-100">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-50/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-sm text-brand-950">{service.name}</h4>
                        <span className="font-serif font-bold text-brand-800 text-xs bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                          {service.price} VNĐ
                        </span>
                      </div>
                      <p className="text-xs text-brand-600 leading-relaxed max-w-3xl">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleStartEditService(service, category.id)}
                          className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          title="Sửa gói dịch vụ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id, service.name, category.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa gói dịch vụ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-[10px] text-brand-400 italic">Chỉ xem</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
