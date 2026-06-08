const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    customer_name: {
      type: String,
      required: [true, 'Müşteri adı zorunludur'],
      trim: true,
    },
    customer_avatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Puan zorunludur'],
      min: [1, 'Puan en az 1 olabilir'],
      max: [5, 'Puan en fazla 5 olabilir'],
    },
    comment: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: 'Bugün',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    ai_reply: {
      type: String,
      default: '',
    },
    is_historical: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Frontend id olarak _id kullanıyor, dönüşümü burada yapıyoruz
reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Review', reviewSchema);
