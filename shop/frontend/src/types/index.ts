export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export interface Good {
  id: number;
  title: string;
  price: string;
  stock: number;
  cover: string | null;
  category_id: number | null;
  category_name?: string;
  tags: string[] | null;
  description: string | null;
  sales: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CartItem {
  id: number;
  goods_id: number;
  num: number;
  title: string;
  price: string;
  stock: number;
  cover: string | null;
}

export interface Address {
  id: number;
  receiver_name: string;
  phone: string;
  address_detail: string;
  is_default: 0 | 1;
}

export interface Order {
  id: number;
  total_price: string;
  status: number;
  address_id: number | null;
  created_at: string;
}

export interface OrderDetail extends Order {
  items: {
    id: number;
    goods_id: number;
    price: string;
    num: number;
    title: string;
    cover: string | null;
  }[];
}

export interface FavoriteItem {
  goods_id: number;
  favorite_at: string;
  title: string;
  price: string;
  stock: number;
  cover: string | null;
  tags: string[] | null;
  sales: number;
}
