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
  updateTrackingStatus
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
  .post(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'RECEPTIONIST'), updateVehicle)
  .delete(authorize('ADMIN', 'MANAGER'), deleteVehicle);

router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), updateStatus);

// Tracking Management
router.post('/:id/tracking/regenerate', authorize('ADMIN', 'MANAGER'), regenerateTrackingCode);
router.patch('/:id/tracking/status', authorize('ADMIN', 'MANAGER'), updateTrackingStatus);

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
