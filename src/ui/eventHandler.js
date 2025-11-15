// src/ui/eventHandler.js
import { fetchDocuments, saveDocuments } from "../api/documentService.js";
import { renderTable } from "./tableRenderer.js";
import DocumentTracker from "../models/DocumentTracker.js";
import CONFIG from "../config.js";

let documents = [];
let currentEndpoint = CONFIG.defaultEndpoint;

/**
 * Load data from the current endpoint
 * @param {string} endpoint - Optional endpoint override
 */
async function loadData(endpoint = currentEndpoint) {
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  const loadingDiv = document.getElementById("loading");

  try {
    if (loadingDiv) loadingDiv.style.display = "block";
    
    console.log(`🔄 Loading data from: ${endpoint}`);
    const rawData = await fetchDocuments(endpoint);
    documents = rawData.map(doc => DocumentTracker.fromJSON(doc));
    renderTable(tableHeader, tableBody, documents);
    console.log("✅ Data loaded and rendered");
    
    if (loadingDiv) loadingDiv.style.display = "none";
  } catch (err) {
    console.error("❌ Failed to load data:", err);
    if (loadingDiv) {
      loadingDiv.innerHTML = `<p style="color: red;">❌ Failed to load data from ${endpoint}. <button onclick="location.reload()">Retry</button></p>`;
    }
  }
}

/**
 * Save data to the current endpoint
 * @param {string} endpoint - Optional endpoint override
 */
async function saveData(endpoint = currentEndpoint) {
  try {
    console.log(`💾 Saving data to: ${endpoint}`);
    const jsonData = documents.map(doc => doc.toJSON());
    await saveDocuments(jsonData, endpoint);
    console.log("✅ Data saved successfully");
    return true;
  } catch (err) {
    console.error("❌ Save failed:", err);
    alert(`Failed to save data to ${endpoint}`);
    return false;
  }
}

/**
 * Initialize all event handlers
 * @param {Object} options - Configuration options
 * @param {string} options.endpoint - Endpoint to use (default: CONFIG.defaultEndpoint)
 * @param {boolean} options.autoLoad - Auto-load data on init (default: true)
 * @param {boolean} options.autoSave - Auto-save on toggle (default: false)
 */
export function initializeEventHandlers(options = {}) {
  const {
    endpoint = CONFIG.defaultEndpoint,
    autoLoad = true,
    autoSave = false
  } = options;

  currentEndpoint = endpoint;

  const refreshBtn = document.getElementById("refreshBtn");
  const saveBtn = document.getElementById("saveBtn");
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");

  // Auto-load data on initialization
  if (autoLoad) {
    loadData(endpoint);
  }

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadData(endpoint));
  }

  // Save button
  if (saveBtn) {
    saveBtn.addEventListener("click", () => saveData(endpoint));
  }

  // Toggle row on button click
  if (tableBody) {
    tableBody.addEventListener("click", async (e) => {
      if (e.target.classList.contains("table-action-btn")) {
        const rowIndex = e.target.closest("tr").rowIndex - 1;
        const doc = documents[rowIndex];
        if (!doc) return;

        doc.toggleStatus();
        renderTable(tableHeader, tableBody, documents);

        // Auto-save if enabled
        if (autoSave) {
          await saveData(endpoint);
        }
      }
    });
  }
}

/**
 * Change the active endpoint and reload data
 * @param {string} newEndpoint - New endpoint to use
 */
export function switchEndpoint(newEndpoint) {
  console.log(`🔄 Switching to endpoint: ${newEndpoint}`);
  currentEndpoint = newEndpoint;
  loadData(newEndpoint);
}

// Export for external use
export { loadData, saveData };