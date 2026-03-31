// backend/src/controllers/investmentController.js

const prisma = require('../utils/prismaClient');

/**
 * @route   POST /api/investments
 * @desc    Create a new investment project
 * @access  Admin only (requires authentication)
 */
const createInvestmentProject = async (req, res) => {
  const { name, description, startDate, endDate, targetFund, roi, status } = req.body;

  if (!name || !startDate) {
    return res.status(400).json({ message: 'Project name and start date are required.' });
  }

  try {
    const newProject = await prisma.investmentProject.create({
      data: {
        name: name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        targetFund: targetFund !== undefined ? parseFloat(targetFund) : null,
        roi: roi !== undefined ? parseFloat(roi) : null,
        status: status || 'FUNDING', // Default to FUNDING
      },
    });

    res.status(201).json({
      message: 'Investment project created successfully.',
      project: newProject,
    });
  } catch (error) {
    console.error('Error creating investment project:', error);
    res.status(500).json({ message: 'Server error creating investment project.' });
  }
};

/**
 * @route   GET /api/investments
 * @desc    Get all investment projects (can be filtered by status)
 * @access  Admin/Advisor/Member (requires authentication)
 */
const getInvestmentProjects = async (req, res) => {
  const { status } = req.query; // e.g., /api/investments?status=ACTIVE

  try {
    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const projects = await prisma.investmentProject.findMany({
      where: whereClause,
      include: {
        contributions: { // Optionally include contributions summary
          select: { amount: true }
        }
      },
      orderBy: { startDate: 'desc' },
    });

    // Enrich projects with total contributions and calculate currentFunded if needed
    const projectsWithSummary = projects.map(project => {
      const totalContributions = project.contributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount), 0);
      // Prisma automatically calculates currentFunded based on actual contributions if that logic is maintained.
      // If currentFunded needs to be derived here, it would be:
      // project.currentFunded = totalContributions; // This might override DB value if not careful
      
      // Remove the detailed contributions if only summary is needed for the main list
      const { contributions, ...restOfProject } = project;
      return {
        ...restOfProject,
        totalContributions: totalContributions.toFixed(2), // Display formatted total
        // currentFunded should ideally be managed by DB logic or explicit updates
      };
    });

    res.status(200).json(projectsWithSummary);
  } catch (error) {
    console.error('Error fetching investment projects:', error);
    res.status(500).json({ message: 'Server error fetching investment projects.' });
  }
};

/**
 * @route   GET /api/investments/:id
 * @desc    Get a single investment project by ID
 * @access  Admin/Advisor/Member (requires authentication)
 */
const getInvestmentProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.investmentProject.findUnique({
      where: { id: parseInt(id) },
      include: {
        contributions: {
          include: {
            user: { // Include accountant who contributed
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Investment project not found.' });
    }
    
    // Calculate total contributions for the project
    const totalContributions = project.contributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount), 0);
    
    // Remove detailed contributions from the main project object if only summary is needed
    const { contributions, ...restOfProject } = project;
    
    res.status(200).json({
      ...restOfProject,
      totalContributions: totalContributions.toFixed(2),
      contributionsCount: project.contributions.length,
      // contributions: project.contributions // If you want to show detailed contributions
    });
  } catch (error) {
    console.error('Error fetching investment project by ID:', error);
    res.status(500).json({ message: 'Server error fetching investment project.' });
  }
};

/**
 * @route   PUT /api/investments/:id
 * @desc    Update an investment project
 * @access  Admin only (requires authentication)
 */
const updateInvestmentProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, startDate, endDate, targetFund, currentFunded, roi, status } = req.body;

  try {
    // Check if project exists
    const existingProject = await prisma.investmentProject.findUnique({ where: { id: parseInt(id) } });
    if (!existingProject) {
      return res.status(404).json({ message: 'Investment project not found.' });
    }

    // Construct update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (targetFund !== undefined) updateData.targetFund = parseFloat(targetFund);
    if (currentFunded !== undefined) updateData.currentFunded = parseFloat(currentFunded);
    if (roi !== undefined) updateData.roi = parseFloat(roi);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update fields provided.' });
    }

    const updatedProject = await prisma.investmentProject.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      message: 'Investment project updated successfully.',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating investment project:', error);
    res.status(500).json({ message: 'Server error updating investment project.' });
  }
};

/**
 * @route   POST /api/investments/:projectId/contributions
 * @desc    Add a contribution to an investment project
 * @access  Admin/Accountant (requires authentication)
 */
const addContribution = async (req, res) => {
  const { projectId } = req.params;
  const { userId, amount, contributionDate } = req.body; // userId is the accountant making the contribution

  if (!projectId || !userId || amount === undefined || !contributionDate) {
    return res.status(400).json({ message: 'Project ID, User ID (accountant), amount, and contribution date are required.' });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Contribution amount must be positive.' });
  }

  try {
    // Check if project exists
    const project = await prisma.investmentProject.findUnique({ where: { id: parseInt(projectId) } });
    if (!project) {
      return res.status(404).json({ message: 'Investment project not found.' });
    }

    // Check if user exists and is potentially an accountant (role check might be in middleware)
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure the user has a wallet if they are making contributions (optional check)
    const wallet = await prisma.accountantWallet.findUnique({ where: { userId: parseInt(userId) } });
    if (!wallet) {
      return res.status(400).json({ message: 'User does not have an accountant wallet to make contributions from.' });
    }
    
    // Deduct amount from accountant's wallet (optional, depending on business logic)
    // if (wallet.balance < parseFloat(amount)) {
    //   return res.status(400).json({ message: 'Insufficient balance in accountant's wallet.' });
    // }
    // await prisma.accountantWallet.update({
    //   where: { id: wallet.id },
    //   data: { balance: { decrement: parseFloat(amount) } }
    // });

    // Create the contribution record
    const newContribution = await prisma.contribution.create({
      data: {
        projectId: parseInt(projectId),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        contributionDate: new Date(contributionDate),
        // realizedRoi can be null initially or calculated later
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      }
    });

    // Update the project's currentFunded amount
    const updatedProject = await prisma.investmentProject.update({
      where: { id: parseInt(projectId) },
      data: {
        currentFunded: {
          increment: parseFloat(amount),
        },
      },
    });

    res.status(201).json({
      message: 'Contribution added successfully.',
      contribution: newContribution,
      projectCurrentFunded: updatedProject.currentFunded
    });
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ message: 'Server error adding contribution.' });
  }
};

/**
 * @route   GET /api/investments/:projectId/contributions
 * @desc    Get all contributions for a specific project
 * @access  Admin/Advisor/Accountant (requires authentication)
 */
const getContributionsByProjectId = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required.' });
  }

  try {
    const contributions = await prisma.contribution.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        user: { // Include accountant who contributed
          select: { id: true, name: true, email: true, role: true }
        },
        project: { // Include project name for context
          select: { id: true, name: true }
        }
      },
      orderBy: { contributionDate: 'asc' },
    });

    res.status(200).json(contributions);
  } catch (error) {
    console.error('Error fetching contributions for project:', error);
    res.status(500).json({ message: 'Server error fetching contributions.' });
  }
};

// Note: Deleting projects or contributions might be restricted.
// Consider soft deletes or status changes instead of hard deletes.

module.exports = {
  createInvestmentProject,
  getInvestmentProjects,
  getInvestmentProjectById,
  updateInvestmentProject,
  addContribution,
  getContributionsByProjectId,
};
