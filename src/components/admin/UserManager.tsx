import React, { useState } from "react";
import { AdminUser, AdminPermissions, CrudPermission } from "../../types";
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  Sliders,
  Check,
  Info,
} from "lucide-react";
import {
  updateUserPermissions,
  updateUserDetails,
  addAdminUser,
  deleteAdminUser,
  resetDefaultAdminUsers,
  FULL_PERMISSIONS,
} from "../../services/authStore";

interface UserManagerProps {
  users: AdminUser[];
  currentUser: AdminUser;
  onRefreshUsers: () => void;
}

const MODULE_DEFINITIONS: {
  key: keyof Omit<AdminPermissions, "cloudflare">;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    key: "orders",
    label: "Đơn Hàng & Xử Lý Đơn",
    icon: "📦",
    desc: "Xem đơn, cập nhật trạng thái đơn, xóa đơn và mở lại đơn đã chốt",
  },
  {
    key: "coupons",
    label: "Mã Ưu Đãi & Khuyến Mãi",
    icon: "🏷️",
    desc: "Tạo và cấu hình mã giảm giá, voucher chiết khấu",
  },
  {
    key: "products",
    label: "Sản Phẩm Spa",
    icon: "🛍️",
    desc: "Quản lý mỹ phẩm, combo quà tặng, tinh dầu",
  },
  {
    key: "services",
    label: "Gói Dịch Vụ",
    icon: "💆‍♀️",
    desc: "Danh mục và các gói trị liệu gội đầu, massage, dưỡng sinh",
  },
  {
    key: "posts",
    label: "Bài Viết & Blog",
    icon: "📝",
    desc: "Tin tức, bài viết kiến thức chăm sóc sức khỏe & spa",
  },
  {
    key: "reviews",
    label: "Đánh Giá Khách Hàng",
    icon: "⭐",
    desc: "Feedback, nhận xét thực tế và điểm số đánh giá từ khách",
  },
];

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentUser,
  onRefreshUsers,
}) => {
  const [toastMessage, setToastMessage] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Permission Editing Modal
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<AdminUser | null>(null);
  const [tempPermissions, setTempPermissions] = useState<AdminPermissions | null>(null);

  // Edit User Details Modal
  const [editingDetailsUser, setEditingDetailsUser] = useState<AdminUser | null>(null);
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    username: "",
    password: "",
    isActive: true,
  });

  // Create User Modal
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    name: "",
    password: "",
  });

  // Delete Confirmation Modal
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Open Permission Modal
  const handleOpenPermissions = (user: AdminUser) => {
    setEditingPermissionsUser(user);
    setTempPermissions(JSON.parse(JSON.stringify(user.permissions)));
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (
    moduleKey: keyof Omit<AdminPermissions, "cloudflare">,
    action: string
  ) => {
    if (!tempPermissions) return;
    const currentModule = tempPermissions[moduleKey] as any;
    const updatedModule = {
      ...currentModule,
      [action]: !currentModule[action],
    };

    // If unchecking 'view', disable create/edit/delete/revertFinishedStatus automatically
    if (action === "view" && currentModule.view) {
      updatedModule.create = false;
      updatedModule.edit = false;
      updatedModule.delete = false;
      if ("revertFinishedStatus" in updatedModule) {
        updatedModule.revertFinishedStatus = false;
      }
    }
    // If enabling any sub-action, ensure 'view' is true
    if (action !== "view" && !currentModule.view) {
      updatedModule.view = true;
    }

    setTempPermissions({
      ...tempPermissions,
      [moduleKey]: updatedModule,
    });
  };

  const handleSavePermissions = () => {
    if (!editingPermissionsUser || !tempPermissions) return;
    const res = updateUserPermissions(editingPermissionsUser.id, tempPermissions);
    if (res.success) {
      showToast(res.message);
      onRefreshUsers();
      setEditingPermissionsUser(null);
      setTempPermissions(null);
    } else {
      alert(res.message);
    }
  };

  // Apply Quick Permission Preset
  const handleApplyPreset = (presetType: "full" | "readonly" | "products" | "services" | "sales") => {
    if (!tempPermissions) return;
    if (presetType === "full") {
      setTempPermissions({
        orders: { view: true, create: true, edit: true, delete: true, revertFinishedStatus: true },
        coupons: { view: true, create: true, edit: true, delete: true },
        posts: { view: true, create: true, edit: true, delete: true },
        products: { view: true, create: true, edit: true, delete: true },
        services: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, create: true, edit: true, delete: true },
        cloudflare: { view: true, sync: true },
      });
    } else if (presetType === "readonly") {
      setTempPermissions({
        orders: { view: true, create: false, edit: false, delete: false, revertFinishedStatus: false },
        coupons: { view: true, create: false, edit: false, delete: false },
        posts: { view: true, create: false, edit: false, delete: false },
        products: { view: true, create: false, edit: false, delete: false },
        services: { view: true, create: false, edit: false, delete: false },
        reviews: { view: true, create: false, edit: false, delete: false },
        cloudflare: { view: false, sync: false },
      });
    } else if (presetType === "products") {
      setTempPermissions({
        orders: { view: true, create: true, edit: true, delete: false, revertFinishedStatus: false },
        coupons: { view: true, create: true, edit: true, delete: false },
        posts: { view: true, create: true, edit: true, delete: false },
        products: { view: true, create: true, edit: true, delete: true },
        services: { view: false, create: false, edit: false, delete: false },
        reviews: { view: true, create: false, edit: false, delete: false },
        cloudflare: { view: false, sync: false },
      });
    } else if (presetType === "services") {
      setTempPermissions({
        orders: { view: false, create: false, edit: false, delete: false, revertFinishedStatus: false },
        coupons: { view: false, create: false, edit: false, delete: false },
        posts: { view: false, create: false, edit: false, delete: false },
        products: { view: false, create: false, edit: false, delete: false },
        services: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, create: true, edit: true, delete: true },
        cloudflare: { view: false, sync: false },
      });
    } else if (presetType === "sales") {
      setTempPermissions({
        orders: { view: true, create: true, edit: true, delete: false, revertFinishedStatus: false },
        coupons: { view: true, create: true, edit: true, delete: false },
        posts: { view: false, create: false, edit: false, delete: false },
        products: { view: true, create: false, edit: false, delete: false },
        services: { view: false, create: false, edit: false, delete: false },
        reviews: { view: false, create: false, edit: false, delete: false },
        cloudflare: { view: false, sync: false },
      });
    }
  };

  // Open Edit Details Modal
  const handleOpenEditDetails = (user: AdminUser) => {
    setEditingDetailsUser(user);
    setDetailsForm({
      name: user.name,
      username: user.username,
      password: user.password,
      isActive: user.isActive !== false,
    });
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDetailsUser) return;
    const res = updateUserDetails(editingDetailsUser.id, {
      name: detailsForm.name.trim(),
      username: detailsForm.username.trim(),
      password: detailsForm.password.trim(),
      isActive: detailsForm.isActive,
    });

    if (res.success) {
      showToast(res.message);
      onRefreshUsers();
      setEditingDetailsUser(null);
    } else {
      alert(res.message);
    }
  };

  // Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username.trim() || !createForm.password.trim()) {
      alert("Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!");
      return;
    }

    const res = addAdminUser({
      username: createForm.username.trim(),
      name: createForm.name.trim() || `Admin ${createForm.username.trim()}`,
      password: createForm.password.trim(),
      role: "sub_admin",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        createForm.username.trim()
      )}&background=8c6454&color=ffffff`,
      permissions: {
        posts: { view: true, create: false, edit: false, delete: false },
        products: { view: true, create: false, edit: false, delete: false },
        services: { view: false, create: false, edit: false, delete: false },
        reviews: { view: false, create: false, edit: false, delete: false },
        cloudflare: { view: false, sync: false },
      },
    });

    if (res.success) {
      showToast(res.message);
      onRefreshUsers();
      setIsCreating(false);
      setCreateForm({ username: "", name: "", password: "" });
    } else {
      alert(res.message);
    }
  };

  // Delete User
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteAdminUser(deletingUser.id);
    if (res.success) {
      showToast(res.message);
      onRefreshUsers();
      setDeletingUser(null);
    } else {
      alert(res.message);
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn khôi phục danh sách và mật khẩu ban đầu của admin1, admin2, admin3 không?"
      )
    ) {
      resetDefaultAdminUsers();
      onRefreshUsers();
      showToast("Đã khôi phục tài khoản mặc định!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-5">
          <Sparkles className="w-4 h-4 text-brand-300" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-brand-900">
              Quản Lý Tài Khoản &amp; Phân Quyền
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-800 text-white text-[11px] font-bold tracking-wider">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-xs text-brand-600 mt-0.5">
            Admin 1 toàn quyền xem thông tin mật khẩu, thêm sửa xóa và điều chỉnh quyền truy cập của các Admin phụ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 border border-brand-300 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Khôi phục tài khoản mặc định (admin1, admin2, admin3)"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" /> Thêm Admin Phụ
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Đặc quyền quản trị tối cao của Admin 1:</p>
          <p className="text-amber-800 leading-relaxed">
            • Bạn có thể xem mật khẩu hiện tại của các tài khoản Admin phụ bên dưới bất kỳ lúc nào bằng cách bấm vào biểu tượng con mắt.<br />
            • Khi bạn tắt quyền "Xem" ở mục nào, tab đó sẽ <strong>hoàn toàn ẩn đi</strong> đối với Admin phụ.<br />
            • Khi bạn bật quyền "Xem" nhưng tắt quyền "Thêm/Sửa/Xóa", Admin phụ chỉ có thể đọc dữ liệu mà <strong>không thể bấm nút chỉnh sửa hoặc xóa</strong>.
          </p>
        </div>
      </div>

      {/* Accounts List Table */}
      <div className="bg-white rounded-2xl border border-brand-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-brand-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-brand-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" /> Danh sách tài khoản quản trị ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-50/70 text-brand-800 uppercase tracking-wider font-semibold border-b border-brand-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Tài khoản &amp; Họ tên</th>
                <th className="py-3.5 px-4">Tên đăng nhập</th>
                <th className="py-3.5 px-4">Mật khẩu</th>
                <th className="py-3.5 px-4">Cấp bậc</th>
                <th className="py-3.5 px-4">Quyền truy cập</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {users.map((u) => {
                const isSuper = u.role === "super_admin" || u.username === "admin1";
                const isCurrent = u.id === currentUser.id;
                const isVisible = visiblePasswords[u.id];

                return (
                  <tr key={u.id} className="hover:bg-brand-50/40 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}`}
                          alt={u.username}
                          className="w-9 h-9 rounded-full border border-brand-200 object-cover shrink-0"
                        />
                        <div>
                          <div className="font-bold text-brand-950 flex items-center gap-1.5 text-sm">
                            {u.name}
                            {isCurrent && (
                              <span className="text-[10px] bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded font-medium">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-brand-500">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-4 font-mono font-bold text-brand-900">
                      {u.username}
                    </td>

                    {/* Password */}
                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-2 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 w-fit">
                        <span className="text-xs font-semibold text-brand-900">
                          {isVisible ? u.password : "••••••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-brand-500 hover:text-brand-800 transition-colors"
                          title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          👑 Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-800">
                          🛡️ Admin Phụ
                        </span>
                      )}
                    </td>

                    {/* Permissions summary */}
                    <td className="py-4 px-4">
                      {isSuper ? (
                        <span className="text-green-700 font-bold text-[11px]">Toàn quyền 100%</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {MODULE_DEFINITIONS.map((m) => {
                            const modPerm = u.permissions[m.key];
                            if (!modPerm?.view) return null;
                            const actions = [];
                            if (modPerm.create) actions.push("Thêm");
                            if (modPerm.edit) actions.push("Sửa");
                            if (modPerm.delete) actions.push("Xóa");

                            return (
                              <span
                                key={m.key}
                                className="text-[10px] bg-brand-50 border border-brand-200 text-brand-900 px-2 py-0.5 rounded"
                              >
                                {m.icon} {m.label}: {actions.length > 0 ? actions.join("+") : "Xem"}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <XCircle className="w-3.5 h-3.5" /> Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isSuper && (
                          <button
                            type="button"
                            onClick={() => handleOpenPermissions(u)}
                            className="p-2 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                            title="Phân quyền chi tiết cho Admin này"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditDetails(u)}
                          className="p-2 text-brand-700 hover:text-brand-950 hover:bg-brand-100 rounded-lg transition-colors"
                          title="Sửa thông tin / Đổi mật khẩu"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!isSuper && (
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa tài khoản admin này"
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

      {/* MODAL PHÂN QUYỀN CHI TIẾT (PERMISSION MATRIX) */}
      {editingPermissionsUser && tempPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-brand-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-brand-50 border-b border-brand-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-800 text-white rounded-xl shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-brand-950">
                    Phân Quyền Cho Tài Khoản: {editingPermissionsUser.name}
                  </h3>
                  <p className="text-xs text-brand-600 font-mono">
                    Username: @{editingPermissionsUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="text-brand-400 hover:text-brand-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-[11px] font-bold text-brand-800 uppercase tracking-wider mb-2">
                  Chọn nhanh mẫu phân quyền (Preset):
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("full")}
                    className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold"
                  >
                    👑 Toàn quyền
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("sales")}
                    className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold"
                  >
                    🛒 Bán Hàng &amp; Xử Lý Đơn (Không xóa / Không mở lại đơn)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("products")}
                    className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold"
                  >
                    🛍️ Quản lý Sản Phẩm &amp; Bài Viết
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("services")}
                    className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold"
                  >
                    💆‍♀️ Quản lý Dịch Vụ &amp; Đánh Giá
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("readonly")}
                    className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg text-xs font-semibold"
                  >
                    👁️ Chỉ được xem (Read-only)
                  </button>
                </div>
              </div>

              {/* Module Matrix */}
              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-brand-800 uppercase tracking-wider">
                  Cài đặt chi tiết từng Module:
                </label>

                <div className="space-y-3">
                  {MODULE_DEFINITIONS.map((mod) => {
                    const perm = (tempPermissions as any)[mod.key];

                    return (
                      <div
                        key={mod.key}
                        className={`p-4 rounded-2xl border transition-all ${
                          perm.view
                            ? "bg-white border-brand-200 shadow-xs"
                            : "bg-brand-50/50 border-brand-100 opacity-70"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{mod.icon}</span>
                            <div>
                              <h4 className="font-bold text-sm text-brand-950">{mod.label}</h4>
                              <p className="text-[11px] text-brand-500">{mod.desc}</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.view}
                              onChange={() => handleTogglePermission(mod.key, "view")}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-800"></div>
                            <span className="ml-2 text-xs font-semibold text-brand-900">
                              {perm.view ? "Cho phép truy cập" : "Ẩn Module"}
                            </span>
                          </label>
                        </div>

                        {/* Sub actions */}
                        {perm.view && mod.key === "orders" && (
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label className="flex items-center gap-2 p-2.5 bg-brand-50/80 rounded-xl cursor-pointer hover:bg-brand-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.create}
                                onChange={() => handleTogglePermission("orders", "create")}
                                className="rounded text-brand-800 focus:ring-brand-500 w-4 h-4"
                              />
                              <div>
                                <div className="text-xs font-semibold text-brand-900">➕ Tạo / Xử lý đơn</div>
                                <div className="text-[10px] text-brand-500">Tạo đơn trực tiếp tại quầy</div>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 bg-brand-50/80 rounded-xl cursor-pointer hover:bg-brand-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.edit}
                                onChange={() => handleTogglePermission("orders", "edit")}
                                className="rounded text-brand-800 focus:ring-brand-500 w-4 h-4"
                              />
                              <div>
                                <div className="text-xs font-semibold text-brand-900">✏️ Chuyển trạng thái thông thường</div>
                                <div className="text-[10px] text-brand-500">Đang xử lý ➔ Đã chốt ➔ Đang giao ➔ Hoàn thành/Hủy</div>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.revertFinishedStatus}
                                onChange={() => handleTogglePermission("orders", "revertFinishedStatus")}
                                className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
                              />
                              <div>
                                <div className="text-xs font-semibold text-amber-950">🔓 Mở lại đơn đã Hoàn thành/Hủy</div>
                                <div className="text-[10px] text-amber-700">Chuyển từ Hoàn thành/Hủy quay lại xác nhận</div>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 bg-red-50/80 border border-red-200/60 rounded-xl cursor-pointer hover:bg-red-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.delete}
                                onChange={() => handleTogglePermission("orders", "delete")}
                                className="rounded text-red-700 focus:ring-red-500 w-4 h-4"
                              />
                              <div>
                                <div className="text-xs font-semibold text-red-900">🗑️ Quyền xóa vĩnh viễn đơn hàng</div>
                                <div className="text-[10px] text-red-600">Thao tác không thể khôi phục</div>
                              </div>
                            </label>
                          </div>
                        )}

                        {perm.view && mod.key !== "orders" && (
                          <div className="pt-3 grid grid-cols-3 gap-3">
                            <label className="flex items-center gap-2 p-2 bg-brand-50/80 rounded-xl cursor-pointer hover:bg-brand-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.create}
                                onChange={() => handleTogglePermission(mod.key, "create")}
                                className="rounded text-brand-800 focus:ring-brand-500 w-4 h-4"
                              />
                              <span className="text-xs font-medium text-brand-900">➕ Thêm mới</span>
                            </label>

                            <label className="flex items-center gap-2 p-2 bg-brand-50/80 rounded-xl cursor-pointer hover:bg-brand-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.edit}
                                onChange={() => handleTogglePermission(mod.key, "edit")}
                                className="rounded text-brand-800 focus:ring-brand-500 w-4 h-4"
                              />
                              <span className="text-xs font-medium text-brand-900">✏️ Chỉnh sửa</span>
                            </label>

                            <label className="flex items-center gap-2 p-2 bg-brand-50/80 rounded-xl cursor-pointer hover:bg-brand-100/80 transition-colors">
                              <input
                                type="checkbox"
                                checked={perm.delete}
                                onChange={() => handleTogglePermission(mod.key, "delete")}
                                className="rounded text-brand-800 focus:ring-brand-500 w-4 h-4"
                              />
                              <span className="text-xs font-medium text-red-600">🗑️ Xóa</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:px-6 bg-brand-50 border-t border-brand-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA THÔNG TIN & ĐỔI MẬT KHẨU */}
      {editingDetailsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100">
              <h3 className="font-serif font-bold text-base text-brand-950">
                Sửa Thông Tin Tài Khoản: @{editingDetailsUser.username}
              </h3>
              <button
                onClick={() => setEditingDetailsUser(null)}
                className="text-brand-400 hover:text-brand-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  required
                  value={detailsForm.name}
                  onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Mật khẩu tài khoản *
                </label>
                <input
                  type="text"
                  required
                  value={detailsForm.password}
                  onChange={(e) => setDetailsForm({ ...detailsForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold text-brand-900 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              {editingDetailsUser.username !== "admin1" && (
                <div className="pt-2 flex items-center justify-between border-t border-brand-100">
                  <span className="text-xs font-semibold text-brand-800">Trạng thái hoạt động</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailsForm.isActive}
                      onChange={(e) => setDetailsForm({ ...detailsForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-700"></div>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => setEditingDetailsUser(null)}
                  className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM ADMIN MỚI */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100">
              <h3 className="font-serif font-bold text-base text-brand-950 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" /> Tạo Tài Khoản Admin Phụ Mới
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-brand-400 hover:text-brand-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: admin4, nhanvien1..."
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Họ tên hiển thị
                </label>
                <input
                  type="text"
                  placeholder="Vd: Quản lý chi nhánh, Nhân viên CSKH..."
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-800 mb-1.5">
                  Mật khẩu ban đầu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mật khẩu cho tài khoản này..."
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold text-brand-900 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-brand-950">
              Xóa tài khoản @{deletingUser.username}?
            </h4>
            <p className="text-xs text-brand-600">
              Tài khoản này sẽ bị xóa vĩnh viễn và không thể đăng nhập vào hệ thống nữa. Bạn có chắc chắn không?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
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
