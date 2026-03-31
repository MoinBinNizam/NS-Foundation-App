// backend/src/controllers/walletController.js

const prisma = require('../utils/prismaClient');

/**
 * @route   POST /api/wallets/create
 * @desc    Create a new accountant wallet
 * @access  Admin only (requires authentication middleware)
 */
const createWallet = async (req, res) => {
  const { userId } = req.body; // Expecting the userId of the accountant

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required to create a wallet.' });
  }

  try {
    // Check if the user exists and is an accountant (or if role check is handled by middleware)
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Optionally, check if user is already an accountant or has a wallet
    const existingWallet = await prisma.accountantWallet.findFirst({ where: { userId: parseInt(userId) } });
    if (existingWallet) {
      return res.status(409).json({ message: 'User already has an accountant wallet.' });
    }

    const newWallet = await prisma.accountantWallet.create({
      data: {
        userId: parseInt(userId),
        balance: 0, // Wallets start with zero balance
      },
      include: {
        user: { // Include user details for confirmation
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(201).json({
      message: 'Accountant wallet created successfully.',
      wallet: newWallet,
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ message: 'Server error creating wallet.' });
  }
};

/**
 * @route   GET /api/wallets/:userId
 * @desc    Get a specific accountant's wallet by User ID
 * @access  Admin/Advisor/Accountant (requires authentication middleware)
 */
const getWalletByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const wallet = await prisma.accountantWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: { // Include user details
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Accountant wallet not found for the specified user.' });
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching wallet by User ID:', error);
    res.status(500).json({ message: 'Server error fetching wallet.' });
  }
};

/**
 * @route   GET /api/wallets/all
 * @desc    Get all accountant wallets
 * @access  Admin/Advisor (requires authentication middleware)
 */
const getAllWallets = async (req, res) => {
  try {
    const wallets = await prisma.accountantWallet.findMany({
      include: {
        user: { // Include user details
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching all wallets:', error);
    res.status(500).json({ message: 'Server error fetching wallets.' });
  }
};

/**
 * @route   PUT /api/wallets/:userId/deposit
 * @desc    Deposit funds into an accountant's wallet
 * @access  Admin only (requires authentication middleware)
 */
const depositToWallet = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (!userId || amount === undefined) {
    return res.status(400).json({ message: 'User ID and deposit amount are required.' });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Deposit amount must be positive.' });
  }

  try {
    const wallet = await prisma.accountantWallet.findUnique({ where: { userId: parseInt(userId) } });
    if (!wallet) {
      return res.status(404).json({ message: 'Accountant wallet not found.' });
    }

    const updatedWallet = await prisma.accountantWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(200).json({
      message: 'Deposit successful.',
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error('Error depositing to wallet:', error);
    res.status(500).json({ message: 'Server error during deposit.' });
  }
};

/**
 * @route   PUT /api/wallets/:userId/withdraw
 * @desc    Withdraw funds from an accountant's wallet
 * @access  Admin only (requires authentication middleware)
 */
const withdrawFromWallet = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (!userId || amount === undefined) {
    return res.status(400).json({ message: 'User ID and withdrawal amount are required.' });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Withdrawal amount must be positive.' });
  }

  try {
    const wallet = await prisma.accountantWallet.findUnique({ where: { userId: parseInt(userId) } });
    if (!wallet) {
      return res.status(404).json({ message: 'Accountant wallet not found.' });
    }

    if (parseFloat(amount) > wallet.balance) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const updatedWallet = await prisma.accountantWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: parseFloat(amount),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(200).json({
      message: 'Withdrawal successful.',
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    res.status(500).json({ message: 'Server error during withdrawal.' });
  }
};

module.exports = {
  createWallet,
  getWalletByUserId,
  getAllWallets,
  depositToWallet,
  withdrawFromWallet,
};
