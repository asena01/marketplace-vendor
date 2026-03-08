import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    vendorId: {
      type: String,
      required: true
    },
    customerId: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    images: [String],
    helpful: {
      type: Number,
      default: 0
    },
    unhelpful: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    response: {
      text: String,
      respondedAt: Date
    }
  },
  { timestamps: true }
);

reviewSchema.index({ vendorId: 1 });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
