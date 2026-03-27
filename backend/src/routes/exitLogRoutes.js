// backend/src/routes/exitLogRoutes.js

const express = require('express');
const {
  recordExit,
  getExitLogs,
  getExitLogById,
  updateExitLog,
} = require('../controllers/exitLogController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

const router = express.Router();

// Route to record a member's exit
// Accessible by Admin only
// router.post('/', protect, authorize('ADMIN'), recordExit);
router.post('/', recordExit); // Temporarily public for testing

// Route to get all exit logs (can be filtered by memberId or payoutStatus)
// Accessible by Admin/Advisor
// router.get('/', protect, authorize(['ADMIN', 'ADVISOR']), getExitLogs);
router.get('/', getExitLogs); // Temporarily public for testing

// Route to get a single exit log by ID
// Accessible by Admin/Advisor
// router.get('/:id', protect, authorize(['ADMIN', 'ADVISOR']), getExitLogById);
router.get('/:id', getExitLogById); // Temporarily public for testing

// Route to update an exit log
// Accessible by Admin only
// router.put('/:id', protect, authorize('ADMIN'), updateExitLog);
router.put('/:id', updateExitLog); // Temporarily public for testing

module.exports = router;
