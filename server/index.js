const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// 1. Search Dictionary (Prefix/Fuzzy)
app.get('/api/dictionary/search', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json([]);
    }

    const sql = `
    SELECT * FROM dictionary 
    WHERE turkish LIKE ? OR ottoman LIKE ? 
    LIMIT 20
  `;
    const param = `%${q}%`;

    db.all(sql, [param, param], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 2. Exact Lookup (for Converter)
app.get('/api/dictionary/lookup', (req, res) => {
    const { word } = req.query;
    if (!word) {
        return res.status(400).json({ error: 'Word parameter is required' });
    }

    const sql = `SELECT ottoman FROM dictionary WHERE turkish = ? COLLATE NOCASE LIMIT 1`;
    db.get(sql, [word], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ ottoman: row ? row.ottoman : null });
    });
});

// 3. Batch Lookup (Optimization for Converter)
app.post('/api/dictionary/batch-lookup', (req, res) => {
    const { words } = req.body; // Array of strings
    if (!words || !Array.isArray(words)) {
        return res.status(400).json({ error: 'Words array is required' });
    }

    if (words.length === 0) return res.json({});

    const placeholders = words.map(() => '?').join(',');
    const sql = `SELECT turkish, ottoman FROM dictionary WHERE turkish IN (${placeholders}) COLLATE NOCASE`;

    db.all(sql, words, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Convert to map for easy lookup
        const map = {};
        rows.forEach(row => {
            map[row.turkish.toLowerCase()] = row.ottoman;
        });
        res.json(map);
    });
});

// 4. Add Word (Admin)
app.post('/api/dictionary', (req, res) => {
    const { turkish, ottoman, category } = req.body;

    if (!turkish || !ottoman) {
        return res.status(400).json({ error: 'Turkish and Ottoman fields are required' });
    }

    const sql = `INSERT INTO dictionary (turkish, ottoman, category) VALUES (?, ?, ?)`;
    db.run(sql, [turkish, ottoman, category || 'GENERAL'], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, turkish, ottoman, category });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
