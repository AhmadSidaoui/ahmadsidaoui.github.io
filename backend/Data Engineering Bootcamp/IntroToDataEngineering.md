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
- We reliably move data from sources to out data platform
- Methods:
    - Batch ingestion  
    - Real-time streaming (Apache Kafka to stream every website click as it happens)  
    - CDC — Change Data Capture ---> detecting and syncing any changes to the database table  

### **Data Storage**
- Modern storage built for scale + flexibility  
- Datalakes (S3 / Azure Data Lake) — store raw files 
- Data warehouses (Snowflake, Redshift) — structured optimized storage for analytics

### **Data Preprocessing**
- Cleaning, validation, transformation before analytics
- Based on what we want we can preprocess
- Data quality check

### **Data Orchestration**
- Managing complex workflows and making sure everything runs smoothly
- Workflow managemnent:
    - Apache Airflow
    - Prefect Workflow orchestration tool for python
- Scheduling ---> schedule workflow runs
- Monitoring ---> Monitor data quality metrics and monitor for failures

### **Data Consumption**
- Consume the preprocessed data into:
    - Dashboards
    - MachineLEarning models
    - Analytics

---

## Why Data Engineering matters

- Data Engineering is important for business success
    - Data Analysts spend 80% of their time finding and cleaning data
    - Inconsistent data can lead to poor decisions


---

## Data Engineering Vs Other Roles

- Data engineers are the infrastrucutre specialists ---> they build the system that everyone uses
- Data Analyst ---> they interpret data and create reports to drive business decisions
- Data Scientists ---> design predictive models and detect relationships in th data
- the data engineer take the models built by data scientists and deploy them into production systems
- **Data Engineers are fixed or building robust scalable systems that serves everyones needs**

---

## Real World Examples

- Millions of customers are generating review on a website
- Build a system that catch these events in real time ---> process them to fraude detection algorithms ---> update inventory systems ---> generate recommendations ---> update dashboards

![alt text](https://raw.githubusercontent.com/AhmadSidaoui/ahmadsidaoui.github.io/main/backend/Data%20Engineering%20Bootcamp/image-5.png)



# Virtual Environment and pytohn packages

