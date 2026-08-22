import { Product } from './../../products/interfaces/product.interface';


export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  size?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
