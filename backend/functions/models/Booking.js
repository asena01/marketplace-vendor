import mongoose from 'mongoose';
const { Schema } = mongoose;

const BookingSchema = new Schema({
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  bookingNumber: {
    type: String,
    unique: true
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfNights: Number,
  numberOfGuests: Number,
  roomRate: Number,
  numberOfRooms: {
    type: Number,
    default: 1
  },
  subtotal: Number,
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalPrice: Number,
  specialRequests: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'online']
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

BookingSchema.pre('save', function(next) {
  if (this.checkInDate && this.checkOutDate) {
    const nights = Math.ceil((this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24));
    this.numberOfNights = nights;
  }
  if (this.roomRate && this.numberOfNights) {
    this.subtotal = this.roomRate * this.numberOfNights * (this.numberOfRooms || 1);
  }
  if (this.subtotal) {
    this.totalPrice = this.subtotal + (this.tax || 0) - (this.discount || 0);
  }
  next();
});

BookingSchema.index({ hotel: 1, bookingNumber: 1 });
BookingSchema.index({ guest: 1 });
BookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

export default mongoose.model('Booking', BookingSchema);
