const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const { MENU_SOURCE_URL } = require(__dirname + "/../set");

zokou({ nomCom: "menu2", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }
    });


    

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('Etc/GMT');

// Create date and time in GMT
const temps = moment().format('HH:mm:ss');
const date = moment().format('DD/MM/YYYY');

  let infoMsg =  `
╭────《J𝖀𝗦𝐓Λ-𝗧𝙕 𝚳𝐃》────
┴  ╭─────────────
│❒⁠⁠⁠⁠│ *ADMIN* : ${s.OWNER_NAME}
│❒│⁠⁠⁠⁠ *CALENDAR* : ${date}
│❒│⁠⁠⁠⁠ *PREFIX* : ${s.PREFIXE}
│❒⁠⁠⁠⁠│⁠⁠⁠ *BOT IS IN* : ${mode} mode
│❒│⁠⁠⁠⁠ *COMMANDS* : ${cm.length} 
│❒│⁠⁠⁠⁠ *SPACE* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│❒│⁠⁠⁠⁠ *PLATFORM* : ${os.platform()}
│❒│⁠⁠⁠⁠ *THEME* : *NEXUS-AI 🚀*
┬  ╰──────────────
╰─── ··《NEXUS-AI》··──\n`;
    
let menuMsg = `
 ─────────
  *☠️ NEXUS-AI ☠️* 
 ─────────


 *COMMANDS*
`;

    for (const cat in coms) {
        menuMsg += ` ╭─⬡ *${cat}* ⬡─`;
        for (const cmd of coms[cat]) {
            menuMsg += `
⬡│▸ *${cmd}*`;
        }
        menuMsg += `
  ╰────────────·· \n`
    }

    menuMsg += `

|⏣𝐌𝐀𝐃𝐄 𝐄𝐀𝐒𝐘 𝐛𝐲 pkdriller 🚀
*❒⁠⁠⁠⁠—————————— ❒⁠⁠⁠⁠——————————❒⁠⁠⁠⁠*
`;

var lien = mybotpic();

if (lien.match(/\.(mp4|gif)$/i)) {
 try {
     zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Powered by NEXUS-AI" , gifPlayback : true }, { quoted: ms });
 }
 catch (e) {
     console.error("Error sending media message in menu:", e);
     repondre("Error sending menu media: " + e.message);
 }
} 
// Verification for .jpeg or .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
 try {
     zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Powered by NEXUS-AI" }, { quoted: ms });
 }
 catch (e) {
     console.error("Error sending media message in menu:", e);
     repondre("Error sending menu media: " + e.message);
 }
}
// Send a text message with the hidden Source URL
else {
    try {
        const sourceUrl = MENU_SOURCE_URL; // Define sourceUrl here
        zk.sendMessage(dest, {
            text: infoMsg + menuMsg,
            contextInfo: {
                externalAdReply: {
                    sourceUrl: sourceUrl,
                    title: "View Channel",
                    body: "Click to view the channel"
                }
            }
        }, { quoted: ms });
    } catch (e) {
        console.error("Error sending menu message:", e);
        repondre("Error sending menu: " + e.message);
    }
}