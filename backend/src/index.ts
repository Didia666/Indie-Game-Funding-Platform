import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/db.json');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure data directory and db.json exist
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    games: [
      {
        id: 1,
        title: "Quest of Mayon",
        description: "An action RPG inspired by Bicolano folklore.",
        goal: 25000,
        raised: 21250,
        assetCode: "MAYON",
        issuer: "GD2W...MAYON",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000"
      },
      {
        id: 2,
        title: "Jeepney Drift",
        description: "Cyberpunk jeepney racing in the streets of Manila.",
        goal: 15000,
        raised: 5000,
        assetCode: "JDRIFT",
        issuer: "GD3X...JDRIFT",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000"
      }
    ],
    investments: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Helper to read DB
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
// Helper to write DB
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.get('/api/games', (req, res) => {
  const db = readDB();
  res.json(db.games);
});

app.post('/api/invest', (req, res) => {
  const { gameId, amount, investorAddress, txHash } = req.body;
  const db = readDB();
  
  const gameIndex = db.games.findIndex(g => g.id === gameId);
  if (gameIndex === -1) return res.status(404).json({ error: 'Game not found' });

  // Update raised amount
  db.games[gameIndex].raised += Number(amount);
  
  // Record investment
  db.investments.push({
    gameId,
    amount,
    investorAddress,
    txHash,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({ success: true, updatedGame: db.games[gameIndex] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
