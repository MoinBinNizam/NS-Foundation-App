// backend/src/routes/investmentRoutes.js

const express = require('express');
const {
  createInvestmentProject,
  getInvestmentProjects,
  getInvestmentProjectById,
  updateInvestmentProject,
  addContribution,
  getContributionsByProjectId,
} = require('../controllers/investmentController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

const router = express.Router();

// Route to create a new investment project (Admin only)
// router.post('/', protect, authorize('ADMIN'), createInvestmentProject);
router.post('/', createInvestmentProject); // Temporarily public for testing

// Route to get all investment projects (Admin/Advisor/Member)
// router.get('/', protect, getInvestmentProjects);
router.get('/', getInvestmentProjects); // Temporarily public for testing

// Route to get a single investment project by ID
// router.get('/:id', protect, getInvestmentProjectById);
router.get('/:id', getInvestmentProjectById); // Temporarily public for testing

// Route to update an investment project (Admin only)
// router.put('/:id', protect, authorize('ADMIN'), updateInvestmentProject);
router.put('/:id', updateInvestmentProject); // Temporarily public for testing

// Route to add a contribution to an investment project (Admin/Accountant)
// router.post('/:projectId/contributions', protect, authorize(['ADMIN', 'ACCOUNTANT']), addContribution);
router.post('/:projectId/contributions', addContribution); // Temporarily public for testing

// Route to get all contributions for a specific project (Admin/Advisor/Accountant)
// router.get('/:projectId/contributions', protect, authorize(['ADMIN', 'ADVISOR', 'ACCOUNTANT']), getContributionsByProjectId);
router.get('/:projectId/contributions', getContributionsByProjectId); // Temporarily public for testing

module.exports = router;
