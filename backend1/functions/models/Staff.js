import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

const StaffSchema = new Schema({
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  position: {
    type: String,
    enum: ['manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bellboy', 'maintenance', 'security', 'other'],
    required: true
  },
  department: {
    type: String,
    enum: ['front-office', 'housekeeping', 'kitchen', 'restaurant', 'maintenance', 'security', 'admin'],
    required: true
  },
  salary: Number,
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  address: String,
  city: String,
  emergencyContact: String,
  emergencyPhone: String,
  profileImage: String,
  password: String,
  lastLogin: Date,
  isVerified: {
    type: Boolean,
    default: false
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

StaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

StaffSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

StaffSchema.index({ hotel: 1, email: 1 });

export default mongoose.model('Staff', StaffSchema);
