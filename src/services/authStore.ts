import { AdminUser, AdminPermissions } from "../types";

export const ADMIN_USERS_STORAGE_KEY = "terre_spa_admin_users";
export const CURRENT_USER_STORAGE_KEY = "terre_spa_current_admin_user";

export const FULL_PERMISSIONS: AdminPermissions = {
  posts: { view: true, create: true, edit: true, delete: true },
  products: { view: true, create: true, edit: true, delete: true },
  services: { view: true, create: true, edit: true, delete: true },
  reviews: { view: true, create: true, edit: true, delete: true },
  orders: { view: true, create: true, edit: true, delete: true },
  cloudflare: { view: true, sync: true },
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-admin1",
    username: "admin1",
    name: "Dev Hieu (Super Admin)",
    password: "Devhieu12802@@",
    role: "super_admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+1&background=8c6454&color=ffffff",
    permissions: FULL_PERMISSIONS,
    createdAt: "2026-09-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "user-admin2",
    username: "admin2",
    name: "Admin Phụ 1",
    password: "dungban123@",
    role: "sub_admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+2&background=a37d6e&color=ffffff",
    permissions: {
      posts: { view: true, create: true, edit: true, delete: false },
      products: { view: true, create: true, edit: true, delete: false },
      services: { view: false, create: false, edit: false, delete: false },
      reviews: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, create: true, edit: true, delete: false },
      cloudflare: { view: false, sync: false },
    },
    createdAt: "2026-09-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "user-admin3",
    username: "admin3",
    name: "Admin Phụ 2",
    password: "admin3@@",
    role: "sub_admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+3&background=bfa295&color=ffffff",
    permissions: {
      posts: { view: false, create: false, edit: false, delete: false },
      products: { view: false, create: false, edit: false, delete: false },
      services: { view: true, create: true, edit: true, delete: false },
      reviews: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: false, edit: false, delete: false },
      cloudflare: { view: false, sync: false },
    },
    createdAt: "2026-09-01T00:00:00.000Z",
    isActive: true,
  },
];

/**
 * Get all stored admin users from LocalStorage
 */
export function getStoredAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
      return INITIAL_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ADMIN_USERS;
  } catch (e) {
    console.warn("Failed to load admin users, fallback to default", e);
    return INITIAL_ADMIN_USERS;
  }
}

/**
 * Save admin users list to LocalStorage
 */
export function saveStoredAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save admin users", e);
  }
}

/**
 * Get current logged in admin user session
 */
export function getCurrentAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AdminUser;
    
    // Always sync with stored user state in case permissions or status changed
    const allUsers = getStoredAdminUsers();
    const found = allUsers.find((u) => u.id === user.id || u.username === user.username);
    if (found && found.isActive !== false) {
      return found;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Set current logged in user session
 */
export function setCurrentAdminUser(user: AdminUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Login function
 */
export function loginAdmin(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AdminUser; message?: string } {
  const cleanUsername = usernameInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, message: "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!" };
  }

  const users = getStoredAdminUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.password === cleanPassword
  );

  if (!user) {
    return { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" };
  }

  if (user.isActive === false) {
    return { success: false, message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin 1!" };
  }

  // Update last login
  const updatedUser = {
    ...user,
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredAdminUsers(updatedUsers);
  setCurrentAdminUser(updatedUser);

  return { success: true, user: updatedUser };
}

/**
 * Logout function
 */
export function logoutAdmin(): void {
  setCurrentAdminUser(null);
}

/**
 * Change password for a specific user
 */
export function changeUserPassword(userId: string, newPass: string): { success: boolean; message: string } {
  if (!newPass || newPass.trim().length < 4) {
    return { success: false, message: "Mật khẩu mới phải có ít nhất 4 ký tự!" };
  }

  const users = getStoredAdminUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, message: "Không tìm thấy tài khoản người dùng!" };
  }

  users[idx] = {
    ...users[idx],
    password: newPass.trim(),
  };

  saveStoredAdminUsers(users);

  // Update session if it's the current user
  const currentUser = getCurrentAdminUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentAdminUser(users[idx]);
  }

  return { success: true, message: "Đổi mật khẩu thành công!" };
}

/**
 * Update user details (Name, Username, Role, Status, Password)
 */
export function updateUserDetails(
  userId: string,
  data: Partial<AdminUser>
): { success: boolean; message: string } {
  const users = getStoredAdminUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, message: "Không tìm thấy tài khoản!" };
  }

  // Prevent modifying admin1's username or role away from super_admin
  if (users[idx].username === "admin1") {
    if (data.username && data.username !== "admin1") {
      return { success: false, message: "Không thể đổi tên tài khoản chính của Super Admin (admin1)!" };
    }
    if (data.role && data.role !== "super_admin") {
      return { success: false, message: "Không thể hạ cấp quyền của Super Admin (admin1)!" };
    }
    if (data.isActive === false) {
      return { success: false, message: "Không thể vô hiệu hóa tài khoản Super Admin (admin1)!" };
    }
  }

  users[idx] = {
    ...users[idx],
    ...data,
  };

  saveStoredAdminUsers(users);

  // Update session if it's current user
  const currentUser = getCurrentAdminUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentAdminUser(users[idx]);
  }

  return { success: true, message: "Đã cập nhật thông tin tài khoản thành công!" };
}

/**
 * Update permissions for a specific sub-admin (only admin1 should call this)
 */
export function updateUserPermissions(
  userId: string,
  permissions: AdminPermissions
): { success: boolean; message: string } {
  const users = getStoredAdminUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, message: "Không tìm thấy người dùng!" };
  }

  // admin1 always keeps full permissions
  if (users[idx].username === "admin1") {
    users[idx].permissions = FULL_PERMISSIONS;
  } else {
    users[idx].permissions = permissions;
  }

  saveStoredAdminUsers(users);

  // If current logged in user is affected, refresh their session
  const currentUser = getCurrentAdminUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentAdminUser(users[idx]);
  }

  return { success: true, message: "Đã lưu cài đặt phân quyền thành công!" };
}

/**
 * Add a new admin user
 */
export function addAdminUser(newUser: Omit<AdminUser, "id">): { success: boolean; message: string; user?: AdminUser } {
  const users = getStoredAdminUsers();
  
  if (users.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase().trim())) {
    return { success: false, message: `Tên đăng nhập "${newUser.username}" đã tồn tại!` };
  }

  const createdUser: AdminUser = {
    ...newUser,
    id: `user-${Date.now()}`,
    username: newUser.username.trim(),
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  const updatedUsers = [...users, createdUser];
  saveStoredAdminUsers(updatedUsers);

  return { success: true, message: "Thêm tài khoản quản trị mới thành công!", user: createdUser };
}

/**
 * Delete a sub-admin user (admin1 cannot be deleted)
 */
export function deleteAdminUser(userId: string): { success: boolean; message: string } {
  const users = getStoredAdminUsers();
  const userToDelete = users.find((u) => u.id === userId);

  if (!userToDelete) {
    return { success: false, message: "Không tìm thấy người dùng cần xóa!" };
  }

  if (userToDelete.username === "admin1" || userToDelete.role === "super_admin") {
    return { success: false, message: "Không thể xóa tài khoản Super Admin (admin1)!" };
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  saveStoredAdminUsers(updatedUsers);

  return { success: true, message: `Đã xóa tài khoản "${userToDelete.username}" thành công!` };
}

/**
 * Reset admin users to initial defaults
 */
export function resetDefaultAdminUsers(): void {
  saveStoredAdminUsers(INITIAL_ADMIN_USERS);
}
