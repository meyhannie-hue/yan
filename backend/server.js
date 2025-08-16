const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'techyme'
});

// ✅ GET player info
app.get('/api/player/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM players WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST create new player
app.post('/api/player', async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const [existing] = await db.query('SELECT * FROM players WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).json({ error: 'Username already exists' });

    await db.query('INSERT INTO players (username) VALUES (?)', [username]);
    res.status(201).json({ message: 'Player created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST T568B Game submission
// ✅ T568B Easy level submission check and reward
app.post('/api/t568b/easy/submit', async (req, res) => {
  const { username, correct } = req.body;

  if (!username || !Array.isArray(correct)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM players WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = rows[0];

    if (player.networking_easy_perfect === 1) {
      return res.status(200).json({ message: '✅ Easy level already completed!' });
    }

    const correctOrder = [
      'White-Orange', 'Orange', 'White-Green', 'Blue',
      'White-Blue', 'Green', 'White-Brown', 'Brown'
    ];

    const isPerfect = correct.length === 8 &&
      correct.every((c, i) => c === correctOrder[i]);

    if (isPerfect) {
      const rewardPoints = 8 * 190; // You can change the value if needed
      await db.query(`
  UPDATE players
  SET points = points + ?, networking_easy_perfect = 1
  WHERE username = ?
`, [rewardPoints, username]);


      return res.status(200).json({
        message: `🎉 Perfect! +${rewardPoints} points awarded for Easy level.`,
        pointsAwarded: rewardPoints
      });
    } else {
      return res.status(200).json({ message: "❌ Incorrect wiring. Try again!" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/buy-level", async (req, res) => {
  const { username, level, cost } = req.body;
  if (!username || !level || !cost) return res.status(400).send("Missing data");

  const levelColumn =
    level === "medium" ? "networking_medium_unlocked" :
    level === "hard" ? "networking_hard_unlocked" :
    level === "programming_medium" ? "programming_medium_unlocked" :
    level === "programming_hard" ? "programming_hard_unlocked" :
    null;

  if (!levelColumn) return res.status(400).send("Invalid level");

  try {
   const [player] = await db.query("SELECT points FROM players WHERE username = ?", [username]);
    if (!player.length) return res.status(404).send("Player not found");

    if (player[0].points < cost) return res.status(400).send("Not enough points");

    await db.query(
  `UPDATE players SET points = points - ?, ${levelColumn} = 1 WHERE username = ?`,
  [cost, username]
);

    res.send("Level purchased");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/api/networking-medium-perfect", async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Check player exists
        const [rows] = await db.query(
            "SELECT networking_medium_perfect FROM players WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Player not found" });
        }

        // Prevent multiple awards
        if (rows[0].networking_medium_perfect) {
            return res.json({ message: "Already awarded for medium perfect score" });
        }

        // Award points & mark as awarded
        await db.query(
            "UPDATE players SET points = points + 3040, networking_medium_perfect = 1 WHERE username = ?",
            [username]
        );

        res.json({ message: "🏆 3040 points awarded for medium perfect!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
//hard net
app.post('/updateHardPoints', async (req, res) => {
  const { username, points } = req.body;

  if (!username || points == null) {
    return res.status(400).json({ success: false, message: "Missing username or points" });
  }

  console.log(`Updating points for user: ${username} by ${points}`);

  try {
    const result = await db.query(`
      UPDATE players
      SET networking_hard_perfect = 1,
          points = points + ?
      WHERE username = ?;
    `, [points, username]);

    console.log('Update result:', result);

    res.json({ success: true, message: "Points updated successfully" });
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).json({ success: false, message: "Database update failed" });
  }
});
//easy for prog
// ✅ Programming Easy Perfect Score
app.post("/api/programming-easy-perfect", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Check player exists
    const [rows] = await db.query(
      "SELECT programming_easy_perfect FROM players WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Prevent multiple awards
    if (rows[0].programming_easy_perfect) {
      return res.json({ message: "Already awarded for programming easy perfect score" });
    }

    const rewardPoints = 6120;

    // Award points & mark as awarded
    await db.query(
      "UPDATE players SET points = points + ?, programming_easy_perfect = 1 WHERE username = ?",
      [rewardPoints, username]
    );

    res.json({ message: `🏆 ${rewardPoints} points awarded for programming easy perfect!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//medium
app.post("/api/programming-medium-perfect", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    // Check player exists
    const [rows] = await db.query(
      "SELECT programming_medium_perfect FROM players WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Prevent multiple awards
    if (rows[0].programming_medium_perfect) {
      return res.json({ message: "Already awarded for programming medium perfect score" });
    }
    const rewardPoints = 7620;
    // Award points & mark as awarded
    await db.query(
      "UPDATE players SET points = points + ?, programming_medium_perfect = 1 WHERE username = ?",
      [rewardPoints, username]
    );
    res.json({ message: `🏆 ${rewardPoints} points awarded for programming medium perfect!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//hard prog
app.post("/api/programming-hard-perfect", async (req, res) => {  
  try {
    const { username } = req.body; 
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Check player exists
    const [rows] = await db.query(
      "SELECT programming_hard_perfect FROM players WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Prevent multiple awards
    if (rows[0].programming_hard_perfect) {
      return res.json({ message: "Already awarded for programming hard perfect score" });
    }

    const rewardPoints = 9120;  // fix to 9120 points

    // Award points & mark as awarded
    await db.query(
      "UPDATE players SET points = points + ?, programming_hard_perfect = 1 WHERE username = ?",
      [rewardPoints, username]
    );

    res.json({ message: `🏆 ${rewardPoints} points awarded for programming hard perfect!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Start server 
app.listen(port, () => {
  console.log('✅ Backend running at http://localhost:3000');
});
