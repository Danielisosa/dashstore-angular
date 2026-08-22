import { User } from "@auth/interfaces/user.interface";

export interface ProductsResponse {
  count:    number;
  pages:    number;
  products: Product[];
}

export interface ProductImageItem {
  id?: number | string;
  url: string;
}

export type ProductImageValue = string | ProductImageItem;

export interface Product {
  id:          string;
  title:       string;
  price:       number;
  description: string;
  slug:        string;
  stock:       number;
  sizes:       Size[];
  gender:      Gender;
  tags:        string[];
  images:      ProductImageValue[];
  user:        User;
}

export enum Gender {
  Kid = "kid",
  Men = "men",
  Unisex = "unisex",
  Women = "women",
}

export enum Size {
  L = "L",
  M = "M",
  S = "S",
  Xl = "XL",
  Xs = "XS",
  Xxl = "XXL",
}


