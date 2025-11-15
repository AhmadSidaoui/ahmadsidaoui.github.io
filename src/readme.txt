## 🔄 How It Works - Step by Step

### Step 1: Page Loads (`index.html`)
1. Browser loads `index.html`
2. HTML displays 3 empty table containers: `table1`, `table2`, `table3`
3. Each container has unique IDs for headers, bodies, buttons
4. The `<script type="module">` tag loads `src/main.js`

### Step 2: JavaScript Initialization (`main.js`)
1. `DOMContentLoaded` event fires
2. `main.js` imports `TableManager` class and `CONFIG`
3. Creates 3 separate `TableManager` instances:
   - `table1` → endpoint: `data`
   - `table2` → endpoint: `chart/data`
   - `table3` → endpoint: `bar/data`

### Step 3: Each TableManager Initializes
For **each table** (table1, table2, table3):

1. **Constructor** (`new TableManager({...})`)
   - Stores config (containerId, endpoint, autoLoad, autoSave)
   - Generates unique IDs: `table1-header`, `table1-body`, etc.
   - Finds the container element in HTML
   - Calls `init()`

2. **init() method**
   - Gets DOM elements (header, body, buttons)
   - Calls `setupEventListeners()`
   - If `autoLoad: true`, calls `loadData()`

3. **setupEventListeners()**
   - Attaches click handler to Refresh button → calls `loadData()`
   - Attaches click handler to Save button → calls `saveData()`
   - Attaches click handler to table body → handles Toggle button clicks

4. **loadData()** (runs automatically if `autoLoad: true`)
   - Shows loading message
   - Calls `fetchDocuments(endpoint)` from `documentService.js`
   - API call: `GET https://api.../data` (or chart/data, bar/data)
   - Receives raw JSON data
   - Converts each item to `DocumentTracker` instance using `fromJSON()`
   - Calls `renderTable()` to display data
   - Hides loading message

### Step 4: API Call (`documentService.js`)
```
fetchDocuments("data")
  ↓
fetch("https://ahmadsidaoui...com/api/data")
  ↓
Returns: { data: [{id: 1, title: "...", status: "..."}, ...] }
  ↓
Extract json.data and return array
```

### Step 5: Data Transformation (`DocumentTracker.js`)
```
Raw JSON: {id: 1, title: "Report", status: "Pending"}
  ↓
DocumentTracker.fromJSON(raw)
  ↓
new DocumentTracker({id: 1, title: "Report", status: "Pending"})
  ↓
Now has methods: toggleStatus(), isCompleted(), toJSON()
```

### Step 6: Render Table (`tableRenderer.js`)
```
renderTable(header, body, documents)
  ↓
clearTable() - empties existing rows
  ↓
createHeader() - creates <th> columns from first document
  ↓
For each document:
  - Create <tr>
  - Create <td> for each field (id, title, status, updatedAt)
  - Create Toggle button
  - If completed, highlight green
  - Append to <tbody>
```

### Step 7: User Interactions

**When user clicks "Toggle" button:**
```
Click event → TableManager.setupEventListeners()
  ↓
Find which row was clicked
  ↓
Get document from array: documents[rowIndex]
  ↓
Call doc.toggleStatus() - changes status in memory
  ↓
Re-render table with new data
  ↓
If autoSave enabled, call saveData()
```

**When user clicks "Save" button:**
```
Click event → saveData()
  ↓
Convert all documents to JSON: documents.map(d => d.toJSON())
  ↓
Call saveDocuments(jsonData, endpoint)
  ↓
POST request to API with data
  ↓
Success/failure message
```

**When user clicks "Refresh" button:**
```
Click event → loadData()
  ↓
Fetches fresh data from API
  ↓
Replaces documents array
  ↓
Re-renders table
```

---

## 🎯 Key Concepts

### 1. **Separation of Concerns**
- `documentService.js` → API calls only
- `DocumentTracker.js` → Data model and business logic
- `tableRenderer.js` → UI rendering only
- `TableManager.js` → Coordinates everything for one table
- `main.js` → App initialization

### 2. **Class-Based Architecture**
- Each table is a `TableManager` instance
- Each data item is a `DocumentTracker` instance
- Encapsulation: each table manages its own state

### 3. **Unique IDs Pattern**
```
containerId: "table1"
  ↓ generates
table1-header
table1-body
table1-refresh
table1-save
table1-loading