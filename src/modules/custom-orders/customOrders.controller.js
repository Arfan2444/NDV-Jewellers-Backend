const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const requireAuth = require('../../middleware/auth');
const requireRole = require('../../middleware/roles');
const {
  UPLOAD_ABSOLUTE_DIR,
  ensureUploadDir,
  parseBudgetRange,
  listTemplates,
  getTemplateById,
  createRequest,
  listRequests,
  updateRequest,
} = require('./customOrders.service');

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_ABSOLUTE_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

const createRequestSchema = Joi.object({
  templateId: Joi.string().required(),
  customText: Joi.string().allow('', null),
  metal: Joi.string().allow('', null),
  size: Joi.string().allow('', null),
  budgetMin: Joi.number().optional(),
  budgetMax: Joi.number().optional(),
  currency: Joi.string().optional(),
  notes: Joi.string().allow('', null),
  guestName: Joi.string().allow('', null),
  guestEmail: Joi.string().email().allow('', null),
  guestPhone: Joi.string().allow('', null),
});

const updateRequestSchema = Joi.object({
  status: Joi.string().valid('new', 'reviewing', 'quoted', 'in_design', 'completed', 'rejected'),
  internalNotes: Joi.string().allow('', null),
  assignedDesigner: Joi.string().allow('', null),
}).min(1);

async function listTemplatesHandler(req, res, next) {
  try {
    const items = await listTemplates(req.query);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

async function getTemplateHandler(req, res, next) {
  try {
    const item = await getTemplateById(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

const createRequestUploadMiddleware = upload.array('referenceImages', 6);

async function createRequestHandler(req, res, next) {
  try {
    const { error, value } = createRequestSchema.validate(req.body || {}, { convert: true });
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user ? req.user.id : undefined;
    const guestContact =
      userId
        ? undefined
        : {
            name: value.guestName || undefined,
            email: value.guestEmail || undefined,
            phone: value.guestPhone || undefined,
          };

    if (!userId && !guestContact?.email && !guestContact?.phone) {
      const err = new Error('Guest contact (email or phone) is required');
      err.statusCode = 400;
      throw err;
    }

    const budgetRange = parseBudgetRange(value);

    const request = await createRequest({
      userId,
      guestContact,
      templateId: value.templateId,
      customText: value.customText,
      metal: value.metal,
      size: value.size,
      budgetRange,
      notes: value.notes,
      files: req.files,
    });

    // Future: trigger email/WhatsApp notification here.

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

async function listRequestsHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';

    const result = await listRequests({
      userId: req.user.id,
      isAdmin,
      query: req.query,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function updateRequestHandler(req, res, next) {
  try {
    const { error, value } = updateRequestSchema.validate(req.body || {}, { convert: true });
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const updated = await updateRequest({
      requestId: req.params.id,
      patch: value,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requireAuth,
  requireRole,
  createRequestUploadMiddleware,
  listTemplatesHandler,
  getTemplateHandler,
  createRequestHandler,
  listRequestsHandler,
  updateRequestHandler,
};

