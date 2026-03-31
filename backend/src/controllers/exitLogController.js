// backend/src/controllers/exitLogController.js

const prisma = require('../utils/prismaClient');

/**
 * @route   POST /api/exit-logs
 * @desc    Record a member's exit from the organization
 * @access  Admin only (requires authentication)
 */
const recordExit = async (req, res) => {
  const { memberId, exitDate, deductionRate, deductionAmount, refundAmount, payoutStartDate, payoutEndDate, payoutStatus } = req.body;

  // Basic validation
  if (!memberId || !exitDate) {
    return res.status(400).json({ message: 'Member ID and exit date are required.' });
  }

  try {
    // Check if member exists
    const member = await prisma.user.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    // Create the exit log record
    const newExitLog = await prisma.exitLog.create({
      data: {
        memberId: parseInt(memberId),
        exitDate: new Date(exitDate),
        deductionRate: deductionRate !== undefined ? parseFloat(deductionRate) : null,
        deductionAmount: deductionAmount !== undefined ? parseFloat(deductionAmount) : null,
        refundAmount: refundAmount !== undefined ? parseFloat(refundAmount) : null,
        payoutStartDate: payoutStartDate ? new Date(payoutStartDate) : null,
        payoutEndDate: payoutEndDate ? new Date(payoutEndDate) : null,
        payoutStatus: payoutStatus || 'SCHEDULED', // Default to SCHEDULED
      },
      include: {
        user: { // Include member details
          select: { id: true, name: true, memberId: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Member exit recorded successfully.',
      exitLog: newExitLog,
    });
  } catch (error) {
    console.error('Error recording member exit:', error);
    res.status(500).json({ message: 'Server error recording member exit.' });
  }
};

/**
 * @route   GET /api/exit-logs
 * @desc    Get all exit logs (can be filtered by memberId or payoutStatus)
 * @access  Admin/Advisor (requires authentication)
 */
const getExitLogs = async (req, res) => {
  const { memberId, payoutStatus } = req.query; // e.g., /api/exit-logs?memberId=1&payoutStatus=PAID

  try {
    let whereClause = {};
    if (memberId) {
      whereClause.memberId = parseInt(memberId);
    }
    if (payoutStatus) {
      whereClause.payoutStatus = payoutStatus;
    }

    const exitLogs = await prisma.exitLog.findMany({
      where: whereClause,
      include: {
        user: { // Include member details
          select: { id: true, name: true, memberId: true, email: true },
        },
      },
      orderBy: { exitDate: 'desc' }, // Order by exit date descending
    });

    res.status(200).json(exitLogs);
  } catch (error) {
    console.error('Error fetching exit logs:', error);
    res.status(500).json({ message: 'Server error fetching exit logs.' });
  }
};

/**
 * @route   GET /api/exit-logs/:id
 * @desc    Get a single exit log by ID
 * @access  Admin/Advisor (requires authentication)
 */
const getExitLogById = async (req, res) => {
  const { id } = req.params;

  try {
    const exitLog = await prisma.exitLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { // Include member details
          select: { id: true, name: true, memberId: true, email: true },
        },
      },
    });

    if (!exitLog) {
      return res.status(404).json({ message: 'Exit log not found.' });
    }

    res.status(200).json(exitLog);
  } catch (error) {
    console.error('Error fetching exit log by ID:', error);
    res.status(500).json({ message: 'Server error fetching exit log.' });
  }
};

/**
 * @route   PUT /api/exit-logs/:id
 * @desc    Update an exit log (e.g., payout status, dates)
 * @access  Admin only (requires authentication)
 */
const updateExitLog = async (req, res) => {
  const { id } = req.params;
  const { exitDate, deductionRate, deductionAmount, refundAmount, payoutStartDate, payoutEndDate, payoutStatus } = req.body;

  try {
    // Check if exit log exists
    const existingExitLog = await prisma.exitLog.findUnique({ where: { id: parseInt(id) } });
    if (!existingExitLog) {
      return res.status(404).json({ message: 'Exit log not found.' });
    }

    // Construct update data
    const updateData = {};
    if (exitDate !== undefined) updateData.exitDate = new Date(exitDate);
    if (deductionRate !== undefined) updateData.deductionRate = parseFloat(deductionRate);
    if (deductionAmount !== undefined) updateData.deductionAmount = parseFloat(deductionAmount);
    if (refundAmount !== undefined) updateData.refundAmount = parseFloat(refundAmount);
    if (payoutStartDate !== undefined) updateData.payoutStartDate = payoutStartDate ? new Date(payoutStartDate) : null;
    if (payoutEndDate !== undefined) updateData.payoutEndDate = payoutEndDate ? new Date(payoutEndDate) : null;
    if (payoutStatus !== undefined) updateData.payoutStatus = payoutStatus;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update fields provided.' });
    }

    const updatedExitLog = await prisma.exitLog.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      message: 'Exit log updated successfully.',
      exitLog: updatedExitLog,
    });
  } catch (error) {
    console.error('Error updating exit log:', error);
    res.status(500).json({ message: 'Server error updating exit log.' });
  }
};

// Note: Deleting exit logs might be restricted depending on business logic.
// Consider soft deletes or status changes.

module.exports = {
  recordExit,
  getExitLogs,
  getExitLogById,
  updateExitLog,
};
