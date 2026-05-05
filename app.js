// app.js - Registre des Volontaires CLTCRH
// Enhanced with dynamic activity management

// Global data
let volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];
let formations = JSON.parse(localStorage.getItem('formations')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || {};
let managedActivities = JSON.parse(localStorage.getItem('managedActivities')) || {
    fidelisation: ['2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12'],
    terrain: ['Visite de quartier', 'Formation terrain', 'Secours d\'urgence', 'Campagne sensibilisation']
};

// Save data
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data
function loadData(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('volunteers-table')) {
        initIndexPage();
    } else if (document.getElementById('volunteer-select')) {
        initActivitePage();
    }
});

// INDEX PAGE INIT (unchanged)
function initIndexPage() {
    loadVolunteers();
    loadFormations();
    renderVolunteers();
    setupEventListeners();
    if (document.getElementById('btn-activite')) {
        document.getElementById('btn-activite').onclick = () => window.location.href = 'activite.html';
    }
}

// Load volunteer data
function loadVolunteers() {
    volunteers = loadData('volunteers');
}

// ACTIVATE PAGE INIT
function initActivitePage() {
    volunteers = loadData('volunteers');
    activities = loadData('activities', {});
    managedActivities = loadData('managedActivities', {
        fidelisation: [],
        terrain: []
    });
    
    setupTabSwitching();
    setupActiviteEventListeners();
    populateVolunteerSelect();
    
    document.getElementById('btn-back').onclick = () => window.location.href = 'index.html';
    
    // Load managed activities tables
    renderManagedActivities();
    
    console.log('Activité page initialized with admin management');
}

// Tab switching
function setupTabSwitching() {
    document.getElementById('tab-volunteer').onclick = () => switchTab('volunteer');
    document.getElementById('tab-admin').onclick = () => switchTab('admin');
}

function switchTab(activeTab) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${activeTab}`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${activeTab}-tab`).classList.add('active');
    
    // Show/hide buttons
    document.querySelectorAll('.volunteer-tab-only').forEach(btn => {
        btn.style.display = activeTab === 'volunteer' ? '' : 'none';
    });
    document.querySelectorAll('.admin-tab-only').forEach(btn => {
        btn.style.display = activeTab === 'admin' ? '' : 'none';
    });
}

// Populate volunteer dropdown
function populateVolunteerSelect() {
    const select = document.getElementById('volunteer-select');
    select.innerHTML = '<option value="">Sélectionner un volontaire...</option>';
    
    volunteers.forEach(vol => {
        const option = document.createElement('option');
        option.value = vol.id;
        option.textContent = `${vol.nom} ${vol.prenom}`;
        select.appendChild(option);
    });
    
    select.onchange = loadVolunteerActivities;
}

// Volunteer tab functions
function loadVolunteerActivities() {
    const volId = document.getElementById('volunteer-select').value;
    const saveBtn = document.getElementById('btn-save-activities');
    
    if (volId) {
        saveBtn.style.display = 'inline-flex';
        document.getElementById('btn-print-activite').style.display = 'inline-flex';
        generateVolunteerCheckboxes(volId);
        updateTotals();
    } else {
        saveBtn.style.display = 'none';
        document.getElementById('btn-print-activite').style.display = 'none';
        clearVolunteerCheckboxes();
    }
}

// Generate dynamic checkboxes for volunteer
function generateVolunteerCheckboxes(volId) {
    const volActivities = activities[volId] || [];
    
    // Fidelisation
    const fidelTbody = document.getElementById('fidelisation-tbody');
    fidelTbody.innerHTML = '';
    managedActivities.fidelisation.forEach(date => {
        const monthName = new Date(date + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(' ', ' ');
        const activity = volActivities.find(a => a.date === date && a.type === 'fidelisation');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthName}</td>
            <td><input type="checkbox" data-type="fidelisation" data-date="${date}" ${activity && activity.present ? 'checked' : ''}></td>
        `;
        fidelTbody.appendChild(row);
    });
    
    // Terrain
    const terrainTbody = document.getElementById('terrain-tbody');
    terrainTbody.innerHTML = '';
    managedActivities.terrain.forEach(activityName => {
        const activity = volActivities.find(a => a.activity === activityName && a.type === 'terrain');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="date" data-date-field value="${activity ? activity.date : ''}"></td>
            <td>${activityName}</td>
            <td><input type="checkbox" data-type="terrain" data-activity="${activityName}" ${activity && activity.present ? 'checked' : ''}></td>
        `;
        terrainTbody.appendChild(row);
    });
    
    // Re-attach listeners
    setupCheckboxListeners();
}

// Clear checkboxes
function clearVolunteerCheckboxes() {
    document.getElementById('fidelisation-tbody').innerHTML = '';
    document.getElementById('terrain-tbody').innerHTML = '';
    updateTotals();
}

// Save volunteer activities
function saveCurrentActivities() {
    const volId = document.getElementById('volunteer-select').value;
    if (!volId) return;
    
    const volActivities = [];
    
    // Fidelisation
    document.querySelectorAll('input[data-type="fidelisation"]').forEach(cb => {
        volActivities.push({
            date: cb.dataset.date,
            type: 'fidelisation',
            present: cb.checked
        });
    });
    
    // Terrain
    document.querySelectorAll('input[data-type="terrain"]').forEach(cb => {
        const tr = cb.closest('tr');
        const dateInput = tr.querySelector('input[type="date"]');
        const activityName = cb.dataset.activity;
        if (dateInput.value && activityName) {
            volActivities.push({
                date: dateInput.value,
                type: 'terrain',
                present: cb.checked,
                activity: activityName
            });
        }
    });
    
    activities[volId] = volActivities;
    saveData('activities', activities);
    alert('Activités du volontaire sauvegardées !');
    updateTotals();
}

// Update totals
function updateTotals() {
    const fidelCbs = document.querySelectorAll('input[data-type="fidelisation"]');
    const fidelChecked = Array.from(fidelCbs).filter(cb => cb.checked).length;
    const fidelTotal = managedActivities.fidelisation.length;
    document.getElementById('total-fidelisation').textContent = `${fidelChecked}/${fidelTotal}`;
    document.getElementById('pct-fidelisation').textContent = fidelTotal > 0 ? `${Math.round((fidelChecked/fidelTotal)*100)}%` : '0%';
    
    const terrainChecked = document.querySelectorAll('input[data-type="terrain"]:checked').length;
    document.getElementById('total-terrain').textContent = terrainChecked;
    
    const totalSessions = fidelChecked + terrainChecked;
    const totalPossible = fidelTotal + managedActivities.terrain.length;
    const pct = totalPossible > 0 ? Math.round((totalSessions/totalPossible)*100) : 0;
    document.getElementById('total-sessions').textContent = totalSessions;
    document.getElementById('total-participation').textContent = `${pct}%`;
    
    const statutEl = document.getElementById('statut-regularite');
    if (pct >= 75) {
        statutEl.textContent = 'Régulier';
        statutEl.parentElement.style.color = 'var(--success)';
    } else if (pct >= 50) {
        statutEl.textContent = 'Moyen';
        statutEl.parentElement.style.color = 'var(--warning)';
    } else {
        statutEl.textContent = 'Irrégulier';
        statutEl.parentElement.style.color = 'var(--danger)';
    }
}

// Event listeners
function setupCheckboxListeners() {
    document.querySelectorAll('#volunteer-tab input[type="checkbox"], #volunteer-tab input[type="date"]').forEach(input => {
        input.removeEventListener('change', updateTotals);
        input.addEventListener('change', updateTotals);
    });
}

// Admin functions
function renderManagedActivities() {
    renderManagedFidelisation();
    renderManagedTerrain();
    
    // Event listeners
    document.getElementById('btn-add-fidel').onclick = addFidelisationDate;
    document.getElementById('btn-add-terrain').onclick = addTerrainActivity;
    document.getElementById('btn-save-managed').onclick = saveManagedActivities;
}

function renderManagedFidelisation() {
    const tbody = document.getElementById('managed-fidel-tbody');
    tbody.innerHTML = '';
    managedActivities.fidelisation.forEach((date, index) => {
        const monthName = new Date(date + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthName} (${date})</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteFidelisation(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderManagedTerrain() {
    const tbody = document.getElementById('managed-terrain-tbody');
    tbody.innerHTML = '';
    managedActivities.terrain.forEach((name, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTerrain(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addFidelisationDate() {
    const dateInput = document.getElementById('add-fidel-date');
    const date = dateInput.value;
    if (date && !managedActivities.fidelisation.includes(date)) {
        managedActivities.fidelisation.push(date);
        dateInput.value = '';
        renderManagedFidelisation();
    }
}

function addTerrainActivity() {
    const nameInput = document.getElementById('add-terrain-name');
    const name = nameInput.value.trim();
    if (name && !managedActivities.terrain.includes(name)) {
        managedActivities.terrain.push(name);
        nameInput.value = '';
        renderManagedTerrain();
    }
}

function saveManagedActivities() {
    saveData('managedActivities', managedActivities);
    alert('Activités gérées sauvegardées !');
}

function deleteFidelisation(index) {
    managedActivities.fidelisation.splice(index, 1);
    renderManagedFidelisation();
}

function deleteTerrain(index) {
    managedActivities.terrain.splice(index, 1);
    renderManagedTerrain();
}

// Placeholder functions
function renderVolunteers() {}
function setupEventListeners() {}
function loadFormations() {}

// Export
console.log('App.js updated - Full admin activity management ready');
