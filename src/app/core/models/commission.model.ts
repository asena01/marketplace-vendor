export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  productId: string;
  vendorId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface CommissionStats {
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalCommissions: number;
  averageCommission: number;
}