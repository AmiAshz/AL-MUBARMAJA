const express = require('express');
const { 
  getVehicles, 
  getVehicle, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  updateStatus,
  addComplaint,
  addProgressLogManual,
  getProgressLogs,
  getInspections,
  addInspection,
  getJobSheet,
  regenerateTrackingCode,
  updateTrackingStatus,
  sendWhatsappNotification,
  sendTrackingEmail,
  sendStatusEmail,
  sendPickupEmail,
  sendCompletionEmail,
  getVehicleEmails
} = require('../controllers/vehicle.controller');
const { getEstimatesByVehicle, createEstimate } = require('../controllers/estimate.controller');
const { getAdditionalRepairs, createAdditionalRepair } = require('../controllers/additionalRepair.controller');
const { getRepairs, createRepair } = require('../controllers/repair.controller');
const { getFinalCost, setFinalCost, getPayments, addPayment } = require('../controllers/billing.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getVehicles)
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), updateVehicle)
  .delete(authorize('ADMIN', 'MANAGER'), deleteVehicle);

router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), updateStatus);

// Tracking Management
router.post('/:id/tracking/regenerate', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), regenerateTrackingCode);
router.patch('/:id/tracking/status', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), updateTrackingStatus);
router.post('/:id/whatsapp-notifications', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), sendWhatsappNotification);

// Email Notifications
router.post('/:id/send-tracking-email', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), sendTrackingEmail);
router.post('/:id/send-status-email', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), sendStatusEmail);
router.post('/:id/send-pickup-email', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), sendPickupEmail);
router.post('/:id/send-completion-email', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), sendCompletionEmail);
router.get('/:id/emails', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST', 'TECHNICIAN'), getVehicleEmails);

// Progress Logs
router.route('/:id/progress')
  .get(getProgressLogs)
  .post(addProgressLogManual);

// Complaints
router.post('/:id/complaints', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), addComplaint);

// Inspections
router.route('/:id/inspections')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), getInspections)
  .post(authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), addInspection);

// Estimates
router.route('/:id/estimates')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), getEstimatesByVehicle)
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), createEstimate);

// Additional Repairs
router.route('/:id/additional-repairs')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), getAdditionalRepairs)
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), createAdditionalRepair);

// Repairs (Tasks)
router.route('/:id/repairs')
  .get(getRepairs)
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), createRepair);

// Final Billing & Payments
router.route('/:id/final-cost')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), getFinalCost)
  .put(authorize('ADMIN', 'MANAGER'), setFinalCost);

router.route('/:id/payments')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), getPayments)
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), addPayment);

// Job Sheet
router.get('/:id/job-sheet', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), getJobSheet);

module.exports = router;
