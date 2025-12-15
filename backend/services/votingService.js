const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/voting-db.json');

class VotingService {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const content = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading voting database:', error);
    }
    return { proposals: [], users: {} };
  }

  saveData() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving voting database:', error);
    }
  }

  getProposalsByCategory(category) {
    return this.data.proposals
      .filter(p => p.category === category)
      .map(p => ({
        ...p,
        totalScore: this.calculateScore(p)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  calculateScore(proposal) {
    return proposal.votes.reduce((sum, vote) => {
      if (vote.vote === 'ignore') return sum;
      const baseScore = vote.vote === 'yes' ? 1 : -1;
      const multiplier = vote.isTopChoice ? 3 : 1;
      return sum + (baseScore * multiplier);
    }, 0);
  }

  addVote(category, proposalId, user, vote, isTopChoice = false) {
    const proposal = this.data.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const existingVoteIndex = proposal.votes.findIndex(v => v.user === user);
    if (existingVoteIndex >= 0) {
      proposal.votes[existingVoteIndex] = {
        user,
        vote,
        isTopChoice,
        date: new Date().toISOString()
      };
    } else {
      proposal.votes.push({
        user,
        vote,
        isTopChoice,
        date: new Date().toISOString()
      });
    }

    // Update user's top choices
    if (!this.data.users[user]) {
      this.data.users[user] = {
        topChoices: { azienda: [], prodotto: [], ai: [] }
      };
    }

    if (isTopChoice && vote !== 'ignore') {
      const topChoices = this.data.users[user].topChoices[category];
      if (!topChoices.includes(proposalId)) {
        if (topChoices.length >= 3) {
          topChoices.shift();
        }
        topChoices.push(proposalId);
      }
    } else {
      const topChoices = this.data.users[user].topChoices[category];
      const index = topChoices.indexOf(proposalId);
      if (index > -1) {
        topChoices.splice(index, 1);
      }
    }

    this.saveData();
    return {
      proposalId,
      user,
      vote,
      isTopChoice,
      totalScore: this.calculateScore(proposal)
    };
  }

  createProposal(category, name, description, imageUrl, createdBy) {
    const id = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const proposal = {
      id,
      category,
      name,
      description,
      imageUrl,
      createdBy,
      createdAt: new Date().toISOString(),
      votes: []
    };

    this.data.proposals.push(proposal);
    this.saveData();
    return proposal;
  }

  getUserVotes(user, category) {
    const votes = {};
    const topChoices = this.data.users[user]?.topChoices?.[category] || [];

    this.data.proposals
      .filter(p => p.category === category)
      .forEach(proposal => {
        const userVote = proposal.votes.find(v => v.user === user);
        votes[proposal.id] = {
          vote: userVote?.vote || null,
          isTopChoice: topChoices.includes(proposal.id)
        };
      });

    return votes;
  }

  getTopChoices(user, category) {
    return this.data.users[user]?.topChoices?.[category] || [];
  }

  getStats(category) {
    const proposals = this.getProposalsByCategory(category);
    const top5 = proposals.slice(0, 5);
    const avgScore = proposals.length > 0
      ? proposals.reduce((sum, p) => sum + p.totalScore, 0) / proposals.length
      : 0;

    return {
      totalProposals: proposals.length,
      averageScore: avgScore.toFixed(2),
      topProposal: proposals[0] || null,
      top5: top5.map(p => ({
        id: p.id,
        name: p.name,
        score: p.totalScore,
        voteCount: p.votes.length
      }))
    };
  }

  deleteProposal(proposalId) {
    const index = this.data.proposals.findIndex(p => p.id === proposalId);
    if (index < 0) {
      throw new Error('Proposal not found');
    }
    this.data.proposals.splice(index, 1);
    this.saveData();
  }
}

module.exports = new VotingService();
