import mongoose from 'mongoose';
const { Schema } = mongoose;

const MenuSchema = new Schema({
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'special', 'dessert', 'beverages'],
    required: true
  },
  description: String,
  dishes: [{
    id: String,
    name: String,
    price: Number,
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountedPrice: {
      type: Number,
      default: null
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: Date,
  endDate: Date,
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

MenuSchema.index({ hotel: 1, type: 1 });

export default mongoose.model('Menu', MenuSchema);
