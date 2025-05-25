const fs = require('fs');
const path = require('path');

// Path to the JSON file storing warning user data
const filePath = path.join(__dirname, '../xmd/warn_users.json');

// Load data from the JSON file
function loadWarnData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {}; // Return an empty object if the file doesn't exist or there's an error
  }
}

// Save data to the JSON file
function saveWarnData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Create the default file if it doesn't exist
if (!fs.existsSync(filePath)) {
  saveWarnData({});
}

// Function to add or update the warning count for a user (jid) in a specific group
async function ajouterUtilisateurAvecWarnCount(groupId, jid, reason = "No reason provided") {
  try {
    const data = loadWarnData();

    // Ensure group exists
    if (!data[groupId]) {
      data[groupId] = {};
    }

    // Ensure user exists in group
    if (!data[groupId][jid]) {
      data[groupId][jid] = { count: 0, details: [] };
    }

    data[groupId][jid].count += 1;
    const timestamp = new Date().toISOString();
    data[groupId][jid].details.push({ reason: reason, timestamp: timestamp });

    saveWarnData(data);
    console.log(`User ${jid} in group ${groupId} updated/added. New warn count: ${data[groupId][jid].count}.`);
  } catch (error) {
    console.error("Error adding or updating user warn count:", error);
  }
}

// Function to get the warning count and details for a user (jid) in a specific group
async function getWarnCountAndDetailsByJID(groupId, jid) {
  try {
    const data = loadWarnData();

    if (data[groupId] && data[groupId][jid]) {
      return data[groupId][jid];
    } else {
      return { count: 0, details: [] }; // Default if user or group not found
    }
  } catch (error) {
    console.error("Error retrieving warn count and details:", error);
    return { count: 0, details: [] }; // Default error value
  }
}

// Function to reset the warning count and details for a user (jid) in a specific group
async function resetWarnCountByJID(groupId, jid) {
  try {
    const data = loadWarnData();

    if (data[groupId] && data[groupId][jid]) {
      data[groupId][jid].count = 0;
      data[groupId][jid].details = [];
      saveWarnData(data);
      console.log(`Warn count for user ${jid} in group ${groupId} has been reset.`);
    } else {
      console.log(`User ${jid} in group ${groupId} not found or no warnings to reset.`);
    }
  } catch (error) {
    console.error("Error resetting warn count:", error);
  }
}

module.exports = {
  ajouterUtilisateurAvecWarnCount,
  getWarnCountAndDetailsByJID, // Updated function name
  resetWarnCountByJID,
};