export interface KitchenItem {
  name: string;
  cost: number;
  quantity: number;
  tax: number;
}

export interface ProductItem {
  name: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  tax: number;
  mrp?: number;
}

export interface FoodInvoiceData {
  invoice_id: string;
  items: { name: string; cost: number; quantity: number; food_id?: string; }[];
  total: number;
  discount: number;
  discountedTotal: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  date: string;
}

export interface ProductInvoiceData {
  invoice_id: string;
  items: { name: string; selling_price: number; mrp?: number; quantity: number; product_id?: string; }[];
  total: number;
  discount: number;
  discountedTotal: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  date: string;
}

export interface MembershipInvoiceData {
  invoice_id: string;
  customerName: string;
  customerPhone: string;
  joinDate: string;
  plan: string;
  paymentMethod: string;
  amountPaid: number;
  date: string;
  showJoiningFee: boolean;
  joiningFee: number;
  startDate: string;
  endDate: string;
  category: string;
  isMembership: boolean;
  isRenewal: boolean;
}

export interface TrainerInvoiceData {
  invoice_id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  trainerName: string;
  assignStart: string;
  assignEnd: string;
  paymentMethod: string;
  total: number;
}

export interface Member {
  member_id: string;
  name: string;
  phone: string;
  address: string;
  join_date: string;
  membership_end: string;
  membership_status: string;
  trainer_assign_end_date: string;
  trainer_assign_start_date: string;
  trainer_status: string;
  trainer_name: string;
  trainer_assigned: string;
  email: string;
}

export interface Membership {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  pricing: number;
}

export interface Trainer {
  trainer_id: string;
  name: string;
  email: string;
  contact: string;
  age: number;
  cost: number;
}

export interface AssignedMember {
  member_id: string;
  name: string;
}