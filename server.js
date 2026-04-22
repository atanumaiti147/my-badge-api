const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB Connection ---
// Environment variable se URI lo (Render settings mein set karo)
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI environment variable not set.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// --- Profile Model (Exactly same as bot's schema) ---
const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    bio: { type: String, default: "This user has no bio yet." },
    badges: { type: [String], default: [] },
    backgroundKey: { type: String, default: null },
    backgroundPath: { type: String, default: null }
});
const Profile = mongoose.model('Profile', ProfileSchema);

app.use(cors());

// --- Helper: Convert badge keys to bot's expected response ---
function formatBadgesResponse(badgeKeys) {
    const response = {};
    // Mapping from stored badge key (e.g., "OWNER") to bot's expected field (e.g., "isOwner")
    const keyToFieldMap = {
        'OWNER': 'isOwner',
        'DEVELOPER': 'isDeveloper',
        'ADMIN': 'isAdmin',
        'MODERATOR': 'isModerator',
        'VIP': 'isSupporter',      // Example: VIP ko Supporter me map kiya
        'CONTRIBUTOR': 'isContributor', // Agar ye field bot map me nahi hai toh add karna hoga
        'STAFF': 'isStaff',
        'SUPPORTER': 'isSupporter',
        'BUG_HUNTER': 'isBugHunters',
        'COMMUNITY_MANAGER': 'isCommunityManager',
        'MANAGER': 'isManager',
        'SPECIAL': 'isSpecialOnes'
    };

    badgeKeys.forEach(key => {
        const field = keyToFieldMap[key];
        if (field) {
            response[field] = true;
        }
        // Agar koi key map nahi hai toh ignore
    });

    return response;
}

// --- API Endpoint ---
app.get('/getbadges', async (req, res) => {
    const userId = req.query.userid;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userid parameter' });
    }

    try {
        const profile = await Profile.findOne({ userId });
        if (profile && Array.isArray(profile.badges) && profile.badges.length > 0) {
            const response = formatBadgesResponse(profile.badges);
            res.json(response);
        } else {
            res.json({}); // Empty object = no badges
        }
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Badge API running on port ${PORT}`);
});
