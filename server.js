const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Helper to fetch random from array ---
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- External APIs Configuration ---
const FUN_GEN_API_KEY = process.env.FUN_GEN_API_KEY || ''; // Agar key ho to daalna, optional

// --- Local fallback prompts (if external APIs fail) ---
const fallbackBanks = {
    truth: [
        "What's a secret you've never told anyone?",
        "What's your biggest fear?",
        "What's the most embarrassing thing you've done?",
        "What's something you regret not doing?",
        "What's a lie you've told recently?",
    ],
    dare: [
        "Send a voice message singing a song.",
        "Change your nickname to 'Potato' for 10 minutes.",
        "Do 10 pushups now!",
        "Send your most used emoji three times in a row.",
        "Tell the channel your most chaotic snack combo.",
    ],
    paranoia: [
        "Who in this server is most likely to be a secret agent?",
        "Who would survive a zombie apocalypse longest?",
        "Who do you think has a secret crush on someone here?",
        "Who is most likely to become famous?",
        "Who is the most mysterious person in this server?",
    ],
    wyr: [
        { optionA: "Have super strength", optionB: "Have super speed" },
        { optionA: "Live in the mountains", optionB: "Live on a beach" },
        { optionA: "Be able to fly", optionB: "Be invisible" },
        { optionA: "Talk to animals", optionB: "Speak every language" },
        { optionA: "Never need to sleep", optionB: "Never need to eat" },
    ],
};

// --- Core Function to Fetch from External APIs ---
async function fetchFromExternal(endpoint, type) {
    try {
        let url, response, data;
        switch (endpoint) {
            case 'truth':
                url = 'https://fungenerators.com/random/text/truth';
                response = await axios.get(url, { headers: { 'Authorization': `Bearer ${FUN_GEN_API_KEY}` } });
                data = response.data;
                return data?.contents?.question || null;
            case 'dare':
                url = 'https://fungenerators.com/random/text/dare';
                response = await axios.get(url, { headers: { 'Authorization': `Bearer ${FUN_GEN_API_KEY}` } });
                data = response.data;
                return data?.contents?.question || null;
            case 'paranoia':
                url = 'https://fungenerators.com/random/text/paranoia';
                response = await axios.get(url, { headers: { 'Authorization': `Bearer ${FUN_GEN_API_KEY}` } });
                data = response.data;
                return data?.contents?.question || null;
            case 'wyr':
                // Using either.io free API
                url = 'https://api.either.io/random';
                response = await axios.get(url);
                data = response.data;
                if (data && data.sentence) {
                    // Convert "Would you rather X or Y?" to { optionA, optionB }
                    const sentence = data.sentence;
                    const match = sentence.match(/Would you rather (.+?) or (.+?)\?/i);
                    if (match) {
                        return { optionA: match[1].trim(), optionB: match[2].trim() };
                    }
                }
                return null;
            default:
                return null;
        }
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

// --- Endpoint Handlers ---
app.get('/truth', async (req, res) => {
    let question = await fetchFromExternal('truth');
    if (!question) {
        question = randomItem(fallbackBanks.truth);
    }
    res.json({ truth: question });
});

app.get('/dare', async (req, res) => {
    let challenge = await fetchFromExternal('dare');
    if (!challenge) {
        challenge = randomItem(fallbackBanks.dare);
    }
    res.json({ dare: challenge });
});

app.get('/paranoia', async (req, res) => {
    let question = await fetchFromExternal('paranoia');
    if (!question) {
        question = randomItem(fallbackBanks.paranoia);
    }
    res.json({ question });
});

app.get('/wyr', async (req, res) => {
    let options = await fetchFromExternal('wyr');
    if (!options) {
        options = randomItem(fallbackBanks.wyr);
    }
    res.json({ optionA: options.optionA, optionB: options.optionB });
});

// --- Health Check Route ---
app.get('/', (req, res) => res.send('🎉 Badge & Game API is running!'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
