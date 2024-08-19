const express = require('express');
const app = express();
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const qrCodeGenerator = require('./qrCodeGenerator');
const pairingCodeGenerator = require('./pairingCodeGenerator');

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Verify GitHub username
app.get('/verify', async (req, res) => {
    const { username } = req.query;
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    const repos = await response.json();

    const forked = repos.some(repo => repo.name === 'session-generator');
    
    if (forked) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Serve generator.html for the /generator route
app.get('/generator.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'generator.html'));
});

// Route for generating QR code
app.use('/Rex_qrCode', qrCodeGenerator);

// Route for generating pairing code
app.use('/Rex_PairCode', pairingCodeGenerator);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
