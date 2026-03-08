import mongoose from 'mongoose';
const { Schema } = mongoose;

const RoomSchema = new Schema({
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe', 'presidential'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  floor: Number,
  pricePerNight: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountedPrice: {
    type: Number,
    default: null
  },
  description: String,
  amenities: [String],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  currentGuest: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  checkInDate: Date,
  checkOutDate: Date,
  images: [String],
  maxOccupancy: Number,
  bedType: String,
  hasBalcony: Boolean,
  hasAC: Boolean,
  hasWifi: Boolean,
  bathroomType: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

RoomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model('Room', RoomSchema);
