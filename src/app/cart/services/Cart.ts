import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Cart, CartItem } from './../../core/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/cart`;

  // Estado reactivo principal
  private _cart = signal<Cart | null>(null);
  public loading = signal<boolean>(false);

  // Readonly para componentes
  public cart = this._cart.asReadonly();

  // Signals computadas
  public cartItems = computed<CartItem[]>(() => this._cart()?.items ?? []);

  public totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  public subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  public tax = computed(() => this.subtotal() * 0.16);

  public totalPrice = computed(() => this.subtotal() + this.tax());

  /**
   * Carga inicial del carrito
   */
  loadCart(): void {
    this.loading.set(true);
    this.http.get<Cart>(this.API_URL).subscribe({
      next: (cart) => {
        this._cart.set(cart);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener el carrito del servidor:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Añadir producto al carrito
   */
  addToCart(productId: string, quantity: number = 1, size?: string): void {
    this.loading.set(true);
    const body = { productId, quantity, ...(size && { size }) };

    this.http.post<Cart>(this.API_URL, body).subscribe({
      next: (updatedCart) => {
        this._cart.set(updatedCart);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al agregar producto al carrito:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Actualizar cantidad usando el ID de la línea del carrito (CartItem._id / CartItem.id)
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    this.loading.set(true);
    this.http.patch<Cart>(`${this.API_URL}/${itemId}`, { quantity }).subscribe({
      next: (updatedCart) => {
        this._cart.set(updatedCart);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al actualizar la cantidad:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Eliminar ítem del carrito
   */
  removeFromCart(itemId: string): void {
    this.loading.set(true);
    this.http.delete<Cart>(`${this.API_URL}/${itemId}`).subscribe({
      next: (updatedCart) => {
        this._cart.set(updatedCart);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al remover el producto del carrito:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Limpiar estado local al cerrar sesión
   */
  clearCartState(): void {
    this._cart.set(null);
  }
}
