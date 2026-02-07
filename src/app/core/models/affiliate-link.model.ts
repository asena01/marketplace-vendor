export interface AffiliateLink {
  id: string;
  affiliateId: string;
  vendorId: string;
  productId?: string;
  uniqueCode: string;
  fullLink: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}