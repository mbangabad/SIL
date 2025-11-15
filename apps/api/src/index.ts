import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Route imports
import profileRoutes from './routes/profile';
import leaderboardRoutes from './routes/leaderboards';
import seasonRoutes from './routes/seasons';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Mount API routes
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/seasons', seasonRoutes);

// Game initialization endpoint
app.post('/api/initGame', async (req, res) => {
  try {
    const { gameId, mode, userId, language = 'en', seed } = req.body;

    // TODO: Load game definition and initialize
    res.json({
      success: true,
      state: {
        step: 0,
        done: false,
        data: {}
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize game' });
  }
});

// Game update endpoint
app.post('/api/updateGame', async (req, res) => {
  try {
    const { gameId, mode, state, action } = req.body;

    // TODO: Process game action and return new state
    res.json({
      success: true,
      state: {
        ...state,
        step: state.step + 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Semantics API endpoints
app.post('/api/semantics/similarity', async (req, res) => {
  try {
    const { word, vectorId, language } = req.body;

    // TODO: Calculate similarity
    res.json({
      score: 0.82,
      percentile: 94
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate similarity' });
  }
});

app.post('/api/semantics/rarity', async (req, res) => {
  try {
    const { word, ruleId } = req.body;

    // TODO: Calculate rarity
    res.json({
      rarityScore: 98.7
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate rarity' });
  }
});

app.post('/api/semantics/midpoint', async (req, res) => {
  try {
    const { word, anchorA, anchorB } = req.body;

    // TODO: Calculate midpoint score
    res.json({
      score: 0.72
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate midpoint score' });
  }
});

app.post('/api/semantics/clusterHeat', async (req, res) => {
  try {
    const { word, clusterId } = req.body;

    // TODO: Calculate cluster heat
    res.json({
      heat: 0.95
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate cluster heat' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`SIL API server running on port ${port}`);
});
