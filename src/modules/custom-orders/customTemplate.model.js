const mongoose = require('mongoose');

const CustomTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    type: { type: String, trim: true, index: true },
    description: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    allowedCustomFields: {
      type: Object,
      default: {},
    },
    allowedMetals: [{ type: String, trim: true, index: true }],
    allowedOccasions: [{ type: String, trim: true, index: true }],
    isActive: { type: Boolean, default: true, index: true },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const CustomTemplate = mongoose.model('CustomTemplate', CustomTemplateSchema);

module.exports = CustomTemplate;

