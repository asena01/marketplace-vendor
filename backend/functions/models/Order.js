import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: String,
      default: null
    },
    userEmail: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    customerAddress: {
      type: String,
      required: true
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        category: String,
        serviceType: {
          type: String,
          enum: ['furniture', 'hair', 'pets', 'gym-equipment', 'shopping'],
          required: true
        }
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'cash', 'card'],
      default: 'stripe'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    stripeSessionId: {
      type: String,
      default: null
    },
    stripePaymentIntentId: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Index for efficient queries
orderSchema.index({ userId: 1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
