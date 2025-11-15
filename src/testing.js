import { fetchDocuments, saveDocuments } from "./api/documentService.js";
import CONFIG from './config.js';

///////////////////////////////////////////////////////////////////////////////////////////
// Testing GET API endpoints
///////////////////////////////////////////////////////////////////////////////////////////

const endpoints = Object.values(CONFIG.endpoints); // fetch all endpoints and convert the JSON object to an array
const API_BASE_URL = CONFIG.API_BASE_URL;

// Get API's test
for (const endpoint of endpoints) {
  try{
    console.log(`Fetching from endpoint: ${API_BASE_URL}/${endpoint} 🔃`);
    const data = await fetchDocuments(endpoint);
    console.log(`✅ Data from ${endpoint}:`, data);
  } catch (error) {
    console.error(`❌ Error fetching from ${endpoint}:`, error);
  }
}


///////////////////////////////////////////////////////////////////////////////////////////
// Testing Save API endpoints
///////////////////////////////////////////////////////////////////////////////////////////

const testData = [
  { Documents: 3, Progress: "Test Document 1"},
  { Documents: 4, Progress: "Test Document 2"}
];

const saveEndpoint = 'save';

try {
    console.log(`📊 Saving to endpoint: ${API_BASE_URL}/${saveEndpoint}`);
    await saveDocuments(saveEndpoint, testData);
    console.log(`✅ Test Data saved successfully to ${saveEndpoint}`);
} catch (error) {
    console.error(`❌ Error saving to ${saveEndpoint}:`, error);
};