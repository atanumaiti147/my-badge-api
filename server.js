const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow requests from any origin

// --- Badge Data (Example) ---
// Real project mein aap ise database se connect karoge (MongoDB/JSON file)
const userBadges = {
    // Format: 'discord_user_id': { isDeveloper: true, isAdmin: true, ... }
    '123456789012345678': { isDeveloper: true, isSupporter: true },
    '987654321098765432': { isAdmin: true, isStaff: true },
    '111122223333444455': { isDeveloper: true, isBugHunters: true },
};

// --- API Endpoint ---
// Bot yahi endpoint call karega: /getbadges?userid=ID
app.get('/getbadges', (req, res) => {
    const userId = req.query.userid;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userid parameter' });
    }

    // Find user's badges, if none return empty object
    const badges = userBadges[userId] || {};
    res.json(badges);
});

// Start server
app.listen(PORT, () => {
    console.log(`Badge API running on port ${PORT}`);
});