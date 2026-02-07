export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
  response?: {
    vendorResponse: string;
    respondedAt: Date;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}