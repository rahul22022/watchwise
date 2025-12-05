const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceName: {
    type: String,
    required: [true, 'Please add a service name'],
    enum: ['Netflix', 'HBO Max', 'Prime Video', 'Peacock', 'Disney+', 'Hulu', 'Apple TV+', 'Paramount+', 'Other']
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Please add the monthly price'],
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  renewalDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    default: 'monthly'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount paid
subscriptionSchema.virtual('totalPaid').get(function() {
  const months = Math.floor((Date.now() - this.startDate) / (1000 * 60 * 60 * 24 * 30));
  return this.monthlyPrice * months;
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
