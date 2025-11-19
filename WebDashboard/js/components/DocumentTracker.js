import { Config } from '../core/Config.js';

// =============================================================================
// DOCUMENT TRACKER - Handles document tracking table
// =============================================================================
export class DocumentTracker {
  static table = document.getElementById("tableCSV");
  static tableHeader = document.getElementById("tableHeader");
  static tableBody = document.getElementById("tableBody");
  static hasUnsavedChanges = false;
  static isLoading = false;

  static init() {
    this.initializeEventListeners();
    this.loadCSVData();
  }

  static initializeEventListeners() {
    this.tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains(`table-action-btn`)) {
        this.toggleRow(e.target);
      }
    });
  }

  static async loadCSVData() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      console.log("Loading Table Data 🔃");
      const response = await fetch(Config.API_BASE_URL + "/data");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.success) {
        this.renderTable(data.data);
        this.hasUnsavedChanges = false;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  static cleartable() {
    this.tableHeader.innerHTML = ``;
    this.tableBody.innerHTML = ``;    
  }

  static createHeader(data) {
    const headerRow = document.createElement('tr');
    
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    
    const actionTh = document.createElement("th");
    actionTh.textContent = "Actions";
    headerRow.appendChild(actionTh);

    return headerRow;
  }

  static renderTable(data) {
    this.cleartable();

    if (!data || data.length === 0) {
      console.log("No data to render");
      return;
    }

    const headerRow = this.createHeader(data);
    this.tableHeader.appendChild(headerRow);

    data.forEach((row) => {
      this.createTableRow(row);
    });
  }

  static createTableRow(rowData) {
    const tr = document.createElement("tr");

    Object.values(rowData).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const secondCell = tr.cells[1];
    if (secondCell && secondCell.textContent.trim().toLowerCase() === "completed") {
      tr.style.backgroundColor = "lightgreen";
      Array.from(tr.cells).forEach((cell) => (cell.style.fontWeight = "bold"));
    }

    const actionTd = document.createElement("td");
    const togglebtn = document.createElement("button");
    togglebtn.type = "button";
    togglebtn.textContent = "Toggle";
    togglebtn.className = `table-action-btn`;
    actionTd.appendChild(togglebtn);
    tr.appendChild(actionTd);

    this.tableBody.appendChild(tr);
    return tr;
  }

  static toggleRow(button) {
    console.log("🟡 toggleRow called");

    const row = button.closest("tr");
    const secondCell = row.cells[1];

    if (!secondCell) return;

    const currentStatus = secondCell.textContent.trim().toLowerCase();

    if (currentStatus === "completed") {
      secondCell.textContent = "Pending";
      row.style.backgroundColor = "";
      Array.from(row.cells).forEach((cell) => {
        cell.style.fontWeight = "normal";
      });
    } else {
      secondCell.textContent = "Completed";
      row.style.backgroundColor = "lightgreen";
      Array.from(row.cells).forEach((cell) => {
        cell.style.fontWeight = "bold";
      });
    }

    this.hasUnsavedChanges = true;
    console.log("🟡 About to call saveChanges");
    this.saveChanges();
    console.log("🟡 saveChanges returned");
  }

  static async saveChanges() {
    console.log("🔵 saveChanges called");

    try {
      console.log("🔵 Building data...");
      
      const headerCells = this.tableHeader.querySelectorAll("th");
      const headers = Array.from(headerCells)
        .map((th) => th.textContent)
        .filter((header) => header !== "Actions");

      const data = [];
      const rows = this.tableBody.querySelectorAll("tr");

      rows.forEach((row) => {
        const rowData = {};
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = cell.textContent.trim();
          }
        });

        if (Object.keys(rowData).length > 0) {
          data.push(rowData);
        }
      });

      console.log("🔵 Sending fetch request...", data);
      const response = await fetch(Config.API_BASE_URL + "/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data }),
      });

      console.log("🔵 Fetch response received:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("🔵 Save completed successfully");
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.error("🔵 Error saving data:", error);
    }

    console.log("🔵 saveChanges function finished");
  }
}