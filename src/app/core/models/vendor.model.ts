export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  avatar: string;
  banner: string;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  location: {
    country: string;
    city: string;
  };
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
  affiliateSettings: {
    defaultCommissionRate: number;
    minWithdrawal: number;
    payoutFrequency: 'weekly' | 'monthly';
    requireApproval: boolean;
  };
}