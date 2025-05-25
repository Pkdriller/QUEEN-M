const { zokou } = require('../framework/zokou');
const { ajouterUtilisateurAvecWarnCount, getWarnCountAndDetailsByJID, resetWarnCountByJID } = require('../bdd/warn');
const s = require("../set");

zokou(
    {
        nomCom: 'warn',
        categorie: 'Group'
    },
    async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifGroupe, verifAdmin, msgRepondu, auteurMsgRepondu } = commandeOptions;

        if (!verifGroupe) {
            repondre('This command can only be used in groups.');
            return;
        }

        if (!verifAdmin && !superUser) {
            repondre('You are not an admin or a superuser.');
            return;
        }

        if (!msgRepondu) {
            repondre('Please reply to the message of the user you want to warn or reset warnings for.');
            return;
        }

        const userJid = auteurMsgRepondu;
        const groupId = dest;
        const warnLimit = parseInt(s.WARN_COUNT) || 3;

        if (arg && arg[0] && arg[0].toLowerCase() === 'reset') {
            await resetWarnCountByJID(groupId, userJid);
            repondre(`Warnings for user @${userJid.split('@')[0]} in this group have been reset.`);
        } else {
            let reason = arg.join(' ').trim() || "No reason provided";
            
            await ajouterUtilisateurAvecWarnCount(groupId, userJid, reason);
            let warnInfo = await getWarnCountAndDetailsByJID(groupId, userJid);
            let warnCount = warnInfo.count;

            repondre(`User @${userJid.split('@')[0]} has been warned (${warnCount}/${warnLimit}).\nReason: ${reason}`);

            if (warnCount >= warnLimit) {
                await repondre(`User @${userJid.split('@')[0]} has reached ${warnCount}/${warnLimit} warnings and will be kicked.`);
                try {
                    await zk.groupParticipantsUpdate(dest, [userJid], "remove");
                    await resetWarnCountByJID(groupId, userJid); // Reset warnings after kick
                    repondre(`User @${userJid.split('@')[0]} has been kicked and their warnings for this group have been reset.`);
                } catch (e) {
                    console.error("Error during kick or reset after kick:", e);
                    repondre(`Failed to kick @${userJid.split('@')[0]}. Please check my permissions.`);
                }
            } else {
                var rest = warnLimit - warnCount;
                repondre(`User @${userJid.split('@')[0]} now has ${warnCount}/${warnLimit} warnings. ${rest} more warnings before kick.`);
            }
        }
    }
);

zokou(
    {
        nomCom: 'checkwarns',
        categorie: 'Group',
        alias: ['warnings']
    },
    async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifGroupe, verifAdmin, msgRepondu, auteurMsgRepondu, auteurMessage } = commandeOptions;

        if (!verifGroupe) {
            repondre('This command can only be used in groups.');
            return;
        }

        let targetJid;

        if (msgRepondu) {
            targetJid = auteurMsgRepondu;
        } else if (arg && arg[0] && arg[0].startsWith('@')) {
            // Attempt to get JID from mention
            // Assuming the framework provides mentionedJid in ms.message.extendedTextMessage.contextInfo.mentionedJid
            // This part might need adjustment based on actual framework capabilities for mention parsing
            const mentioned = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentioned && mentioned[0]) {
                targetJid = mentioned[0];
            } else {
                // Fallback if direct mention JID isn't available, try parsing from arg (less reliable)
                const mentionMatch = arg[0].match(/@(\d+)/);
                if (mentionMatch) {
                    targetJid = mentionMatch[1] + '@s.whatsapp.net';
                } else {
                    repondre('Invalid mention format. Please reply to a user or use a valid @mention.');
                    return;
                }
            }
        } else if (!arg || arg.length === 0) {
            targetJid = auteurMessage; // Check own warnings
        } else {
            repondre('Please reply to a user, mention a user, or use the command without arguments to check your own warnings.');
            return;
        }
        
        if (!targetJid) { // Should ideally be caught by earlier checks
            repondre('Could not determine the target user.');
            return;
        }


        if (targetJid !== auteurMessage && !verifAdmin && !superUser) {
            repondre("You can only check other users' warnings if you are an admin.");
            return;
        }

        const groupId = dest;
        const warnInfo = await getWarnCountAndDetailsByJID(groupId, targetJid);
        const warnCount = warnInfo.count;
        const warnDetails = warnInfo.details;

        if (warnCount === 0) {
            repondre(`User @${targetJid.split('@')[0]} has no warnings in this group.`);
        } else {
            let response = `User @${targetJid.split('@')[0]} has ${warnCount} warning(s) in this group:\n\n`;
            for (let i = 0; i < warnDetails.length; i++) {
                response += `Warning ${i + 1}:\n  Reason: ${warnDetails[i].reason}\n  Date: ${new Date(warnDetails[i].timestamp).toLocaleString()}\n\n`;
            }
            repondre(response);
        }
    }
);
