const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const complaintRoutes = require('./routes/complaint.routes');
const inspectionRoutes = require('./routes/inspection.routes');
const estimateRoutes = require('./routes/estimate.routes');
const additionalRepairRoutes = require('./routes/additionalRepair.routes');
const repairRoutes = require('./routes/repair.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const publicRoutes = require('./routes/public.routes');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For base64 photos
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// API Routes
const { protect, authorize } = require('./middleware/auth.middleware');
const { resendTrackingMessage, resendCompletionMessage } = require('./controllers/vehicle.controller');
app.post('/api/workshop/vehicles/:id/send-tracking-message', protect, authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), resendTrackingMessage);
app.post('/api/workshop/vehicles/:id/send-completion-message', protect, authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), resendCompletionMessage);

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/additional-repairs', additionalRepairRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

module.exports = app;
