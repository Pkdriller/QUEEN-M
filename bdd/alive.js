const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../xmd/alive.json');

// Default settings
const defaultSettings = {
  message: "NEXUS-AI is alive!",
  lien: "",
  show_uptime: true,
  show_owner: true,
  owner_name_override: ""
};

// Load data from JSON file
function loadAliveData() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      // Merge with defaults to ensure all keys are present
      return { ...defaultSettings, ...parsedData };
    }
    return { ...defaultSettings }; // Return default if file doesn't exist
  } catch (err) {
    console.error("Error loading alive data, returning defaults:", err);
    return { ...defaultSettings }; // Return default on error
  }
}

// Save data to JSON file
function saveAliveData(data) {
  // Ensure we only save the defined fields, excluding any old 'id' field
  const dataToSave = {
    message: data.message !== undefined ? data.message : defaultSettings.message,
    lien: data.lien !== undefined ? data.lien : defaultSettings.lien,
    show_uptime: data.show_uptime !== undefined ? data.show_uptime : defaultSettings.show_uptime,
    show_owner: data.show_owner !== undefined ? data.show_owner : defaultSettings.show_owner,
    owner_name_override: data.owner_name_override !== undefined ? data.owner_name_override : defaultSettings.owner_name_override,
  };
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
}

// Create default data if not exists
if (!fs.existsSync(filePath)) {
  saveAliveData({ ...defaultSettings });
}

// Function to update settings in 'alive'
async function updateAliveSettings(newSettings) {
  try {
    const currentData = loadAliveData();
    const updatedData = { ...currentData, ...newSettings };
    saveAliveData(updatedData);
    console.log("Alive settings updated.");
  } catch (error) {
    console.error("Error while updating alive settings:", error);
  }
}

// Function to get data from 'alive'
async function getDataFromAlive() {
  try {
    const data = loadAliveData(); // This now always returns a full object with defaults
    return data;
  } catch (error) {
    console.error("Error while retrieving alive data:", error);
    return { ...defaultSettings }; // Return defaults in case of an unexpected error
  }
}

module.exports = {
  updateAliveSettings,
  getDataFromAlive,
};