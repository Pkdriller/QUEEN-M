const { zokou } = require('../framework/zokou');
const { getDataFromAlive } = require('../bdd/alive.js');
const s = require('../set');
const os = require('os'); // process.uptime is more direct for Node.js uptime

zokou({
    nomCom: 'alive',
    categorie: 'General',
    reaction: '🤖'
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, nomAuteurMessage } = commandeOptions;

    try {
        const aliveSettings = await getDataFromAlive();

        let uptimeStr = "";
        if (aliveSettings.show_uptime) {
            const uptimeSeconds = process.uptime();
            const days = Math.floor(uptimeSeconds / (24 * 3600));
            const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = Math.floor(uptimeSeconds % 60);
            uptimeStr = `\n*Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        let ownerNameStr = "";
        if (aliveSettings.show_owner) {
            const ownerName = aliveSettings.owner_name_override || s.OWNER_NAME || "NEXUS-AI Owner";
            ownerNameStr = `\n*Owner:* ${ownerName}`;
        }

        let messageText = aliveSettings.message || `${s.BOT_NAME || 'NEXUS-AI'} is running!`;
        messageText += `\n*User:* ${nomAuteurMessage}`;
        messageText += uptimeStr;
        messageText += ownerNameStr;
        messageText += `\n*Prefix:* ${s.PREFIXE}`;
        messageText += `\n*Mode:* ${(s.MODE || 'public').toLowerCase() === 'yes' ? 'Public' : 'Private'}`;

        const lien = aliveSettings.lien;

        if (lien && (lien.match(/\.(jpeg|png|jpg)$/i) || lien.match(/\.(mp4|gif)$/i))) {
            try {
                if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                    await zk.sendMessage(dest, { image: { url: lien }, caption: messageText }, { quoted: ms });
                } else { // mp4 or gif
                    await zk.sendMessage(dest, { video: { url: lien }, caption: messageText, gifPlayback: true }, { quoted: ms });
                }
            } catch (e) {
                console.error("Error sending alive message with media:", e);
                // Fallback to text message if media sending fails
                await repondre(messageText);
            }
        } else {
            await repondre(messageText);
        }

    } catch (error) {
        console.error("Error in alive command:", error);
        repondre("An error occurred while fetching alive message settings.");
    }
});

const { updateAliveSettings } = require('../bdd/alive.js'); // Add this import

zokou({
    nomCom: 'setalive',
    categorie: 'Admin',
    reaction: '⚙️'
}, async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, superUser, auteurMessage } = commandeOptions;

    if (!superUser) {
        return repondre("This command is reserved for the bot owner/superusers.");
    }

    const subCommand = arg[0] ? arg[0].toLowerCase() : '';
    const value = arg.slice(1).join(' ').trim();
    let currentSettings = await getDataFromAlive(); // getDataFromAlive is already imported
    let settingChanged = false;
    let responseMsg = "";

    switch (subCommand) {
        case 'message':
            if (!value) { return repondre("Please provide a message. Usage: .setalive message <your text>"); }
            currentSettings.message = value; settingChanged = true;
            responseMsg = "Alive message updated."; break;
        case 'lien':
            if (!value) { return repondre("Please provide a URL. Usage: .setalive lien <image_or_gif_url>"); }
            currentSettings.lien = value; settingChanged = true;
            responseMsg = "Alive media link updated."; break;
        case 'reset_lien':
            currentSettings.lien = ""; settingChanged = true;
            responseMsg = "Alive media link reset."; break;
        case 'show_uptime':
            if (value === 'true') { currentSettings.show_uptime = true; settingChanged = true; }
            else if (value === 'false') { currentSettings.show_uptime = false; settingChanged = true; }
            else { return repondre("Invalid value. Usage: .setalive show_uptime true|false"); }
            responseMsg = `Show uptime set to ${currentSettings.show_uptime}.`; break;
        case 'show_owner':
            if (value === 'true') { currentSettings.show_owner = true; settingChanged = true; }
            else if (value === 'false') { currentSettings.show_owner = false; settingChanged = true; }
            else { return repondre("Invalid value. Usage: .setalive show_owner true|false"); }
            responseMsg = `Show owner set to ${currentSettings.show_owner}.`; break;
        case 'owner_override':
            currentSettings.owner_name_override = value; settingChanged = true;
            responseMsg = value ? "Custom owner name updated." : "Custom owner name reset (will use default)."; break;
        case 'reset_owner_override':
            currentSettings.owner_name_override = ""; settingChanged = true;
            responseMsg = "Custom owner name reset (will use default)."; break;
        case 'show_settings':
            repondre(`Current Alive Settings:
Message: ${currentSettings.message}
Lien: ${currentSettings.lien || 'Not set'}
Show Uptime: ${currentSettings.show_uptime}
Show Owner: ${currentSettings.show_owner}
Owner Override: ${currentSettings.owner_name_override || 'Not set'}`);
            return; // No settings changed
        default:
            return repondre(`Invalid subcommand. Available options: message, lien, reset_lien, show_uptime, show_owner, owner_override, reset_owner_override, show_settings`);
    }

    if (settingChanged) {
        await updateAliveSettings(currentSettings);
        repondre(responseMsg);
    }
});
