
export function clearTable(tableHeader, tableBody) {
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";
}

export function createHeader(tableHeader, data) {
  if (!data || data.length === 0) return;

  const headerRow = document.createElement("tr");

  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  const actionTh = document.createElement("th");
  actionTh.textContent = "Actions";
  headerRow.appendChild(actionTh);

  tableHeader.appendChild(headerRow);
}

export function renderTable(tableHeader, tableBody, documents) {
  clearTable(tableHeader, tableBody);
  if (!documents || documents.length === 0) return;

  createHeader(tableHeader, documents.map((d) => d.toJSON()));

  documents.forEach((doc) => {
    const tr = document.createElement("tr");

    const json = doc.toJSON();
    Object.values(json).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    // Add toggle button
    const actionTd = document.createElement("td");
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = "Toggle";
    toggleBtn.className = "table-action-btn";
    actionTd.appendChild(toggleBtn);
    tr.appendChild(actionTd);

    // Highlight completed
    if (doc.isCompleted()) {
      tr.style.backgroundColor = "lightgreen";
      tr.style.fontWeight = "bold";
    }

    tableBody.appendChild(tr);
  });
}