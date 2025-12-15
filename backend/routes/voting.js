const express = require('express');
const router = express.Router();
const votingService = require('../services/votingService');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ dest: '/tmp' });

// Simple session validation middleware
function validateUser(req, res, next) {
  const user = req.headers['x-user'] || req.body.user;
  const validUsers = ['Leo', 'Enri', 'Fane', 'Digio', 'Vince', 'Abu'];

  if (!user || !validUsers.includes(user)) {
    return res.status(401).json({ error: 'Invalid or missing user' });
  }

  req.user = user;
  next();
}

router.use(validateUser);

// ============ AUTHENTICATION ENDPOINTS ============

router.post('/auth/login', (req, res) => {
  const { user, password } = req.body;
  const validUsers = ['Leo', 'Enri', 'Fane', 'Digio', 'Vince', 'Abu'];
  const correctPassword = 'tvrvlli2025';

  if (!user || !validUsers.includes(user)) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  if (password !== correctPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Return session data
  res.json({
    success: true,
    user,
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    expiresIn: 86400000 // 24 hours
  });
});

router.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// ============ VOTING ENDPOINTS ============

// Get all proposals for a category (sorted by score)
router.get('/categories/:category/proposals', (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['azienda', 'prodotto', 'ai'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const proposals = votingService.getProposalsByCategory(category);
    const userVotes = votingService.getUserVotes(req.user, category);

    const enrichedProposals = proposals.map(p => ({
      ...p,
      userVote: userVotes[p.id] || { vote: null, isTopChoice: false },
      isNew: new Date() - new Date(p.createdAt) < 24 * 60 * 60 * 1000
    }));

    res.json({
      category,
      proposals: enrichedProposals,
      total: enrichedProposals.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's current votes for a category
router.get('/categories/:category/user-votes/:user', (req, res) => {
  try {
    const { category, user } = req.params;
    const validCategories = ['azienda', 'prodotto', 'ai'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const votes = votingService.getUserVotes(user, category);
    const topChoices = votingService.getTopChoices(user, category);

    res.json({
      user,
      category,
      votes,
      topChoices,
      topChoicesCount: topChoices.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cast a vote on a proposal
router.post('/categories/:category/vote', express.json(), (req, res) => {
  try {
    const { category } = req.params;
    const { proposalId, vote, isTopChoice } = req.body;
    const user = req.user;

    const validCategories = ['azienda', 'prodotto', 'ai'];
    const validVotes = ['yes', 'no', 'ignore'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!validVotes.includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote value' });
    }

    // Validate top choices limit
    if (isTopChoice && vote !== 'ignore') {
      const topChoices = votingService.getTopChoices(user, category);
      const hasExisting = topChoices.includes(proposalId);
      if (!hasExisting && topChoices.length >= 3) {
        return res.status(400).json({ error: 'Maximum 3 top choices allowed' });
      }
    }

    const result = votingService.addVote(category, proposalId, user, vote, isTopChoice);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new proposal with optional image upload
router.post('/categories/:category/proposal', upload.single('image'), async (req, res) => {
  try {
    const { category } = req.params;
    const { name, description } = req.body;
    const user = req.user;

    const validCategories = ['azienda', 'prodotto', 'ai'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    let imageUrl = null;

    // Upload image to ImgBB if provided
    if (req.file) {
      try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY || 'test-key'}`,
          formData,
          { headers: formData.getHeaders() }
        );

        imageUrl = response.data.data.url;

        // Clean up temp file
        fs.unlinkSync(req.file.path);
      } catch (imgError) {
        console.error('Image upload error:', imgError.message);
        // Continue without image if upload fails
        if (req.file) fs.unlinkSync(req.file.path);
      }
    }

    const proposal = votingService.createProposal(
      category,
      name,
      description,
      imageUrl,
      user
    );

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a proposal
router.delete('/proposals/:proposalId', (req, res) => {
  try {
    const { proposalId } = req.params;
    votingService.deleteProposal(proposalId);

    res.json({
      success: true,
      message: 'Proposal deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for a category
router.get('/categories/:category/stats', (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['azienda', 'prodotto', 'ai'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const stats = votingService.getStats(category);

    res.json({
      category,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific proposal's score
router.get('/categories/:category/proposal-score/:proposalId', (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposals = votingService.data.proposals;
    const proposal = proposals.find(p => p.id === proposalId);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const score = votingService.calculateScore(proposal);

    res.json({
      proposalId,
      score,
      voteCount: proposal.votes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
