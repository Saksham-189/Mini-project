// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    // Add event listener to theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Constants for calculations
const CARBON_FACTORS = {
    car: 0.404, // kg CO2 per km
    publicTransport: 0.104, // kg CO2 per km
    electricity: 0.233, // kg CO2 per kWh
    gas: 2.162, // kg CO2 per m³
    meatMeal: 2.5, // kg CO2 per meal
    dairyProduct: 1.0 // kg CO2 per product
};

const WATER_FACTORS = {
    dailyUsage: 1, // liters per liter
    meatMeal: 100, // liters per meal
    dairyProduct: 200 // liters per product
};

// Global averages and safe limits
const GLOBAL_AVERAGES = {
    carbon: 600, // kg CO2 per month
    water: 9000 // liters per month
};

const SAFE_LIMITS = {
    carbon: 200, // kg CO2 per month
    water: 8000 // liters per month
};

// Chart instances
let carbonChart = null;
let waterChart = null;
let carbonPieChart = null;

// DOM Elements
const calculator = document.getElementById('calculator');
const results = document.getElementById('results');
const form = document.getElementById('footprint-form');
const impactAreas = document.getElementById('impact-areas');
const personalizedTips = document.getElementById('personalized-tips');

// Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            if (this.getAttribute('href') === '#calculator') {
                calculator.classList.remove('hidden');
            }
        }
    });
});

// Form Submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateFootprint();
    showResults();
});

// Calculate Carbon and Water Footprint
function calculateFootprint() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Calculate Carbon Footprint
    const carbonFootprint = {
        transportation: (data['car-distance'] * CARBON_FACTORS.car) + 
                       (data['public-transport'] * CARBON_FACTORS.publicTransport),
        energy: (data['electricity'] * CARBON_FACTORS.electricity) + 
                (data['gas'] * CARBON_FACTORS.gas),
        diet: (data['meat-meals'] * 4 * CARBON_FACTORS.meatMeal) + 
              (data['dairy-products'] * 4 * CARBON_FACTORS.dairyProduct)
    };

    // Calculate Water Footprint
    const waterFootprint = {
        daily: data['water-usage'] * 30 * WATER_FACTORS.dailyUsage,
        diet: (data['meat-meals'] * 4 * WATER_FACTORS.meatMeal) + 
              (data['dairy-products'] * 4 * WATER_FACTORS.dairyProduct)
    };

    const totalCarbon = Object.values(carbonFootprint).reduce((a, b) => a + b, 0);
    const totalWater = Object.values(waterFootprint).reduce((a, b) => a + b, 0);

    return {
        carbon: {
            total: totalCarbon,
            breakdown: carbonFootprint
        },
        water: {
            total: totalWater,
            breakdown: waterFootprint
        }
    };
}

// Show Results
function showResults() {
    const footprint = calculateFootprint();
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth' });

    // Render Charts
    renderCarbonChart(footprint.carbon);
    renderWaterChart(footprint.water);
    renderCarbonPieChart(footprint.carbon);

    // Show Impact Areas
    showImpactAreas(footprint);

    // Show Personalized Tips
    showPersonalizedTips(footprint);

    // Add download button
    addDownloadButton(footprint);
}

// Render Carbon Chart
function renderCarbonChart(carbonData) {
    const ctx = document.getElementById('carbon-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (carbonChart) {
        carbonChart.destroy();
    }

    carbonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Your Footprint', 'Global Average', 'Safe Limit'],
            datasets: [{
                data: [carbonData.total, GLOBAL_AVERAGES.carbon, SAFE_LIMITS.carbon],
                backgroundColor: ['#2ecc71', '#95a5a6', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Carbon Footprint (kg CO2/month)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO2/month'
                    }
                }
            }
        }
    });
}

// Render Water Chart
function renderWaterChart(waterData) {
    const ctx = document.getElementById('water-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (waterChart) {
        waterChart.destroy();
    }

    waterChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Your Footprint', 'Global Average', 'Safe Limit'],
            datasets: [{
                data: [waterData.total, GLOBAL_AVERAGES.water, SAFE_LIMITS.water],
                backgroundColor: ['#2ecc71', '#95a5a6', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Water Footprint (liters/month)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'liters/month'
                    }
                }
            }
        }
    });
}

// Render Carbon Pie Chart
function renderCarbonPieChart(carbonData) {
    const ctx = document.getElementById('carbon-pie-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (carbonPieChart) {
        carbonPieChart.destroy();
    }

    const labels = Object.keys(carbonData.breakdown).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1)
    );
    const values = Object.values(carbonData.breakdown);

    carbonPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#2ecc71', // Transportation
                    '#3498db', // Energy
                    '#9b59b6'  // Diet
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Carbon Footprint Breakdown',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / carbonData.total) * 100).toFixed(1);
                            return `${context.label}: ${Math.round(value)} kg CO2 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Show Impact Areas
function showImpactAreas(footprint) {
    const carbonBreakdown = footprint.carbon.breakdown;
    const sortedAreas = Object.entries(carbonBreakdown)
        .sort(([,a], [,b]) => b - a);

    impactAreas.innerHTML = sortedAreas
        .map(([area, value]) => `
            <div class="impact-area">
                <h4>${area.charAt(0).toUpperCase() + area.slice(1)}</h4>
                <p>${Math.round(value).toLocaleString()} kg CO2/month</p>
                <p>${((value / footprint.carbon.total) * 100).toFixed(1)}% of total carbon footprint</p>
            </div>
        `)
        .join('');
}

// Show Personalized Tips
function showPersonalizedTips(footprint) {
    const tips = [];
    const carbonBreakdown = footprint.carbon.breakdown;
    const waterTotal = footprint.water.total;

    if (carbonBreakdown.transportation > 500) {
        tips.push({
            title: 'Transportation',
            tip: 'Consider using public transport more often or carpooling to reduce your carbon footprint. Each kilometer saved can reduce your carbon footprint by up to 0.4 kg CO2.'
        });
    }

    if (carbonBreakdown.energy > 500) {
        tips.push({
            title: 'Energy Usage',
            tip: 'Switch to energy-efficient appliances and turn off devices when not in use. Consider using LED bulbs and setting your thermostat 1°C lower to save energy.'
        });
    }

    if (carbonBreakdown.diet > 500) {
        tips.push({
            title: 'Diet',
            tip: 'Try incorporating more plant-based meals into your diet. Each meat-free meal can save up to 2.5 kg CO2 and 1000 liters of water.'
        });
    }

    if (waterTotal > GLOBAL_AVERAGES.water) {
        tips.push({
            title: 'Water Usage',
            tip: 'Install water-saving devices and be mindful of water usage during daily activities. Consider taking shorter showers and fixing any leaks promptly.'
        });
    }

    if (tips.length === 0) {
        tips.push({
            title: 'Great Job!',
            tip: 'Your environmental impact is below average! Keep up the good work and continue looking for ways to reduce your footprint even further.'
        });
    }

    personalizedTips.innerHTML = tips
        .map(tip => `
            <div class="tip">
                <h4>${tip.title}</h4>
                <p>${tip.tip}</p>
            </div>
        `)
        .join('');
}

// Handle window resize
window.addEventListener('resize', function() {
    if (!results.classList.contains('hidden')) {
        const footprint = calculateFootprint();
        renderCarbonChart(footprint.carbon);
        renderWaterChart(footprint.water);
        renderCarbonPieChart(footprint.carbon);
    }
});

// Add Download Button
function addDownloadButton(footprint) {
    const downloadSection = document.getElementById('download-section');
    if (!downloadSection) {
        const section = document.createElement('div');
        section.id = 'download-section';
        section.className = 'download-section';
        section.innerHTML = `
            <button id="download-pdf" class="download-button">
                📄 Download Report as PDF
            </button>
        `;
        results.appendChild(section);
    }

    const downloadBtn = document.getElementById('download-pdf');
    downloadBtn.onclick = () => generatePDF(footprint);
}

// Generate PDF Report
function generatePDF(footprint) {
    // Create a new window with the report content
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML(footprint);
    
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Environmental Impact Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2ecc71;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2ecc71;
                    font-size: 28px;
                    margin: 0;
                }
                .date {
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section h2 {
                    color: #2ecc71;
                    font-size: 20px;
                    border-bottom: 2px solid #2ecc71;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                }
                .metric {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    border-left: 4px solid #2ecc71;
                }
                .metric h3 {
                    color: #2ecc71;
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }
                .metric p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                .breakdown-item {
                    background: #e8f5e8;
                    padding: 10px;
                    border-radius: 5px;
                    text-align: center;
                }
                .breakdown-item h4 {
                    color: #2ecc71;
                    margin: 0 0 5px 0;
                    font-size: 14px;
                }
                .breakdown-item p {
                    margin: 0;
                    font-size: 12px;
                    color: #666;
                }
                .tip {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }
                .tip h3 {
                    color: #856404;
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }
                .tip p {
                    margin: 0;
                    color: #856404;
                    font-size: 14px;
                }
                .comparison {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 15px;
                }
                .comparison-item {
                    text-align: center;
                    padding: 10px;
                    border-radius: 5px;
                }
                .comparison-item.your {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                }
                .comparison-item.average {
                    background: #d1ecf1;
                    border: 1px solid #bee5eb;
                }
                .comparison-item.safe {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                }
                .comparison-item h4 {
                    margin: 0 0 5px 0;
                    font-size: 14px;
                }
                .comparison-item p {
                    margin: 0;
                    font-size: 12px;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 20px; }
                    .section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    
    reportWindow.document.close();
}

// Generate Report HTML
function generateReportHTML(footprint) {
    const tips = generateTips(footprint);
    const carbonTotal = Math.round(footprint.carbon.total);
    const waterTotal = Math.round(footprint.water.total);
    
    return `
        <div class="header">
            <h1>Environmental Impact Report</h1>
            <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
            <h2>Carbon Footprint Summary</h2>
            <div class="metric">
                <h3>Your Total Carbon Footprint</h3>
                <p><strong>${carbonTotal} kg CO2/month</strong></p>
                
                <div class="comparison">
                    <div class="comparison-item your">
                        <h4>Your Footprint</h4>
                        <p>${carbonTotal} kg CO2</p>
                    </div>
                    <div class="comparison-item average">
                        <h4>Global Average</h4>
                        <p>${GLOBAL_AVERAGES.carbon} kg CO2</p>
                    </div>
                    <div class="comparison-item safe">
                        <h4>Safe Limit</h4>
                        <p>${SAFE_LIMITS.carbon} kg CO2</p>
                    </div>
                </div>
            </div>

            <h3>Carbon Footprint Breakdown</h3>
            <div class="breakdown">
                ${Object.entries(footprint.carbon.breakdown).map(([area, value]) => {
                    const percentage = ((value / footprint.carbon.total) * 100).toFixed(1);
                    return `
                        <div class="breakdown-item">
                            <h4>${area.charAt(0).toUpperCase() + area.slice(1)}</h4>
                            <p>${Math.round(value)} kg CO2</p>
                            <p>${percentage}% of total</p>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="section">
            <h2>Water Footprint Summary</h2>
            <div class="metric">
                <h3>Your Total Water Footprint</h3>
                <p><strong>${waterTotal} liters/month</strong></p>
                
                <div class="comparison">
                    <div class="comparison-item your">
                        <h4>Your Usage</h4>
                        <p>${waterTotal} liters</p>
                    </div>
                    <div class="comparison-item average">
                        <h4>Global Average</h4>
                        <p>${GLOBAL_AVERAGES.water} liters</p>
                    </div>
                    <div class="comparison-item safe">
                        <h4>Safe Limit</h4>
                        <p>${SAFE_LIMITS.water} liters</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Personalized Recommendations</h2>
            ${tips.map(tip => `
                <div class="tip">
                    <h3>${tip.title}</h3>
                    <p>${tip.tip}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>About This Report</h2>
            <p>This report was generated using Clim8's environmental impact calculator. The calculations are based on widely accepted environmental impact factors and global averages.</p>
            <p><strong>Note:</strong> This is an estimate based on the information provided. For more accurate results, consider tracking your actual usage over time.</p>
        </div>
    `;
}

// Generate tips for PDF (reuse existing logic)
function generateTips(footprint) {
    const tips = [];
    const carbonBreakdown = footprint.carbon.breakdown;
    const waterTotal = footprint.water.total;

    if (carbonBreakdown.transportation > 500) {
        tips.push({
            title: 'Transportation',
            tip: 'Consider using public transport more often or carpooling to reduce your carbon footprint. Each kilometer saved can reduce your carbon footprint by up to 0.4 kg CO2.'
        });
    }

    if (carbonBreakdown.energy > 500) {
        tips.push({
            title: 'Energy Usage',
            tip: 'Switch to energy-efficient appliances and turn off devices when not in use. Consider using LED bulbs and setting your thermostat 1°C lower to save energy.'
        });
    }

    if (carbonBreakdown.diet > 500) {
        tips.push({
            title: 'Diet',
            tip: 'Try incorporating more plant-based meals into your diet. Each meat-free meal can save up to 2.5 kg CO2 and 1000 liters of water.'
        });
    }

    if (waterTotal > GLOBAL_AVERAGES.water) {
        tips.push({
            title: 'Water Usage',
            tip: 'Install water-saving devices and be mindful of water usage during daily activities. Consider taking shorter showers and fixing any leaks promptly.'
        });
    }

    if (tips.length === 0) {
        tips.push({
            title: 'Great Job!',
            tip: 'Your environmental impact is below average! Keep up the good work and continue looking for ways to reduce your footprint even further.'
        });
    }

    return tips;
} 
