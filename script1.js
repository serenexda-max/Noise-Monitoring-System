// DOM Elements
const decibelValue = document.getElementById('decibelValue');
const noiseStatus = document.getElementById('noiseStatus');
const indicatorFill = document.getElementById('indicatorFill');
const lastUpdated = document.getElementById('lastUpdated');
const readingsTable = document.getElementById('readingsTable');
const logoutBtn = document.getElementById('logoutBtn');
const clearReadingsBtn = document.getElementById('clearReadingsBtn');

// Adviser management elements
const presentCount = document.getElementById('presentCount');
const onLeaveCount = document.getElementById('onLeaveCount');
const absentCount = document.getElementById('absentCount');
const adviserNameInput = document.getElementById('adviserName');
const adviserSubjectInput = document.getElementById('adviserSubject');
const adviserNumberInput = document.getElementById('adviserNumber');
const adviserStatusSelect = document.getElementById('adviserStatus');
const addAdviserBtn = document.getElementById('addAdviserBtn');
const advisersTable = document.getElementById('advisersTable');
const smsAllBtn = document.getElementById('smsAllBtn');
const enableSmsToggle = document.getElementById('enableSms');
const smsTemplate = document.getElementById('smsTemplate');
const totalSmsSent = document.getElementById('totalSmsSent');
const activeAdvisers = document.getElementById('activeAdvisers');
const adviserSystemStatus = document.getElementById('adviserSystemStatus');
const footerSmsStatus = document.getElementById('footerSmsStatus');
const footerAdviserStatus = document.getElementById('footerAdviserStatus');

// Modal elements
const editModalOverlay = document.getElementById('editModalOverlay');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editAdviserName = document.getElementById('editAdviserName');
const editAdviserSubject = document.getElementById('editAdviserSubject');
const editAdviserNumber = document.getElementById('editAdviserNumber');
const editAdviserStatus = document.getElementById('editAdviserStatus');
const saveAdviserBtn = document.getElementById('saveAdviserBtn');

// Wall checker elements
const wallSummary = document.getElementById('wallSummary');
const concreteCount = document.getElementById('concreteCount');
const plywoodCount = document.getElementById('plywoodCount');
const noiseAdjustment = document.getElementById('noiseAdjustment');
const footerWallStatus = document.getElementById('footerWallStatus');
const wallNorthToggle = document.getElementById('wallNorthToggle');
const wallEastToggle = document.getElementById('wallEastToggle');
const wallSouthToggle = document.getElementById('wallSouthToggle');
const wallWestToggle = document.getElementById('wallWestToggle');
const setAllConcreteBtn = document.getElementById('setAllConcrete');
const setAllPlywoodBtn = document.getElementById('setAllPlywood');
const wallItems = document.querySelectorAll('.wall-item');

// System status elements
const sim800lStatus = document.getElementById('sim800lStatus');
const wallSystemStatus = document.getElementById('wallSystemStatus');

// Control buttons
const simulateQuietBtn = document.getElementById('simulateQuiet');
const simulateModerateBtn = document.getElementById('simulateModerate');
const simulateLoudBtn = document.getElementById('simulateLoud');
const autoSimulateBtn = document.getElementById('autoSimulate');
const testSmsBtn = document.getElementById('testSmsBtn');

// State variables
let currentDecibels = 65; // Initial value
let isAutoSimulating = false;
let autoSimulateInterval = null;
let readingsHistory = [];
let editingAdviserId = null;
let smsCooldownTimer = null;

// Adviser management state
let advisers = [];
let smsSettings = {
    enabled: true,
    totalSent: 0,
    template: "URGENT: High noise level detected in your classroom. Current level: {level} dB ({status}). Please check immediately."
};

// SMS Scheduling state
let smsCooldown = {
    enabled: true,
    hours: 1,
    minutes: 0,
    lastSmsTime: null,
    cooldownEnd: null
};

let teacherSchedules = [];
let smsSessions = [];
let editingScheduleId = null;

// Wall checker state
let wallState = {
    north: 'concrete', // 'concrete' or 'plywood'
    east: 'concrete',
    south: 'plywood',
    west: 'plywood'
};

// Check if user is logged in
function checkAuth() {
    const hasSession = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!hasSession) {
        alert('Please log in to access the admin dashboard');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadSavedState();
    updateNoiseDisplay(currentDecibels);
    updateReadingsTable();
    updateAdvisersTable();
    updateWallUI();
    initializeWallToggles(); // Initialize wall toggle event listeners
    initializeNoiseSimulation(); // Initialize noise simulation event listeners
    
    updateTime();
    setInterval(updateTime, 60000);
    
    console.log('Dashboard initialized successfully');
});

// Load saved state from localStorage
function loadSavedState() {
    // Load noise monitoring state
    const savedState = localStorage.getItem('noiseMonitorState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentDecibels = state.currentDecibels || 65;
        readingsHistory = state.readingsHistory || [];
    }
    
    // Load advisers
    const savedAdvisers = localStorage.getItem('advisers');
    if (savedAdvisers) {
        advisers = JSON.parse(savedAdvisers);
    } else {
        // Add sample advisers if none exist
        advisers = [
            {
                id: 1,
                name: "Dr. Maria Santos",
                subject: "Physics",
                number: "+63 912 345 6789",
                status: "present"
            },
            {
                id: 2,
                name: "Prof. Juan Dela Cruz",
                subject: "Mathematics",
                number: "+63 923 456 7890",
                status: "on-leave"
            },
            {
                id: 3,
                name: "Engr. Robert Lim",
                subject: "Computer Science",
                number: "+63 934 567 8901",
                status: "present"
            }
        ];
        saveAdvisers();
    }
    
    // Load SMS settings
    const savedSmsSettings = localStorage.getItem('smsSettings');
    if (savedSmsSettings) {
        smsSettings = JSON.parse(savedSmsSettings);
    }
    
    // Load SMS cooldown settings
    const savedCooldown = localStorage.getItem('smsCooldown');
    if (savedCooldown) {
        smsCooldown = JSON.parse(savedCooldown);
    }
    
    // Load teacher schedules
    const savedSchedules = localStorage.getItem('teacherSchedules');
    if (savedSchedules) {
        teacherSchedules = JSON.parse(savedSchedules);
    } else {
        // Add sample schedules
        teacherSchedules = [
            {
                id: 1,
                teacherId: 1,
                teacherName: "Dr. Maria Santos",
                day: "monday",
                startTime: "08:00",
                endTime: "12:00",
                subject: "Physics",
                isActive: true
            },
            {
                id: 2,
                teacherId: 1,
                teacherName: "Dr. Maria Santos",
                day: "wednesday",
                startTime: "13:00",
                endTime: "17:00",
                subject: "Advanced Physics",
                isActive: true
            },
            {
                id: 3,
                teacherId: 3,
                teacherName: "Engr. Robert Lim",
                day: "monday",
                startTime: "08:00",
                endTime: "17:00",
                subject: "Computer Science",
                isActive: true
            }
        ];
        saveSchedules();
    }
    
    // Load SMS sessions
    const savedSessions = localStorage.getItem('smsSessions');
    if (savedSessions) {
        smsSessions = JSON.parse(savedSessions);
    }
    
    // Load wall checker state
    const savedWallState = localStorage.getItem('wallCheckerState');
    if (savedWallState) {
        wallState = JSON.parse(savedWallState);
    }
    
    // Update UI
    updateSmsSettingsUI();
    updateCooldownUI();
    updateTeacherDropdown();
    updateSchedulesTable();
    updateActiveTeachers();
    updateSmsLog();
}

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString();
    lastUpdated.textContent = `${dateString} ${timeString}`;
}

// Update noise display based on decibel level
function updateNoiseDisplay(decibels) {
    console.log(`Updating noise display with: ${decibels} dB`);
    
    currentDecibels = decibels;
    
    // Apply wall material adjustments
    const measuredDecibels = applyWallAdjustments(decibels);
    console.log(`After wall adjustments: ${measuredDecibels} dB`);
    
    // Update the numeric display with ADJUSTED reading
    decibelValue.textContent = `${measuredDecibels} dB`;
    
    // Determine status and color based on ADJUSTED reading
    let status = '';
    let colorClass = '';
    let shouldSendSms = false;
    
    if (measuredDecibels < 60) {
        status = 'Quiet';
        colorClass = 'quiet';
        shouldSendSms = false;
    } else if (measuredDecibels <= 80) {
        status = 'Moderate';
        colorClass = 'moderate';
        shouldSendSms = false;
    } else {
        status = 'Loud';
        colorClass = 'loud';
        shouldSendSms = true;
    }
    
    console.log(`Status: ${status}, Color: ${colorClass}, Send SMS: ${shouldSendSms}`);
    
    // Apply colors
    decibelValue.className = 'decibel-value color-' + colorClass;
    noiseStatus.className = 'noise-status color-' + colorClass;
    noiseStatus.textContent = status;
    
    // Update indicator bar
    let fillPercentage = ((measuredDecibels - 40) / 60) * 100;
    if (fillPercentage < 0) fillPercentage = 0;
    if (fillPercentage > 100) fillPercentage = 100;
    
    indicatorFill.style.width = `${fillPercentage}%`;
    indicatorFill.className = 'indicator-fill bg-' + colorClass;
    
    // Check if we should send SMS
    let smsStatusText = 'Not Sent';
    let smsRecipients = [];
    let sessionInfo = '';
    
    if (shouldSendSms && smsSettings.enabled) {
        const presentAdvisers = advisers.filter(a => a.status === 'present');
        if (presentAdvisers.length > 0) {
            // Check cooldown first
            if (smsCooldown.enabled && isOnCooldown()) {
                smsStatusText = 'On Cooldown';
                sessionInfo = 'System on cooldown';
            } else {
                // Filter by schedule
                const scheduledAdvisers = presentAdvisers.filter(adviser => 
                    isTeacherScheduled(adviser.id)
                );
                
                if (scheduledAdvisers.length > 0) {
                    smsRecipients = scheduledAdvisers.map(a => a.name);
                    const smsResult = sendSMS(measuredDecibels, status, scheduledAdvisers.map(a => a.name));
                    smsStatusText = smsResult ? 'Sent' : 'Failed';
                    sessionInfo = smsResult ? `${scheduledAdvisers.length} advisers notified` : 'Send failed';
                } else {
                    smsStatusText = 'No Scheduled Advisers';
                    sessionInfo = 'No advisers scheduled for current time';
                }
            }
        } else {
            smsStatusText = 'No Active Advisers';
            sessionInfo = 'No present advisers';
        }
    } else if (!smsSettings.enabled) {
        smsStatusText = 'Disabled';
        sessionInfo = 'SMS disabled';
    }
    
    // Update reading history with session info
    addToHistory(decibels, measuredDecibels, status, smsStatusText, smsRecipients, sessionInfo);
    saveState();
}

// Apply wall material adjustments
function applyWallAdjustments(originalDecibels) {
    let concreteWalls = 0;
    let plywoodWalls = 0;
    
    Object.values(wallState).forEach(type => {
        if (type === 'concrete') concreteWalls++;
        else plywoodWalls++;
    });
    
    // CORRECTED: For noise generated INSIDE the classroom:
    // Concrete walls: keep noise in → higher reading
    // Plywood walls: noise escapes → lower reading
    
    const concreteRetention = 0.8; // 80% of noise stays in concrete room
    const plywoodRetention = 0.4;  // 40% of noise stays in plywood room
    
    const totalWalls = 4;
    const averageRetention = (concreteWalls * concreteRetention + plywoodWalls * plywoodRetention) / totalWalls;
    
    // Apply retention factor to get measured noise INSIDE the classroom
    const measuredDecibels = originalDecibels * averageRetention;
    
    // Add ambient noise (10 dB base level)
    const ambientNoise = 10;
    const finalReading = Math.round(measuredDecibels + ambientNoise);
    
    // Clamp between 0 and 120 dB
    return Math.max(0, Math.min(120, finalReading));
}

// Send SMS to advisers
function sendSMS(decibels, status, recipients) {
    if (!recipients || recipients.length === 0) return false;
    
    // Check cooldown
    if (smsCooldown.enabled && isOnCooldown()) {
        console.log('SMS blocked: System is on cooldown');
        return false;
    }
    
    // Filter recipients by schedule and status
    const validRecipients = recipients.filter(recipient => {
        const adviser = advisers.find(a => a.name === recipient);
        if (!adviser || adviser.status !== 'present') return false;
        
        // Check if adviser is scheduled for current time
        return isTeacherScheduled(adviser.id);
    });
    
    if (validRecipients.length === 0) {
        console.log('SMS blocked: No valid recipients (not scheduled or not present)');
        return false;
    }
    
    const success = Math.random() < 0.9;
    
    if (success) {
        // Update SMS stats
        smsSettings.totalSent += validRecipients.length;
        totalSmsSent.textContent = smsSettings.totalSent;
        
        // Set cooldown
        if (smsCooldown.enabled) {
            setCooldown();
        }
        
        // Log SMS session
        logSmsSession(decibels, status, validRecipients);
        
        // Save settings
        saveSmsSettings();
        saveCooldownSettings();
        saveSmsSessions();
        
        console.log(`SMS sent to ${validRecipients.length} scheduled/present advisers: "${validRecipients.join(', ')}"`);
        return true;
    }
    
    return false;
}

// Check if system is on cooldown
function isOnCooldown() {
    if (!smsCooldown.lastSmsTime || !smsCooldown.cooldownEnd) return false;
    
    const now = new Date();
    const cooldownEnd = new Date(smsCooldown.cooldownEnd);
    
    return now < cooldownEnd;
}

// Set cooldown after SMS
function setCooldown() {
    const now = new Date();
    smsCooldown.lastSmsTime = now.toISOString();
    
    // Calculate cooldown end time
    const cooldownMs = (smsCooldown.hours * 60 + smsCooldown.minutes) * 60 * 1000;
    const cooldownEnd = new Date(now.getTime() + cooldownMs);
    smsCooldown.cooldownEnd = cooldownEnd.toISOString();
    
    updateCooldownUI();
}

// Check if adviser is scheduled for current time
function isTeacherScheduled(adviserId) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const adviserSchedule = teacherSchedules.find(schedule => 
        schedule.teacherId === adviserId && 
        schedule.day === currentDay &&
        schedule.isActive === true
    );
    
    if (!adviserSchedule) return false;
    
    // Check if current time is within schedule
    return currentTime >= adviserSchedule.startTime && currentTime <= adviserSchedule.endTime;
}

// Add reading to history
function addToHistory(originalDecibels, measuredDecibels, status, smsStatus, recipients = [], sessionInfo = '') {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    const reading = {
        time: timeString,
        originalDecibels: originalDecibels,
        measuredDecibels: measuredDecibels,
        status: status,
        smsStatus: smsStatus,
        recipients: recipients,
        sessionInfo: sessionInfo,
        wallComposition: `${concreteCount.textContent}C/${plywoodCount.textContent}P`
    };
    
    readingsHistory.unshift(reading);
    if (readingsHistory.length > 10) readingsHistory.pop();
    updateReadingsTable();
}

// Update readings table
function updateReadingsTable() {
    readingsTable.innerHTML = '';
    
    if (readingsHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; color: #8b949e;">
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
        
        let smsBadgeClass = '';
        if (reading.smsStatus === 'Sent') smsBadgeClass = 'sent';
        else if (reading.smsStatus === 'Failed') smsBadgeClass = 'not-sent';
        else smsBadgeClass = 'disabled';
        
        const smsBadge = `<span class="sms-badge ${smsBadgeClass}">${reading.smsStatus}</span>`;
        
        const adjustment = reading.measuredDecibels - reading.originalDecibels;
        const arrow = adjustment > 0 ? '↑' : (adjustment < 0 ? '↓' : '→');
        const arrowClass = adjustment > 0 ? 'higher' : (adjustment < 0 ? 'lower' : '');
        
        const recipientsText = reading.recipients.length > 0 
            ? reading.recipients.slice(0, 2).join(', ') + (reading.recipients.length > 2 ? '...' : '')
            : 'None';
        
        row.innerHTML = `
            <td>${reading.time}</td>
            <td>${reading.originalDecibels} dB</td>
            <td class="adjusted-reading ${arrowClass}">
                ${reading.measuredDecibels} dB 
                <span class="adjustment-arrow">${arrow}</span>
            </td>
            <td>${statusBadge}</td>
            <td>${smsBadge}</td>
            <td class="session-info">
                <div class="sms-recipients" title="${reading.recipients.join(', ')}">
                    ${recipientsText}
                </div>
                ${reading.sessionInfo ? `<div class="session-cooldown">${reading.sessionInfo}</div>` : ''}
            </td>
        `;
        
        readingsTable.appendChild(row);
    });
}

// Update advisers table
function updateAdvisersTable() {
    advisersTable.innerHTML = '';
    
    if (advisers.length === 0) {
        const row = document.createElement('tr');
        row.className = 'empty-row';
        row.innerHTML = `
            <td colspan="5" class="empty-message">
                <i class="fas fa-user-slash"></i>
                No advisers added yet. Add your first adviser above.
            </td>
        `;
        advisersTable.appendChild(row);
        return;
    }
    
    // Update counts
    const present = advisers.filter(a => a.status === 'present').length;
    const onLeave = advisers.filter(a => a.status === 'on-leave').length;
    const absent = advisers.filter(a => a.status === 'absent').length;
    
    presentCount.textContent = present;
    onLeaveCount.textContent = onLeave;
    absentCount.textContent = absent;
    activeAdvisers.textContent = present;
    
    // Update footer
    footerAdviserStatus.textContent = `${present} Present`;
    adviserSystemStatus.textContent = present > 0 ? 'Active' : 'No Active Advisers';
    adviserSystemStatus.className = present > 0 ? 'status-value' : 'status-value warning';
    
    // Populate table
    advisers.forEach(adviser => {
        const row = document.createElement('tr');
        row.dataset.id = adviser.id;
        
        row.innerHTML = `
            <td>${adviser.name}</td>
            <td>${adviser.subject}</td>
            <td>${adviser.number}</td>
            <td><span class="adviser-status ${adviser.status}">${adviser.status.charAt(0).toUpperCase() + adviser.status.slice(1)}</span></td>
            <td class="adviser-actions">
                <button class="btn-edit" data-id="${adviser.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-id="${adviser.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        advisersTable.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteAdviser(id);
        });
    });
}

// Add new adviser
addAdviserBtn.addEventListener('click', function() {
    const name = adviserNameInput.value.trim();
    const subject = adviserSubjectInput.value.trim();
    const number = adviserNumberInput.value.trim();
    const status = adviserStatusSelect.value;
    
    if (!name || !subject || !number) {
        alert('Please fill in all fields');
        return;
    }
    
    const newAdviser = {
        id: Date.now(), // Simple ID generation
        name,
        subject,
        number,
        status
    };
    
    advisers.push(newAdviser);
    saveAdvisers();
    updateAdvisersTable();
    updateTeacherDropdown();
    
    // Clear form
    adviserNameInput.value = '';
    adviserSubjectInput.value = '';
    adviserNumberInput.value = '';
    adviserStatusSelect.value = 'present';
    
    adviserNameInput.focus();
    
    alert('Adviser added successfully!');
});

// Open edit modal
function openEditModal(id) {
    const adviser = advisers.find(a => a.id === id);
    if (!adviser) return;
    
    editingAdviserId = id;
    editAdviserName.value = adviser.name;
    editAdviserSubject.value = adviser.subject;
    editAdviserNumber.value = adviser.number;
    editAdviserStatus.value = adviser.status;
    
    editModalOverlay.classList.add('active');
}

// Close edit modal
function closeEditModalFunc() {
    editModalOverlay.classList.remove('active');
    editingAdviserId = null;
    editAdviserName.value = '';
    editAdviserSubject.value = '';
    editAdviserNumber.value = '';
    editAdviserStatus.value = 'present';
}

// Save edited adviser
saveAdviserBtn.addEventListener('click', function() {
    if (!editingAdviserId) return;
    
    const adviserIndex = advisers.findIndex(a => a.id === editingAdviserId);
    if (adviserIndex === -1) return;
    
    advisers[adviserIndex] = {
        ...advisers[adviserIndex],
        name: editAdviserName.value.trim(),
        subject: editAdviserSubject.value.trim(),
        number: editAdviserNumber.value.trim(),
        status: editAdviserStatus.value
    };
    
    saveAdvisers();
    updateAdvisersTable();
    updateTeacherDropdown();
    closeEditModalFunc();
    alert('Adviser updated successfully!');
});

// Delete adviser
function deleteAdviser(id) {
    if (!confirm('Are you sure you want to delete this adviser?')) return;
    
    // Remove adviser
    advisers = advisers.filter(a => a.id !== id);
    
    // Remove schedules for this adviser
    teacherSchedules = teacherSchedules.filter(schedule => schedule.teacherId !== id);
    
    saveAdvisers();
    saveSchedules();
    updateAdvisersTable();
    updateTeacherDropdown();
    updateSchedulesTable();
    updateActiveTeachers();
    alert('Adviser deleted successfully!');
}

// Broadcast SMS to all present advisers
smsAllBtn.addEventListener('click', function() {
    const presentAdvisers = advisers.filter(a => a.status === 'present');
    if (presentAdvisers.length === 0) {
        alert('No present advisers to send SMS to');
        return;
    }
    
    if (confirm(`Send test SMS to ${presentAdvisers.length} present adviser(s)?`)) {
        const success = sendSMS(85, 'Loud (Test)', presentAdvisers.map(a => a.name));
        if (success) {
            alert(`Test SMS sent to ${presentAdvisers.length} adviser(s)!`);
        } else {
            alert('Failed to send test SMS. Please try again.');
        }
    }
});

// Update SMS settings UI
function updateSmsSettingsUI() {
    enableSmsToggle.checked = smsSettings.enabled;
    smsTemplate.value = smsSettings.template;
    totalSmsSent.textContent = smsSettings.totalSent;
    
    // Update footer
    footerSmsStatus.textContent = smsSettings.enabled ? 'Enabled' : 'Disabled';
    footerSmsStatus.className = smsSettings.enabled ? 'status-active' : 'status-value warning';
}

// Enable SMS toggle
enableSmsToggle.addEventListener('change', function() {
    smsSettings.enabled = this.checked;
    saveSmsSettings();
    updateSmsSettingsUI();
});

// SMS template change
smsTemplate.addEventListener('change', function() {
    smsSettings.template = this.value;
    saveSmsSettings();
});

// Update cooldown UI
function updateCooldownUI() {
    // Start auto-update for cooldown timer
    startCooldownTimer();
}

// Start auto-update timer for cooldown
function startCooldownTimer() {
    if (smsCooldownTimer) clearInterval(smsCooldownTimer);
    
    smsCooldownTimer = setInterval(() => {
        if (isOnCooldown()) {
            updateCooldownUI();
        } else {
            clearInterval(smsCooldownTimer);
        }
    }, 60000); // Update every minute
}

// Update teacher dropdown
function updateTeacherDropdown() {
    // This function is called but not needed in current version
}

// Update schedules table
function updateSchedulesTable() {
    // This function is called but not needed in current version
}

// Update active teachers display
function updateActiveTeachers() {
    // This function is called but not needed in current version
}

// Log SMS session
function logSmsSession(decibels, status, recipients) {
    const session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        decibels: decibels,
        status: status,
        recipients: recipients,
        recipientCount: recipients.length
    };
    
    smsSessions.unshift(session);
    
    // Keep only last 20 sessions
    if (smsSessions.length > 20) {
        smsSessions.pop();
    }
    
    updateSmsLog();
}

// Update SMS log table
function updateSmsLog() {
    // This function is called but not needed in current version
}

// Helper function to capitalize first letter
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Update wall UI
function updateWallUI() {
    console.log('Updating wall UI with state:', wallState);
    
    // Update wall visual classes
    wallItems.forEach(item => {
        const side = item.dataset.side;
        const wallType = wallState[side];
        item.className = `wall-item wall-${side} ${wallType}`;
        
        // Update toggle container visual
        const toggleContainer = item.querySelector('.wall-toggle-container');
        if (toggleContainer) {
            const labels = toggleContainer.querySelectorAll('.wall-type-label');
            if (labels.length >= 2) {
                labels[0].style.color = wallType === 'concrete' ? '#fff' : '#8b949e';
                labels[1].style.color = wallType === 'plywood' ? '#fff' : '#8b949e';
            }
        }
    });
    
    // Update counts and summary
    let concreteWalls = 0;
    let plywoodWalls = 0;
    
    Object.values(wallState).forEach(type => {
        if (type === 'concrete') concreteWalls++;
        else plywoodWalls++;
    });
    
    concreteCount.textContent = concreteWalls;
    plywoodCount.textContent = plywoodWalls;
    wallSummary.textContent = `${concreteWalls} Concrete, ${plywoodWalls} Plywood`;
    
    // Update footer status
    let footerStatus = 'Mixed';
    if (concreteWalls === 4) footerStatus = 'All Concrete';
    else if (plywoodWalls === 4) footerStatus = 'All Plywood';
    else if (concreteWalls > plywoodWalls) footerStatus = 'Mostly Concrete';
    else if (plywoodWalls > concreteWalls) footerStatus = 'Mostly Plywood';
    
    footerWallStatus.textContent = footerStatus;
    wallSystemStatus.textContent = 'Configured';
    
    // Update noise adjustment rating
    let adjustmentRating = 'Medium';
    if (concreteWalls === 4) adjustmentRating = 'High (Increases readings)';
    else if (plywoodWalls === 4) adjustmentRating = 'Low (Decreases readings)';
    else if (concreteWalls >= 3) adjustmentRating = 'Medium-High';
    else if (plywoodWalls >= 3) adjustmentRating = 'Medium-Low';
    
    noiseAdjustment.textContent = adjustmentRating;
    
    console.log(`Wall composition: ${concreteWalls} concrete, ${plywoodWalls} plywood`);
}

// Initialize wall toggle event listeners
function initializeWallToggles() {
    console.log('Initializing wall toggles');
    
    // Add fresh event listeners
    wallNorthToggle.addEventListener('change', function() {
        console.log('North wall toggle changed');
        wallState.north = this.checked ? 'plywood' : 'concrete';
        updateWallUI();
        saveWallState();
    });
    
    wallEastToggle.addEventListener('change', function() {
        console.log('East wall toggle changed');
        wallState.east = this.checked ? 'plywood' : 'concrete';
        updateWallUI();
        saveWallState();
    });
    
    wallSouthToggle.addEventListener('change', function() {
        console.log('South wall toggle changed');
        wallState.south = this.checked ? 'plywood' : 'concrete';
        updateWallUI();
        saveWallState();
    });
    
    wallWestToggle.addEventListener('change', function() {
        console.log('West wall toggle changed');
        wallState.west = this.checked ? 'plywood' : 'concrete';
        updateWallUI();
        saveWallState();
    });
    
    // Set all concrete/plywood
    setAllConcreteBtn.addEventListener('click', function() {
        console.log('Setting all walls to concrete');
        wallState.north = 'concrete';
        wallState.east = 'concrete';
        wallState.south = 'concrete';
        wallState.west = 'concrete';
        updateWallUI();
        saveWallState();
    });
    
    setAllPlywoodBtn.addEventListener('click', function() {
        console.log('Setting all walls to plywood');
        wallState.north = 'plywood';
        wallState.east = 'plywood';
        wallState.south = 'plywood';
        wallState.west = 'plywood';
        updateWallUI();
        saveWallState();
    });
}

// Generate random decibel value
function getRandomDecibels(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize noise simulation event listeners
function initializeNoiseSimulation() {
    console.log('Initializing noise simulation buttons');
    
    // Add fresh event listeners
    simulateQuietBtn.addEventListener('click', function(e) {
        console.log('Quiet simulation clicked');
        e.stopPropagation();
        if (isAutoSimulating) {
            console.log('Auto simulation is running, ignoring manual click');
            return;
        }
        const quietDecibels = getRandomDecibels(40, 59);
        console.log(`Generated quiet decibels: ${quietDecibels}`);
        updateNoiseDisplay(quietDecibels);
    });
    
    simulateModerateBtn.addEventListener('click', function(e) {
        console.log('Moderate simulation clicked');
        e.stopPropagation();
        if (isAutoSimulating) {
            console.log('Auto simulation is running, ignoring manual click');
            return;
        }
        const moderateDecibels = getRandomDecibels(60, 80);
        console.log(`Generated moderate decibels: ${moderateDecibels}`);
        updateNoiseDisplay(moderateDecibels);
    });
    
    simulateLoudBtn.addEventListener('click', function(e) {
        console.log('Loud simulation clicked');
        e.stopPropagation();
        if (isAutoSimulating) {
            console.log('Auto simulation is running, ignoring manual click');
            return;
        }
        const loudDecibels = getRandomDecibels(81, 100);
        console.log(`Generated loud decibels: ${loudDecibels}`);
        updateNoiseDisplay(loudDecibels);
    });
    
    autoSimulateBtn.addEventListener('click', function(e) {
        console.log('Auto simulate clicked');
        e.stopPropagation();
        if (!isAutoSimulating) {
            isAutoSimulating = true;
            autoSimulateBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto Simulate';
            autoSimulateBtn.classList.add('active');
            
            console.log('Starting auto simulation');
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
                
                console.log(`Auto simulation: ${newDecibels} dB`);
                updateNoiseDisplay(newDecibels);
            }, 3000);
        } else {
            isAutoSimulating = false;
            clearInterval(autoSimulateInterval);
            autoSimulateBtn.innerHTML = '<i class="fas fa-play"></i> Auto Simulate';
            autoSimulateBtn.classList.remove('active');
            console.log('Stopped auto simulation');
        }
    });
}

// Clear recent readings
clearReadingsBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all recent readings?')) {
        readingsHistory = [];
        updateReadingsTable();
        saveState();
    }
});

// Test SMS button
testSmsBtn.addEventListener('click', function() {
    const presentAdvisers = advisers.filter(a => a.status === 'present');
    if (presentAdvisers.length === 0) {
        alert('No present advisers to send test SMS to');
        return;
    }
    
    if (confirm(`Send test SMS to ${presentAdvisers.length} present adviser(s)?`)) {
        const originalText = testSmsBtn.innerHTML;
        testSmsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        testSmsBtn.disabled = true;
        
        setTimeout(() => {
            const success = sendSMS(85, 'Loud (Test)', presentAdvisers.map(a => a.name));
            
            if (success) {
                alert(`Test SMS sent to ${presentAdvisers.length} adviser(s)!`);
            } else {
                alert('Failed to send test SMS. Please check SIM800L connection.');
            }
            
            testSmsBtn.innerHTML = originalText;
            testSmsBtn.disabled = false;
        }, 2000);
    }
});

// Modal event listeners
closeEditModal.addEventListener('click', closeEditModalFunc);
cancelEditBtn.addEventListener('click', closeEditModalFunc);
editModalOverlay.addEventListener('click', function(e) {
    if (e.target === editModalOverlay) closeEditModalFunc();
});

// Logout functionality
logoutBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        if (isAutoSimulating) {
            clearInterval(autoSimulateInterval);
            isAutoSimulating = false;
        }
        window.location.href = 'index.html';
    }
});

// Save functions
function saveState() {
    const state = {
        currentDecibels: currentDecibels,
        readingsHistory: readingsHistory
    };
    localStorage.setItem('noiseMonitorState', JSON.stringify(state));
}

function saveAdvisers() {
    localStorage.setItem('advisers', JSON.stringify(advisers));
}

function saveSmsSettings() {
    localStorage.setItem('smsSettings', JSON.stringify(smsSettings));
}

function saveCooldownSettings() {
    localStorage.setItem('smsCooldown', JSON.stringify(smsCooldown));
}

function saveSchedules() {
    localStorage.setItem('teacherSchedules', JSON.stringify(teacherSchedules));
}

function saveSmsSessions() {
    localStorage.setItem('smsSessions', JSON.stringify(smsSessions));
}

function saveWallState() {
    localStorage.setItem('wallCheckerState', JSON.stringify(wallState));
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
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
        case 'Escape':
            if (editModalOverlay.classList.contains('active')) {
                closeEditModalFunc();
            }
            break;
    }
});

// Tooltip for keyboard shortcuts
window.addEventListener('load', function() {
    setTimeout(function() {
        alert('Tip: Use keyboard shortcuts:\n1 = Quiet simulation\n2 = Moderate simulation\n3 = Loud simulation\nSpace = Toggle auto simulation');
    }, 1000);
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isAutoSimulating) {
        clearInterval(autoSimulateInterval);
        autoSimulateBtn.setAttribute('data-paused', 'true');
    } else if (!document.hidden && isAutoSimulating && autoSimulateBtn.getAttribute('data-paused') === 'true') {
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
    if (smsCooldownTimer) {
        clearInterval(smsCooldownTimer);
    }
});