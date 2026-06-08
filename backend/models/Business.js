const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'İşletme adı zorunludur'],
      trim: true,
    },
    sector: {
      type: String,
      default: 'Genel',
      enum: ['Restoran', 'Kafe', 'Giyim', 'Sağlık', 'Spor', 'Otel', 'Diğer', 'Genel'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    placeId: {
      type: String,
      default: '',
    },
    activeTone: {
      type: String,
      default: 'Empatik ve Profesyonel',
    },
    membershipTier: {
      type: Number,
      default: 0, // 0: Deneme, 1: Esnaf, 2: Usta
    },
    packageName: {
      type: String,
      default: 'Deneme Sürümü',
    },
    membershipEnd: {
      type: Date,
      default: null,
    },
    monthlyQuota: {
      type: Number,
      default: 5,
    },
    currentUsage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

businessSchema.set('toJSON', { transform: (doc, ret) => { delete ret.__v; return ret; } });

module.exports = mongoose.model('Business', businessSchema);
