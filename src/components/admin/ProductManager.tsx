import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { compressImageFile } from "../../utils/imageUtils";
import {
  getStoredProductCategories,
  addProductCategory,
} from "../../data/store";
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
  Eye,
  X,
  Globe,
  Sliders,
  Percent,
  Layers,
  ShoppingBag,
  Phone,
  HelpCircle,
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
  { label: "Kem phục hồi da", url: facialCareImg },
  { label: "Chăm sóc tóc & Gội", url: hairWashImg },
  { label: "Tinh dầu trị liệu", url: herbalCompressImg },
  { label: "Set quà tặng Spa", url: massageDetail },
  { label: "Dưỡng sinh thư giãn", url: SanhChoSangTrong },
];

const WEIGHT_PRESET_UNITS = ["ml", "g", "kg", "lít", "Gói", "Hộp", "Chai", "Tuýp", "Set"];

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
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [ingredientInput, setIngredientInput] = useState("");
  const [isBulkIngredients, setIsBulkIngredients] = useState(false);
  const [bulkIngredientsText, setBulkIngredientsText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Dynamic categories
  const [categories, setCategories] = useState<string[]>(() => getStoredProductCategories());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Volume / Weight builder
  const [volumeAmount, setVolumeAmount] = useState<string>("");
  const [volumeUnit, setVolumeUnit] = useState<string>("ml");

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
    const defaultCat = categories[0] || "Chăm sóc da";
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: "",
      slug: "",
      category: defaultCat,
      price: 189000,
      originalPrice: 250000,
      thumbnail: facialCareImg,
      images: [facialCareImg],
      shortDesc: "",
      fullDesc: "",
      inStock: true,
      featured: false,
      rating: 5.0,
      reviewCount: 1,
      volumeOrWeight: "25g",
      ingredients: ["Chiết xuất rau má Centella", "D-Panthenol (Vitamin B5)", "Hyaluronic Acid"],
      usageInstructions: "Làm sạch vùng da, thoa đều một lượng vừa đủ và vỗ nhẹ cho thẩm thấu.",
      metaTitle: "",
      metaDescription: "",
    };
    setEditingProduct(newProd);
    setIsCreating(true);
    setIsBulkIngredients(false);
    setBulkIngredientsText(newProd.ingredients?.join(", ") || "");
    setVolumeAmount("25");
    setVolumeUnit("g");
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsCreating(false);
    setIsBulkIngredients(false);
    setBulkIngredientsText(prod.ingredients?.join(", ") || "");

    // Parse volume amount & unit if matched
    const vw = prod.volumeOrWeight || "";
    const match = vw.match(/^(\d+(?:\.\d+)?)\s*([a-zA-ZÀ-ỹ]+.*)$/);
    if (match) {
      setVolumeAmount(match[1]);
      setVolumeUnit(match[2].trim());
    } else {
      setVolumeAmount("");
      setVolumeUnit(vw);
    }
  };

  // Fast Comma / Semicolon Ingredients Parser
  const handleProcessIngredientsInput = (val: string) => {
    if (!editingProduct) return;

    // Check if contains delimiter (comma, semicolon, or newline)
    if (val.includes(",") || val.includes(";") || val.includes("\n")) {
      const parts = val
        .split(/[,;\n]/)
        .map((p) => p.trim())
        .filter(Boolean);

      const current = editingProduct.ingredients || [];
      const newItems = Array.from(new Set([...current, ...parts]));
      setEditingProduct({
        ...editingProduct,
        ingredients: newItems,
      });
      setBulkIngredientsText(newItems.join(", "));
      setIngredientInput("");
    } else {
      setIngredientInput(val);
    }
  };

  const handleAddSingleIngredient = () => {
    if (!ingredientInput.trim() || !editingProduct) return;
    const parts = ingredientInput
      .split(/[,;\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    const current = editingProduct.ingredients || [];
    const newItems = Array.from(new Set([...current, ...parts]));
    setEditingProduct({
      ...editingProduct,
      ingredients: newItems,
    });
    setBulkIngredientsText(newItems.join(", "));
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ingToRemove: string) => {
    if (!editingProduct) return;
    const updated = (editingProduct.ingredients || []).filter((i) => i !== ingToRemove);
    setEditingProduct({
      ...editingProduct,
      ingredients: updated,
    });
    setBulkIngredientsText(updated.join(", "));
  };

  const handleSaveBulkIngredients = (text: string) => {
    setBulkIngredientsText(text);
    if (!editingProduct) return;
    const items = text
      .split(/[,;\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const deduplicated = Array.from(new Set(items));
    setEditingProduct({
      ...editingProduct,
      ingredients: deduplicated,
    });
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const updated = addProductCategory(newCategoryName.trim());
    setCategories(updated);
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, category: newCategoryName.trim() });
    }
    setNewCategoryName("");
    setIsAddingCategory(false);
    showToast(`Đã thêm danh mục mới: "${newCategoryName.trim()}"`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      const result = await compressImageFile(file);
      setEditingProduct({
        ...editingProduct,
        thumbnail: result,
      });
      showToast("Đã tải ảnh lên thành công!");
    } catch (err) {
      alert("Không thể tải ảnh. Vui lòng thử lại!");
    }
  };

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }

    const finalSlug = editingProduct.slug ? createSlug(editingProduct.slug) : createSlug(editingProduct.name);

    const prodToSave: Product = {
      ...editingProduct,
      slug: finalSlug,
      metaTitle: editingProduct.metaTitle?.trim() || `${editingProduct.name} Chính Hãng | Terre Spa`,
      metaDescription: editingProduct.metaDescription?.trim() || editingProduct.shortDesc || `Sản phẩm ${editingProduct.name} thảo mộc thiên nhiên tại Terre Spa.`,
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(prodToSave);
    showToast(isCreating ? "Đã thêm sản phẩm mới thành công!" : "Đã cập nhật sản phẩm thành công!");
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      showToast(`Đã xóa sản phẩm "${productToDelete.name}" thành công!`);
      if (editingProduct?.id === productToDelete.id) {
        setEditingProduct(null);
        setIsCreating(false);
      }
      setProductToDelete(null);
    }
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Discount % computation
  const calcDiscountPercent = (orig?: number, curr?: number) => {
    if (!orig || !curr || orig <= curr) return 0;
    return Math.round(((orig - curr) / orig) * 100);
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

  // ==========================================
  // VIEW: EDIT / CREATE PRODUCT FORM
  // ==========================================
  if (editingProduct) {
    const currentDiscount = calcDiscountPercent(editingProduct.originalPrice, editingProduct.price);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
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
                Cập nhật thông tin chi tiết, giá bán, SEO Google và hình ảnh sản phẩm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewProduct(editingProduct)}
              className="px-3.5 py-2 border border-brand-300 text-brand-800 hover:bg-brand-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="w-4 h-4 text-brand-700" /> Xem trước (Preview)
            </button>

            {!isCreating && canDelete && (
              <button
                type="button"
                onClick={() => handleDeleteClick(editingProduct.id, editingProduct.name || "Sản phẩm")}
                className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                title="Xóa sản phẩm này"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            )}

            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 border border-brand-300 text-brand-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-100 transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {isCreating ? "Thêm sản phẩm" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Basic info */}
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
                      metaTitle: !editingProduct.metaTitle || editingProduct.metaTitle === `${editingProduct.name} Chính Hãng | Terre Spa`
                        ? `${newName} Chính Hãng | Terre Spa`
                        : editingProduct.metaTitle,
                    });
                  }}
                  placeholder="Vd: BISA DERMA HamadLAB 25g – Kem Phục Hồi, Làm Dịu & Dưỡng Ẩm Da..."
                  className="w-full px-4 py-3 text-base md:text-lg font-serif font-semibold border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-brand-950 bg-brand-50/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-800">
                    Đường dẫn tĩnh (Slug URL thân thiện SEO)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, slug: createSlug(editingProduct.name) })}
                    className="text-[11px] text-brand-600 hover:text-brand-900 font-medium underline"
                  >
                    Tạo lại từ tên SP
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-brand-500 bg-brand-100/60 px-3 py-2.5 border border-r-0 border-brand-200 rounded-l-xl font-mono">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-brand-200 rounded-r-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-brand-800 bg-white"
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
                  className="w-full px-3.5 py-2.5 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-brand-800 bg-white"
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
                  className="w-full px-3.5 py-2.5 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-brand-800 bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Fast Ingredients & Usage */}
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-brand-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" /> Thành phần thảo mộc &amp; Hướng dẫn sử dụng
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBulkIngredients(!isBulkIngredients)}
                  className="text-xs text-brand-700 hover:text-brand-950 font-semibold flex items-center gap-1 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isBulkIngredients ? "Nhập từng thành phần" : "Nhập nhanh cả danh sách (Dấu phẩy)"}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Thành phần chính (Tự động nhận diện khi gõ dấu phẩy ",")
                </label>

                {isBulkIngredients ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={bulkIngredientsText}
                      onChange={(e) => handleSaveBulkIngredients(e.target.value)}
                      placeholder="Dán hoặc gõ danh sách thành phần cách nhau dấu phẩy: Rau má Centella, Vitamin B5, Hyaluronic Acid..."
                      className="w-full px-3.5 py-2 text-xs border border-brand-300 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20 font-medium"
                    />
                    <p className="text-[11px] text-brand-500 italic">
                      Mẹo: Nhập hoặc dán trực tiếp nhiều thành phần ngăn cách bởi dấu phẩy, hệ thống sẽ tự động tách thành phần.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={ingredientInput}
                        onChange={(e) => handleProcessIngredientsInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddSingleIngredient();
                          }
                        }}
                        placeholder="Gõ thành phần (cách nhau dấu phẩy hoặc nhấn Enter để thêm)..."
                        className="flex-1 px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddSingleIngredient}
                        className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-brand-900"
                      >
                        Thêm
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2.5 bg-brand-50/50 rounded-xl border border-brand-100">
                      {(editingProduct.ingredients || []).length === 0 ? (
                        <span className="text-xs text-brand-400 italic">Chưa có thành phần nào</span>
                      ) : (
                        (editingProduct.ingredients || []).map((ing) => (
                          <span
                            key={ing}
                            className="inline-flex items-center gap-1.5 text-xs bg-white border border-brand-200 text-brand-900 px-3 py-1 rounded-full font-medium shadow-2xs"
                          >
                            🌿 {ing}
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(ing)}
                              className="hover:text-red-600 font-bold ml-0.5 text-brand-400 hover:scale-110"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
                  className="w-full px-3.5 py-2.5 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            {/* 3. SEO Settings (Google Title & Meta Description) */}
            <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-brand-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" /> Tối ưu hóa SEO Google (Meta Title &amp; Description)
                </h3>
                <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-semibold border border-green-200">
                  Chuẩn SEO
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider">
                      Tiêu đề SEO (Meta Title)
                    </label>
                    <span className="text-[11px] text-brand-500">
                      {editingProduct.metaTitle?.length || 0}/60 ký tự (Khuyên dùng: 50-60)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editingProduct.metaTitle || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, metaTitle: e.target.value })}
                    placeholder="Vd: Kem Phục Hồi Da BISA DERMA HamadLAB 25g Chính Hãng | Terre Spa"
                    className="w-full px-3.5 py-2.5 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider">
                      Mô tả SEO (Meta Description)
                    </label>
                    <span className="text-[11px] text-brand-500">
                      {editingProduct.metaDescription?.length || 0}/160 ký tự (Khuyên dùng: 140-160)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={editingProduct.metaDescription || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, metaDescription: e.target.value })}
                    placeholder="Mô tả hấp dẫn xuất hiện dưới tiêu đề trên trang tìm kiếm Google..."
                    className="w-full px-3.5 py-2.5 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/20"
                  />
                </div>

                {/* Google Search Result Preview */}
                <div className="p-4 bg-brand-50/60 rounded-xl border border-brand-200/80 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1">
                    Xem trước kết quả tìm kiếm Google (Google SERP Snippet)
                  </p>
                  <div className="text-xs text-emerald-800 flex items-center gap-1 font-mono truncate">
                    https://terre-spa.vercel.app/products/{editingProduct.slug || "slug-san-pham"}
                  </div>
                  <div className="text-sm md:text-base text-blue-800 font-medium hover:underline cursor-pointer line-clamp-1">
                    {editingProduct.metaTitle || `${editingProduct.name || "Tên sản phẩm"} | Terre Spa`}
                  </div>
                  <div className="text-xs text-brand-700 line-clamp-2 leading-relaxed">
                    {editingProduct.metaDescription || editingProduct.shortDesc || "Khám phá các sản phẩm thảo dược và chăm sóc phục hồi da chuẩn spa từ Terre Spa."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Price & Discount */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-900 border-b border-brand-100 pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-600" /> Giá bán &amp; % Giảm giá
              </h3>

              <div className="space-y-3.5">
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
                    className="w-full px-3.5 py-2 text-sm font-bold text-brand-900 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
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
                    className="w-full px-3.5 py-2 text-sm border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                </div>

                {/* Live Discount calculation badge */}
                {currentDiscount > 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
                    <span className="font-semibold flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-red-600" /> Tag khuyến mãi:
                    </span>
                    <span className="px-2.5 py-0.5 bg-red-600 text-white font-bold rounded-md">
                      -{currentDiscount}% SALE
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-brand-400 italic">
                    (Nhập Giá gốc cao hơn Giá bán để tự động hiển thị tag % SALE)
                  </p>
                )}

                {/* Weight / Volume selector */}
                <div className="pt-2 border-t border-brand-100">
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                    Dung tích / Quy cách đóng gói
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Số lượng (vd: 25, 500...)"
                      value={volumeAmount}
                      onChange={(e) => {
                        const amt = e.target.value;
                        setVolumeAmount(amt);
                        setEditingProduct({
                          ...editingProduct,
                          volumeOrWeight: amt ? `${amt}${volumeUnit}` : volumeUnit,
                        });
                      }}
                      className="w-24 px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Quy cách đầy đủ"
                      value={editingProduct.volumeOrWeight || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, volumeOrWeight: e.target.value })
                      }
                      className="flex-1 px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {WEIGHT_PRESET_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          setVolumeUnit(u);
                          const combined = volumeAmount ? `${volumeAmount}${u}` : u;
                          setEditingProduct({ ...editingProduct, volumeOrWeight: combined });
                        }}
                        className={`px-2 py-1 text-[11px] rounded-lg border transition-all ${
                          editingProduct.volumeOrWeight?.includes(u)
                            ? "bg-brand-900 text-white border-brand-900 font-semibold"
                            : "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category with creation */}
                <div className="pt-2 border-t border-brand-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider">
                      Danh mục sản phẩm
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-[11px] text-brand-800 hover:text-brand-950 font-bold flex items-center gap-1 underline"
                    >
                      <Plus className="w-3 h-3" /> Tạo mới
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 space-y-2 mb-2">
                      <span className="text-[11px] font-bold text-brand-900 block">Tạo danh mục mới:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Vd: Mỹ phẩm sinh học..."
                          className="flex-1 px-2.5 py-1.5 text-xs border border-brand-200 rounded-lg focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategorySubmit}
                          className="px-3 py-1.5 bg-brand-800 text-white text-xs font-bold rounded-lg"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/50 text-brand-900 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock & Featured */}
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
                  <ImageIcon className="w-4 h-4 text-brand-600" /> Hình ảnh sản phẩm
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
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-brand-100 border border-brand-200 relative group flex items-center justify-center shadow-inner">
                  {editingProduct.thumbnail ? (
                    <img
                      src={editingProduct.thumbnail}
                      alt={editingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = facialCareImg;
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
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors shadow-xs">
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
                    className="w-full px-3 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600"
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
                        className={`text-[11px] p-2 text-left border rounded-xl transition-colors truncate ${
                          editingProduct.thumbnail === preset.url
                            ? "bg-brand-800 text-white border-brand-800 font-semibold"
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

        {/* Live Preview Modal */}
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-brand-200">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-brand-900 rounded-full shadow-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column (Image) */}
              <div className="md:w-1/2 bg-brand-100 relative shrink-0 min-h-[300px] md:min-h-[480px]">
                <img
                  src={previewProduct.thumbnail || facialCareImg}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
                {previewProduct.featured && (
                  <span className="absolute top-4 left-4 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                  </span>
                )}
                {calcDiscountPercent(previewProduct.originalPrice, previewProduct.price) > 0 && (
                  <span className="absolute top-4 right-14 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    -{calcDiscountPercent(previewProduct.originalPrice, previewProduct.price)}% SALE
                  </span>
                )}
              </div>

              {/* Right Column (Info) */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">
                      {previewProduct.category}
                    </span>
                    {previewProduct.volumeOrWeight && (
                      <span className="text-xs bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full font-semibold">
                        {previewProduct.volumeOrWeight}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-950 leading-snug">
                    {previewProduct.name || "Tên sản phẩm mẫu"}
                  </h2>

                  <div className="flex items-baseline gap-3 pb-3 border-b border-brand-100">
                    <span className="text-2xl font-bold text-brand-900 font-serif">
                      {formatPrice(previewProduct.price)} VNĐ
                    </span>
                    {previewProduct.originalPrice && previewProduct.originalPrice > previewProduct.price && (
                      <span className="text-sm text-brand-400 line-through">
                        {formatPrice(previewProduct.originalPrice)} VNĐ
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-700 leading-relaxed">
                    {previewProduct.shortDesc || previewProduct.fullDesc || "Chưa có mô tả chi tiết sản phẩm."}
                  </p>

                  {/* Ingredients */}
                  {previewProduct.ingredients && previewProduct.ingredients.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block">
                        Thành phần thảo mộc:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {previewProduct.ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="text-[11px] bg-brand-100 text-brand-900 px-2.5 py-0.5 rounded-md font-medium"
                          >
                            🌿 {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Usage instructions */}
                  {previewProduct.usageInstructions && (
                    <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-xs text-brand-800 space-y-1">
                      <span className="font-bold text-brand-900">Hướng dẫn sử dụng:</span>
                      <p>{previewProduct.usageInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-between text-xs text-brand-500">
                  <span>Xem trước hiển thị trên giao diện khách hàng</span>
                  <button
                    type="button"
                    onClick={() => setPreviewProduct(null)}
                    className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase"
                  >
                    Đóng xem trước
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: PRODUCT TABLE LIST
  // ==========================================
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
            {categories.map((c) => (
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold hover:bg-brand-200 transition-colors"
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
                  <th className="p-4">Giá bán &amp; % Giảm</th>
                  <th className="p-4">Quy cách</th>
                  <th className="p-4">Tình trạng</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredProducts.map((prod) => {
                  const discount = calcDiscountPercent(prod.originalPrice, prod.price);
                  return (
                    <tr key={prod.id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.thumbnail}
                            alt={prod.name}
                            className="w-14 h-14 rounded-xl object-cover border border-brand-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = facialCareImg;
                            }}
                          />
                          <div className="space-y-1">
                            <div className="font-serif font-bold text-sm text-brand-950 line-clamp-1 hover:text-brand-700">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-brand-500 font-mono line-clamp-1">
                              /products/{prod.slug || prod.id}
                            </div>
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
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-brand-900 text-sm">{formatPrice(prod.price)} đ</div>
                          {discount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              -{discount}%
                            </span>
                          )}
                        </div>
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
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(prod)}
                            title="Xem trước sản phẩm"
                            className="p-1.5 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                              onClick={() => handleDeleteClick(prod.id, prod.name)}
                              title="Xóa sản phẩm"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-brand-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-900">Xác nhận xóa sản phẩm</h3>
                <p className="text-xs text-brand-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-sm text-brand-700 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong className="text-brand-950 font-bold">"{productToDelete.name}"</strong>?
              Sản phẩm sẽ bị gỡ bỏ vĩnh viễn khỏi website và cơ sở dữ liệu.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal (Table view) */}
      {previewProduct && !editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-brand-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewProduct(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-brand-900 rounded-full shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column (Image) */}
            <div className="md:w-1/2 bg-brand-100 relative shrink-0 min-h-[300px] md:min-h-[480px]">
              <img
                src={previewProduct.thumbnail || facialCareImg}
                alt={previewProduct.name}
                className="w-full h-full object-cover"
              />
              {previewProduct.featured && (
                <span className="absolute top-4 left-4 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Bán chạy
                </span>
              )}
              {calcDiscountPercent(previewProduct.originalPrice, previewProduct.price) > 0 && (
                <span className="absolute top-4 right-14 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  -{calcDiscountPercent(previewProduct.originalPrice, previewProduct.price)}% SALE
                </span>
              )}
            </div>

            {/* Right Column (Info) */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between space-y-5">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">
                    {previewProduct.category}
                  </span>
                  {previewProduct.volumeOrWeight && (
                    <span className="text-xs bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full font-semibold">
                      {previewProduct.volumeOrWeight}
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-950 leading-snug">
                  {previewProduct.name}
                </h2>

                <div className="flex items-baseline gap-3 pb-3 border-b border-brand-100">
                  <span className="text-2xl font-bold text-brand-900 font-serif">
                    {formatPrice(previewProduct.price)} VNĐ
                  </span>
                  {previewProduct.originalPrice && previewProduct.originalPrice > previewProduct.price && (
                    <span className="text-sm text-brand-400 line-through">
                      {formatPrice(previewProduct.originalPrice)} VNĐ
                    </span>
                  )}
                </div>

                <p className="text-xs text-brand-700 leading-relaxed">
                  {previewProduct.shortDesc || previewProduct.fullDesc}
                </p>

                {/* Ingredients */}
                {previewProduct.ingredients && previewProduct.ingredients.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block">
                      Thành phần thảo mộc:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewProduct.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-[11px] bg-brand-100 text-brand-900 px-2.5 py-0.5 rounded-md font-medium"
                        >
                          🌿 {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage instructions */}
                {previewProduct.usageInstructions && (
                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-xs text-brand-800 space-y-1">
                    <span className="font-bold text-brand-900">Hướng dẫn sử dụng:</span>
                    <p>{previewProduct.usageInstructions}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-brand-100 flex items-center justify-between text-xs text-brand-500">
                <span>Xem trước hiển thị trên giao diện khách hàng</span>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase"
                >
                  Đóng xem trước
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
