// backend/src/controllers/paymentController.js

const prisma = require('../utils/prismaClient');

// Helper to calculate penalty amount (based on penaltyRate and number of shares)
// This is a simplified calculation; actual logic might be more complex.
// For now, assuming penalty is a flat rate per payment if late, or per share.
// The schema has `penaltyAmount` in Payment, let's assume it's a direct value.
// The SYSTEM_REQUIREMENTS mention "20 BDT per share" as penalty.
// This controller assumes the 'amount' is the base share payment,
// and penalty is calculated separately or added to the total.
// For simplicity, we'll allow manual entry of penaltyAmount for now.
// A more advanced system would calculate it based on shares and days late.

/**
 * @route   POST /api/payments
 * @desc    Record a new payment/transaction
 * @access  User (Member) or Admin (requires authentication)
 */
const recordPayment = async (req, res) => {
  const { memberId, amount, transactionDate, receiptUrl, penaltyAmount, isAdvance, status } = req.body;

  // Basic validation
  if (!memberId || amount === undefined || !transactionDate) {
    return res.status(400).json({ message: 'Member ID, amount, and transaction date are required.' });
  }
  if (parseFloat(amount) < 0) {
    return res.status(400).json({ message: 'Payment amount cannot be negative.' });
  }
  if (penaltyAmount !== undefined && parseFloat(penaltyAmount) < 0) {
    return res.status(400).json({ message: 'Penalty amount cannot be negative.' });
  }

  try {
    // Check if member exists
    const member = await prisma.user.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    // Create the payment record
    const newPayment = await prisma.payment.create({
      data: {
        memberId: parseInt(memberId),
        amount: parseFloat(amount),
        transactionDate: new Date(transactionDate),
        receiptUrl: receiptUrl || null, // Optional
        penaltyAmount: penaltyAmount !== undefined ? parseFloat(penaltyAmount) : 0,
        isAdvance: isAdvance || false,
        status: status || 'PENDING', // Default status
      },
    });

    res.status(201).json({
      message: 'Payment recorded successfully.',
      payment: newPayment,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server error recording payment.' });
  }
};

/**
 * @route   GET /api/payments
 * @desc    Get all payments (filtered by memberId or status if query params exist)
 * @access  Admin/Advisor/Member (requires authentication)
 */
const getPayments = async (req, res) => {
  const { memberId, status } = req.query; // e.g., /api/payments?memberId=1&status=PENDING

  try {
    let whereClause = {};
    if (memberId) {
      whereClause.memberId = parseInt(memberId);
    }
    if (status) {
      whereClause.status = status;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        user: { // Include member details
          select: { id: true, name: true, memberId: true, email: true },
        },
      },
      orderBy: { transactionDate: 'desc' }, // Order by date descending
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error fetching payments.' });
  }
};

/**
 * @route   GET /api/payments/:id
 * @desc    Get a single payment by ID
 * @access  Admin/Advisor/Member (requires authentication)
 */
const getPaymentById = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { // Include member details
          select: { id: true, name: true, memberId: true, email: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    res.status(500).json({ message: 'Server error fetching payment.' });
  }
};

/**
 * @route   PUT /api/payments/:id
 * @desc    Update a payment record (e.g., change status, add penalty)
 * @access  Admin/Advisor (requires authentication)
 */
const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { amount, transactionDate, receiptUrl, penaltyAmount, isAdvance, status } = req.body;

  try {
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({ where: { id: parseInt(id) } });
    if (!existingPayment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    // Construct update data, only including fields that are present in the request body
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (transactionDate !== undefined) updateData.transactionDate = new Date(transactionDate);
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
    if (penaltyAmount !== undefined) updateData.penaltyAmount = parseFloat(penaltyAmount);
    if (isAdvance !== undefined) updateData.isAdvance = isAdvance;
    if (status !== undefined) updateData.status = status;

    // If no update fields were provided, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update fields provided.' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      message: 'Payment updated successfully.',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error updating payment.' });
  }
};

// Note: Deleting payments might not be advisable depending on business logic.
// If needed, add a deletePayment endpoint with appropriate authorization.

module.exports = {
  recordPayment,
  getPayments,
  getPaymentById,
  updatePayment,
};
