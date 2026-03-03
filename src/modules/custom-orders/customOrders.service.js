const path = require('path');
const fs = require('fs');
const CustomTemplate = require('./customTemplate.model');
const CustomOrderRequest = require('./customOrderRequest.model');

const UPLOAD_RELATIVE_DIR = path.join('uploads', 'custom-orders');
const UPLOAD_ABSOLUTE_DIR = path.join(process.cwd(), UPLOAD_RELATIVE_DIR);

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_ABSOLUTE_DIR, { recursive: true });
}

function buildTemplateFilters(query) {
  const filters = { isActive: true };

  if (query.type) {
    filters.type = query.type;
  }

  if (query.metal) {
    filters.allowedMetals = { $in: [query.metal] };
  }

  if (query.occasion) {
    filters.allowedOccasions = { $in: [query.occasion] };
  }

  return filters;
}

async function listTemplates(query) {
  const filters = buildTemplateFilters(query);
  return CustomTemplate.find(filters).sort({ createdAt: -1 });
}

async function getTemplateById(id) {
  const template = await CustomTemplate.findById(id);
  if (!template) {
    const error = new Error('Template not found');
    error.statusCode = 404;
    throw error;
  }
  return template;
}

function parseBudgetRange({ budgetMin, budgetMax, currency }) {
  if (budgetMin === undefined && budgetMax === undefined) return undefined;

  const min = budgetMin !== undefined ? Number(budgetMin) : undefined;
  const max = budgetMax !== undefined ? Number(budgetMax) : undefined;

  return {
    ...(Number.isNaN(min) ? {} : { min }),
    ...(Number.isNaN(max) ? {} : { max }),
    currency: currency || 'INR',
  };
}

function filesToReferenceImages(files) {
  if (!files || !files.length) return [];

  return files.map((f) => ({
    url: `/${UPLOAD_RELATIVE_DIR.replace(/\\\\/g, '/')}/${f.filename}`,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
  }));
}

async function createRequest({ userId, guestContact, templateId, customText, metal, size, budgetRange, notes, files }) {
  ensureUploadDir();

  const template = await CustomTemplate.findById(templateId);
  if (!template) {
    const error = new Error('Template not found');
    error.statusCode = 404;
    throw error;
  }

  const referenceImages = filesToReferenceImages(files);

  const request = await CustomOrderRequest.create({
    ...(userId ? { user: userId } : {}),
    ...(guestContact ? { guestContact } : {}),
    template: templateId,
    customText,
    metal,
    size,
    budgetRange,
    referenceImages,
    notes,
    status: 'new',
  });

  return request;
}

async function listRequests({ userId, isAdmin, query }) {
  const filters = {};

  if (!isAdmin) {
    filters.user = userId;
  } else if (query.userId) {
    filters.user = query.userId;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.templateId) {
    filters.template = query.templateId;
  }

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 && Number(query.limit) <= 100 ? Number(query.limit) : 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    CustomOrderRequest.find(filters)
      .populate('template')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CustomOrderRequest.countDocuments(filters),
  ]);

  return { items, total, page, pageSize: limit };
}

async function updateRequest({ requestId, patch }) {
  const allowed = ['status', 'internalNotes', 'assignedDesigner'];
  const toUpdate = {};
  allowed.forEach((k) => {
    if (patch[k] !== undefined) toUpdate[k] = patch[k];
  });

  const updated = await CustomOrderRequest.findByIdAndUpdate(requestId, toUpdate, { new: true }).populate('template');
  if (!updated) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  return updated;
}

module.exports = {
  UPLOAD_ABSOLUTE_DIR,
  UPLOAD_RELATIVE_DIR,
  ensureUploadDir,
  parseBudgetRange,
  listTemplates,
  getTemplateById,
  createRequest,
  listRequests,
  updateRequest,
};

