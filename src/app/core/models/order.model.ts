export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  shippingTrackingNumber?: string;
  affiliateLinkId?: string;
  affiliateId?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDelivery: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderFilter {
  status?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerName?: string;
  affiliateId?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}