const express = require('express');
const QRCode = require('qrcode');
const pino = require("pino");
const { useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");
const { makeid } = require('./id');
const fs = require('fs');

const router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
    const id = makeid();

    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
        let Qr_Code_By_Rex_Emperor = RexEmperor({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop"),
        });

        Qr_Code_By_Rex_Emperor.ev.on('creds.update', saveCreds);
        Qr_Code_By_Rex_Emperor.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr) await res.end(await QRCode.toBuffer(qr));
            if (connection == "open") {
                await delay(5000);
                let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                await delay(800);
                let b64data = Buffer.from(data).toString('base64');
                let session = await Qr_Code_By_Rex_Emperor.sendMessage(Qr_Code_By_Rex_Emperor.user.id, { text: '' + b64data });

                let AbraXas_MD_TEXT = `Session Connected Successfully`;
                await Qr_Code_By_Rex_Emperor.sendMessage(Qr_Code_By_Rex_Emperor.user.id, { text: AbraXas_MD_TEXT }, { quoted: session });

                await delay(100);
                await Qr_Code_By_Rex_Emperor.ws.close();
                return await removeFile("temp/" + id);
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                await delay(10000);
                Rex_Emperor_QR_CODE();
            }
        });
    } catch (err) {
        if (!res.headersSent) {
            await res.json({ code: "Service is Currently Unavailable" });
        }
        console.log(err);
        await removeFile("temp/" + id);
    }
});

module.exports = router;
