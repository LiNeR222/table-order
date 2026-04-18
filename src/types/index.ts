export interface Warehouse {
  id: number;
  name: string;
  type: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  parent: number | null;
  is_public: boolean | null;
  status: boolean;
  updated_at: number;
  created_at: number;
}

export interface Paybox {
  id: number;
  name: string;
}

export interface Organization {
  id: number;
  name: string;
}

export interface PriceType {
  id: number;
  name: string;
}

export interface Contragent {
  id: number;
  name: string | null;
  phone: string | null;
  email?: string | null;
}

export interface Nomenclature {
  id: number;
  name: string;
  article?: string;
  price?: number;
  price_retail?: number;
  unit?: number;
}

export interface OrderItem {
  nomenclature: number;
  price: number;
  quantity: number;
  unit: number;
  discount: number;
  sum_discounted: number;
}

export interface CreateOrderPayload {
  priority: number;
  dated: number;
  operation: string;
  tax_included: boolean;
  tax_active: boolean;
  goods: OrderItem[];
  settings: Record<string, any>;
  warehouse: number | null;
  contragent: number | null;
  paybox: number | null;
  organization: number | null;
  status: boolean;
  paid_rubles: number | string;
  paid_lt: number;
}