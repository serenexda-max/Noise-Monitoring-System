// DOM Elements
const decibelValue = document.getElementById('decibelValue');
const noiseStatus = document.getElementById('noiseStatus');
const indicatorFill = document.getElementById('indicatorFill');
const lastUpdated = document.getElementById('lastUpdated');
const readingsTable = document.getElementById('readingsTable');
const logoutBtn = document.getElementById('logoutBtn');

// Control buttons
const simulateQuietBtn = document.getElementById('simulateQuiet');
const simulateModerateBtn = document.getElementById('simulateModerate');
const simulateLoudBtn = document.getElementById('simulateLoud');
const autoSimulateBtn = document.getElementById('autoSimulate');

// State variables
let currentDecibels = 65; // Initial value
let isAutoSimulating = false;
let autoSimulateInterval = null;
let readingsHistory = [];

// Check if user is logged in
function checkAuth() {
    // Check if the user has the logged-in flag set
    const hasSession = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!hasSession) {
        // Redirect to login page if not logged in
        alert('Please log in to access the admin dashboard');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Load any saved state
    const savedState = localStorage.getItem('noiseMonitorState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentDecibels = state.currentDecibels || 65;
        readingsHistory = state.readingsHistory || [];
    }
    
    // Initial update
    updateNoiseDisplay(currentDecibels);
    updateReadingsTable();
    
    // Start auto-update for time display
    updateTime();
    setInterval(updateTime, 60000); // Update time every minute
});

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString();
    lastUpdated.textContent = `${dateString} ${timeString}`;
}

// Update noise display based on decibel level
function updateNoiseDisplay(decibels) {
    currentDecibels = decibels;
    
    // Update the numeric display
    decibelValue.textContent = `${decibels} dB`;
    
    // Determine status and color
    let status = '';
    let colorClass = '';
    
    if (decibels < 60) {
        status = 'Quiet';
        colorClass = 'quiet';
    } else if (decibels <= 80) {
        status = 'Moderate';
        colorClass = 'moderate';
    } else {
        status = 'Loud';
        colorClass = 'loud';
    }
    
    // Apply colors
    decibelValue.className = 'decibel-value color-' + colorClass;
    noiseStatus.className = 'noise-status color-' + colorClass;
    noiseStatus.textContent = status;
    
    // Update indicator bar
    // Scale: 40 dB = 0%, 100 dB = 100%
    let fillPercentage = ((decibels - 40) / 60) * 100;
    if (fillPercentage < 0) fillPercentage = 0;
    if (fillPercentage > 100) fillPercentage = 100;
    
    indicatorFill.style.width = `${fillPercentage}%`;
    indicatorFill.className = 'indicator-fill bg-' + colorClass;
    
    // Add to history
    addToHistory(decibels, status);
    
    // Save state
    saveState();
}

// Add reading to history
function addToHistory(decibels, status) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    readingsHistory.unshift({
        time: timeString,
        decibels: decibels,
        status: status
    });
    
    // Keep only last 10 readings
    if (readingsHistory.length > 10) {
        readingsHistory.pop();
    }
    
    updateReadingsTable();
}

// Update readings table
function updateReadingsTable() {
    readingsTable.innerHTML = '';
    
    if (readingsHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" style="text-align: center; color: #8b949e;">
                No readings yet. Use the controls to simulate noise levels.
            </td>
        `;
        readingsTable.appendChild(row);
        return;
    }
    
    readingsHistory.forEach(reading => {
        const row = document.createElement('tr');
        
        const statusClass = reading.status.toLowerCase();
        const statusBadge = `<span class="status-badge ${statusClass}">${reading.status}</span>`;
        
        row.innerHTML = `
            <td>${reading.time}</td>
            <td>${reading.decibels} dB</td>
            <td>${statusBadge}</td>
        `;
        
        readingsTable.appendChild(row);
    });
}

// Generate random decibel value within a range
function getRandomDecibels(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Control button event listeners
simulateQuietBtn.addEventListener('click', function() {
    if (isAutoSimulating) return;
    const quietDecibels = getRandomDecibels(40, 59);
    updateNoiseDisplay(quietDecibels);
});

simulateModerateBtn.addEventListener('click', function() {
    if (isAutoSimulating) return;
    const moderateDecibels = getRandomDecibels(60, 80);
    updateNoiseDisplay(moderateDecibels);
});

simulateLoudBtn.addEventListener('click', function() {
    if (isAutoSimulating) return;
    const loudDecibels = getRandomDecibels(81, 100);
    updateNoiseDisplay(loudDecibels);
});

autoSimulateBtn.addEventListener('click', function() {
    if (!isAutoSimulating) {
        // Start auto simulation
        isAutoSimulating = true;
        autoSimulateBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto Simulate';
        autoSimulateBtn.classList.add('active');
        
        autoSimulateInterval = setInterval(function() {
            // Randomly choose a level: 40% quiet, 40% moderate, 20% loud
            const rand = Math.random();
            let newDecibels;
            
            if (rand < 0.4) {
                newDecibels = getRandomDecibels(40, 59); // Quiet
            } else if (rand < 0.8) {
                newDecibels = getRandomDecibels(60, 80); // Moderate
            } else {
                newDecibels = getRandomDecibels(81, 100); // Loud
            }
            
            updateNoiseDisplay(newDecibels);
        }, 3000); // Update every 3 seconds
    } else {
        // Stop auto simulation
        isAutoSimulating = false;
        clearInterval(autoSimulateInterval);
        autoSimulateBtn.innerHTML = '<i class="fas fa-play"></i> Auto Simulate';
        autoSimulateBtn.classList.remove('active');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', function() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear the session flag
        localStorage.removeItem('isLoggedIn');
        
        // Optional: Clear admin-specific data
        // localStorage.removeItem('noiseMonitorState');
        
        // Stop auto simulation if running
        if (isAutoSimulating) {
            clearInterval(autoSimulateInterval);
            isAutoSimulating = false;
        }
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
});

// Save state to localStorage
function saveState() {
    const state = {
        currentDecibels: currentDecibels,
        readingsHistory: readingsHistory
    };
    
    localStorage.setItem('noiseMonitorState', JSON.stringify(state));
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // 1 = Quiet, 2 = Moderate, 3 = Loud, Space = Toggle Auto
    if (isAutoSimulating) return;
    
    switch(event.key) {
        case '1':
            simulateQuietBtn.click();
            break;
        case '2':
            simulateModerateBtn.click();
            break;
        case '3':
            simulateLoudBtn.click();
            break;
        case ' ':
            event.preventDefault();
            autoSimulateBtn.click();
            break;
    }
});

// Tooltip for keyboard shortcuts
window.addEventListener('load', function() {
    setTimeout(function() {
        alert('Tip: Use keyboard shortcuts:\n1 = Quiet simulation\n2 = Moderate simulation\n3 = Loud simulation\nSpace = Toggle auto simulation');
    }, 1000);
});

// Handle page visibility change (stop auto simulation when tab is not active)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isAutoSimulating) {
        // Pause auto simulation when tab is not active
        clearInterval(autoSimulateInterval);
        
        // We'll set a flag so we can restart when the tab becomes active again
        autoSimulateBtn.setAttribute('data-paused', 'true');
    } else if (!document.hidden && isAutoSimulating && autoSimulateBtn.getAttribute('data-paused') === 'true') {
        // Restart auto simulation when tab becomes active again
        autoSimulateBtn.removeAttribute('data-paused');
        
        autoSimulateInterval = setInterval(function() {
            const rand = Math.random();
            let newDecibels;
            
            if (rand < 0.4) {
                newDecibels = getRandomDecibels(40, 59);
            } else if (rand < 0.8) {
                newDecibels = getRandomDecibels(60, 80);
            } else {
                newDecibels = getRandomDecibels(81, 100);
            }
            
            updateNoiseDisplay(newDecibels);
        }, 3000);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (isAutoSimulating) {
        clearInterval(autoSimulateInterval);
    }
});