const mongoose = require('mongoose');

const GuestContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const ReferenceImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const BudgetRangeSchema = new mongoose.Schema(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const CustomOrderRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    guestContact: GuestContactSchema,
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomTemplate', required: true, index: true },
    customText: { type: String, trim: true },
    metal: { type: String, trim: true, index: true },
    size: { type: String, trim: true },
    budgetRange: BudgetRangeSchema,
    referenceImages: [ReferenceImageSchema],
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'quoted', 'in_design', 'completed', 'rejected'],
      default: 'new',
      index: true,
    },
    assignedDesigner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internalNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

const CustomOrderRequest = mongoose.model('CustomOrderRequest', CustomOrderRequestSchema);

module.exports = CustomOrderRequest;

