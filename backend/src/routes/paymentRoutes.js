// backend/src/routes/paymentRoutes.js

const express = require('express');
const {
  recordPayment,
  getPayments,
  getPaymentById,
  updatePayment,
} = require('../controllers/paymentController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

const router = express.Router();

// Route to record a new payment
// Accessible by members and admin/advisor
// router.post('/', protect, recordPayment);
router.post('/', recordPayment); // Temporarily public for testing

// Route to get all payments (can be filtered by memberId or status via query params)
// Accessible by Admin/Advisor/Member
// router.get('/', protect, getPayments);
router.get('/', getPayments); // Temporarily public for testing

// Route to get a single payment by ID
// Accessible by Admin/Advisor/Member
// router.get('/:id', protect, getPaymentById);
router.get('/:id', getPaymentById); // Temporarily public for testing

// Route to update a payment record
// Accessible by Admin/Advisor
// router.put('/:id', protect, authorize(['ADMIN', 'ADVISOR']), updatePayment);
router.put('/:id', updatePayment); // Temporarily public for testing

module.exports = router;
