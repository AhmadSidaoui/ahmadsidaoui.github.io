# Introduction to Data Engineering

- Data engineering is different than data science or data analysis

- What is the data problem?
    - Companies are drowning in data — coming from many sources & in different formats
    - Data formats include:
        - **Structured** → database records  
        - **Semi-structured** → JSON from APIs  
        - **Unstructured** → text files, PDFs  
    - How do we turn messy scattered data into something useful?

    ![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image.png)

- **What is the definition of Data Engineering?**
    - Data engineers are architects + builders who create systems that make data analysis possible

    ![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image-1.png)

    - Create reliable automated systems that collect, clean, transform & deliver data
    - Build the highways that data travels on

---

## ETL and ELT

### **ETL — Extract, Transform, Load**
- Extract data and pull it into the pipeline  
- Transform → cleaning, standardizing, integration  
- Load → usually into a data warehouse  
- Slow, expensive, hard to change  
- Single-purpose transformations  

![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image-2.png)

---

### **ELT — Extract, Load, Transform (modern approach)**  
- More flexible & cost-effective  
- Supports batch + real-time  
- Serves multiple use cases from one platform  
- Extract → load into cloud/datalake → transform when needed  
- Multi-purpose → transformation depends on the use case  

![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image-3.png)

---

## Data Engineering Ecosystem

![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image-4.png)

### **Data Sources**
- Databases  
- APIs  
- IoT devices (sensors, SCADA)  
- CSV files  
- Real-time clickstream  
- etc.

### **Data Ingestion**
- Moving data reliably into your platform  
- Methods:
    - Batch  
    - Real-time streaming (Kafka, etc.)  
    - CDC — Change Data Capture  

### **Data Storage**
- Modern storage built for scale + flexibility  
- Datalakes (S3 / Azure Data Lake) — store raw files  
- Data warehouses (Snowflake, Redshift) — optimized for analytics

### **Data Preprocessing**
- Cleaning, validation, transformation before analytics
