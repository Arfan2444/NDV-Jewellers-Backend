const express = require('express');
const optionalAuth = require('../../middleware/optionalAuth');
const {
  requireAuth,
  requireRole,
  createRequestUploadMiddleware,
  listTemplatesHandler,
  getTemplateHandler,
  createRequestHandler,
  listRequestsHandler,
  updateRequestHandler,
} = require('./customOrders.controller');

const router = express.Router();

router.get('/templates', listTemplatesHandler);
router.get('/templates/:id', getTemplateHandler);

router.post('/requests', optionalAuth, createRequestUploadMiddleware, createRequestHandler);

router.get('/requests', requireAuth, listRequestsHandler);
router.patch('/requests/:id', requireAuth, requireRole('admin'), updateRequestHandler);

module.exports = router;

