// src/ui/TableManager.js
import { fetchDocuments, saveDocuments } from "../api/documentService.js";
import { renderTable } from "./tableRenderer.js";
import DocumentTracker from "../models/DocumentTracker.js";

export class TableManager {
  constructor(config) {
    this.config = {
      containerId: config.containerId,
      endpoint: config.endpoint,
      autoLoad: config.autoLoad !== false,
      autoSave: config.autoSave || false,
      tableHeaderId: `${config.containerId}-header`,
      tableBodyId: `${config.containerId}-body`,
      refreshBtnId: `${config.containerId}-refresh`,
      saveBtnId: `${config.containerId}-save`,
      loadingId: `${config.containerId}-loading`
    };

    this.documents = [];
    this.container = document.getElementById(this.config.containerId);

    if (!this.container) {
      throw new Error(`Container with ID "${this.config.containerId}" not found`);
    }

    this.init();
  }

  init() {
    // Get DOM elements
    this.tableHeader = document.getElementById(this.config.tableHeaderId);
    this.tableBody = document.getElementById(this.config.tableBodyId);
    this.refreshBtn = document.getElementById(this.config.refreshBtnId);
    this.saveBtn = document.getElementById(this.config.saveBtnId);
    this.loadingDiv = document.getElementById(this.config.loadingId);

    // Setup event listeners
    this.setupEventListeners();

    // Auto-load data if enabled
    if (this.config.autoLoad) {
      this.loadData();
    }
  }

  setupEventListeners() {
    // Refresh button
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener("click", () => this.loadData());
    }

    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => this.saveData());
    }

    // Toggle button
    if (this.tableBody) {
      this.tableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("table-action-btn")) {
          const rowIndex = e.target.closest("tr").rowIndex - 1;
          const doc = this.documents[rowIndex];
          if (!doc) return;

          doc.toggleStatus();
          renderTable(this.tableHeader, this.tableBody, this.documents);

          // Auto-save if enabled
          if (this.config.autoSave) {
            await this.saveData();
          }
        }
      });
    }
  }

  async loadData() {
    try {
      if (this.loadingDiv) this.loadingDiv.style.display = "block";

      console.log(`🔄 [${this.config.containerId}] Loading from: ${this.config.endpoint}`);
      const rawData = await fetchDocuments(this.config.endpoint);
      this.documents = rawData.map(doc => DocumentTracker.fromJSON(doc));
      renderTable(this.tableHeader, this.tableBody, this.documents);
      console.log(`✅ [${this.config.containerId}] Data loaded`);

      if (this.loadingDiv) this.loadingDiv.style.display = "none";
    } catch (err) {
      console.error(`❌ [${this.config.containerId}] Load failed:`, err);
      if (this.loadingDiv) {
        this.loadingDiv.innerHTML = `<p style="color: red;">❌ Failed to load. <button onclick="location.reload()">Retry</button></p>`;
      }
    }
  }

  async saveData() {
    try {
      console.log(`💾 [${this.config.containerId}] Saving to: ${this.config.endpoint}`);
      const jsonData = this.documents.map(doc => doc.toJSON());
      await saveDocuments(jsonData, this.config.endpoint);
      console.log(`✅ [${this.config.containerId}] Saved successfully`);
      return true;
    } catch (err) {
      console.error(`❌ [${this.config.containerId}] Save failed:`, err);
      alert(`Failed to save data for ${this.config.containerId}`);
      return false;
    }
  }

  // Change endpoint dynamically
  setEndpoint(newEndpoint) {
    console.log(`🔄 [${this.config.containerId}] Switching to: ${newEndpoint}`);
    this.config.endpoint = newEndpoint;
    this.loadData();
  }

  // Get current documents
  getDocuments() {
    return this.documents;
  }

  // Refresh the table display
  refresh() {
    renderTable(this.tableHeader, this.tableBody, this.documents);
  }
}