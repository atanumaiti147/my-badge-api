const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Mongoose import karein
const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB Connection ---
// Aapka MongoDB URI yahan daalein (Environment variable use karna best hai)
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_connection_string';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- User Model Define Karein ---
// Yeh schema bilkul vaisa hi hona chahiye jaise aapke bot mein use hota hai
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    badges: { type: [String], default: [] }
});
const User = mongoose.model('User', UserSchema);

app.use(cors());

// --- API Endpoint ---
app.get('/getbadges', async (req, res) => {
    const userId = req.query.userid;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userid parameter' });
    }

    try {
        // Database mein user ko userId se dhundhein
        const userData = await User.findOne({ userId: userId });
        
        // Agar user mil gaya toh uske badges bhejo, nahi toh empty object bhejo
        if (userData && userData.badges) {
            // Bot ke map array ke hisaab se response format karein
            const response = {};
            userData.badges.forEach(badge => {
                // Yahan aapko bot ke map array ke hisaab se keys set karni hongi
                if (badge === 'Developer') response.isDeveloper = true;
                else if (badge === 'Owner') response.isOwner = true;
                else if (badge === 'Admin') response.isAdmin = true;
                // ... aur bhi badges
            });
            res.json(response);
        } else {
            res.json({});
        }
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Badge API running on port ${PORT}`);
});
