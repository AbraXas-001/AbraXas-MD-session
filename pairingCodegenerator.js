const express = require('express');
const pino = require("pino");
const { useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require("maher-zubair-baileys");
const { makeid } = require('./id');
const { sendMessage } = require('./messageSender');
const fs = require('fs');

const router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
        let Pair_Code_By_Rex_Emperor = Rex_Emperor({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            browser: ["Chrome (Linux)", "", ""]
        });

        if (!Pair_Code_By_Rex_Emperor.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await Pair_Code_By_Rex_Emperor.registerUser(num);

            if (code) {
                await sendMessage(Pair_Code_By_Rex_Emperor, Pair_Code_By_Rex_Emperor.user.id, `Pairing Code: ${code}`);
                await res.json({ code });
            } else {
                await res.json({ code: "Failed to generate pairing code." });
            }
        }

        await delay(100);
        await Pair_Code_By_Rex_Emperor.ws.close();
        return await removeFile("temp/" + id);
    } catch (err) {
        if (!res.headersSent) {
            await res.json({ code: "Service is Currently Unavailable" });
        }
        console.log(err);
        await removeFile("temp/" + id);
    }
});

module.exports = router;
