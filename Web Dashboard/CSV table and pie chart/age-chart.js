// age-chart.js - Pie chart for age distribution
class AgeChart {
    constructor() {
        this.chart = null;
        this.ageGroups = {
            '0-18': { label: 'Under 18', color: '#FF6384', count: 0 },
            '19-25': { label: '19-25', color: '#36A2EB', count: 0 },
            '26-35': { label: '26-35', color: '#FFCE56', count: 0 },
            '36-50': { label: '36-50', color: '#4BC0C0', count: 0 },
            '51-65': { label: '51-65', color: '#9966FF', count: 0 },
            '65+': { label: '65+', color: '#FF9F40', count: 0 }
        };
        
        this.initializeChart();
        this.loadAgeData();
        
        // Refresh chart when CSV data changes (less frequent)
        setInterval(() => this.loadAgeData(), 5000);
    }

    initializeChart() {
        const ctx = document.getElementById('ageChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Loading...'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#dddddd'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    async loadAgeData() {
        try {
            console.log('Loading age data from API...');
            const response = await fetch('http://localhost:3000/api/data');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API response:', result);
            
            if (result.success) {
                this.processAgeData(result.data);
            } else {
                this.showError('Failed to load age data: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading age data:', error);
            this.showError('Error loading age data: ' + error.message);
        }
    }

    processAgeData(data) {
        console.log('Processing age data:', data);
        
        // Reset counts
        Object.keys(this.ageGroups).forEach(group => {
            this.ageGroups[group].count = 0;
        });

        let validAges = 0;

        // Count ages in each group
        data.forEach(person => {
            // Try different possible age field names
            const ageValue = person.Age || person.age || person.AGE;
            const age = parseInt(ageValue);
            
            console.log('Person:', person, 'Age value:', ageValue, 'Parsed age:', age);
            
            if (!isNaN(age) && age > 0 && age < 120) {
                validAges++;
                if (age <= 18) this.ageGroups['0-18'].count++;
                else if (age <= 25) this.ageGroups['19-25'].count++;
                else if (age <= 35) this.ageGroups['26-35'].count++;
                else if (age <= 50) this.ageGroups['36-50'].count++;
                else if (age <= 65) this.ageGroups['51-65'].count++;
                else this.ageGroups['65+'].count++;
            }
        });

        console.log('Valid ages found:', validAges);
        console.log('Age groups:', this.ageGroups);

        if (validAges > 0) {
            this.updateChart();
            this.updateStats(data);
            this.showChart();
        } else {
            this.showNoData('No valid age data found. Please check if your CSV has an "Age" column with numbers.');
        }
    }

    updateChart() {
        const labels = [];
        const data = [];
        const backgroundColors = [];
        let hasData = false;

        Object.keys(this.ageGroups).forEach(group => {
            const groupData = this.ageGroups[group];
            if (groupData.count > 0) {
                labels.push(groupData.label);
                data.push(groupData.count);
                backgroundColors.push(groupData.color);
                hasData = true;
            }
        });

        if (hasData) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.data.datasets[0].backgroundColor = backgroundColors;
            this.chart.update();
        }
    }

    updateStats(data) {
        const ages = data
            .map(person => parseInt(person.Age || person.age || person.AGE))
            .filter(age => !isNaN(age) && age > 0 && age < 120);
        
        if (ages.length === 0) {
            document.getElementById('totalPeople').textContent = '0';
            document.getElementById('averageAge').textContent = '0';
            document.getElementById('minAge').textContent = '0';
            document.getElementById('maxAge').textContent = '0';
            return;
        }

        const total = ages.length;
        const average = Math.round(ages.reduce((a, b) => a + b, 0) / total);
        const min = Math.min(...ages);
        const max = Math.max(...ages);

        document.getElementById('totalPeople').textContent = total;
        document.getElementById('averageAge').textContent = average;
        document.getElementById('minAge').textContent = min;
        document.getElementById('maxAge').textContent = max;

        this.updateAgeGroupsLegend();
    }

    updateAgeGroupsLegend() {
        const legendContainer = document.getElementById('ageGroupsLegend');
        legendContainer.innerHTML = '';

        Object.keys(this.ageGroups).forEach(group => {
            const groupData = this.ageGroups[group];
            if (groupData.count > 0) {
                const groupElement = document.createElement('div');
                groupElement.className = 'age-group';
                groupElement.innerHTML = `
                    <div class="age-color" style="background-color: ${groupData.color}"></div>
                    <span>${groupData.label}: ${groupData.count}</span>
                `;
                legendContainer.appendChild(groupElement);
            }
        });
    }

    showChart() {
        document.getElementById('chartContent').style.display = 'block';
        document.getElementById('noDataMessage').style.display = 'none';
        document.getElementById('loadingMessage').style.display = 'none';
    }

    showNoData(message = 'No age data available.') {
        document.getElementById('chartContent').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
        document.getElementById('noDataMessage').textContent = message;
        document.getElementById('loadingMessage').style.display = 'none';
    }

    showError(message) {
        document.getElementById('chartContent').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
        document.getElementById('noDataMessage').textContent = message;
        document.getElementById('loadingMessage').style.display = 'none';
    }

    refreshChart() {
        console.log('Manual refresh triggered');
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('noDataMessage').style.display = 'none';
        document.getElementById('chartContent').style.display = 'none';
        this.loadAgeData();
    }
}

// Make it globally accessible for the refresh button
let ageChart;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ageChart = new AgeChart();
});