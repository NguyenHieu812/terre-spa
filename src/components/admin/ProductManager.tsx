import React, { useState } from "react";
import { Product } from "../../types";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Check,
  Upload,
} from "lucide-react";
import hairWashImg from "../../assets/images/spa_hair_wash_1781704187306.jpg";
import massageDetail from "../../assets/images/spa_massage_detail_1781666753905.jpg";
import facialCareImg from "../../assets/images/spa_facial_care_1781704209004.jpg";
import herbalCompressImg from "../../assets/images/spa_herbal_compress_1781885390039.jpg";
import SanhChoSangTrong from "../../assets/images/sanhchosangtrong.jpg";

interface ProductManagerProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const SPA_IMAGE_PRESETS = [
  { label: "Chăm sóc tóc", url: hairWashImg },
  { label: "Tinh dầu trị liệu", url: herbalCompressImg },
  { label: "Serum chăm sóc da", url: facialCareImg },
  { label: "Set quà tặng Spa", url: massageDetail },
  { label: "Dưỡng sinh thư giãn", url: SanhChoSangTrong },
];

const PRODUCT_CATEGORIES = [
  "Chăm sóc tóc",
  "Chăm sóc da",
  "Dưỡng sinh thư giãn",
  "Combo quà tặng",
  "Tinh dầu & Nến thơm",
];

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [ingredientInput, setIngredientInput] = useState("");
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
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: "",
      slug: "",
      category: "Chăm sóc tóc",
      price: 200000,
      originalPrice: 250000,
      thumbnail: hairWashImg,
      shortDesc: "",
      fullDesc: "",
      inStock: true,
      featured: false,
      rating: 5.0,
      reviewCount: 1,
      volumeOrWeight: "500ml",
      ingredients: ["Bồ kết", "Vỏ bưởi", "Hương nhu"],
      usageInstructions: "Thoa đều lên tóc ướt và massage nhẹ nhàng rồi xả sạch với nước.",
    };
    setEditingProduct(newProd);
    setIsCreating(true);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsCreating(false);
  };

  const handleAddIngredient = () => {
    if (!ingredientInput.trim() || !editingProduct) return;
    const current = editingProduct.ingredients || [];
    if (!current.includes(ingredientInput.trim())) {
      setEditingProduct({
        ...editingProduct,
        ingredients: [...current, ingredientInput.trim()],
      });
    }
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ingToRemove: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      ingredients: (editingProduct.ingredients || []).filter((i) => i !== ingToRemove),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 5MB. Vui lòng chọn file nhẹ hơn!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditingProduct({
          ...editingProduct,
          thumbnail: result,
        });
        showToast("Đã tải ảnh lên thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }

    const prodToSave: Product = {
      ...editingProduct,
      slug: editingProduct.slug || createSlug(editingProduct.name),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(prodToSave);
    showToast(isCreating ? "Đã thêm sản phẩm mới thành công!" : "Đã cập nhật sản phẩm thành công!");
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) {
      onDeleteProduct(id);
      showToast("Đã xóa sản phẩm.");
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.ingredients || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === "all" || prod.category === filterCategory;
    const matchesStock =
      filterStock === "all" ||
      (filterStock === "in_stock" && prod.inStock) ||
      (filterStock === "out_of_stock" && !prod.inStock);
    return matchesSearch && matchesCat && matchesStock;
  });

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // If in create or edit form
  if (editingProduct) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingProduct(null)}
              className="p-2 hover:bg-brand-100 rounded-lg text-brand-800 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">
                {isCreating ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
              </h2>
              <p className="text-xs text-brand-600">
                Cập nhật thông tin chi tiết, giá bán và hình ảnh sản phẩm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 border border-brand-300 text-brand-800 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-brand-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {isCreating ? "Thêm sản phẩm" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Product Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setEditingProduct({
                      ...editingProduct,
                      name: newName,
                      slug: isCreating || !editingProduct.slug ? createSlug(newName) : editingProduct.slug,
                    });
                  }}
                  placeholder="Vd: Dầu Gội Thảo Dược Bồ Kết Cô Đặc Terre Spa (500ml)..."
                  className="w-full px-4 py-3 text-base md:text-lg font-serif font-semibold border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-brand-950 bg-brand-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1">
                  Đường dẫn tĩnh (Slug URL)
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-brand-500 bg-brand-100/60 px-3 py-2.5 border border-r-0 border-brand-200 rounded-l-lg font-mono">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-brand-200 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-brand-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
                  Mô tả ngắn gọn (Short Description)
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                  placeholder="Mô tả tóm tắt tính năng và công dụng chính của sản phẩm..."
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-brand-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
                  Mô tả chi tiết sản phẩm (Full Description)
                </label>
                <textarea
                  rows={6}
                  value={editingProduct.fullDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDesc: e.target.value })}
                  placeholder="Chi tiết về nguồn gốc, quy trình chiết xuất thủ công, công dụng toàn diện..."
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-brand-800 bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Ingredients & Usage */}
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2">
                Thành phần thảo mộc &amp; Hướng dẫn sử dụng
              </h3>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Thành phần chính (Ingredients)
                </label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="Vd: Bồ kết nướng, Vỏ bưởi (nhấn Enter để thêm)..."
                    className="flex-1 px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-4 py-2 bg-brand-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(editingProduct.ingredients || []).map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 text-xs bg-brand-100 text-brand-900 px-3 py-1 rounded-full font-medium"
                    >
                      🌿 {ing}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing)}
                        className="hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Hướng dẫn sử dụng
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.usageInstructions || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, usageInstructions: e.target.value })
                  }
                  placeholder="Cách dùng sản phẩm để đạt hiệu quả cao nhất..."
                  className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Price & Category */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-600" /> Giá bán &amp; Phân loại
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                    Giá bán ưu đãi (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm font-bold text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600 bg-brand-50/40"
                  />
                  <p className="text-[11px] text-brand-600 mt-1">
                    Hiển thị: <strong>{formatPrice(editingProduct.price)} VNĐ</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                    Giá gốc niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editingProduct.originalPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Để trống nếu không giảm giá"
                    className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                    Dung tích / Quy cách đóng gói
                  </label>
                  <input
                    type="text"
                    value={editingProduct.volumeOrWeight || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, volumeOrWeight: e.target.value })
                    }
                    placeholder="Vd: 500ml, 100g, Hộp 30 gói"
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                    Danh mục sản phẩm
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600 bg-brand-50/50 text-brand-900 font-medium"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 space-y-2 border-t border-brand-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-800">Tình trạng còn hàng</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-700"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-800">Sản phẩm Bán Chạy / Nổi Bật</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, featured: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-800"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-brand-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-600" /> Hình ảnh đại diện
                </h3>
                {editingProduct.thumbnail && (
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, thumbnail: "" })}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Gỡ ảnh
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-brand-100 border border-brand-200 relative group flex items-center justify-center">
                  {editingProduct.thumbnail ? (
                    <img
                      src={editingProduct.thumbnail}
                      alt={editingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = hairWashImg;
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-brand-400 mx-auto mb-1" />
                      <p className="text-xs text-brand-500">Chưa có hình ảnh</p>
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
                    value={editingProduct.thumbnail}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, thumbnail: e.target.value })
                    }
                    placeholder="https://... hoặc data:image/..."
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-700 uppercase mb-1.5">
                    Hoặc chọn ảnh mẫu Spa có sẵn:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SPA_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, thumbnail: preset.url })
                        }
                        className={`text-[11px] p-1.5 text-left border rounded-lg transition-colors truncate ${
                          editingProduct.thumbnail === preset.url
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
          </div>
        </form>
      </div>
    );
  }

  // Product List View
  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-900">Quản lý Sản phẩm</h2>
          <p className="text-xs text-brand-600">
            Tổng cộng: <strong className="text-brand-900">{products.length} sản phẩm</strong>
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm mới
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            placeholder="Tìm sản phẩm theo tên, thành phần..."
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
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none bg-brand-50/50 text-brand-800 font-medium"
          >
            <option value="all">Tất cả kho hàng</option>
            <option value="in_stock">Còn hàng</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-200 space-y-3">
          <p className="text-brand-600 font-serif text-lg">Không tìm thấy sản phẩm nào.</p>
          {canCreate && (
            <button
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold hover:bg-brand-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm sản phẩm đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-800">
              <thead className="bg-brand-50/80 border-b border-brand-200 text-brand-900 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Quy cách</th>
                  <th className="p-4">Tình trạng</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-14 h-14 rounded-lg object-cover border border-brand-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = hairWashImg;
                          }}
                        />
                        <div className="space-y-1">
                          <div className="font-serif font-bold text-sm text-brand-950 line-clamp-1 hover:text-brand-700">
                            {prod.name}
                          </div>
                          <p className="text-[11px] text-brand-500 line-clamp-1">{prod.shortDesc}</p>
                          {prod.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                              <Sparkles className="w-3 h-3 text-amber-600" /> Bán chạy
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 text-[10px] font-semibold whitespace-nowrap">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-brand-900 text-sm">{formatPrice(prod.price)} đ</div>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <div className="text-[11px] text-brand-400 line-through">
                          {formatPrice(prod.originalPrice)} đ
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-brand-600 whitespace-nowrap">
                      {prod.volumeOrWeight || "—"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {prod.inStock ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold text-[11px] bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Còn hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-700 font-semibold text-[11px] bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Hết hàng
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(prod)}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            title="Xóa sản phẩm"
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
