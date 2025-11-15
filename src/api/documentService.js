// src/api/documentService.js
import CONFIG from '../config.js';

const API_BASE_URL = CONFIG.API_BASE_URL;

/**
 * Fetch data from any endpoint
 * @param {string} endpoint - API endpoint (e.g., 'data', 'chart/data')
 * @returns {Promise<Array>} - Array of data objects
 */

export async function fetchDocuments(endpoint) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);

  if (!response.ok) 
    throw new Error(`Error fetching data: ${response.status}`);

  const json = await response.json();
  console.log(`✅ Data fetched from ${endpoint}`);
  return json.data;
}

/**
 * Save data to any endpoint
 * @param {Array|Object} data - Data to save
 * @param {string} endpoint - API endpoint (e.g., 'data', 'chart/data')
 * @returns {Promise<void>}
 */

export async function saveDocuments(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }), // wrap data in an object
  });

  if (!response.ok) throw new Error(`Error saving: ${response.status}`);
  console.log(`✅ Data saved to ${endpoint}`);
}


/**
 * Generic API call function - for maximum flexibility
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}






