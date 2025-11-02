class CSVTableEditor {
    constructor() {
        this.table = document.getElementById('csvTable');
        this.tableHeader = document.getElementById('tableHeader');
        this.tableBody = document.getElementById('tableBody');
        this.messageDiv = document.getElementById('message');
        this.hasUnsavedChanges = false;
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.loadCSVData();
    }

    initializeEventListeners() {
        document.getElementById('addRow').addEventListener('click', () => this.addNewRow());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveChanges());
        document.getElementById('refreshBtn').addEventListener('click', () => this.confirmRefresh());
        
        // Add event delegation for dynamic elements
        this.tableBody.addEventListener('input', (e) => {
            if (e.target.classList.contains('editable')) {
                this.hasUnsavedChanges = true;
                this.showMessage('You have unsaved changes. Click "Save Changes" to update CSV.', 'info');
            }
        });
        
        this.tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-row')) {
                this.deleteRow(e.target);
            }
        });

        // Prevent refresh when user is typing
        this.tableBody.addEventListener('focusin', () => {
            this.isUserEditing = true;
        });

        this.tableBody.addEventListener('focusout', () => {
            this.isUserEditing = false;
        });
    }

    async loadCSVData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            console.log('Loading CSV data...');
            const response = await fetch('http://localhost:3000/api/data');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.renderTable(data.data);
                this.hasUnsavedChanges = false;
                this.showMessage('Data loaded successfully', 'success');
            } else {
                this.showMessage('Error loading data: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showMessage('Error loading data: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    confirmRefresh() {
        if (this.hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to refresh? All unsaved changes will be lost.')) {
                this.loadCSVData();
            }
        } else {
            this.loadCSVData();
        }
    }

    renderTable(data) {
        // Clear existing table
        this.tableHeader.innerHTML = '';
        this.tableBody.innerHTML = '';

        if (data.length === 0) {
            this.showMessage('No data found in CSV file', 'info');
            // Create empty table with headers if no data
            this.createEmptyTable();
            return;
        }

        // Create header row
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        
        // Add action column header
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        headerRow.appendChild(actionTh);
        
        this.tableHeader.appendChild(headerRow);

        // Create data rows
        data.forEach((row, index) => {
            this.createTableRow(row);
        });
    }

    createEmptyTable() {
        // Create default headers if no data exists
        const headerRow = document.createElement('tr');
        const defaultHeaders = ['Name', 'Age', 'City'];
        
        defaultHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        headerRow.appendChild(actionTh);
        
        this.tableHeader.appendChild(headerRow);
    }

    createTableRow(rowData) {
        const tr = document.createElement('tr');
        
        Object.values(rowData).forEach(value => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.className = 'editable';
            input.setAttribute('data-original-value', value);
            td.appendChild(input);
            tr.appendChild(td);
        });

        // Add delete button
        const actionTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-row';
        actionTd.appendChild(deleteBtn);
        tr.appendChild(actionTd);

        this.tableBody.appendChild(tr);
        return tr;
    }

    addNewRow() {
        const headerRow = this.tableHeader.querySelector('tr');
        if (!headerRow || headerRow.children.length === 0) {
            this.showMessage('Please load data first', 'error');
            return;
        }

        const headers = Array.from(headerRow.querySelectorAll('th'))
            .map(th => th.textContent)
            .filter(header => header !== 'Actions');

        const newRow = {};
        headers.forEach(header => {
            newRow[header] = '';
        });

        this.createTableRow(newRow);
        this.hasUnsavedChanges = true;
        this.showMessage('New row added. Click "Save Changes" to update CSV.', 'info');
        
        // Focus on first input of new row
        const newRowInputs = this.tableBody.lastElementChild.querySelectorAll('input');
        if (newRowInputs.length > 0) {
            newRowInputs[0].focus();
        }
    }

    deleteRow(button) {
        const row = button.closest('tr');
        row.remove();
        this.hasUnsavedChanges = true;
        this.showMessage('Row deleted. Click "Save Changes" to update CSV.', 'info');
    }

    async saveChanges() {
        if (!this.hasUnsavedChanges) {
            this.showMessage('No changes to save', 'info');
            return;
        }

        try {
            const headers = Array.from(this.tableHeader.querySelectorAll('th'))
                .map(th => th.textContent)
                .filter(header => header !== 'Actions');

            const data = [];
            const rows = this.tableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const rowData = {};
                const inputs = row.querySelectorAll('.editable');
                
                inputs.forEach((input, index) => {
                    if (headers[index]) {
                        rowData[headers[index]] = input.value.trim();
                    }
                });
                
                // Only add row if it has at least one non-empty value
                if (Object.values(rowData).some(value => value !== '')) {
                    data.push(rowData);
                }
            });

            console.log('Saving data:', data);

            const response = await fetch('http://localhost:3000/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: data }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Changes saved successfully to CSV file!', 'success');
                this.hasUnsavedChanges = false;
                
                // Update original values
                this.tableBody.querySelectorAll('.editable').forEach(input => {
                    input.setAttribute('data-original-value', input.value);
                });
            } else {
                this.showMessage('Error saving data: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data: ' + error.message, 'error');
        }
    }

    showMessage(message, type = 'info') {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `message ${type}`;
        
        // Clear message after 5 seconds for info, keep errors longer
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (this.messageDiv.textContent === message) {
                this.messageDiv.textContent = '';
                this.messageDiv.className = 'message';
            }
        }, timeout);
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CSVTableEditor();
});