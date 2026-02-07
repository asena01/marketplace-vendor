export interface Affiliate {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  commissionRate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalReferredSales: number;
  lastPaymentAmount: number;
  lastPaymentDate: Date;
  nextPaymentDue: number;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
  notes: string;
  createdAt: Date;
  approvedAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
}

export interface AffiliateFilter {
  search?: string;
  status?: string;
  tier?: string;
  sortBy?: 'name' | 'earnings' | 'conversions' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalEarnings: number;
  totalCommissions: number;
  pendingPayouts: number;
  topAffiliates: Affiliate[];
}