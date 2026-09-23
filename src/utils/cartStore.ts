import { CartItem, Product } from "../types";

export const CART_STORAGE_KEY = "terre_spa_cart_items";
export const TERRE_CART_UPDATED_EVENT = "terre_cart_updated";

/**
 * Get all current items in the cart
 */
export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.product && typeof item.quantity === "number" && item.quantity > 0);
    }
  } catch (e) {
    console.warn("Failed to read cart from LocalStorage", e);
  }
  return [];
}

/**
 * Save cart items and dispatch reactive event
 */
export function saveCart(cart: CartItem[]): void {
  try {
    const valid = cart.filter((item) => item.quantity > 0);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(valid));
    window.dispatchEvent(
      new CustomEvent(TERRE_CART_UPDATED_EVENT, {
        detail: { cart: valid, count: valid.reduce((sum, i) => sum + i.quantity, 0) },
      })
    );
  } catch (e) {
    console.error("Failed to save cart to LocalStorage", e);
  }
}

/**
 * Add product with quantity to cart
 */
export function addToCart(product: Product, quantity: number = 1): { success: boolean; cart: CartItem[]; addedItem: CartItem } {
  const safeQty = Math.max(1, Math.floor(quantity));
  const currentCart = getCart();
  const existingIdx = currentCart.findIndex((item) => item.product.id === product.id);

  let updatedCart: CartItem[];
  let targetItem: CartItem;

  if (existingIdx >= 0) {
    const updatedQty = currentCart[existingIdx].quantity + safeQty;
    targetItem = {
      ...currentCart[existingIdx],
      product, // Refresh product details in case updated
      quantity: updatedQty,
    };
    updatedCart = [...currentCart];
    updatedCart[existingIdx] = targetItem;
  } else {
    targetItem = { product, quantity: safeQty };
    updatedCart = [targetItem, ...currentCart];
  }

  saveCart(updatedCart);
  return { success: true, cart: updatedCart, addedItem: targetItem };
}

/**
 * Update quantity of a specific item in cart
 */
export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  const currentCart = getCart();
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  const updated = currentCart.map((item) => {
    if (item.product.id === productId) {
      return { ...item, quantity: Math.max(1, Math.floor(quantity)) };
    }
    return item;
  });
  saveCart(updated);
  return updated;
}

/**
 * Remove an item completely from cart
 */
export function removeFromCart(productId: string): CartItem[] {
  const currentCart = getCart();
  const filtered = currentCart.filter((item) => item.product.id !== productId);
  saveCart(filtered);
  return filtered;
}

/**
 * Clear all items in cart
 */
export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(TERRE_CART_UPDATED_EVENT, {
      detail: { cart: [], count: 0 },
    })
  );
}

/**
 * Get total quantity count in cart
 */
export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get subtotal price of all cart items
 */
export function getCartSubtotal(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
}
