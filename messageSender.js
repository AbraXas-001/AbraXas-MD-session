async function sendMessage(client, recipient, message, quoted) {
    return await client.sendMessage(recipient, { text: message }, { quoted });
}

module.exports = { sendMessage };
