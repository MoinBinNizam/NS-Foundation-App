// backend/src/controllers/settingsController.js

const prisma = require('../utils/prismaClient');

// Helper function to get or create the single settings record
async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        // Default values as defined in schema.prisma
        sharePrice: 500,
        penaltyRate: 20,
        deadlineDay: 15,
        exitDeductionRate: 9.99,
      },
    });
  }
  return settings;
}

/**
 * @route   GET /api/settings
 * @desc    Get system settings
 * @access  Public (or Admin/Advisor)
 */
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

/**
 * @route   PUT /api/settings
 * @desc    Update system settings
 * @access  Admin only (requires authentication middleware)
 */
const updateSettings = async (req, res) => {
  const { sharePrice, penaltyRate, deadlineDay, exitDeductionRate } = req.body;

  try {
    // Get the existing settings record
    let settings = await getOrCreateSettings();

    // Update settings with provided values, only if they are present in the request body
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id }, // Update the single existing record
      data: {
        // Use provided values if they exist, otherwise keep current values
        sharePrice: sharePrice !== undefined ? parseFloat(sharePrice) : settings.sharePrice,
        penaltyRate: penaltyRate !== undefined ? parseFloat(penaltyRate) : settings.penaltyRate,
        deadlineDay: deadlineDay !== undefined ? parseInt(deadlineDay, 10) : settings.deadlineDay,
        exitDeductionRate: exitDeductionRate !== undefined ? parseFloat(exitDeductionRate) : settings.exitDeductionRate,
      },
    });

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
