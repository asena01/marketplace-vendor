import { Commission } from './commission.model';

export interface Payout {
  id: string;
  affiliateId: string;
  vendorId: string;
  amount: number;
  commissions: Commission[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  scheduledDate: Date;
  completedAt?: Date;
  failureReason?: string;
}