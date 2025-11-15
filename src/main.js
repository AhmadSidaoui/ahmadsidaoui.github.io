// src/main.js
import { TableManager } from "./ui/TableManager.js";
import CONFIG from "../config.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App initialized");
  console.log(`Environment: ${CONFIG.environment}`);
  console.log(`API Base URL: ${CONFIG.API_BASE_URL}`);

  // Create multiple table instances
  const tables = {};

  // Table 1: Documents
  tables.documents = new TableManager({
    containerId: "table1",
    endpoint: "data",
    autoLoad: true,
    autoSave: false
  });

  // Table 2: Charts
  tables.charts = new TableManager({
    containerId: "table2",
    endpoint: "chart/data",
    autoLoad: true,
    autoSave: false
  });

  // Table 3: Bars
  tables.bars = new TableManager({
    containerId: "table3",
    endpoint: "bar/data",
    autoLoad: true,
    autoSave: true  // Auto-save enabled for this table
  });

  // Make tables available globally for debugging
  window.app = {
    tables,
    config: CONFIG
  };

  console.log("✅ All tables initialized");
});

// Example usage in browser console:
// app.tables.documents.loadData()
// app.tables.documents.saveData()
// app.tables.documents.setEndpoint('new/endpoint')